import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { type NextRequest, NextResponse } from 'next/server';

import { env } from '../../env';

/**
 * Verify webhook signatures for security
 * Different webhooks use different signing methods
 */

// QStash webhook verification
export async function verifyQStashWebhook(request: NextRequest) {
  try {
    // QStash signs webhooks with QSTASH_CURRENT_SIGNING_KEY
    const signature = request.headers.get('upstash-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 401 });
    }

    // Verify using QStash's built-in verification
    const handler = async (_req: NextRequest) => {
      return new Response('Verified', { status: 200 });
    };
    const verifiedHandler = verifySignatureAppRouter(handler);
    await verifiedHandler(request);
    return true;
  } catch (error) {
    console.error('QStash webhook verification failed:', error);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }
}

// Generic webhook verification using shared secret
export async function verifyWebhookSignature(request: Request, secret: string) {
  try {
    const signature = request.headers.get('x-webhook-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 401 });
    }

    // Get the raw body
    const body = await request.text();

    // Create HMAC signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(body));

    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(mac)));

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // Return the parsed body for the handler to use
    return JSON.parse(body);
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 401 });
  }
}

// Service API key verification for webhooks that support it
export async function verifyWebhookApiKey(request: Request) {
  const apiKey = request.headers.get('x-api-key');

  if (apiKey && env.SERVICE_API_KEY && apiKey === env.SERVICE_API_KEY) {
    return true;
  }

  return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
}
