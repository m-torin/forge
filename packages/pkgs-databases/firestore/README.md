# @repo/db-firestore

Firebase Firestore client with Next.js and edge runtime support.

## Features

- 🔥 Firebase Admin SDK integration
- 🌐 Multi-runtime support (Node.js, Edge, Browser)
- 📦 TypeScript-first with complete type safety
- ⚡ Optimized for serverless and edge environments
- 🚀 Built-in pagination and batch operations
- 🛡️ Comprehensive error handling
- 📊 Connection pooling and performance optimization

## Installation

```bash
pnpm add @repo/db-firestore
```

## Quick Start

### Server-side (Node.js)

```typescript
import { createServerClient } from "@repo/db-firestore/server";

// Create client with configuration
const firestore = createServerClient({
  projectId: "your-project-id",
  clientEmail: "your-service-account@your-project.iam.gserviceaccount.com",
  privateKey: process.env.FIREBASE_PRIVATE_KEY
});

// Basic operations
const doc = await firestore.doc("users/user-id").get();
const users = await firestore.collection("users").limit(10).get();
```

### Configuration

The package automatically detects configuration from environment variables:

```bash
# Firebase configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIRESTORE_DATABASE_ID=(default)

# Or use service account file
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

## API Reference

### Client Operations

```typescript
// Collection operations
const collection = firestore.collection("users");
await collection.add({ name: "John Doe" });

// Document operations
const doc = firestore.doc("users/john");
await doc.set({ name: "John Doe", age: 30 });
const data = await doc.get();

// Query operations
const query = collection.where("age", ">", 18).orderBy("name").limit(10);
const results = await query.get();
```

### Batch Operations

```typescript
import { executeBatch } from "@repo/db-firestore";

await executeBatch(firestore, [
  { type: "set", ref: doc1, data: { name: "Alice" } },
  { type: "update", ref: doc2, data: { age: 25 } },
  { type: "delete", ref: doc3 }
]);
```

### Pagination

```typescript
import { paginateQuery } from "@repo/db-firestore";

const result = await paginateQuery(
  firestore.collection("users").orderBy("createdAt"),
  { page: 1, pageSize: 20 }
);

console.log({
  items: result.items,
  total: result.total,
  hasNext: result.hasNext,
  hasPrev: result.hasPrev
});
```

### Safe Operations

```typescript
import { safeFirestoreOperation } from "@repo/db-firestore";

const result = await safeFirestoreOperation(async () => {
  return await firestore.doc("users/john").get();
});

if (result.success) {
  console.log("Document data:", result.data.data());
} else {
  console.error("Error:", result.error);
}
```

## Runtime Support

### Node.js

Full Firebase Admin SDK support with connection pooling.

### Edge Runtime

Optimized for Vercel Edge Functions and Cloudflare Workers.

### Browser

Client-side Firebase SDK integration (when available).

## TypeScript Support

Full TypeScript support with generated types:

```typescript
import type {
  FirestoreClient,
  FirestoreResult,
  PaginatedResult
} from "@repo/db-firestore";

// Strongly typed operations
const result: FirestoreResult<DocumentSnapshot> = await safeFirestoreOperation(
  () => firestore.doc("users/john").get()
);
```

## Best Practices

1. **Reuse client instances** - Create one client per application
2. **Use pagination** - Always paginate large queries
3. **Handle errors gracefully** - Use `safeFirestoreOperation` wrapper
4. **Optimize queries** - Use appropriate indexes and limits
5. **Batch operations** - Group multiple writes for efficiency

## Contributing

This package follows the monorepo conventions. See the main README for
development guidelines.
