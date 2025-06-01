# Upstash Vector Integration

This module provides integration with Upstash Vector, a serverless vector database designed for AI applications and semantic search.

## Overview

Upstash Vector is optimized for:
- High-performance vector similarity search
- Serverless architecture with pay-per-use pricing
- AI/ML applications with embedding storage and retrieval
- Real-time semantic search and RAG (Retrieval-Augmented Generation)

## Setup

### Environment Variables

Add these environment variables to your `.env.local` file:

```bash
UPSTASH_VECTOR_REST_URL=your_upstash_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token
```

You can get these from your Upstash Vector dashboard at [console.upstash.com](https://console.upstash.com).

### Installation

The `@upstash/vector` dependency is already included in the database package.

## Usage

### Basic Usage

```typescript
import { upstash, createUpstashVectorAdapter } from '@repo/database/upstash';

// Direct client usage
const vectorData = {
  id: 'doc-1',
  vector: [0.1, 0.2, 0.3, ...], // Your embedding vector
  metadata: { title: 'Document 1', category: 'tech' }
};

await upstash.upsert(vectorData);

// Query similar vectors
const results = await upstash.query({
  vector: [0.1, 0.2, 0.3, ...],
  topK: 10,
  includeMetadata: true
});
```

### Using the Adapter

```typescript
import { createUpstashVectorAdapter } from '@repo/database/upstash';

const adapter = createUpstashVectorAdapter();

// Initialize (optional, but good practice)
await adapter.initialize();

// Create/upsert vectors (collection = namespace)
await adapter.create('documents', {
  id: 'doc-1',
  vector: [0.1, 0.2, 0.3, ...],
  metadata: { title: 'Document 1' }
});

// Query similar vectors
const results = await adapter.query({
  vector: [0.1, 0.2, 0.3, ...],
  topK: 5,
  includeMetadata: true
}, 'documents');

// Fetch specific vectors
const vectors = await adapter.fetch(['doc-1', 'doc-2'], {
  namespace: 'documents',
  includeMetadata: true
});
```

## Vector Operations

### Similarity Search

```typescript
// Basic similarity search
const results = await adapter.query({
  vector: embedding, // Your query vector
  topK: 10, // Number of results
  includeMetadata: true
}, 'my-namespace');

// With metadata filtering (if supported by your plan)
const filteredResults = await adapter.query({
  vector: embedding,
  topK: 10,
  filter: 'category = "technology"',
  includeMetadata: true
}, 'my-namespace');
```

### Batch Operations

```typescript
// Upsert multiple vectors
const vectors = [
  { id: 'doc-1', vector: [0.1, 0.2, ...], metadata: { type: 'article' } },
  { id: 'doc-2', vector: [0.3, 0.4, ...], metadata: { type: 'blog' } }
];

await adapter.upsertMany(vectors, 'documents');

// Delete multiple vectors
await adapter.deleteMany(['doc-1', 'doc-2'], 'documents');
```

### Index Management

```typescript
// Get index information
const info = await adapter.getInfo();
console.log('Vector count:', info.vectorCount);
console.log('Index dimension:', info.dimension);

// Reset entire index (use with caution!)
await adapter.reset();
```

## Namespaces

Upstash Vector supports namespaces to partition your data within a single index:

```typescript
// Store vectors in different namespaces
await adapter.create('documents', vectorData);
await adapter.create('images', imageVectorData);
await adapter.create('audio', audioVectorData);

// Query within specific namespace
const docResults = await adapter.query(queryVector, 'documents');
const imageResults = await adapter.query(queryVector, 'images');
```

## Best Practices

### 1. Vector Dimensions

Ensure all vectors in your index have the same dimensions:

```typescript
// All vectors must have the same length
const vector384 = new Array(384).fill(0).map(() => Math.random());
const vector1536 = new Array(1536).fill(0).map(() => Math.random());

// Don't mix different dimensions in the same index
```

### 2. Metadata Structure

Keep metadata consistent and lightweight:

```typescript
interface DocumentMetadata {
  title: string;
  category: string;
  timestamp: number;
  author?: string;
}

const vectorWithMetadata = {
  id: 'doc-1',
  vector: embedding,
  metadata: {
    title: 'My Document',
    category: 'tech',
    timestamp: Date.now()
  } as DocumentMetadata
};
```

### 3. Error Handling

```typescript
try {
  const results = await adapter.query({
    vector: embedding,
    topK: 10
  }, 'documents');
} catch (error) {
  console.error('Vector query failed:', error);
  // Handle error appropriately
}
```

### 4. Connection Management

The adapter uses a singleton client that doesn't require manual connection management:

```typescript
// No need to manually connect/disconnect
const adapter = createUpstashVectorAdapter();
// Client is ready to use immediately
```

## Integration with Embedding Models

### With OpenAI Embeddings

```typescript
import OpenAI from 'openai';

const openai = new OpenAI();

async function storeDocument(text: string, metadata: any) {
  // Generate embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  
  const embedding = response.data[0].embedding;
  
  // Store in Upstash Vector
  await adapter.create('documents', {
    id: `doc-${Date.now()}`,
    vector: embedding,
    metadata
  });
}
```

### Semantic Search Example

```typescript
async function semanticSearch(query: string, limit = 5) {
  // Generate query embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  
  const queryEmbedding = response.data[0].embedding;
  
  // Search similar documents
  const results = await adapter.query({
    vector: queryEmbedding,
    topK: limit,
    includeMetadata: true
  }, 'documents');
  
  return results.map(result => ({
    score: result.score,
    metadata: result.metadata,
    id: result.id
  }));
}
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```
   Error: Missing Upstash Vector environment variables
   ```
   Solution: Ensure `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN` are set.

2. **Dimension Mismatch**
   ```
   Error: Vector dimension mismatch
   ```
   Solution: Ensure all vectors have the same dimension as your index.

3. **Quota Exceeded**
   ```
   Error: Request quota exceeded
   ```
   Solution: Check your Upstash Vector usage limits and upgrade if needed.

### Performance Tips

- Use batch operations (`upsertMany`, `deleteMany`) for better performance
- Keep metadata lightweight to reduce storage costs
- Use appropriate `topK` values to balance accuracy and performance
- Consider using namespaces to organize different types of vectors

## Links

- [Upstash Vector Documentation](https://upstash.com/docs/vector)
- [Upstash Vector Console](https://console.upstash.com)
- [Vector JS SDK](https://github.com/upstash/vector-js)