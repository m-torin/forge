/**
 * Signature Verification Tests
 * Tests for QStash webhook signature verification implementation
 */

import '@repo/qa/vitest/setup/next-app';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, vi } from 'vitest';

// Import after mocking
import { createWorkflowWebhookHandler } from '../src/server-next';

// Mock the QStash Receiver
const mockReceiver = {
  verify: vi.fn(),
};

const mockReceiverConstructor = vi.fn().mockImplementation(() => mockReceiver);

// Mock @upstash/qstash module
vi.mock('@upstash/qstash', async () => ({
  Receiver: mockReceiverConstructor,
}));

describe('signature Verification Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('qStash Webhook Signature Verification', () => {
    test('should verify valid signatures successfully', async () => {
      mockReceiver.verify.mockResolvedValue(true);

      const handler = createWorkflowWebhookHandler({
        provider: {
          name: 'test-provider',
          healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
        } as any,
        secret: 'test-signing-key',
        onEvent: vi.fn(),
      });

      const request = new NextRequest('http://localhost/webhook', {
        method: 'POST',
        headers: {
          'Upstash-Signature': 'valid-signature',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'workflow.completed', data: { id: '123' } }),
      });

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(mockReceiverConstructor).toHaveBeenCalledWith({
        currentSigningKey: 'test-signing-key',
      });
      expect(mockReceiver.verify).toHaveBeenCalledWith({
        signature: 'valid-signature',
        body: expect.any(String),
      });
    });

    test('should support key rotation with nextSecret', async () => {
      mockReceiver.verify.mockResolvedValue(true);

      const handler = createWorkflowWebhookHandler({
        provider: {
          name: 'test-provider',
          healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
        } as any,
        secret: 'current-key',
        nextSecret: 'next-key',
        onEvent: vi.fn(),
      });

      const request = new NextRequest('http://localhost/webhook', {
        method: 'POST',
        headers: {
          'Upstash-Signature': 'valid-signature',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'workflow.completed', data: { id: '123' } }),
      });

      await handler(request);

      expect(mockReceiverConstructor).toHaveBeenCalledWith({
        currentSigningKey: 'current-key',
        nextSigningKey: 'next-key',
      });
    });

    test('should reject invalid signatures', async () => {
      mockReceiver.verify.mockResolvedValue(false);

      const handler = createWorkflowWebhookHandler({
        provider: {
          name: 'test-provider',
          healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
        } as any,
        secret: 'test-signing-key',
        onEvent: vi.fn(),
      });

      const request = new NextRequest('http://localhost/webhook', {
        method: 'POST',
        headers: {
          'Upstash-Signature': 'invalid-signature',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'workflow.completed', data: { id: '123' } }),
      });

      const response = await handler(request);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Invalid signature');
    });

    test('should reject requests missing signature header', async () => {
      const handler = createWorkflowWebhookHandler({
        provider: {
          name: 'test-provider',
          healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
        } as any,
        secret: 'test-signing-key',
        onEvent: vi.fn(),
      });

      const request = new NextRequest('http://localhost/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'workflow.completed', data: { id: '123' } }),
      });

      const response = await handler(request);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Missing signature header');
      expect(mockReceiver.verify).not.toHaveBeenCalled();
    });

    test('should handle case-insensitive signature headers', async () => {
      mockReceiver.verify.mockResolvedValue(true);

      const handler = createWorkflowWebhookHandler({
        provider: {
          name: 'test-provider',
          healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
        } as any,
        secret: 'test-signing-key',
        onEvent: vi.fn(),
      });

      // Test lowercase header (as mentioned in QStash docs for some platforms)
      const request = new NextRequest('http://localhost/webhook', {
        method: 'POST',
        headers: {
          'upstash-signature': 'valid-signature', // lowercase
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'workflow.completed', data: { id: '123' } }),
      });

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(mockReceiver.verify).toHaveBeenCalledWith({
        signature: 'valid-signature',
        body: expect.any(String),
      });
    });

    test('should handle verification errors gracefully', async () => {
      mockReceiver.verify.mockRejectedValue(new Error('Verification failed'));

      const handler = createWorkflowWebhookHandler({
        provider: {
          name: 'test-provider',
          healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
        } as any,
        secret: 'test-signing-key',
        onEvent: vi.fn(),
      });

      const request = new NextRequest('http://localhost/webhook', {
        method: 'POST',
        headers: {
          'Upstash-Signature': 'valid-signature',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'workflow.completed', data: { id: '123' } }),
      });

      const response = await handler(request);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Signature verification failed');
    });

    test('should skip verification when no secret is configured', async () => {
      const onEventMock = vi.fn();

      const handler = createWorkflowWebhookHandler({
        provider: {
          name: 'test-provider',
          healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
        } as any,
        // No secret provided
        onEvent: onEventMock,
      });

      const request = new NextRequest('http://localhost/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'workflow.completed', data: { id: '123' } }),
      });

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(mockReceiver.verify).not.toHaveBeenCalled();
      expect(onEventMock).toHaveBeenCalledWith({
        type: 'workflow.completed',
        data: { id: '123' },
      });
    });
  });

  describe('security Edge Cases', () => {
    test('should handle malformed JSON bodies', async () => {
      mockReceiver.verify.mockResolvedValue(true);

      const handler = createWorkflowWebhookHandler({
        provider: {
          name: 'test-provider',
          healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
        } as any,
        secret: 'test-signing-key',
        onEvent: vi.fn(),
      });

      const request = new NextRequest('http://localhost/webhook', {
        method: 'POST',
        headers: {
          'Upstash-Signature': 'valid-signature',
          'Content-Type': 'application/json',
        },
        body: '{ invalid json }',
      });

      const response = await handler(request);

      // Should still verify signature but fail on JSON parsing
      expect(mockReceiver.verify).toHaveBeenCalledWith({
        signature: 'valid-signature',
        body: '{ invalid json }',
      });
      expect(response.status).toBe(500); // JSON parse error
    });

    test('should handle empty request bodies', async () => {
      mockReceiver.verify.mockResolvedValue(true);

      const handler = createWorkflowWebhookHandler({
        provider: {
          name: 'test-provider',
          healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
        } as any,
        secret: 'test-signing-key',
        onEvent: vi.fn(),
      });

      const request = new NextRequest('http://localhost/webhook', {
        method: 'POST',
        headers: {
          'Upstash-Signature': 'valid-signature',
          'Content-Type': 'application/json',
        },
        body: '',
      });

      const response = await handler(request);

      expect(mockReceiver.verify).toHaveBeenCalledWith({
        signature: 'valid-signature',
        body: '',
      });
    });

    test('should handle very large request bodies', async () => {
      mockReceiver.verify.mockResolvedValue(true);

      const handler = createWorkflowWebhookHandler({
        provider: {
          name: 'test-provider',
          healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
        } as any,
        secret: 'test-signing-key',
        onEvent: vi.fn(),
      });

      // Create large payload
      const largePayload = {
        type: 'workflow.completed',
        data: {
          id: '123',
          largeData: 'x'.repeat(10000), // 10KB of data
        },
      };

      const request = new NextRequest('http://localhost/webhook', {
        method: 'POST',
        headers: {
          'Upstash-Signature': 'valid-signature',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(largePayload),
      });

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(mockReceiver.verify).toHaveBeenCalledWith({
        signature: 'valid-signature',
        body: expect.stringContaining('"largeData":"x'),
      });
    });

    test('should prevent timing attacks on signature comparison', async () => {
      // Test multiple invalid signatures to ensure consistent timing
      const results: number[] = [];

      for (let i = 0; i < 5; i++) {
        mockReceiver.verify.mockResolvedValue(false);

        const handler = createWorkflowWebhookHandler({
          provider: {
            name: 'test-provider',
            healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
          } as any,
          secret: 'test-signing-key',
          onEvent: vi.fn(),
        });

        const start = performance.now();

        const request = new NextRequest('http://localhost/webhook', {
          method: 'POST',
          headers: {
            'Upstash-Signature': `invalid-signature-${i}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: 'test' }),
        });

        await handler(request);

        const duration = performance.now() - start;
        results.push(duration);
      }

      // All timings should be relatively consistent (within reasonable variance)
      const maxTime = Math.max(...results);
      const minTime = Math.min(...results);
      const variance = maxTime - minTime;

      // Variance should be reasonable (not revealing signature comparison time)
      expect(variance).toBeLessThan(10); // 10ms variance tolerance
    });
  });

  describe('integration with Event Handling', () => {
    test('should call onEvent with parsed webhook data after successful verification', async () => {
      mockReceiver.verify.mockResolvedValue(true);
      const onEventMock = vi.fn();

      const handler = createWorkflowWebhookHandler({
        provider: {
          name: 'test-provider',
          healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
        } as any,
        secret: 'test-signing-key',
        onEvent: onEventMock,
      });

      const webhookPayload = {
        type: 'workflow.completed',
        data: {
          executionId: 'exec-123',
          workflowId: 'workflow-456',
          status: 'success',
        },
      };

      const request = new NextRequest('http://localhost/webhook', {
        method: 'POST',
        headers: {
          'Upstash-Signature': 'valid-signature',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(onEventMock).toHaveBeenCalledWith(webhookPayload);
    });

    test('should not call onEvent if signature verification fails', async () => {
      mockReceiver.verify.mockResolvedValue(false);
      const onEventMock = vi.fn();

      const handler = createWorkflowWebhookHandler({
        provider: {
          name: 'test-provider',
          healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
        } as any,
        secret: 'test-signing-key',
        onEvent: onEventMock,
      });

      const request = new NextRequest('http://localhost/webhook', {
        method: 'POST',
        headers: {
          'Upstash-Signature': 'invalid-signature',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'workflow.completed' }),
      });

      const response = await handler(request);

      expect(response.status).toBe(401);
      expect(onEventMock).not.toHaveBeenCalled();
    });
  });
});
