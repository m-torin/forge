import { AIOperations, DocumentOperations, SemanticSearchOperations } from '../src/operations';
import { createEdgeClient, createServerClient } from '../src/server';

// =============================================================================
// Basic Vector Operations
// =============================================================================

async function basicVectorOperations() {
  // Create client from environment variables
  const vector = createServerClient();

  // Basic vector operations
  const testVector = [0.1, 0.2, 0.3, 0.4, 0.5];

  // Upsert a single vector
  await vector.upsert({
    id: 'doc1',
    vector: testVector,
    metadata: {
      title: 'My Document',
      category: 'tech',
      author: 'john_doe',
      created_at: new Date().toISOString(),
    },
  });

  // Upsert multiple vectors
  await vector.upsert([
    {
      id: 'doc2',
      vector: [0.2, 0.3, 0.4, 0.5, 0.6],
      metadata: { title: 'Document 2', category: 'science' },
    },
    {
      id: 'doc3',
      vector: [0.3, 0.4, 0.5, 0.6, 0.7],
      metadata: { title: 'Document 3', category: 'tech' },
    },
  ]);

  // Query similar vectors
  const queryResults = await vector.query({
    vector: [0.15, 0.25, 0.35, 0.45, 0.55],
    topK: 5,
    includeMetadata: true,
    includeValues: true,
  });

  console.log('Query results:', queryResults.matches);

  // Query with filters
  const filteredResults = await vector.query({
    vector: testVector,
    topK: 10,
    filter: 'category = "tech"',
    includeMetadata: true,
  });

  console.log('Filtered results:', filteredResults.matches);

  // Fetch specific vectors
  const fetched = await vector.fetch(['doc1', 'doc2']);
  console.log('Fetched vectors:', fetched.vectors);

  // Update a vector
  await vector.update({
    id: 'doc1',
    metadata: {
      title: 'Updated Document',
      updated_at: new Date().toISOString(),
    },
  });

  // Delete vectors
  await vector.delete(['doc3']);

  // Delete with filter
  await vector.delete({ filter: 'category = "outdated"' });
}

// =============================================================================
// Embedding-Enabled Operations
// =============================================================================

async function embeddingOperations() {
  // Create client with OpenAI embeddings
  const vector = createServerClient({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    embeddings: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'text-embedding-ada-002',
    },
  });

  // Generate embedding from text
  const embedding = await vector.generateEmbedding('This is a sample text');
  console.log('Generated embedding:', embedding.slice(0, 5), '...'); // Show first 5 dimensions

  // Upsert with auto-embedding
  await vector.upsertWithEmbedding({
    id: 'article1',
    text: 'Artificial intelligence is revolutionizing software development',
    metadata: {
      title: 'AI in Software Development',
      category: 'technology',
      published: '2024-01-15',
    },
  });

  // Batch upsert with embeddings
  await vector.upsertWithEmbedding([
    {
      id: 'article2',
      text: 'Machine learning models are becoming more efficient',
      metadata: { title: 'ML Efficiency', category: 'ai' },
    },
    {
      id: 'article3',
      text: 'Neural networks enable complex pattern recognition',
      metadata: { title: 'Neural Networks', category: 'ai' },
    },
  ]);

  // Query using text (auto-embedding)
  const textQueryResults = await vector.queryWithText({
    text: 'machine learning artificial intelligence',
    topK: 5,
    includeMetadata: true,
    filter: 'category = "ai"',
  });

  console.log('Text query results:', textQueryResults.matches);

  // Semantic search
  const semanticResults = await vector.queryWithText({
    text: 'How does AI help with coding?',
    topK: 3,
    includeMetadata: true,
  });

  console.log('Semantic search results:', semanticResults.matches);
}

// =============================================================================
// Document Processing Operations
// =============================================================================

async function documentProcessingOperations() {
  const vector = createServerClient({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    embeddings: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'text-embedding-ada-002',
    },
  });

  const docs = new DocumentOperations(vector);

  // Process a long document with chunking
  const longDocument = `
    Artificial Intelligence (AI) has emerged as one of the most transformative technologies of our time.
    From revolutionizing healthcare and finance to transforming how we interact with technology,
    AI is reshaping industries and creating new possibilities that were once confined to science fiction.

    Machine learning, a subset of AI, enables computers to learn and improve from experience without
    being explicitly programmed for every task. This capability has led to breakthroughs in image
    recognition, natural language processing, and predictive analytics.

    Deep learning, which uses neural networks with multiple layers, has been particularly successful
    in handling complex problems like computer vision and speech recognition. These systems can
    process vast amounts of data and identify patterns that would be impossible for humans to detect.

    The applications of AI continue to expand, with new use cases emerging in autonomous vehicles,
    smart cities, personalized medicine, and intelligent automation. As AI technology continues
    to advance, it promises to unlock even greater possibilities for innovation and progress.
  `;

  // Process document with automatic chunking and embedding
  await docs.processDocument({
    id: 'ai-overview',
    text: longDocument,
    metadata: {
      title: 'AI Overview Document',
      author: 'Tech Writer',
      category: 'technology',
      tags: ['ai', 'machine-learning', 'deep-learning'],
    },
    chunkSize: 500,
    chunkOverlap: 50,
  });

  // Process multiple documents
  await docs.processBatch([
    {
      id: 'ml-guide',
      text: 'Machine Learning is a method of data analysis that automates analytical model building...',
      metadata: { title: 'ML Guide', category: 'education' },
    },
    {
      id: 'dl-basics',
      text: 'Deep Learning is a subset of machine learning that uses neural networks with many layers...',
      metadata: { title: 'Deep Learning Basics', category: 'education' },
    },
  ]);

  // Search processed documents
  const searchResults = await docs.searchDocuments({
    query: 'What is machine learning?',
    topK: 5,
    filters: { category: 'education' },
  });

  console.log('Document search results:', searchResults);

  // Get document chunks
  const chunks = await docs.getDocumentChunks('ai-overview');
  console.log(`Found ${chunks.length} chunks for ai-overview document`);
}

// =============================================================================
// Semantic Search Operations
// =============================================================================

async function semanticSearchOperations() {
  const vector = createServerClient({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    embeddings: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'text-embedding-ada-002',
    },
  });

  const search = new SemanticSearchOperations(vector);

  // Index content for semantic search
  await search.indexContent([
    {
      id: 'product1',
      text: 'Wireless Bluetooth headphones with noise cancellation',
      metadata: {
        category: 'electronics',
        price: 199.99,
        brand: 'TechSound',
        features: ['bluetooth', 'noise-cancellation', 'wireless'],
      },
    },
    {
      id: 'product2',
      text: 'Ergonomic office chair with lumbar support',
      metadata: {
        category: 'furniture',
        price: 299.99,
        brand: 'ComfortSeating',
      },
    },
    {
      id: 'product3',
      text: 'Mechanical keyboard with RGB lighting',
      metadata: {
        category: 'electronics',
        price: 129.99,
        brand: 'KeyMaster',
      },
    },
  ]);

  // Semantic search with various query types
  const productSearches = [
    'audio equipment for music',
    'comfortable seating for work',
    'gaming accessories with lights',
  ];

  for (const query of productSearches) {
    const results = await search.semanticSearch({
      query,
      topK: 3,
      threshold: 0.7,
      filters: { category: 'electronics' },
    });

    console.log(`\nResults for "${query}":`);
    results.forEach(result => {
      console.log(`- ${result.metadata.text} (score: ${result.score})`);
    });
  }

  // Hybrid search (semantic + keyword)
  const hybridResults = await search.hybridSearch({
    query: 'bluetooth headphones',
    topK: 5,
    semanticWeight: 0.7,
    keywordWeight: 0.3,
  });

  console.log('\nHybrid search results:', hybridResults);

  // Similar item recommendations
  const recommendations = await search.findSimilar('product1', {
    topK: 2,
    filters: { category: 'electronics' },
  });

  console.log('\nSimilar products:', recommendations);
}

// =============================================================================
// AI-Enhanced Operations
// =============================================================================

async function aiOperations() {
  const vector = createServerClient({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    embeddings: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'text-embedding-ada-002',
    },
  });

  const ai = new AIOperations(vector);

  // Generate content embeddings for recommendation system
  await ai.generateContentEmbeddings([
    {
      id: 'article1',
      content: "Introduction to TypeScript: A beginner's guide to typed JavaScript",
      metadata: { type: 'tutorial', difficulty: 'beginner', topic: 'typescript' },
    },
    {
      id: 'article2',
      content: 'Advanced React patterns: Higher-order components and render props',
      metadata: { type: 'tutorial', difficulty: 'advanced', topic: 'react' },
    },
    {
      id: 'article3',
      content: 'Building REST APIs with Node.js and Express framework',
      metadata: { type: 'tutorial', difficulty: 'intermediate', topic: 'nodejs' },
    },
  ]);

  // Get personalized recommendations
  const userInterests = 'I want to learn about web development with JavaScript';
  const recommendations = await ai.getPersonalizedRecommendations({
    userProfile: userInterests,
    topK: 3,
    diversityFactor: 0.3, // Balance between relevance and diversity
  });

  console.log('Personalized recommendations:', recommendations);

  // Cluster similar content
  const clusters = await ai.clusterSimilarContent({
    threshold: 0.8,
    minClusterSize: 2,
    filters: { type: 'tutorial' },
  });

  console.log('Content clusters:', clusters);

  // Detect content anomalies
  const anomalies = await ai.detectAnomalies({
    threshold: 0.5, // Items with similarity below this are considered anomalies
    sampleSize: 100,
  });

  console.log('Content anomalies:', anomalies);

  // Generate content summaries with context
  const summaries = await ai.generateContextualSummaries({
    contentIds: ['article1', 'article2', 'article3'],
    context: 'web development learning path',
  });

  console.log('Contextual summaries:', summaries);
}

// =============================================================================
// Advanced Vector Operations
// =============================================================================

async function advancedVectorOperations() {
  const vector = createServerClient();

  // Range scanning for analytics
  let cursor = '';
  let totalVectors = 0;
  const batchSize = 100;

  do {
    const result = await vector.range({
      cursor,
      limit: batchSize,
      includeMetadata: true,
    });

    totalVectors += result.vectors.length;
    cursor = result.nextCursor || '';

    // Process batch
    console.log(`Processed batch of ${result.vectors.length} vectors`);

    // Example: Analyze metadata distribution
    const categories = result.vectors.map(v => v.metadata?.category).filter(Boolean);

    const categoryCount = categories.reduce(
      (acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log('Category distribution:', categoryCount);
  } while (cursor);

  console.log(`Total vectors processed: ${totalVectors}`);

  // Index statistics and health check
  const info = await vector.info();
  console.log('Index information:', {
    vectorCount: info.vectorCount,
    pendingVectorCount: info.pendingVectorCount,
    indexSize: `${(info.indexSize / 1024 / 1024).toFixed(2)} MB`,
    dimension: info.dimension,
    similarityFunction: info.similarityFunction,
  });

  // Index description for debugging
  const description = await vector.describe();
  console.log('Index description:', description);
}

// =============================================================================
// Edge Runtime Operations
// =============================================================================

async function edgeOperations() {
  // Edge-compatible client
  const vector = createEdgeClient({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  });

  // All operations work the same in edge runtime
  await vector.upsert({
    id: 'edge-doc',
    vector: [0.1, 0.2, 0.3, 0.4, 0.5],
    metadata: { source: 'edge-runtime' },
  });

  const results = await vector.query({
    vector: [0.1, 0.2, 0.3, 0.4, 0.5],
    topK: 5,
    includeMetadata: true,
  });

  console.log('Edge query results:', results.matches);
}

// =============================================================================
// Error Handling and Monitoring
// =============================================================================

async function errorHandlingOperations() {
  const vector = createServerClient();

  try {
    // Operation that might fail due to dimension mismatch
    await vector.upsert({
      id: 'test-doc',
      vector: [0.1, 0.2, 0.3], // Wrong dimension
      metadata: { test: true },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Vector operation failed:', error.message);

      // Handle specific error types
      if (error.message.includes('dimension')) {
        console.log('Dimension mismatch detected');
      } else if (error.message.includes('quota')) {
        console.log('Quota exceeded, consider upgrading plan');
      } else if (error.message.includes('rate limit')) {
        console.log('Rate limit hit, implementing backoff...');
      }
    }
  }

  // Health check
  try {
    const info = await vector.info();
    console.log('Vector index is healthy:', {
      vectorCount: info.vectorCount,
      pendingCount: info.pendingVectorCount,
    });
  } catch (error) {
    console.error('Health check failed:', error);
  }
}

// =============================================================================
// Performance Optimization
// =============================================================================

async function performanceOptimizations() {
  const vector = createServerClient();

  // Batch upsert for better performance
  const batchSize = 100;
  const vectors = [];

  for (let i = 0; i < 1000; i++) {
    vectors.push({
      id: `doc-${i}`,
      vector: Array.from({ length: 512 }, () => Math.random()),
      metadata: { batch: Math.floor(i / batchSize) },
    });
  }

  // Process in batches
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);

    console.time(`Batch ${Math.floor(i / batchSize)}`);
    await vector.upsert(batch);
    console.timeEnd(`Batch ${Math.floor(i / batchSize)}`);

    // Rate limiting to avoid overwhelming the service
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Efficient querying with appropriate topK
  const queryVector = Array.from({ length: 512 }, () => Math.random());

  console.time('Query with topK=10');
  const results = await vector.query({
    vector: queryVector,
    topK: 10, // Don't request more than needed
    includeMetadata: true,
    includeValues: false, // Skip vectors if not needed
  });
  console.timeEnd('Query with topK=10');

  console.log(`Found ${results.matches.length} matches`);
}

// =============================================================================
// Run Examples
// =============================================================================

async function runExamples() {
  console.log('🚀 Running Upstash Vector Examples...\n');

  try {
    console.log('1. Basic Vector Operations...');
    await basicVectorOperations();

    console.log('\n2. Embedding Operations...');
    await embeddingOperations();

    console.log('\n3. Document Processing...');
    await documentProcessingOperations();

    console.log('\n4. Semantic Search...');
    await semanticSearchOperations();

    console.log('\n5. AI-Enhanced Operations...');
    await aiOperations();

    console.log('\n6. Advanced Vector Operations...');
    await advancedVectorOperations();

    console.log('\n7. Edge Operations...');
    await edgeOperations();

    console.log('\n8. Error Handling...');
    await errorHandlingOperations();

    console.log('\n9. Performance Optimizations...');
    await performanceOptimizations();

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
  advancedVectorOperations,
  aiOperations,
  basicVectorOperations,
  documentProcessingOperations,
  edgeOperations,
  embeddingOperations,
  errorHandlingOperations,
  performanceOptimizations,
  semanticSearchOperations,
};
