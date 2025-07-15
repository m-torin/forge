#!/usr/bin/env tsx
/**
 * MCP-RAG Integration Demo Script
 *
 * Run with: npx tsx demo-mcp-rag.ts
 *
 * This script demonstrates the MCP-RAG integration patterns
 * with fallbacks for development environments
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import { config } from 'dotenv';
import {
  realTimeKnowledgeUpdate,
  researchAssistantWorkflow,
  runAllMCPRAGExamples,
  streamingMCPRAGChat,
  webSearchEnhancedRAG,
} from './examples/mcp-rag-integration-examples';

// Load environment variables
config();

async function main() {
  logInfo('🚀 MCP-RAG Integration Demo');
  logInfo('='.repeat(50));

  // Check required environment variables
  const requiredEnvVars = [
    'UPSTASH_VECTOR_REST_URL',
    'UPSTASH_VECTOR_REST_TOKEN',
    'OPENAI_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter(v => !process.env[v]);

  if (missingVars.length > 0) {
    logWarn('⚠️  Missing required environment variables:');
    missingVars.forEach(v => logWarn(`   - ${v}`));
    logInfo('\n📋 To run this demo, set up these environment variables:');
    logInfo('   1. Create Upstash Vector database: https://upstash.com/');
    logInfo('   2. Get OpenAI API key: https://platform.openai.com/');
    logInfo('   3. Copy .env.example to .env.local and fill in values');
    logInfo('\n🔧 For development testing, run the test suite instead:');
    logInfo('   pnpm test __tests__/mcp-rag-integration/workflows.test.ts');
    return;
  }

  // Interactive demo menu
  const demos = [
    {
      name: 'Web Search Enhanced RAG',
      description: 'Combine web search with knowledge base',
      fn: webSearchEnhancedRAG,
    },
    {
      name: 'Research Assistant Workflow',
      description: 'Multi-step research with document management',
      fn: () => researchAssistantWorkflow('AI Safety Research'),
    },
    {
      name: 'Real-time Knowledge Update',
      description: 'Update knowledge base with latest information',
      fn: () => realTimeKnowledgeUpdate('Artificial Intelligence'),
    },
    {
      name: 'Streaming MCP-RAG Chat',
      description: 'Real-time conversational interface',
      fn: async () => {
        logInfo('💬 Starting streaming chat demo...');
        const results = [];
        for await (const chunk of streamingMCPRAGChat(
          'What are the current trends in AI research?',
          { domain: 'AI Research', namespace: 'demo-trends' },
        )) {
          logInfo(`[${chunk.type}]:`, { chunkData: chunk.data });
          results.push(chunk);

          // Add small delay for better visualization
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return { streamedChunks: results.length, finalResult: results[results.length - 1] };
      },
    },
    {
      name: 'Run All Examples',
      description: 'Execute all integration patterns',
      fn: runAllMCPRAGExamples,
    },
  ];

  // Get command line argument for demo selection
  const demoArg = process.argv[2];

  if (demoArg === 'all') {
    logInfo('🎯 Running all MCP-RAG integration examples...\n');

    try {
      const results = await runAllMCPRAGExamples();

      logInfo('\n📊 Demo Results Summary:');
      results.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        logInfo(`${status} ${demos[index]?.name || `Demo ${index + 1}`}`);

        if (result.success && result.data) {
          // Show key metrics if available
          if (typeof result.data === 'object' && result.data.tokensUsed) {
            logInfo(`   Tokens used: ${result.data.tokensUsed}`);
          }
          if (typeof result.data === 'object' && result.data.confidence) {
            logInfo(`   Confidence: ${(result.data.confidence * 100).toFixed(1)}%`);
          }
        }
      });
    } catch (error) {
      logError('❌ Error running all examples:', error);
    }
    return;
  }

  if (demoArg && !isNaN(parseInt(demoArg))) {
    const demoIndex = parseInt(demoArg) - 1;
    if (demoIndex >= 0 && demoIndex < demos.length) {
      const demo = demos[demoIndex];
      logInfo(`🎯 Running: ${demo.name}`);
      logInfo(`📋 Description: ${demo.description}`);

      try {
        const startTime = Date.now();
        const result = await demo.fn();
        const duration = Date.now() - startTime;

        logInfo(`✅ ${demo.name} completed in ${duration}ms`);
        logInfo('📊 Result:', { result });
      } catch (error) {
        logError(`❌ Error in ${demo.name}:`, error);
      }
      return;
    }
  }

  // Show interactive menu
  logInfo('📋 Available MCP-RAG Integration Demos:');
  demos.forEach((demo, index) => {
    logInfo(`${index + 1}. ${demo.name}`);
    logInfo(`   ${demo.description}`);
  });

  logInfo('🚀 Usage:');
  logInfo('   npx tsx demo-mcp-rag.ts [demo-number]   # Run specific demo');
  logInfo('   npx tsx demo-mcp-rag.ts all            # Run all demos');
  logInfo('   npx tsx demo-mcp-rag.ts                # Show this menu');

  logInfo('💡 Examples:');
  logInfo('   npx tsx demo-mcp-rag.ts 1              # Web Search Enhanced RAG');
  logInfo('   npx tsx demo-mcp-rag.ts 2              # Research Assistant');
  logInfo('   npx tsx demo-mcp-rag.ts all            # All patterns');

  logInfo('🧪 For testing without external dependencies:');
  logInfo('   pnpm test __tests__/mcp-rag-integration/workflows.test.ts');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logInfo('👋 Demo interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

// Run the demo
if (require.main === module) {
  (async () => {
    try {
      await main();
    } catch (error) {
      logError('❌ Demo failed:', error);
      process.exit(1);
    }
  })();
}
