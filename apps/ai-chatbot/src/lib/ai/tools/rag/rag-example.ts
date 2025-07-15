/**
 * RAG Integration Example
 *
 * This file demonstrates how to use the RAG functionality
 * in both demo mode and real mode.
 */

import { logError } from '@repo/observability';
import { isRAGEnabled } from './rag-tools';

// Mock data constants
const SAMPLE_RAG_DOCUMENTS = [
  {
    content: 'Example document content',
    metadata: { title: 'Sample Document', source: 'example' },
  },
];

const shouldUseMockRAG = () => true;

const mockRAGKnowledgeBase = {
  getDocuments: () => [],
  addDocument: (_content: string, _metadata?: any) => 'Added mock document',
  search: (_query: string, _limit?: number) => [],
};

const createMockRAGTools = () => ({
  addResource: { execute: async () => 'Mock add result' },
  getInformation: { execute: async () => [] },
});

const getRAGStatus = () => ({ enabled: false });
const initializeUserRAG = async (_userId: string, _documents?: any[]) => ({
  success: false,
  documentsAdded: 0,
});

// Example: Initialize RAG for a new user
export async function exampleInitializeUserRAG(userId: string) {
  // console.log('🚀 RAG Integration Example');
  // console.log('=========================');

  if (shouldUseMockRAG()) {
    // console.log('📍 Demo Mode: Using mock RAG system');

    // In demo mode, documents are already loaded
    const documents = mockRAGKnowledgeBase.getDocuments();
    // console.log(`📚 Mock knowledge base has ${documents.length} documents`);

    // Example: Add a new document
    const _result = mockRAGKnowledgeBase.addDocument(
      "TypeScript is a programming language developed by Microsoft. It's a typed superset of JavaScript that compiles to plain JavaScript. TypeScript provides static type checking, classes, interfaces, and other features that help developers build large-scale applications.",
      {
        title: 'TypeScript Overview',
        source: 'example',
        category: 'programming',
        userId,
      },
    );
    // console.log(`✅ ${result}`);

    // Example: Search the knowledge base
    const searchResults = mockRAGKnowledgeBase.search('What is TypeScript?', 3) as any[];
    // console.log(`🔍 Search results: ${searchResults.length} found`);
    searchResults.forEach((result, index) => {
      // Log search result details
      const _resultInfo = `   ${index + 1}. Score: ${result.score.toFixed(3)} - ${result.content.substring(0, 100)}...`;
    });

    return {
      mode: 'demo',
      success: true,
      documentsCount: documents.length,
      searchResults: searchResults.length,
    };
  } else if (isRAGEnabled()) {
    // console.log('🎯 Real Mode: Using Upstash Vector RAG system');

    const status = getRAGStatus();
    // console.log('📊 RAG Status:', status);

    try {
      // Initialize with sample documents
      const result = await initializeUserRAG(userId, SAMPLE_RAG_DOCUMENTS);
      // console.log(`✅ RAG initialized: ${result.documentsAdded} documents added`);

      return {
        mode: 'real',
        success: result.success,
        documentsAdded: result.documentsAdded,
        status,
      };
    } catch (error) {
      logError('RAG initialization failed', { error });
      return {
        mode: 'real',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  } else {
    // console.log('⚠️  RAG is not configured');
    // console.log('   Set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN to enable RAG');

    return {
      mode: 'disabled',
      success: false,
      message: 'RAG is not configured',
    };
  }
}

// Example: Test RAG tools
export async function exampleTestRAGTools(_userId: string) {
  // console.log('🔧 Testing RAG Tools');
  // console.log('==================');

  if (shouldUseMockRAG()) {
    // console.log('📍 Using mock RAG tools');

    const tools = createMockRAGTools();

    // Test adding a resource
    const addResult = await tools.addResource.execute();
    // console.log(`📝 Add resource result: ${addResult}`);

    // Test retrieving information
    const getResult = (await tools.getInformation.execute()) as any[];
    // console.log(`🔍 Information retrieval: ${getResult.length} results found`);
    getResult.forEach((result, index) => {
      // Log result details
      const _resultInfo = `   ${index + 1}. Score: ${result.score.toFixed(3)} - ${result.content.substring(0, 80)}...`;
    });

    return {
      mode: 'demo',
      addResult,
      getResult: getResult.length,
    };
  } else if (isRAGEnabled()) {
    // console.log('🎯 Using real RAG tools (would require session)');
    // console.log('   In real mode, tools require session and dataStream parameters');

    // Real tools would be created like this:
    // const tools = createChatbotRAGTools({ session, dataStream });

    return {
      mode: 'real',
      message: 'Real tools require session context',
    };
  } else {
    // console.log('⚠️  RAG tools not available (not configured)');

    return {
      mode: 'disabled',
      message: 'RAG is not configured',
    };
  }
}

// Example: Comprehensive RAG demo
export async function runRAGDemo(userId: string = 'demo-user') {
  // console.log('🎨 RAG Integration Demo');
  // console.log('=======================');

  try {
    // Step 1: Initialize RAG
    const initResult = await exampleInitializeUserRAG(userId);
    // console.log('📋 Initialization Result:', initResult);

    // Step 2: Test RAG tools
    const toolsResult = await exampleTestRAGTools(userId);
    // console.log('📋 Tools Test Result:', toolsResult);

    // Step 3: Show available features
    // console.log('🎯 Available RAG Features:');
    // console.log('  ✅ Document ingestion and chunking');
    // console.log('  ✅ Semantic search with relevance scoring');
    // console.log('  ✅ AI SDK v5 tool integration (addResource, getInformation)');
    // console.log('  ✅ Demo mode with mock data');
    // console.log('  ✅ Real mode with Upstash Vector');
    // console.log('  ✅ Knowledge base management UI');
    // console.log('  ✅ Database schema for RAG documents');
    // console.log('  ✅ Chat-level RAG configuration');

    return {
      success: true,
      initialization: initResult,
      tools: toolsResult,
      features: [
        'Document ingestion',
        'Semantic search',
        'AI SDK v5 integration',
        'Demo and real modes',
        'UI management',
        'Database persistence',
      ],
    };
  } catch (error) {
    logError('RAG demo failed', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Export for use in tests or examples
export const ragExamples = {
  initialize: exampleInitializeUserRAG,
  testTools: exampleTestRAGTools,
  runDemo: runRAGDemo,
};
