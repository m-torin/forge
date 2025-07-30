'use client';

import {
  AlertCircleIcon,
  CheckIcon,
  CodeIcon,
  FileIcon,
  SearchIcon,
  SparklesIcon,
} from '#/components/icons';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import type { ProcessorResult } from '#/lib/ai/output-processors';
import { cn } from '#/lib/utils';
import { logError } from '@repo/observability';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface OutputProcessorDisplayProps {
  results: ProcessorResult[];
  className?: string;
}

export function OutputProcessorDisplay({ results, className }: OutputProcessorDisplayProps) {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  if (!results || results.length === 0) return null;

  const containerAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  const getProcessorIcon = (type: string) => {
    switch (type) {
      case 'json-repair':
        return CodeIcon;
      case 'sentiment-analysis':
        return SparklesIcon;
      case 'entity-extraction':
        return SearchIcon;
      case 'text-summarization':
        return FileIcon;
      case 'language-detection':
        return SparklesIcon;
      default:
        return CheckIcon;
    }
  };

  const getProcessorTitle = (type: string) => {
    switch (type) {
      case 'json-repair':
        return 'JSON Repair';
      case 'sentiment-analysis':
        return 'Sentiment Analysis';
      case 'entity-extraction':
        return 'Entity Extraction';
      case 'text-summarization':
        return 'Text Summary';
      case 'language-detection':
        return 'Language Detection';
      default:
        return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const renderResultData = (result: ProcessorResult) => {
    const { type, data } = result;

    switch (type) {
      case 'sentiment-analysis':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  data.sentiment === 'positive'
                    ? 'default'
                    : data.sentiment === 'negative'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {data.sentiment}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {Math.round(data.confidence * 100)}% confidence
              </span>
            </div>
            {data.keywords && data.keywords.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-medium">Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {data.keywords.map((keyword: string) => (
                    <Badge key={`keyword-${keyword}`} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'entity-extraction':
        const hasEntities = Object.values(data).some(
          (arr: any) => Array.isArray(arr) && arr.length > 0,
        );
        if (!hasEntities) {
          return <p className="text-sm text-muted-foreground">No entities found</p>;
        }

        return (
          <div className="space-y-3">
            {Object.entries(data).map(([category, items]: [string, any]) => {
              if (!Array.isArray(items) || items.length === 0) return null;

              return (
                <div key={category}>
                  <p className="mb-1 text-sm font-medium capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {items.map((item: string) => (
                      <Badge key={`entity-${item}`} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'text-summarization':
        return (
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-sm font-medium">Summary:</p>
              <p className="rounded bg-muted p-3 text-sm">{data.summary}</p>
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Original: {data.originalLength} chars</span>
              <span>Summary: {data.summary?.length || 0} chars</span>
              <span>Words: {data.wordCount}</span>
            </div>

            {data.keyPhrases && data.keyPhrases.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-medium">Key Phrases:</p>
                <div className="flex flex-wrap gap-1">
                  {data.keyPhrases.map((phrase: string) => (
                    <Badge key={`phrase-${phrase}`} variant="outline" className="text-xs">
                      {phrase}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'language-detection':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="capitalize">
                {data.language}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {Math.round(data.confidence * 100)}% confidence
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Script: {data.script}</p>
          </div>
        );

      case 'json-repair':
        if (data) {
          return (
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-600">✓ JSON repaired successfully</p>
              <pre className="max-h-40 overflow-x-auto rounded bg-muted p-3 text-xs">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          );
        }
        return null;

      default:
        return (
          <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        );
    }
  };

  return (
    <motion.div {...containerAnimation} className={cn('space-y-3', className)}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <SparklesIcon size={16} />
            Output Analysis
            <Badge variant="secondary" className="text-xs">
              {results.length} processor{results.length > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {results.map((result, _index) => {
            const ProcessorIcon = getProcessorIcon(result.type);
            const isExpanded = expandedResult === result.type;

            return (
              <div key={`result-${result.type}`} className="rounded-lg border">
                <div
                  className="flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-muted/50"
                  onClick={() => setExpandedResult(isExpanded ? null : result.type)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedResult(isExpanded ? null : result.type);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-label={`Toggle ${getProcessorTitle(result.type)} details`}
                >
                  <div className="flex items-center gap-2">
                    <ProcessorIcon size={16} />
                    <span className="text-sm font-medium">{getProcessorTitle(result.type)}</span>
                    {result.success ? (
                      <span className="text-green-500">
                        <CheckIcon size={14} />
                      </span>
                    ) : (
                      <span className="text-red-500">
                        <AlertCircleIcon size={14} />
                      </span>
                    )}
                  </div>

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t"
                  >
                    <div className="p-3">
                      {result.success ? (
                        renderResultData(result)
                      ) : (
                        <div className="text-sm text-red-600">
                          <p className="font-medium">Error:</p>
                          <p>{result.error}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface OutputProcessorTriggerProps {
  text: string;
  processors?: string[];
  onResults?: (results: ProcessorResult[]) => void;
  className?: string;
}

export function OutputProcessorTrigger({
  text,
  processors = ['sentiment-analysis', 'entity-extraction'],
  onResults,
  className,
}: OutputProcessorTriggerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessorResult[]>([]);

  const handleProcess = async () => {
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
      // Dynamic import to avoid loading processors on initial render
      const { outputProcessors } = await import('#/lib/ai/output-processors');

      const processingResults = processors.map(processor =>
        outputProcessors.process(processor, text),
      );

      setResults(processingResults);
      onResults?.(processingResults);
    } catch (error) {
      logError('Error processing output:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleProcess}
            disabled={!text.trim() || isProcessing}
            className="text-xs"
          >
            <SparklesIcon size={14} />
            {isProcessing ? 'Analyzing...' : 'Analyze Output'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Run advanced analysis on this text</TooltipContent>
      </Tooltip>

      {results.length > 0 && <OutputProcessorDisplay results={results} />}
    </div>
  );
}
