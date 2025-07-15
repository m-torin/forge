import { spawn, type ChildProcess } from 'node:child_process';
import { join } from 'node:path';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import { afterAll, beforeAll } from 'vitest';

const wait = (ms: number) => setTimeoutPromise(ms);

interface QStashDevServer {
  process: ChildProcess;
  url: string;
  token: string;
  currentSigningKey: string;
  nextSigningKey: string;
}

let qstashServer: QStashDevServer | null = null;

/**
 * Get the path to the QStash CLI binary
 */
function getQStashCliPath(): string {
  // Try to find the QStash CLI in node_modules
  const possiblePaths = [
    // From the testing package
    join(
      process.cwd(),
      'node_modules',
      '.pnpm',
      '@upstash+qstash-cli@2.22.3',
      'node_modules',
      '@upstash',
      'qstash-cli',
      'bin',
      'qstash',
    ),
    // From the monorepo root
    join(
      process.cwd(),
      '..',
      '..',
      'node_modules',
      '.pnpm',
      '@upstash+qstash-cli@2.22.3',
      'node_modules',
      '@upstash',
      'qstash-cli',
      'bin',
      'qstash',
    ),
    // Fallback to npx
    'npx',
  ];

  for (const path of possiblePaths) {
    try {
      if (path === 'npx') {
        return 'npx';
      }
      // Check if file exists and is executable
      const fs = require('node:fs');
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- Safe: checking build tool paths
      if (fs.existsSync(path) && fs.statSync(path).mode & 0o111) {
        console.log(`[QStash] Found CLI at: ${path}`);
        return path;
      }
    } catch (unusedError) {
      // Continue to next path
    }
  }

  console.log('[QStash] CLI not found, falling back to npx');
  return 'npx';
}

/**
 * Start QStash development server for testing
 */
export async function startQStashDevServer(port = 8081): Promise<QStashDevServer> {
  if (qstashServer) {
    return qstashServer;
  }

  console.log(`[QStash] Starting development server on port ${port}...`);

  const qstashPath = getQStashCliPath();
  const args =
    qstashPath === 'npx'
      ? ['@upstash/qstash-cli', 'dev', '-port=' + port]
      : ['dev', '-port=' + port];

  console.log(`[QStash] Running: ${qstashPath} ${args.join(' ')}`);

  const process = spawn(qstashPath, args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
  });

  // Log stdout and stderr for debugging
  process.stdout?.on('data', data => {
    console.log(`[QStash] stdout: ${data.toString().trim()}`);
  });

  process.stderr?.on('data', data => {
    console.log(`[QStash] stderr: ${data.toString().trim()}`);
  });

  // Default test credentials for QStash dev server
  const url = `http://localhost:${port}`;
  const token = 'eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=';
  const currentSigningKey = 'sig_7kYjw48mhY7kAjqNGcy6cr29RJ6r';
  const nextSigningKey = 'sig_5ZB6DVzB1wjE8S6rZ7eenA8Pdnhs';

  qstashServer = {
    process,
    url,
    token,
    currentSigningKey,
    nextSigningKey,
  };

  // Wait for server to start
  let attempts = 0;
  const maxAttempts = 30;

  console.log(`[QStash] Waiting for server to start on ${url}...`);

  while (attempts < maxAttempts) {
    try {
      // Try a simple request to check if server is responding
      const response = await fetch(`${url}/v2/messages`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`[QStash] Health check response: ${response.status} ${response.statusText}`);
      // QStash is running if we get any response (even 401/404)
      if (response.status !== undefined) {
        console.log(`[QStash] Development server started successfully on ${url}`);
        break;
      }
    } catch (error) {
      console.log(
        `[QStash] Health check attempt ${attempts + 1} failed:`,
        error instanceof Error ? error.message : error,
      );
    }

    await wait(1000);
    attempts++;
  }

  if (attempts >= maxAttempts) {
    console.log(`[QStash] Server failed to start after ${maxAttempts} attempts`);
    throw new Error(`[QStash] Failed to start development server after ${maxAttempts} attempts`);
  }

  // Set environment variables for tests
  globalThis.process.env.QSTASH_URL = url;
  globalThis.process.env.QSTASH_TOKEN = token;
  globalThis.process.env.QSTASH_CURRENT_SIGNING_KEY = currentSigningKey;
  globalThis.process.env.QSTASH_NEXT_SIGNING_KEY = nextSigningKey;

  console.log(`[QStash] Environment variables set:
      QSTASH_URL=${url}
      QSTASH_TOKEN=${token}
      QSTASH_CURRENT_SIGNING_KEY=${currentSigningKey}
      QSTASH_NEXT_SIGNING_KEY=${nextSigningKey}
    `);

  return qstashServer;
}

/**
 * Stop QStash development server
 */
export async function stopQStashDevServer(): Promise<void> {
  if (!qstashServer) {
    return;
  }

  console.log('[QStash] Stopping development server...');

  return new Promise(resolve => {
    qstashServer!.process.once('close', () => {
      console.log('[QStash] Development server stopped');
      qstashServer = null;
      resolve();
    });

    qstashServer!.process.kill('SIGTERM');

    // Force kill after 5 seconds
    setTimeout(() => {
      if (qstashServer?.process) {
        qstashServer.process.kill('SIGKILL');
      }
      resolve();
    }, 5000);
  });
}

/**
 * Setup QStash for tests - starts server before all tests
 */
export function setupQStash(): void {
  beforeAll(async () => {
    await startQStashDevServer();
  }, 30000); // 30 second timeout

  afterAll(async () => {
    await stopQStashDevServer();
  }, 10000); // 10 second timeout
}

/**
 * Get QStash server info
 */
export function getQStashServer(): QStashDevServer | null {
  return qstashServer;
}

/**
 * Check if QStash server is running
 */
export function isQStashServerRunning(): boolean {
  return qstashServer !== null && !qstashServer.process.killed;
}
