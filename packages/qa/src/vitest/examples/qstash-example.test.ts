import { describe, expect, test } from 'vitest';
import { getQStashServer, isQStashServerRunning, setupQStash } from '../setup/qstash';

// Setup QStash for this test suite
setupQStash();

describe('qStash Integration Example', () => {
  test('should have QStash server running', () => {
    expect(isQStashServerRunning()).toBeTruthy();
  });

  test('should have QStash environment variables set', () => {
    expect(process.env.QSTASH_URL).toBe('http://localhost:8081');
    expect(process.env.QSTASH_TOKEN).toBeDefined();
    expect(process.env.QSTASH_CURRENT_SIGNING_KEY).toBeDefined();
    expect(process.env.QSTASH_NEXT_SIGNING_KEY).toBeDefined();
  });

  test('should be able to connect to QStash server', async () => {
    const server = getQStashServer();
    expect(server).not.toBeNull();

    const response = await fetch(`${server!.url}/v2/messages`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${server!.token}`,
      },
    });
    // QStash is working if we get any valid HTTP response
    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  test('should have correct QStash credentials', () => {
    const server = getQStashServer();
    expect(server).not.toBeNull();

    expect(server!.url).toBe('http://localhost:8081');
    expect(server!.token).toBe(
      'eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=',
    );
    expect(server!.currentSigningKey).toBe('sig_7kYjw48mhY7kAjqNGcy6cr29RJ6r');
    expect(server!.nextSigningKey).toBe('sig_5ZB6DVzB1wjE8S6rZ7eenA8Pdnhs');
  });
});
