import * as cdk from 'aws-cdk-lib';
import { aws_cloudfront_origins as origins, aws_cloudfront as cloudfront, aws_certificatemanager as acm } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53_targets from "aws-cdk-lib/aws-route53-targets";
import { OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';



import {
  CloudFrontWebDistribution,
  ViewerCertificate,
  SSLMethod,
  SecurityPolicyProtocol,
} from "aws-cdk-lib/aws-cloudfront";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface CdkStackProps extends cdk.StackProps {
  envName: 'dev' | 'prod';
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

  
     // Add a check for props
     if (!props?.envName) {
      throw new Error('Environment name is required');
    }

    // Now you can safely use props.envName
    const domainName = props.envName === 'dev' 
      ? 'dev.forkalicious.isawesome.xyz'
      : 'forkalicious.isawesome.xyz';
  
    
    // The code that defines your stack goes here
    // 1. S3 Bucket
    const destinationBucket = new s3.Bucket(this, `${props.envName}DestinationBucket`, {
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      //autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      // versioned: false,
      websiteErrorDocument: "index.html",
      websiteIndexDocument: "index.html",
    });

    // Export the bucket name for use in GitHub Actions
    new cdk.CfnOutput(this, 'BucketName', {
      value: destinationBucket.bucketName,
      description: 'Name of the S3 bucket for client files'
    });

   // 2. Create the hosted zone
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, `${props.envName}HostedZone`, {
      zoneName: 'forkalicious.isawesome.xyz',
      hostedZoneId: props.envName === 'dev' 
        ? 'Z01066421TRSX14SGMI3U'  // Use the second zone ID for dev
        : 'Z07581513ITHH80T66E66'  // Use the first zone ID for prod
    });

     // Add this code to retain the hosted zone
    // Try to find the hosted zone resource by its ID
    const cfnHostedZone = this.node.tryFindChild('isAwesomeHostedZone79684184');
    if (cfnHostedZone) {
      (cfnHostedZone as cdk.CfnResource).applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    }

    // Also check for a dev hosted zone if it exists
    const devHostedZone = this.node.tryFindChild('DevHostedZone');
    if (devHostedZone) {
      (devHostedZone as cdk.CfnResource).applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    }

    
     // 3. ACM Certificate (must be in us-east-1 for CloudFront)
    const certificate = new acm.Certificate(this, `${props.envName}Certificate`, {
      domainName: domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });


    // 4. Create the OAI
  const oai = new OriginAccessIdentity(this, "WebsiteOAI", {
    comment: "OAI for website content"
  });

  new cdk.CfnOutput(this, 'OAIId', {
    value: oai.originAccessIdentityId,
    description: 'OAI ID for CloudFront'
  });

    // 5. Add bucket policy
   destinationBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [`${destinationBucket.bucketArn}/*`],
        principals: [oai.grantPrincipal],
      })
    );

// 6. Use existing CloudFront distributions
let distribution;
if (props.envName === 'prod') {
  // Use existing CloudFront distribution for production
  distribution = cloudfront.Distribution.fromDistributionAttributes(this, 'ExistingProdCloudFrontDist', {
    distributionId: 'E3FJ1705O81MGW', 
    domainName: 'forkalicious.isawesome.xyz',
  });
} else {
  // Use existing CloudFront distribution for dev
  distribution = cloudfront.Distribution.fromDistributionAttributes(this, 'ExistingDevCloudFrontDist', {
    distributionId: 'E217MWERN2BFNB', 
    domainName: 'dev.forkalicious.isawesome.xyz',
  });
}

//  // 7. Create Route53 record
//       new route53.ARecord(this, `${props.envName}CloudFrontAliasRecord`, {
//         zone: hostedZone,
//         recordName: props.envName === 'dev' ? 'dev' : '', // 'dev' subdomain for dev, root for prod
//         target: route53.RecordTarget.fromAlias(new route53_targets.CloudFrontTarget(distribution)),
//       });

  console.log('Current working directory:', process.cwd());
  console.log('Asset path being used:', path.join(__dirname, '../../client/dist'));

// 8. Deploy the frontend assets to S3
    new s3deploy.BucketDeployment(this, 'clientDeploy', {
      sources: [s3deploy.Source.asset(path.resolve(__dirname, '../../client/dist'))],
      destinationBucket: destinationBucket,
      distribution,
      distributionPaths: ['/*'], // invalidate CloudFront cache after deploy
      prune: true,
      memoryLimit: 1024, // Increase memory limit
      logRetention: cdk.aws_logs.RetentionDays.ONE_DAY, // Add logging
    });

    const logGroup = new logs.LogGroup(this, 'BackendFunctionLogGroup', {
      logGroupName: `/aws/lambda/${props.envName}-forkalicious-backend`,
      retention: logs.RetentionDays.ONE_WEEK, // or whatever retention period you want
      removalPolicy: cdk.RemovalPolicy.DESTROY // or RETAIN if you want to keep logs after stack deletion
    });


  // 9 .Create Lambda function for your backend
  const backendFunction = new lambda.Function(this, 'BackendFunction', {
    functionName: `${props.envName}-forkalicious-backend`,
    runtime: lambda.Runtime.NODEJS_20_X,
    handler: 'lambda.handler',
    code: lambda.Code.fromAsset(path.resolve(__dirname, '../../server/dist')),
    environment: {
      JWT_SECRET_KEY: ssm.StringParameter.valueForStringParameter(this, '/forkalicious/jwt-secret'),
      SPOONACULAR_API_KEY: ssm.StringParameter.valueForStringParameter(this, '/forkalicious/spoonacular-api-key'),
      API_BASE_URL: 'https://api.spoonacular.com',
      OPENAI_API_KEY: ssm.StringParameter.valueForStringParameter(this, '/forkalicious/openai-api-key'),
      MONGODB_URI: ssm.StringParameter.valueForStringParameter(this, '/forkalicious/mongodb-uri'),
      NODE_ENV: props.envName === 'prod' ? 'production' : 'development'
    },
    timeout: cdk.Duration.seconds(30),
    memorySize: 256,
    logRetention: logs.RetentionDays.ONE_WEEK
  });

  // Add permissions for SSM, CloudWatch, and basic execution
  backendFunction.addToRolePolicy(new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: [
      'ssm:GetParameter',
      'ssm:GetParameters',
      'ssm:GetParametersByPath',
      'logs:CreateLogGroup',
      'logs:CreateLogStream',
      'logs:PutLogEvents'
    ],
    resources: [
      `arn:aws:ssm:${this.region}:${this.account}:parameter/forkalicious/*`,
      `arn:aws:logs:${this.region}:${this.account}:*`
    ]
  }));

  // Create API Gateway logging role
  const apiGatewayLoggingRole = new iam.Role(this, 'ApiGatewayLoggingRole', {
    assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs')
    ]
  });

  // Create API Gateway account settings
  const apiGatewayAccount = new apigateway.CfnAccount(this, 'ApiGatewayAccount', {
    cloudWatchRoleArn: apiGatewayLoggingRole.roleArn
  });

  // Create API Gateway
  const api = new apigateway.RestApi(this, `${props.envName}BackendApi`, {
    restApiName: `${props.envName}BackendService`,
    deploy: true,
    deployOptions: {
      stageName: 'prod',  // This is required by API Gateway
      loggingLevel: apigateway.MethodLoggingLevel.INFO,
      dataTraceEnabled: true
    },
    defaultCorsPreflightOptions: {
      allowOrigins: [
        'https://forkalicious.isawesome.xyz',
        'https://dev.forkalicious.isawesome.xyz'
      ],
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: [
        'Content-Type',
        'X-Amz-Date',
        'Authorization',
        'X-Api-Key',
        'X-Amz-Security-Token',
        'X-Amz-User-Agent',
        'Apollo-Require-Preflight',
        'x-apollo-operation-name',
        'x-apollo-operation-type'
      ],
      allowCredentials: true
    }
  });

  // Add dependency to ensure account settings are created first
  api.node.addDependency(apiGatewayAccount);

  // Make sure the integration is properly set up
  const backendIntegration = new apigateway.LambdaIntegration(backendFunction, {
    proxy: true
  });

  // Add a test endpoint to verify basic connectivity
  const testResource = api.root.addResource('test');
  testResource.addMethod('GET', backendIntegration);

  // Add GraphQL endpoint
  const graphqlResource = api.root.addResource('graphql');
  graphqlResource.addMethod('POST', backendIntegration);

  // Add proxy integration for all other routes
  api.root.addProxy({
    defaultIntegration: backendIntegration,
    anyMethod: true
  });

  new cdk.CfnOutput(this, 'ApiGatewayUrl', {
    value: api.url,
    description: 'API Gateway URL'
  });
    
    // const apiGatewayAccount = new apigateway.CfnAccount(this, 'ApiGatewayAccount', {
    //   cloudWatchRoleArn: apiGatewayLoggingRole.roleArn
    // });

    // const apiGatewayDeployment = api.node.findChild('Deployment') as apigateway.CfnDeployment;
    // apiGatewayDeployment.addDependsOn(apiGatewayAccount);   

    // 11. Connect API Gateway to Lambda
    // const backendIntegration = new apigateway.LambdaIntegration(backendFunction);
    // api.root.addProxy({
    //   defaultIntegration: backendIntegration,
    //   anyMethod: true 
    // });
 
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
    
      // Attach OAC to the CloudFront Origin
      // const cfnDistribution = distribution.node.defaultChild as cloudfront.CfnDistribution;
      // cfnDistribution.addPropertyOverride("DistributionConfig.Origins.0.OriginAccessControlId", oac.ref);
      // cfnDistribution.addPropertyOverride("DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity", "");
  
}
}
