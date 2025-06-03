import { parseError } from '@repo/observability/error';
import { noseconeMiddleware, noseconeOptions } from '@repo/security/middleware';

// Initialize security headers middleware
const securityHeaders = noseconeMiddleware(noseconeOptions);

// Initialize auth middleware
// const authHandler = authMiddleware();

async function main() {
  try {
    // Set up security headers
    securityHeaders();

    // Set up auth middleware
    // Note: In a worker context, you might want to handle auth differently
    // than in a web context. You may want to validate tokens or credentials
    // for each job/request instead of using the middleware directly.

    // Your worker logic here
    console.log('Worker started with auth and security setup');
  } catch (error) {
    const message = parseError(error);
    console.error('Worker error:', message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
