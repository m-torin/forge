// awsClients.ts

import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { EC2Client } from '@aws-sdk/client-ec2';
import { EventBridge } from '@aws-sdk/client-eventbridge';
import { IAMClient } from '@aws-sdk/client-iam';
import { KafkaClient } from '@aws-sdk/client-kafka';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
import { SFNClient } from '@aws-sdk/client-sfn';
import { SNSClient } from '@aws-sdk/client-sns';
import { SQSClient } from '@aws-sdk/client-sqs';

// Check required AWS environment variables
if (
  !process.env.AWS_REGION ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY
) {
  throw new Error('Missing one or more required AWS environment variables.');
}

// AWS Client configuration
const awsClientConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

// Create clients for AWS services
export const cloudWatchLogsClient = new CloudWatchLogsClient(awsClientConfig);
export const ec2Client = new EC2Client(awsClientConfig);
export const eventBridgeClient = new EventBridge(awsClientConfig);
export const iamClient = new IAMClient(awsClientConfig);
export const kafkaClient = new KafkaClient(awsClientConfig);
export const lambdaClient = new LambdaClient(awsClientConfig);
export const s3Client = new S3Client(awsClientConfig);
export const sesClient = new SESClient(awsClientConfig);
export const snsClient = new SNSClient(awsClientConfig);
export const sqsClient = new SQSClient(awsClientConfig);
export const stepFunctionsClient = new SFNClient(awsClientConfig);
