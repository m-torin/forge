'use client';

import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import {
  generateMockRAGStreamResponse,
  generateMockStreamResponse,
  mockRAGKnowledgeBase,
  shouldUseMockRAG,
} from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { useDisclosure } from '@mantine/hooks';
import { logError } from '@repo/observability';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Brain,
  Check,
  Copy,
  Eye,
  EyeOff,
  Lightbulb,
  Play,
  RotateCcw,
  Search,
  Settings,
  Target,
  Zap,
} from 'lucide-react';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface RAGPlaygroundProps {
  className?: string;
}

export function RAGPlayground({ className }: RAGPlaygroundProps) {
  const prototypeMode = isPrototypeMode();
  const useMockRAG = shouldUseMockRAG();

  // State management
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, { toggle: toggleSettings }] = useDisclosure();
  const [showRAGDetails, { toggle: toggleRAGDetails }] = useDisclosure(true);
  const [copied, setCopied] = useState(false);

  // RAG Parameters
  const [ragParams, setRagParams] = useState({
    topK: 5,
    threshold: 0.7,
    enableRAG: true,
  });

  // Results
  const [ragResults, setRagResults] = useState<{
    retrievedChunks: Array<{ content: string; score: number; metadata: any }>;
    ragResponse: string;
    normalResponse: string;
  } | null>(null);

  // Streaming state
  const [streamingRAG, setStreamingRAG] = useState('');
  const [streamingNormal, setStreamingNormal] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Example queries
  const exampleQueries = [
    'What is Next.js and how does it work?',
    'Explain React hooks with examples',
    'How does RAG improve AI responses?',
    'What are the benefits of server-side rendering?',
    'Tell me about the Vercel AI SDK',
  ];

  // Stream text effect
  const _streamText = useCallback(
    async (text: string, setter: React.Dispatch<React.SetStateAction<string>>, delay = 50) => {
      setter('');
      for (let i = 0; i <= text.length; i++) {
        if (abortControllerRef.current?.signal.aborted) break;
        await new Promise(resolve => setTimeout(resolve, delay));
        setter(text.slice(0, i));
      }
    },
    [],
  );

  // Handle query execution
  const handleExecuteQuery = useCallback(async () => {
    if (!query.trim() || isGenerating) return;

    setIsGenerating(true);
    setRagResults(null);
    setStreamingRAG('');
    setStreamingNormal('');

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      let retrievedChunks: Array<{ content: string; score: number; metadata: any }> = [];

      if (ragParams.enableRAG && useMockRAG) {
        // Retrieve relevant chunks
        retrievedChunks = mockRAGKnowledgeBase.search(query, ragParams.topK);
      }

      // Generate responses
      let ragResponse = '';
      let normalResponse = '';

      if (ragParams.enableRAG && useMockRAG) {
        // Generate RAG-enhanced response
        const ragStream = generateMockRAGStreamResponse(query);
        for await (const chunk of ragStream) {
          if (abortControllerRef.current?.signal.aborted) break;
          ragResponse += chunk;
          setStreamingRAG(ragResponse);
        }
      }

      // Generate normal response for comparison
      const normalStream = generateMockStreamResponse(query);
      for await (const chunk of normalStream) {
        if (abortControllerRef.current?.signal.aborted) break;
        normalResponse += chunk;
        setStreamingNormal(normalResponse);
      }

      setRagResults({
        retrievedChunks,
        ragResponse,
        normalResponse,
      });
    } catch (error) {
      logError('Error executing query', { error });
    } finally {
      setIsGenerating(false);
    }
  }, [query, ragParams, useMockRAG, isGenerating]);

  // Handle stop generation
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  }, []);

  // Handle reset
  const handleReset = useCallback(() => {
    setQuery('');
    setRagResults(null);
    setStreamingRAG('');
    setStreamingNormal('');
    handleStop();
  }, [handleStop]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logError('Failed to copy to clipboard', { error });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!useMockRAG) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Brain className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">RAG Playground</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure your RAG system to try the interactive playground.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">RAG Playground</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={toggleRAGDetails} variant="outline" size="sm" className="gap-2">
            {showRAGDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showRAGDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          <Button onClick={toggleSettings} variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 rounded-lg border bg-muted/30 p-4"
          >
            <h3 className="font-medium">RAG Parameters</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Top K Results</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={ragParams.topK}
                  onChange={e =>
                    setRagParams(prev => ({ ...prev, topK: parseInt(e.target.value) || 5 }))
                  }
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Number of relevant chunks to retrieve
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Similarity Threshold</label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={ragParams.threshold}
                  onChange={e =>
                    setRagParams(prev => ({
                      ...prev,
                      threshold: parseFloat(e.target.value) || 0.7,
                    }))
                  }
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimum similarity score for results
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Enable RAG</label>
                <div className="mt-1">
                  <input
                    type="checkbox"
                    checked={ragParams.enableRAG}
                    onChange={e => setRagParams(prev => ({ ...prev, enableRAG: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm">Use knowledge base</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Toggle RAG enhancement on/off</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Query Input */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Ask a question to test RAG performance..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleExecuteQuery()}
              className="pl-10"
            />
          </div>
          {!isGenerating ? (
            <Button onClick={handleExecuteQuery} disabled={!query.trim()}>
              <Play className="mr-2 h-4 w-4" />
              Execute
            </Button>
          ) : (
            <Button onClick={handleStop} variant="destructive">
              Stop
            </Button>
          )}
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Example Queries */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Try:</span>
          {exampleQueries.map(example => (
            <Button
              key={`example-query-${example}`}
              onClick={() => setQuery(example)}
              variant="outline"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
            >
              {example}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {(ragResults || isGenerating) && (
        <div className="space-y-6">
          {/* Retrieved Chunks */}
          {showRAGDetails && ragParams.enableRAG && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border bg-background p-4"
            >
              <h3 className="mb-4 flex items-center gap-2 font-medium">
                <Target className="h-4 w-4" />
                Retrieved Knowledge ({ragResults?.retrievedChunks.length || 0} chunks)
              </h3>
              {ragResults?.retrievedChunks.length ? (
                <div className="space-y-3">
                  {ragResults.retrievedChunks.map((chunk, index) => (
                    <motion.div
                      key={`source-${chunk.metadata.documentTitle}-${chunk.score}-${chunk.content.slice(0, 20)}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-lg bg-muted/30 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium">{chunk.metadata.documentTitle}</div>
                        <div className="text-xs text-muted-foreground">
                          Score: {(chunk.score * 100).toFixed(1)}%
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{chunk.content}</p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Source: {chunk.metadata.source} • Category: {chunk.metadata.category}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <Search className="mx-auto mb-2 h-8 w-8" />
                  <p>No relevant chunks found</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Response Comparison */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* RAG Response */}
            {ragParams.enableRAG && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border bg-background p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-medium">
                    <Zap className="h-4 w-4 text-green-500" />
                    RAG-Enhanced Response
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => handleCopy(ragResults?.ragResponse || streamingRAG)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div className="min-h-32 rounded-lg bg-muted/30 p-3">
                  {streamingRAG || ragResults?.ragResponse ? (
                    <p className="whitespace-pre-wrap text-sm">
                      {streamingRAG || ragResults?.ragResponse}
                      {isGenerating && <span className="animate-pulse">▋</span>}
                    </p>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                      <Lightbulb className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Normal Response */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border bg-background p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-medium">
                  <Brain className="h-4 w-4 text-blue-500" />
                  Standard Response
                </h3>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => handleCopy(ragResults?.normalResponse || streamingNormal)}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="min-h-32 rounded-lg bg-muted/30 p-3">
                {streamingNormal || ragResults?.normalResponse ? (
                  <p className="whitespace-pre-wrap text-sm">
                    {streamingNormal || ragResults?.normalResponse}
                    {isGenerating && <span className="animate-pulse">▋</span>}
                  </p>
                ) : (
                  <div className="flex h-32 items-center justify-center text-muted-foreground">
                    <Brain className="h-6 w-6" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Prototype Mode Indicator */}
      {prototypeMode && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/20">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Prototype Mode:</strong> This playground uses mock RAG functionality with sample
            data. In production, this would connect to your actual vector database and knowledge
            base.
          </p>
        </div>
      )}
    </div>
  );
}
