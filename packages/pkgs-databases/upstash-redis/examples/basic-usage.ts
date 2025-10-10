import { CacheOperations, RateLimitOperations, SessionOperations } from '../src/operations';
import { createEdgeClient, createServerClient } from '../src/server';

// =============================================================================
// Basic Redis Operations
// =============================================================================

async function basicOperations() {
  // Create client from environment variables
  const redis = createServerClient();

  // String operations
  await redis.set('user:123:name', 'John Doe');
  const name = await redis.get('user:123:name');
  console.log('User name:', name); // "John Doe"

  // Set with expiration (1 hour)
  await redis.set('session:abc123', 'user-data', { ex: 3600 });

  // Numeric operations
  await redis.incr('page:views');
  await redis.incr('page:views');
  const views = await redis.get('page:views');
  console.log('Page views:', views); // "2"

  // List operations
  await redis.lpush('notifications:user:123', 'New message');
  await redis.lpush('notifications:user:123', 'Friend request');
  const notifications = await redis.lrange('notifications:user:123', 0, -1);
  console.log('Notifications:', notifications);

  // Hash operations
  await redis.hset('user:123', {
    name: 'John Doe',
    email: 'john@example.com',
    age: '30',
  });
  const user = await redis.hgetall('user:123');
  console.log('User data:', user);

  // Set operations
  await redis.sadd('online:users', 'user:123', 'user:456');
  const onlineUsers = await redis.smembers('online:users');
  console.log('Online users:', onlineUsers);

  // Sorted set operations (leaderboard)
  await redis.zadd('leaderboard', { score: 1000, member: 'user:123' });
  await redis.zadd('leaderboard', { score: 950, member: 'user:456' });
  const topUsers = await redis.zrange('leaderboard', 0, 9, { rev: true, withScores: true });
  console.log('Top users:', topUsers);
}

// =============================================================================
// Pipeline/Transaction Operations
// =============================================================================

async function batchOperations() {
  const redis = createServerClient();

  // Pipeline for multiple commands
  const pipeline = redis.pipeline();
  pipeline.set('key1', 'value1');
  pipeline.set('key2', 'value2');
  pipeline.get('key1');
  pipeline.get('key2');

  const results = await pipeline.exec();
  console.log('Pipeline results:', results);

  // Multi/transaction for atomic operations
  const multi = redis.multi();
  multi.incr('counter');
  multi.get('counter');

  const transactionResults = await multi.exec();
  console.log('Transaction results:', transactionResults);
}

// =============================================================================
// Advanced Caching Operations
// =============================================================================

async function cachingOperations() {
  const redis = createServerClient();
  const cache = new CacheOperations(redis);

  // Simple caching
  const userId = '123';
  const cacheKey = `user:${userId}`;

  let user = await cache.get(cacheKey);
  if (!user) {
    // Simulate database fetch
    user = { id: userId, name: 'John Doe', email: 'john@example.com' };

    // Cache for 1 hour
    await cache.set(cacheKey, user, { ttl: 3600 });
  }
  console.log('Cached user:', user);

  // Cache with stale-while-revalidate
  const expensiveData = await cache.getWithSWR(
    'expensive:computation',
    async () => {
      // Simulate expensive computation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { result: 'computed-value', timestamp: Date.now() };
    },
    {
      ttl: 300, // Fresh for 5 minutes
      staleTtl: 3600, // Serve stale for 1 hour while revalidating
    },
  );
  console.log('Expensive data:', expensiveData);

  // Multi-level caching
  const multilevelData = await cache.getMultiLevel(
    ['l1:user:123', 'l2:user:123'],
    async () => {
      // Database fetch
      return { id: '123', name: 'John Doe' };
    },
    [
      { ttl: 60 }, // L1: 1 minute
      { ttl: 3600 }, // L2: 1 hour
    ],
  );
  console.log('Multi-level data:', multilevelData);

  // Cache invalidation
  await cache.invalidate(['user:123', 'users:*']);

  // Cache warming
  await cache.warm(
    'popular:products',
    async () => {
      return ['product1', 'product2', 'product3'];
    },
    { ttl: 1800 },
  );
}

// =============================================================================
// Rate Limiting Operations
// =============================================================================

async function rateLimitingOperations() {
  const redis = createServerClient();
  const rateLimit = new RateLimitOperations(redis);

  const userId = '123';
  const ip = '192.168.1.1';

  // Simple rate limiting (10 requests per minute)
  const simpleLimit = await rateLimit.checkLimit(`user:${userId}`, {
    max: 10,
    window: 60,
  });

  if (simpleLimit.allowed) {
    console.log('Request allowed. Remaining:', simpleLimit.remaining);
  } else {
    console.log('Rate limit exceeded. Reset in:', simpleLimit.resetTime);
  }

  // Sliding window rate limiting
  const slidingLimit = await rateLimit.slidingWindow(`api:${ip}`, {
    max: 100,
    window: 3600, // 100 requests per hour
  });

  // Token bucket rate limiting
  const bucketLimit = await rateLimit.tokenBucket(`premium:${userId}`, {
    capacity: 50, // Max 50 tokens
    refillRate: 10, // 10 tokens per minute
    window: 60,
  });

  // Hierarchical rate limiting
  const hierarchicalLimits = await rateLimit.hierarchical([
    { key: `user:${userId}`, max: 100, window: 3600 }, // User limit
    { key: `ip:${ip}`, max: 1000, window: 3600 }, // IP limit
    { key: 'global', max: 10000, window: 3600 }, // Global limit
  ]);

  console.log(
    'All limits passed:',
    hierarchicalLimits.every(l => l.allowed),
  );

  // Burst limiting
  const burstLimit = await rateLimit.burstLimit(`burst:${userId}`, {
    normalRate: { max: 10, window: 60 }, // Normal: 10/min
    burstRate: { max: 50, window: 60 }, // Burst: 50/min
    burstDuration: 300, // Burst lasts 5 minutes
  });
}

// =============================================================================
// Session Management Operations
// =============================================================================

async function sessionOperations() {
  const redis = createServerClient();
  const sessions = new SessionOperations(redis);

  const userId = '123';
  const sessionId = 'session_abc123';

  // Create session
  const session = await sessions.create(
    sessionId,
    {
      userId,
      email: 'john@example.com',
      role: 'user',
      permissions: ['read', 'write'],
    },
    {
      ttl: 3600, // 1 hour
      sliding: true, // Extend on activity
    },
  );
  console.log('Created session:', session);

  // Get session
  const retrievedSession = await sessions.get(sessionId);
  if (retrievedSession) {
    console.log('Session data:', retrievedSession.data);
    console.log('Expires at:', new Date(retrievedSession.expiresAt));
  }

  // Update session
  await sessions.update(sessionId, {
    lastActivity: Date.now(),
    ipAddress: '192.168.1.1',
  });

  // Extend session
  await sessions.extend(sessionId, 1800); // Extend by 30 minutes

  // Multi-device session management
  await sessions.createMultiDevice(userId, sessionId, {
    deviceId: 'device_xyz789',
    deviceType: 'mobile',
    userAgent: 'MyApp/1.0',
  });

  // Get all user sessions
  const userSessions = await sessions.getUserSessions(userId);
  console.log('User sessions:', userSessions);

  // Session cleanup
  await sessions.cleanup(); // Remove expired sessions

  // Destroy session
  await sessions.destroy(sessionId);
}

// =============================================================================
// Real-time Pub/Sub Operations
// =============================================================================

async function pubsubOperations() {
  const redis = createServerClient();

  // Simple publish/subscribe
  const subscriber = createServerClient({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  // Publisher
  await redis.publish(
    'notifications',
    JSON.stringify({
      type: 'user_message',
      userId: '123',
      message: 'Hello World!',
    }),
  );

  await redis.publish(
    'chat:room:general',
    JSON.stringify({
      userId: '123',
      username: 'john_doe',
      message: 'Hello everyone!',
      timestamp: Date.now(),
    }),
  );

  console.log('Messages published to channels');

  // Pattern-based publishing
  await redis.publish(
    'user:123:notifications',
    JSON.stringify({
      type: 'friend_request',
      from: 'user:456',
    }),
  );
}

// =============================================================================
// Edge Runtime Operations
// =============================================================================

async function edgeOperations() {
  // Edge-compatible client (uses REST API)
  const redis = createEdgeClient({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  // All operations work the same in edge
  await redis.set('edge:test', 'works in edge runtime');
  const value = await redis.get('edge:test');
  console.log('Edge value:', value);

  // Optimized for edge
  const cache = new CacheOperations(redis);
  const cachedData = await cache.get('edge:cached:data');
  if (!cachedData) {
    await cache.set('edge:cached:data', { message: 'Hello from edge!' });
  }
}

// =============================================================================
// Lua Script Operations
// =============================================================================

async function luaScriptOperations() {
  const redis = createServerClient();

  // Atomic counter with limit
  const counterScript = `
    local current = redis.call('GET', KEYS[1])
    local limit = tonumber(ARGV[1])
    
    if current == false then
      current = 0
    else
      current = tonumber(current)
    end
    
    if current < limit then
      local new_value = redis.call('INCR', KEYS[1])
      return {1, new_value}
    else
      return {0, current}
    end
  `;

  const result = await redis.eval(counterScript, ['limited:counter'], ['10']);
  console.log('Counter script result:', result);

  // Distributed lock
  const lockScript = `
    local key = KEYS[1]
    local token = ARGV[1]
    local ttl = ARGV[2]
    
    if redis.call('SET', key, token, 'NX', 'EX', ttl) then
      return 1
    else
      return 0
    end
  `;

  const lockAcquired = await redis.eval(lockScript, ['lock:resource'], ['token123', '10']);
  if (lockAcquired) {
    console.log('Lock acquired successfully');

    // Do work here...

    // Release lock
    const releaseScript = `
      if redis.call('GET', KEYS[1]) == ARGV[1] then
        return redis.call('DEL', KEYS[1])
      else
        return 0
      end
    `;

    await redis.eval(releaseScript, ['lock:resource'], ['token123']);
    console.log('Lock released');
  }
}

// =============================================================================
// Error Handling and Monitoring
// =============================================================================

async function errorHandlingOperations() {
  const redis = createServerClient();

  try {
    // Operation that might fail
    await redis.get('test:key');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Redis operation failed:', error.message);

      // Check if error is retryable
      const isRetryable = error.message.includes('timeout') || error.message.includes('connection');

      if (isRetryable) {
        console.log('Error is retryable, implementing backoff...');
        // Implement exponential backoff
      }
    }
  }

  // Connection health check
  try {
    await redis.ping();
    console.log('Redis connection is healthy');
  } catch (error) {
    console.error('Redis health check failed:', error);
  }
}

// =============================================================================
// Run Examples
// =============================================================================

async function runExamples() {
  console.log('🚀 Running Upstash Redis Examples...\n');

  try {
    console.log('1. Basic Operations...');
    await basicOperations();

    console.log('\n2. Batch Operations...');
    await batchOperations();

    console.log('\n3. Caching Operations...');
    await cachingOperations();

    console.log('\n4. Rate Limiting...');
    await rateLimitingOperations();

    console.log('\n5. Session Management...');
    await sessionOperations();

    console.log('\n6. Pub/Sub Operations...');
    await pubsubOperations();

    console.log('\n7. Edge Operations...');
    await edgeOperations();

    console.log('\n8. Lua Scripts...');
    await luaScriptOperations();

    console.log('\n9. Error Handling...');
    await errorHandlingOperations();

    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example failed:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}

export {
  basicOperations,
  batchOperations,
  cachingOperations,
  edgeOperations,
  errorHandlingOperations,
  luaScriptOperations,
  pubsubOperations,
  rateLimitingOperations,
  sessionOperations,
};
