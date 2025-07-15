/**
 * MCP-RAG Integration Examples
 * Comprehensive examples combining Model Context Protocol (MCP) tools with RAG workflows
 * These examples demonstrate real-world patterns for enhanced AI applications
 */

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { createMCPToolsFromConfigs, type MCPClientConfig } from '../src/server/mcp/client';
import { createUpstashVectorDB } from '../src/server/vector/upstash-vector';
import { createRAGWorkflow, type RAGWorkflowConfig } from '../src/server/workflows/vector-rag';

/**
 * Example 1: Web Search Enhanced RAG
 * Combines Perplexity web search with existing knowledge base
 */
export async function webSearchEnhancedRAG() {
  console.log('🔍 Example 1: Web Search Enhanced RAG');

  // Set up MCP client for Perplexity web search
  const mcpConfigs: MCPClientConfig[] = [
    {
      name: 'perplexity-search',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['@perplexity/mcp-server'],
      },
    },
  ];

  // Set up RAG system with vector database
  const vectorDB = createUpstashVectorDB({
    url: process.env.UPSTASH_VECTOR_REST_URL || 'missing-url',
    token: process.env.UPSTASH_VECTOR_REST_TOKEN || 'missing-token',
    namespace: 'research-knowledge',
  });

  const ragConfig: RAGWorkflowConfig = {
    vectorDB,
    embeddingModel: 'text-embedding-3-small',
    chatModel: 'gpt-4o',
    provider: 'openai',
    topK: 5,
    similarityThreshold: 0.7,
    enableReranking: true,
    enableCaching: true,
  };

  try {
    // Initialize MCP tools and RAG workflow
    const { tools: mcpTools, closeAllClients } = await createMCPToolsFromConfigs(mcpConfigs, {
      gracefulDegradation: true,
    });
    const ragWorkflow = createRAGWorkflow(ragConfig);

    const query = 'What are the latest developments in AI safety research?';
    console.log(`
📋 Query: ${query}`);

    // Step 1: Search existing knowledge base
    console.log('1️⃣ Searching existing knowledge base...');
    const ragContext = await ragWorkflow.retrieveContext(query);
    console.log(`Found ${ragContext.length} relevant documents in knowledge base`);

    // Step 2: Get fresh web information
    console.log('2️⃣ Searching web for latest information...');
    const webSearchResult = await generateText({
      model: openai('gpt-4o'),
      tools: mcpTools,
      prompt: `Search for the latest information about: ${query}. Use web search tools to find recent developments.`,
      maxSteps: 3,
    } as any);

    // Step 3: Combine and synthesize information
    console.log('3️⃣ Synthesizing information from both sources...');
    const combinedContext = [
      `Knowledge Base Context:
${ragContext.map(ctx => ctx.content).join('\\n')}`,
      `Latest Web Information:
${webSearchResult.text}`,
    ].join('\\n\\n---\\n\\n');

    const finalResult = await generateText({
      model: openai('gpt-4o'),
      prompt: `Based on both the existing knowledge base and latest web information, provide a comprehensive answer to: ${query}

Context:
${combinedContext}

Please synthesize information from both sources, highlighting what's new from web search and what confirms existing knowledge.`,
      maxOutputTokens: 1500,
    });

    console.log('✅ Combined Result:');
    console.log(finalResult.text);

    // Cleanup
    await closeAllClients();
    return {
      query,
      ragContext: ragContext.length,
      webSearchSteps: webSearchResult.steps?.length || 0,
      finalAnswer: finalResult.text,
      tokensUsed: finalResult.usage?.totalTokens,
    };
  } catch (error) {
    console.error('❌ Error in web search enhanced RAG:', error);
    throw error;
  }
}

/**
 * Example 2: Research Assistant Workflow
 * Multi-step research process with document discovery and analysis
 */
export async function researchAssistantWorkflow(topic: string) {
  console.log('🔬 Example 2: Research Assistant Workflow');
  console.log(`📋 Research Topic: ${topic}`);

  // Set up multiple MCP tools
  const mcpConfigs: MCPClientConfig[] = [
    {
      name: 'web-search',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['@perplexity/mcp-server'],
      },
    },
    {
      name: 'filesystem',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['@mcp/server-filesystem'],
      },
    },
  ];

  // Set up RAG for research knowledge management
  const vectorDB = createUpstashVectorDB({
    url: process.env.UPSTASH_VECTOR_REST_URL || 'missing-url',
    token: process.env.UPSTASH_VECTOR_REST_TOKEN || 'missing-token',
    namespace: `research-${topic.toLowerCase().replace(/\s+/g, '-')}`,
  });

  const ragWorkflow = createRAGWorkflow({
    vectorDB,
    embeddingModel: 'text-embedding-3-small',
    chatModel: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    topK: 8,
    enableReranking: true,
  });

  try {
    const { tools: mcpTools, closeAllClients } = await createMCPToolsFromConfigs(mcpConfigs, {
      gracefulDegradation: true,
    });

    // Phase 1: Research Planning
    console.log('1️⃣ Phase 1: Research Planning');
    const researchPlan = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt: `Create a comprehensive research plan for the topic: "${topic}"

Please outline:
1. Key research questions to investigate
2. Types of sources to search for
3. Specific aspects to focus on
4. Expected deliverables

Provide a structured research plan.`,
      maxOutputTokens: 800,
    });

    console.log('📋 Research Plan Generated:');
    console.log(researchPlan.text);

    // Phase 2: Information Gathering
    console.log('2️⃣ Phase 2: Information Gathering');
    const gatheringResult = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      tools: mcpTools,
      prompt: `Based on this research plan, gather comprehensive information about "${topic}":

${researchPlan.text}

Use available tools to:
1. Search for recent publications and articles
2. Look for authoritative sources
3. Find case studies or examples
4. Identify key researchers or organizations

Collect diverse, high-quality information sources.`,
      maxSteps: 5,
    } as any);

    // Phase 3: Knowledge Base Population
    console.log('3️⃣ Phase 3: Building Knowledge Base');
    const documents = [
      {
        id: `research-plan-${Date.now()}`,
        content: researchPlan.text,
        metadata: { type: 'research-plan', topic, timestamp: new Date().toISOString() },
      },
      {
        id: `gathered-info-${Date.now()}`,
        content: gatheringResult.text,
        metadata: { type: 'gathered-information', topic, timestamp: new Date().toISOString() },
      },
    ];

    const addResult = await ragWorkflow.addDocuments(documents);
    console.log(`📚 Added ${addResult.added} documents to knowledge base`);

    // Phase 4: Analysis and Synthesis
    console.log('4️⃣ Phase 4: Analysis and Synthesis');
    const analysisQuery = `What are the key insights and findings about ${topic}?`;
    const ragAnalysis = await ragWorkflow.query(analysisQuery);

    const finalAnalysis = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt: `Based on the comprehensive research conducted, provide a detailed analysis of "${topic}".

Research Context:
${ragAnalysis.context.map(ctx => ctx.content).join('\\n')}

Additional Findings:
${ragAnalysis.answer}

Please provide:
1. Executive Summary
2. Key Findings
3. Notable Trends or Patterns
4. Implications and Recommendations
5. Areas for Further Research

Make this a comprehensive research report.`,
      maxOutputTokens: 2000,
    });

    console.log('📊 Final Research Analysis:');
    console.log(finalAnalysis.text);

    // Phase 5: Knowledge Base Statistics
    const stats = await ragWorkflow.getStats();
    console.log('📈 Knowledge Base Statistics:');
    console.log(`- Total Vectors: ${stats.totalVectors}`);
    console.log(`- Namespace: ${stats.namespace}`);
    console.log(`- Cache Size: ${stats.cacheSize}`);

    await closeAllClients();
    return {
      topic,
      researchPlan: researchPlan.text,
      informationGathering: gatheringResult.text,
      documentsAdded: addResult.added,
      ragAnalysis: ragAnalysis.answer,
      finalAnalysis: finalAnalysis.text,
      knowledgeBaseStats: stats,
      totalTokensUsed:
        (researchPlan.usage?.totalTokens || 0) +
        (gatheringResult.usage?.totalTokens || 0) +
        (finalAnalysis.usage?.totalTokens || 0),
    };
  } catch (error) {
    console.error('❌ Error in research assistant workflow:', error);
    throw error;
  }
}

/**
 * Example 3: Real-time Knowledge Update Workflow
 * Monitors and updates knowledge base with fresh information
 */
export async function realTimeKnowledgeUpdate(domain: string) {
  console.log('🔄 Example 3: Real-time Knowledge Update Workflow');
  console.log(`📋 Domain: ${domain}`);

  const mcpConfigs: MCPClientConfig[] = [
    {
      name: 'web-search',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['@perplexity/mcp-server'],
      },
    },
  ];

  const vectorDB = createUpstashVectorDB({
    url: process.env.UPSTASH_VECTOR_REST_URL || 'missing-url',
    token: process.env.UPSTASH_VECTOR_REST_TOKEN || 'missing-token',
    namespace: `live-updates-${domain.toLowerCase().replace(/\s+/g, '-')}`,
  });

  const ragWorkflow = createRAGWorkflow({
    vectorDB,
    embeddingModel: 'text-embedding-3-small',
    chatModel: 'gpt-4o',
    provider: 'openai',
    topK: 10,
    enableCaching: false, // Disable caching for real-time updates
  });

  try {
    const { tools: mcpTools, closeAllClients } = await createMCPToolsFromConfigs(mcpConfigs);

    // Step 1: Check existing knowledge base
    console.log('1️⃣ Checking existing knowledge base...');
    const currentStats = await ragWorkflow.getStats();
    console.log(`Current knowledge base has ${currentStats.totalVectors} vectors`);

    // Step 2: Search for latest information
    console.log('2️⃣ Searching for latest developments...');
    const latestInfo = await generateText({
      model: openai('gpt-4o'),
      tools: mcpTools,
      prompt: `Search for the very latest news, developments, and updates in the "${domain}" field.
      Focus on information from the last 7 days. Use web search tools to find:
      1. Breaking news or announcements
      2. New research or publications
      3. Product launches or updates
      4. Industry trends or shifts

      Provide detailed, factual information with sources.`,
      maxSteps: 3,
    } as any);

    // Step 3: Analyze for novelty
    console.log('3️⃣ Analyzing information novelty...');
    const existingContext = await ragWorkflow.retrieveContext(`latest ${domain} developments`);

    const noveltyAnalysis = await generateText({
      model: openai('gpt-4o'),
      prompt: `Compare the latest information with existing knowledge to identify what's truly new:

Latest Information:
${latestInfo.text}

Existing Knowledge Context:
${existingContext.map(ctx => ctx.content).join('\\n')}

Identify:
1. Completely new information not in existing knowledge
2. Updates to existing information
3. Contradictions or corrections
4. Confirmation of existing knowledge

Focus on extracting genuinely new insights.`,
      maxOutputTokens: 1000,
    });

    // Step 4: Update knowledge base with new information
    console.log('4️⃣ Updating knowledge base...');
    const newDocuments = [
      {
        id: `latest-update-${domain}-${Date.now()}`,
        content: noveltyAnalysis.text,
        metadata: {
          type: 'real-time-update',
          domain,
          timestamp: new Date().toISOString(),
          source: 'web-search',
          updateType: 'latest-developments',
        },
      },
    ];

    const updateResult = await ragWorkflow.addDocuments(newDocuments);
    console.log(`📚 Added ${updateResult.added} new documents to knowledge base`);

    // Step 5: Generate updated insights
    console.log('5️⃣ Generating updated insights...');
    const updatedInsights = await ragWorkflow.query(
      `What are the latest developments and current state of ${domain}?`,
    );

    console.log('🎯 Updated Insights:');
    console.log(updatedInsights.answer);
    console.log(`
📊 Confidence Score: ${updatedInsights.confidence.toFixed(2)}`);
    console.log(`📄 Sources: ${updatedInsights.sources.length} documents`);

    const finalStats = await ragWorkflow.getStats();
    console.log(`
📈 Updated Knowledge Base: ${finalStats.totalVectors} vectors`);

    await closeAllClients();
    return {
      domain,
      initialVectors: currentStats.totalVectors,
      finalVectors: finalStats.totalVectors,
      newDocuments: updateResult.added,
      latestInfo: latestInfo.text,
      noveltyAnalysis: noveltyAnalysis.text,
      updatedInsights: updatedInsights.answer,
      confidence: updatedInsights.confidence,
      sourcesUsed: updatedInsights.sources.length,
    };
  } catch (error) {
    console.error('❌ Error in real-time knowledge update:', error);
    throw error;
  }
}

/**
 * Example 4: Multi-Modal Document Processing with MCP
 * Processes various document types using MCP filesystem tools
 */
export async function multiModalDocumentProcessing(documentPath: string) {
  console.log('📄 Example 4: Multi-Modal Document Processing');
  console.log(`📋 Document Path: ${documentPath}`);

  const mcpConfigs: MCPClientConfig[] = [
    {
      name: 'filesystem',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['@mcp/server-filesystem', documentPath],
      },
    },
  ];

  const vectorDB = createUpstashVectorDB({
    url: process.env.UPSTASH_VECTOR_REST_URL || 'missing-url',
    token: process.env.UPSTASH_VECTOR_REST_TOKEN || 'missing-token',
    namespace: 'document-processing',
  });

  const ragWorkflow = createRAGWorkflow({
    vectorDB,
    embeddingModel: 'text-embedding-3-small',
    chatModel: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    maxContextLength: 8000,
  });

  try {
    const { tools: mcpTools, closeAllClients } = await createMCPToolsFromConfigs(mcpConfigs);

    // Step 1: Discover and analyze documents
    console.log('1️⃣ Discovering documents...');
    const documentDiscovery = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      tools: mcpTools,
      prompt: `Explore the document directory and analyze available files.
      For each document found:
      1. Identify the file type and format
      2. Extract key metadata (size, modification date, etc.)
      3. Determine processing approach needed
      4. Read and summarize content where possible

      Provide a comprehensive overview of available documents.`,
      maxSteps: 5,
    } as any);

    // Step 2: Process and chunk documents
    console.log('2️⃣ Processing document content...');
    const contentProcessing = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      tools: mcpTools,
      prompt: `Process the discovered documents by:
      1. Reading text content from supported formats
      2. Extracting key information and insights
      3. Creating logical chunks for knowledge base storage
      4. Identifying relationships between documents

      Focus on creating structured, searchable content chunks.`,
      maxSteps: 8,
    } as any);

    // Step 3: Add processed content to RAG system
    console.log('3️⃣ Building knowledge base from documents...');
    const processedContent = contentProcessing.text;

    // Create multiple document chunks for better retrieval
    const documentChunks = processedContent.split('\\n').filter(chunk => chunk.trim().length > 100);
    const documents = documentChunks.map((chunk, index) => ({
      id: `doc-chunk-${documentPath.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`,
      content: chunk,
      metadata: {
        type: 'document-chunk',
        sourcePath: documentPath,
        chunkIndex: index,
        timestamp: new Date().toISOString(),
        processingMethod: 'mcp-filesystem',
      },
    }));

    const addResult = await ragWorkflow.addDocuments(documents);
    console.log(`📚 Added ${addResult.added} document chunks to knowledge base`);

    // Step 4: Test knowledge retrieval
    console.log('4️⃣ Testing knowledge retrieval...');
    const testQuery = 'What are the main topics and insights from these documents?';
    const retrievalTest = await ragWorkflow.query(testQuery);

    console.log('📖 Document Analysis Results:');
    console.log(retrievalTest.answer);
    console.log(`
📊 Retrieved ${retrievalTest.context.length} relevant chunks`);
    console.log(`🎯 Confidence: ${retrievalTest.confidence.toFixed(2)}`);

    // Step 5: Create document index
    console.log('5️⃣ Creating searchable document index...');
    const documentIndex = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt: `Based on the processed documents, create a comprehensive index including:

Document Discovery Results:
${documentDiscovery.text}

Processed Content:
${processedContent}

RAG Analysis:
${retrievalTest.answer}

Create an index with:
1. Document summary and key topics
2. Searchable keywords and concepts
3. Cross-references between documents
4. Suggested use cases for this knowledge base

Make this a useful reference for future queries.`,
      maxOutputTokens: 1500,
    });

    console.log('📇 Document Index Created:');
    console.log(documentIndex.text);

    await closeAllClients();
    return {
      documentPath,
      documentsProcessed: documents.length,
      addedToKnowledgeBase: addResult.added,
      discoveryResults: documentDiscovery.text,
      processedContent: contentProcessing.text,
      retrievalTest: retrievalTest.answer,
      documentIndex: documentIndex.text,
      confidence: retrievalTest.confidence,
    };
  } catch (error) {
    console.error('❌ Error in multi-modal document processing:', error);
    throw error;
  }
}

/**
 * Example 5: Streaming MCP-RAG Chat Interface
 * Real-time conversational interface combining MCP tools and RAG
 */
export async function* streamingMCPRAGChat(
  query: string,
  context: { domain: string; namespace: string },
): AsyncGenerator<{
  type: 'mcp-tools' | 'rag-context' | 'synthesis' | 'final-answer' | 'metadata';
  data: any;
}> {
  console.log('💬 Example 5: Streaming MCP-RAG Chat Interface');

  const mcpConfigs: MCPClientConfig[] = [
    {
      name: 'perplexity-search',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['@perplexity/mcp-server'],
      },
    },
  ];

  const vectorDB = createUpstashVectorDB({
    url: process.env.UPSTASH_VECTOR_REST_URL || 'missing-url',
    token: process.env.UPSTASH_VECTOR_REST_TOKEN || 'missing-token',
    namespace: context.namespace,
  });

  const ragWorkflow = createRAGWorkflow({
    vectorDB,
    embeddingModel: 'text-embedding-3-small',
    chatModel: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
  });

  try {
    // Initialize MCP tools
    const { tools: mcpTools, closeAllClients } = await createMCPToolsFromConfigs(mcpConfigs, {
      gracefulDegradation: true,
    });

    yield {
      type: 'metadata',
      data: { status: 'initialized', query, domain: context.domain },
    };

    // Step 1: Get live information via MCP tools
    yield {
      type: 'mcp-tools',
      data: { status: 'searching', message: 'Searching for latest information...' },
    };

    const mcpResult = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      tools: mcpTools,
      prompt: `For the query "${query}" in the domain of ${context.domain}, search for current, relevant information. Use available tools to find recent developments, authoritative sources, and contextual information.`,
      maxSteps: 3,
    } as any);

    yield {
      type: 'mcp-tools',
      data: {
        status: 'completed',
        toolSteps: mcpResult.steps?.length || 0,
        information: mcpResult.text.substring(0, 500) + '...',
      },
    };

    // Step 2: Retrieve relevant context from RAG
    yield {
      type: 'rag-context',
      data: { status: 'retrieving', message: 'Searching knowledge base...' },
    };

    const ragContext = await ragWorkflow.retrieveContext(query);

    yield {
      type: 'rag-context',
      data: {
        status: 'completed',
        documentsFound: ragContext.length,
        averageScore:
          ragContext.length > 0
            ? ragContext.reduce((sum, ctx) => sum + ctx.score, 0) / ragContext.length
            : 0,
        topSources: ragContext.slice(0, 3).map(ctx => ctx.id),
      },
    };

    // Step 3: Stream the synthesized response
    yield {
      type: 'synthesis',
      data: { status: 'starting', message: 'Synthesizing information...' },
    };

    const combinedContext = [
      `Live Information:
${mcpResult.text}`,
      `Knowledge Base Context:
${ragContext.map(ctx => ctx.content).join('\\n')}`,
    ].join('\\n\\n---\\n\\n');

    const streamResult = streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt: `Based on both live information and knowledge base context, provide a comprehensive answer to: "${query}"

Context:
${combinedContext}

Please:
1. Synthesize information from both live and stored sources
2. Highlight what's current vs. established knowledge
3. Provide specific examples and evidence
4. Indicate confidence levels where appropriate

Be thorough but concise in your response.`,
      maxOutputTokens: 1500,
    });

    let fullResponse = '';
    for await (const delta of streamResult.textStream) {
      fullResponse += delta;
      yield {
        type: 'synthesis',
        data: { status: 'streaming', delta, fullResponse: fullResponse.substring(0, 200) + '...' },
      };
    }

    // Final metadata
    yield {
      type: 'final-answer',
      data: {
        query,
        fullResponse,
        mcpSteps: mcpResult.steps?.length || 0,
        ragDocuments: ragContext.length,
        tokensUsed: (mcpResult.usage?.totalTokens || 0) + ragContext.length * 50, // Estimate
        sources: ragContext.map(ctx => ctx.id),
        confidence:
          ragContext.length > 0
            ? ragContext.reduce((sum, ctx) => sum + ctx.score, 0) / ragContext.length
            : 0.5,
      },
    };

    await closeAllClients();
  } catch (error) {
    yield {
      type: 'metadata',
      data: { status: 'error', error: error instanceof Error ? error.message : String(error) },
    };
    throw error;
  }
}

/**
 * Utility function to run all examples
 */
export async function runAllMCPRAGExamples() {
  console.log('🚀 Running All MCP-RAG Integration Examples');

  const results: any[] = [];

  try {
    // Example 1: Web Search Enhanced RAG
    console.log('='.repeat(60));
    const result1 = await webSearchEnhancedRAG();
    results.push({ example: 'Web Search Enhanced RAG', success: true, data: result1 });

    await new Promise(resolve => setTimeout(resolve, 2000)); // Brief pause between examples

    // Example 2: Research Assistant
    console.log('\n' + '='.repeat(60));
    const result2 = await researchAssistantWorkflow('AI Ethics and Governance');
    results.push({ example: 'Research Assistant Workflow', success: true, data: result2 });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Example 3: Real-time Knowledge Update
    console.log('\n' + '='.repeat(60));
    const result3 = await realTimeKnowledgeUpdate('Machine Learning');
    results.push({ example: 'Real-time Knowledge Update', success: true, data: result3 });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Example 4: Document Processing (if documents available)
    console.log('\n' + '='.repeat(60));
    try {
      const result4 = await multiModalDocumentProcessing('./docs');
      results.push({ example: 'Multi-Modal Document Processing', success: true, data: result4 });
    } catch (_error) {
      console.log('⚠️ Document processing example skipped (no documents found)');
      results.push({
        example: 'Multi-Modal Document Processing',
        success: false,
        reason: 'No documents found',
      });
    }

    // Example 5: Streaming Chat Demo
    console.log('\n' + '='.repeat(60));
    console.log('💬 Streaming MCP-RAG Chat Demo:');

    const streamingResults: any[] = [];
    for await (const chunk of streamingMCPRAGChat('What are the current trends in AI research?', {
      domain: 'AI Research',
      namespace: 'ai-trends',
    })) {
      console.log(`[${chunk.type}]:`, JSON.stringify(chunk.data, null, 2));
      streamingResults.push(chunk);
    }
    results.push({ example: 'Streaming MCP-RAG Chat', success: true, data: streamingResults });
  } catch (error) {
    console.error('❌ Error running examples:', error);
    results.push({
      example: 'General Error',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 EXAMPLE EXECUTION SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const total = results.length;

  console.log(`✅ Successful: ${successful}/${total} examples`);
  console.log(`❌ Failed: ${total - successful}/${total} examples`);

  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.example}`);
    if (!result.success && result.reason) {
      console.log(`   Reason: ${result.reason}`);
    }
  });

  return results;
}
