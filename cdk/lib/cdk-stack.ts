import * as cdk from 'aws-cdk-lib';
import { aws_cloudfront_origins as origins, aws_cloudfront as cloudfront, aws_certificatemanager as acm } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53_targets from "aws-cdk-lib/aws-route53-targets";
import { OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
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
      accessControl: s3.BucketAccessControl.PRIVATE,
      //autoDeleteObjects: true,
      //blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      publicReadAccess: false,
      // removalPolicy: cdk.RemovalPolicy.DESTROY,
      // versioned: false,
      websiteErrorDocument: "index.html",
      websiteIndexDocument: "index.html",
    });

    const hostedZone = new HostedZone (this, "isAwesomeHostedZone",  {
      zoneName: 'forkalicious.isawesome.xyz'
    })

     // 2. ACM Certificate (must be in us-east-1 for CloudFront)
    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: "forkalicious.isawesome.xyz",
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // 3. CloudFront Origin Access Control (OAC)
    const oac = new cloudfront.CfnOriginAccessControl(this, "OAC", {
      originAccessControlConfig: {
        name: "S3OAC",
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
    });

  const oai = new OriginAccessIdentity(this, "OAI");

   destinationBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [`${destinationBucket.bucketArn}/*`],
        principals: [oai.grantPrincipal],
      })
    );


   const distribution = new cloudfront.Distribution(this, "WebsiteDistribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(destinationBucket, { originAccessIdentity: oai }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: ["forkalicious.isawesome.xyz"],
      certificate,
    });

  
    // Assuming `hostedZone` and `distribution` are already defined

      new route53.ARecord(this, "CloudFrontAliasRecord", {
        zone: hostedZone,
        recordName: "", // This means it's for the apex/root domain (@)
        target: route53.RecordTarget.fromAlias(new route53_targets.CloudFrontTarget(distribution)),
      });

      // 6. Attach OAC to the CloudFront Origin
      // const cfnDistribution = distribution.node.defaultChild as cloudfront.CfnDistribution;
      // cfnDistribution.addPropertyOverride("DistributionConfig.Origins.0.OriginAccessControlId", oac.ref);
      // cfnDistribution.addPropertyOverride("DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity", "");
  
  }
}






