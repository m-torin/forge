// requestExtractor.ts
'use server';

import { NextRequest } from 'next/server';
import { logUtils } from '#/lib/owlPost/logUtils';

export interface ExtractedRequest {
  http: {
    method: string;
    url: string;
    queryParams: Record<string, string>;
    body: Record<string, any>;
    headers: Record<string, string>;
    timestamp: string;
  };
  [key: string]: any;
}

export const extractRequestInput = async (
  request: NextRequest,
): Promise<ExtractedRequest> => {
  const method = request.method;
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let body = {};
  try {
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const clonedRequest = request.clone();
      body = await clonedRequest.json();
    }
  } catch (e) {
    logUtils.error('Request body parsing failed', e);
  }

  return {
    http: {
      method,
      url: url.toString(),
      queryParams,
      body,
      headers,
      timestamp: new Date().toISOString(),
    },
    ...(['POST', 'PUT', 'PATCH'].includes(method) ? body : queryParams),
  };
};
