# Upstash Redis Integration

This module provides integration with Upstash Redis, a serverless Redis-compatible database designed
for modern applications.

## Overview

Upstash Redis is optimized for:

- Serverless and edge functions
- Pay-per-request pricing with zero cost when idle
- Global replication for low latency
- Connectionless HTTP-based operations
- Redis protocol compatibility

## Setup

### Environment Variables

Add these environment variables to your `.env.local` file:

```bash
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

You can get these from your Upstash Redis dashboard at
[console.upstash.com](https://console.upstash.com).

### Installation

The `@upstash/redis` dependency is already included in the database package.

## Usage

### Basic Usage

```typescript
import { redis, createUpstashRedisAdapter } from '@repo/database/redis';

// Direct client usage
await redis.set('key', 'value');
const value = await redis.get('key');

// Set with expiration
await redis.set('temp-key', 'temp-value', { ex: 3600 }); // expires in 1 hour

// Using environment variables
import { createUpstashRedisFromEnv } from '@repo/database/redis';
const envRedis = createUpstashRedisFromEnv();
```

### Using the Adapter

```typescript
import { createUpstashRedisAdapter } from '@repo/database/redis';

const adapter = createUpstashRedisAdapter();

// Initialize (optional, but good practice)
await adapter.initialize();

// Create/set data (collection = key prefix)
await adapter.create('users', {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
});

// Find unique record
const user = await adapter.findUnique('users', { id: 'user-1' });

// Update record
await adapter.update('users', 'user-1', { name: 'John Smith' });

// Delete record
await adapter.delete('users', 'user-1');
```

## Redis Data Structures

### String Operations

```typescript
// Basic key-value operations
await adapter.create('cache', { id: 'session-123', data: 'user-data' });

// Set with expiration
await adapter.setWithExpiration('cache', 'temp-data', { value: 42 }, 3600);

// Check if key exists
const exists = await adapter.exists('cache', 'session-123');

// Set expiration
await adapter.expire('cache', 'session-123', 1800);

// Get TTL
const ttl = await adapter.ttl('cache', 'session-123');
```

### Numeric Operations

```typescript
// Increment counters
await adapter.increment('counters', 'page-views'); // +1
await adapter.increment('counters', 'downloads', undefined, 5); // +5

// Decrement counters
await adapter.decrement('counters', 'credits', undefined, 2); // -2
```

### List Operations

```typescript
// Push items to list
await adapter.listPush(
  'queues',
  'emails',
  { to: 'user1@example.com', subject: 'Welcome' },
  { to: 'user2@example.com', subject: 'Newsletter' }
);

// Pop item from list
const nextEmail = await adapter.listPop('queues', 'emails');

// Get list range
const allEmails = await adapter.listRange('queues', 'emails', 0, -1);

// Get list length
const queueLength = await adapter.listLength('queues', 'emails');
```

### Set Operations

```typescript
// Add members to set
await adapter.setAdd('tags', 'post-1', 'javascript', 'redis', 'tutorial');

// Remove members
await adapter.setRemove('tags', 'post-1', 'tutorial');

// Get all members
const tags = await adapter.setMembers('tags', 'post-1');

// Check membership
const hasTag = await adapter.setIsMember('tags', 'post-1', 'javascript');
```

### Hash Operations

```typescript
// Set hash field
await adapter.hashSet('profiles', 'user-1', 'name', 'John Doe');
await adapter.hashSet('profiles', 'user-1', 'age', 30);

// Get hash field
const name = await adapter.hashGet('profiles', 'user-1', 'name');

// Get all hash fields
const profile = await adapter.hashGetAll('profiles', 'user-1');

// Delete hash fields
await adapter.hashDelete('profiles', 'user-1', 'age');
```

### Sorted Set Operations

```typescript
// Add scored members
await adapter.sortedSetAdd(
  'leaderboard',
  'game-1',
  { score: 1000, member: { userId: 'user-1', name: 'Alice' } },
  { score: 950, member: { userId: 'user-2', name: 'Bob' } }
);

// Get range (top players)
const topPlayers = await adapter.sortedSetRange('leaderboard', 'game-1', 0, 9);

// Get range with scores
const topWithScores = await adapter.sortedSetRange('leaderboard', 'game-1', 0, 9, true);

// Get player score
const playerScore = await adapter.sortedSetScore('leaderboard', 'game-1', {
  userId: 'user-1',
  name: 'Alice',
});
```

## Batch Operations

### Multiple Records

```typescript
// Set multiple records
await adapter.setMultiple('users', [
  { id: 'user-1', name: 'Alice', role: 'admin' },
  { id: 'user-2', name: 'Bob', role: 'user' },
  { id: 'user-3', name: 'Charlie', role: 'user' },
]);

// Get multiple records
const users = await adapter.getMultiple('users', ['user-1', 'user-2', 'user-3']);

// Delete multiple records
await adapter.deleteMultiple('users', ['user-2', 'user-3']);
```

### Pipeline Operations

```typescript
// Using Redis pipeline for atomic batch operations
const client = adapter.getClient();
const pipeline = client.pipeline();

pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
pipeline.incr('counter');

const results = await pipeline.exec();
// results[0] => "OK"
// results[1] => "OK"
// results[2] => 1
```

## Advanced Features

### Pattern Matching

```typescript
// Find records with pattern matching
const allUsers = await adapter.findMany('users', {
  pattern: 'users:*',
  limit: 100,
});

// Count records matching pattern
const userCount = await adapter.count('users', { pattern: 'users:*' });
```

### Connection Testing

```typescript
// Test connection
const pong = await adapter.ping(); // returns "PONG"

// Raw Redis commands
const result = await adapter.raw('info', ['server']);
```

### Database Management

```typescript
// Clear all data (use with caution!)
await adapter.flushAll(); // clears all databases
await adapter.flushDb(); // clears current database
```

## Use Cases

### Caching

```typescript
// Session cache
await adapter.setWithExpiration(
  'sessions',
  'sess_123',
  {
    userId: 'user-1',
    data: { theme: 'dark', language: 'en' },
  },
  3600
); // 1 hour expiration

// API response cache
await adapter.setWithExpiration(
  'api-cache',
  'users-list',
  {
    data: users,
    timestamp: Date.now(),
  },
  300
); // 5 minutes
```

### Rate Limiting

```typescript
// Simple rate limiting
const key = `rate_limit:${userId}:${endpoint}`;
const current = await adapter.increment('limits', key);

if (current === 1) {
  // First request, set expiration
  await adapter.expire('limits', key, 3600); // 1 hour window
}

if (current > 100) {
  throw new Error('Rate limit exceeded');
}
```

### Real-time Features

```typescript
// Live counters
await adapter.increment('live', 'active-users');
await adapter.setAdd('online', 'users', userId);

// Leaderboards
await adapter.sortedSetAdd('leaderboard', 'daily', { score: points, member: { userId, name } });
```

### Queue Management

```typescript
// Job queue
await adapter.listPush('jobs', 'email-queue', {
  type: 'welcome-email',
  userId: 'user-1',
  priority: 'high',
});

// Process jobs
const job = await adapter.listPop('jobs', 'email-queue');
if (job) {
  // Process job
  console.log('Processing job:', job);
}
```

## Best Practices

### 1. Key Naming Conventions

```typescript
// Use consistent patterns
const userKey = `users:${userId}`;
const sessionKey = `sessions:${sessionId}`;
const cacheKey = `cache:${endpoint}:${hash}`;
```

### 2. Expiration Management

```typescript
// Always set expiration for temporary data
await adapter.setWithExpiration('temp', 'data', value, 3600);

// Use TTL to check expiration
const remaining = await adapter.ttl('temp', 'data');
if (remaining < 60) {
  // Refresh data soon
}
```

### 3. Error Handling

```typescript
try {
  const result = await adapter.get('critical', 'data');
  if (!result) {
    // Handle missing data
    await adapter.create('critical', 'data', defaultValue);
  }
} catch (error) {
  console.error('Redis operation failed:', error);
  // Fallback to alternative data source
}
```

### 4. Memory Optimization

```typescript
// Use appropriate data structures
// Lists for ordered data
// Sets for unique collections
// Hashes for objects with many fields
// Sorted sets for ranked data

// Set expiration on large objects
await adapter.setWithExpiration('large-cache', 'data', largeObject, 1800);
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**

   ```
   Error: Missing Upstash Redis environment variables
   ```

   Solution: Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set.

2. **Connection Timeout**

   ```
   Error: Request timeout
   ```

   Solution: Check your network connection and Upstash service status.

3. **JSON Parsing Errors**
   ```
   Error: Unexpected token in JSON
   ```
   Solution: Ensure data is properly serialized before storage.

### Performance Tips

- Use pipeline operations for batch operations
- Set appropriate expiration times to manage memory
- Use scan operations for large datasets instead of keys
- Choose the right data structure for your use case
- Monitor memory usage in Upstash console

### Debugging

```typescript
// Enable debug logging
const adapter = createUpstashRedisAdapter();

// Test connection
try {
  await adapter.ping();
  console.log('Redis connection successful');
} catch (error) {
  console.error('Redis connection failed:', error);
}

// Monitor operations
const start = Date.now();
const result = await adapter.get('test', 'key');
console.log(`Operation took ${Date.now() - start}ms`);
```

## Links

- [Upstash Redis Documentation](https://upstash.com/docs/redis)
- [Upstash Console](https://console.upstash.com)
- [Redis JS SDK](https://github.com/upstash/redis-js)
- [Redis Commands Reference](https://redis.io/commands)
