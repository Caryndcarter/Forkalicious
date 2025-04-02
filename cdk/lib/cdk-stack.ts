import * as cdk from 'aws-cdk-lib';
import { aws_cloudfront_origins as origins, aws_cloudfront as cloudfront, aws_certificatemanager as acm } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53_targets from "aws-cdk-lib/aws-route53-targets";
import { OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as path from 'path';


import {
  CloudFrontWebDistribution,
  ViewerCertificate,
  SSLMethod,
  SecurityPolicyProtocol,
} from "aws-cdk-lib/aws-cloudfront";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    
    // The code that defines your stack goes here
    // 1. S3 Bucket
    const destinationBucket = new s3.Bucket(this, "DestinationBucket", {
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      //autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      // versioned: false,
      websiteErrorDocument: "index.html",
      websiteIndexDocument: "index.html",
    });

       // 2. Create the hosted zone
    const hostedZone = new HostedZone (this, "isAwesomeHostedZone",  {
      zoneName: 'forkalicious.isawesome.xyz'
    })

     // 3. ACM Certificate (must be in us-east-1 for CloudFront)
    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: "forkalicious.isawesome.xyz",
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    /*
    // 4. CloudFront Origin Access Control (OAC)
    const oac = new cloudfront.CfnOriginAccessControl(this, "OAC", {
      originAccessControlConfig: {
        name: "S3OAC",
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
    });*/

    // 4. Create the OAI
  const oai = new OriginAccessIdentity(this, "OAI");

    // 5. Add bucket policy
   destinationBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [`${destinationBucket.bucketArn}/*`],
        principals: [oai.grantPrincipal],
      })
    );

// 6. Create CloudFront distribution
   const distribution = new cloudfront.Distribution(this, "CloudFrontDist", {
      defaultBehavior: {
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        origin: new origins.S3Origin(destinationBucket, { originAccessIdentity: oai }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: ["forkalicious.isawesome.xyz"],
      certificate,
    });

 // 7. Create Route53 record
      new route53.ARecord(this, "CloudFrontAliasRecord", {
        zone: hostedZone,
        recordName: "", // This means it's for the apex/root domain (@)
        target: route53.RecordTarget.fromAlias(new route53_targets.CloudFrontTarget(distribution)),
      });

  console.log('Current working directory:', process.cwd());
  console.log('Asset path being used:', path.join(__dirname, '../client/dist'));


// 8. Deploy the frontend assets to S3
    new s3deploy.BucketDeployment(this, 'clientDeploy', {
      sources: [s3deploy.Source.asset(path.resolve(__dirname, '../../client/dist'))],
      destinationBucket: destinationBucket,
      distribution: distribution,
      distributionPaths: ['/*'], // invalidate CloudFront cache after deploy
      prune: true,
      memoryLimit: 1024, // Increase memory limit
      logRetention: cdk.aws_logs.RetentionDays.ONE_DAY, // Add logging
    });

  // 9 .Create Lambda function for your backend
  const backendFunction = new lambda.Function(this, 'BackendFunction', {
    runtime: lambda.Runtime.NODEJS_20_X,
    handler: 'lambda.handler',
    //code: lambda.Code.fromAsset('../server/dist'),
    code: lambda.Code.fromAsset(path.resolve(__dirname, '../../server/dist')),
    environment: {
      JWT_SECRET_KEY: ssm.StringParameter.valueForStringParameter(this, '/forkalicious/jwt-secret'),
      SPOONACULAR_API_KEY: ssm.StringParameter.valueForStringParameter(this, '/forkalicious/spoonacular-api-key'),
      API_BASE_URL: 'https://api.spoonacular.com',
      OPENAI_API_KEY: ssm.StringParameter.valueForStringParameter(this, '/forkalicious/openai-api-key'),
      MONGODB_URI: ssm.StringParameter.valueForStringParameter(this, '/forkalicious/mongodb-uri')
    },
    timeout: cdk.Duration.seconds(30),
    memorySize: 256
  });
  

    // 10. Create API Gateway
    const api = new apigateway.RestApi(this, 'BackendApi', {
      restApiName: 'Backend Service',
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://forkalicious.isawesome.xyz'], // add other domains later if needed in the array like https://dev.forkalicious.isawesome.xyz
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE'], 
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'Apollo-Require-Preflight',
          'Accept',
          'x-apollo-operation-name',
          'x-apollo-operation-type'
        ],
      }
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });
    

    // 11. Connect API Gateway to Lambda
    const backendIntegration = new apigateway.LambdaIntegration(backendFunction);
    api.root.addProxy({
      defaultIntegration: backendIntegration,
    });

    

    

      // Attach OAC to the CloudFront Origin
      // const cfnDistribution = distribution.node.defaultChild as cloudfront.CfnDistribution;
      // cfnDistribution.addPropertyOverride("DistributionConfig.Origins.0.OriginAccessControlId", oac.ref);
      // cfnDistribution.addPropertyOverride("DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity", "");
  
  }
}






