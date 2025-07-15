// src/integrations/aws/integration.ts
// 'use server';

import {
  APIGateway,
  GetRestApisCommand,
  RestApi,
} from '@aws-sdk/client-api-gateway';
import { logError } from '@repo/observability';
import { CONFIG } from './config';

const apiGateway = new APIGateway(CONFIG);

export interface APIGatewayEndpoint {
  id: string;
  name: string;
  arn: string;
}

export async function fetchAPIGateways(): Promise<APIGatewayEndpoint[]> {
  try {
    const command = new GetRestApisCommand({});
    const response = await apiGateway.send(command);

    return (response.items || [])
      .filter((api): api is RestApi & { id: string; name: string } =>
        Boolean(api.id && api.name),
      )
      .map((api) => ({
        id: api.id,
        name: api.name,
        arn: `arn:aws:execute-api:${CONFIG.region}:${process.env.AWS_ACCOUNT_ID}:${api.id}/*`,
      }));
  } catch (error) {
    logError('Error fetching API Gateway endpoints', { error });
    throw error;
  }
}
