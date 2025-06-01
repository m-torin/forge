# @repo/database

A database abstraction layer that supports Prisma (PostgreSQL), Cloud Firestore, Upstash Vector (serverless vector database), and Upstash Redis (serverless Redis).

## Features

- Unified database interface for Prisma, Firestore, Upstash Vector, and Upstash Redis
- Specialized vector database support for AI/ML applications
- High-performance Redis operations for caching and real-time features
- Ability to switch between database providers at runtime
- Direct access to provider-specific features when needed
- Backward compatibility with existing Prisma code

## Configuration

Set the database provider in your environment variables:

```env
# Use "prisma", "firestore", "upstash-vector", or "upstash-redis"
DATABASE_PROVIDER="prisma"
```

### Prisma Configuration

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
```

### Firestore Configuration

```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-client-email@example.com"
FIREBASE_PRIVATE_KEY="your-private-key"
```

### Upstash Vector Configuration

```env
UPSTASH_VECTOR_REST_URL="your-upstash-vector-url"
UPSTASH_VECTOR_REST_TOKEN="your-upstash-vector-token"
```

### Upstash Redis Configuration

```env
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
```

## Usage

### Using the Abstraction Layer

```typescript
import { database } from '@repo/database';

// Create a new record
const user = await database.create('user', {
  name: 'John Doe',
  email: 'john@example.com',
});

// Find a unique record
const user = await database.findUnique('user', {
  where: { id: 'user-id' },
});

// Find many records
const users = await database.findMany('user', {
  where: { active: true },
  take: 10,
});

// Update a record
const updatedUser = await database.update('user', 'user-id', {
  name: 'Jane Doe',
});

// Delete a record
const deletedUser = await database.delete('user', 'user-id');

// Count records
const count = await database.count('user', {
  where: { active: true },
});
```

### Direct Provider Access

For Prisma-specific features:

```typescript
import { prisma } from '@repo/database/prisma';

// Use Prisma client directly
const users = await prisma.user.findMany({
  include: {
    posts: true,
  },
});
```

For Firestore-specific features:

```typescript
import { firestore } from '@repo/database/firestore';

// Use Firestore client directly
const userRef = firestore.collection('users').doc('user-id');
const snapshot = await userRef.get();
const userData = snapshot.data();
```

For Upstash Vector-specific features:

```typescript
import { upstash, createUpstashVectorAdapter } from '@repo/database/upstash';

// Use Upstash Vector client directly
await upstash.upsert({
  id: 'doc-1',
  vector: [0.1, 0.2, 0.3, ...], // Your embedding vector
  metadata: { title: 'Document 1' }
});

// Similarity search
const results = await upstash.query({
  vector: [0.1, 0.2, 0.3, ...],
  topK: 10,
  includeMetadata: true
});

// Using the adapter for unified interface
const adapter = createUpstashVectorAdapter();
const searchResults = await adapter.query({
  vector: embedding,
  topK: 5
}, 'documents');
```

For Upstash Redis-specific features:

```typescript
import { redis, createUpstashRedisAdapter } from '@repo/database/redis';

// Use Upstash Redis client directly
await redis.set('user:123', JSON.stringify({ name: 'John', email: 'john@example.com' }));
await redis.set('session:abc', 'active', { ex: 3600 }); // with expiration

// Get data
const userData = await redis.get('user:123');
const sessionStatus = await redis.get('session:abc');

// Using the adapter for unified interface
const adapter = createUpstashRedisAdapter();

// Store with automatic JSON serialization
await adapter.create('users', { id: '123', name: 'John', email: 'john@example.com' });

// Redis-specific operations
await adapter.listPush('notifications', 'user-123', 
  { type: 'email', message: 'Welcome!' }
);

await adapter.sortedSetAdd('leaderboard', 'game-1',
  { score: 1000, member: { userId: '123', name: 'John' } }
);
```

### Server Actions

The package includes server actions for common database operations:

```typescript
import { getUsersFromDatabase } from '@repo/database/actions';

// Use server action
const { data, success, error } = await getUsersFromDatabase();
```

## Switching Providers at Runtime

```typescript
import { database } from '@repo/database';
import { Database } from '@repo/database/database';

// Cast to Database type to access provider methods
const db = database as Database;

// Get current provider
const currentProvider = db.getProvider();

// Switch to Firestore
await db.setProvider('firestore');

// Switch back to Prisma
await db.setProvider('prisma');
```

## Development

### Adding Support for a New Database Provider

1. Create a new adapter that implements the `DatabaseAdapter` interface
2. Update the `Database` class to support the new provider
3. Export the provider-specific client and utilities

## License

This package is private and for internal use only.
