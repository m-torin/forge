'use client';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { cn } from '#/lib/utils';
import { useDisclosure } from '@mantine/hooks';
import { Brain, ChevronDown, ChevronUp, Database, ExternalLink, FileText } from 'lucide-react';
import { useState } from 'react';

interface RAGSource {
  content: string;
  score: number;
  metadata: {
    title?: string;
    source?: string;
    category?: string;
    documentTitle?: string;
    chunkIndex?: number;
    originalFilename?: string;
    blobUrl?: string;
  };
}

interface RAGSourcesProps {
  sources: RAGSource[];
  className?: string;
  isDemo?: boolean;
}

export function RAGSources({ sources, className, isDemo = false }: RAGSourcesProps) {
  const [isExpanded, { toggle: toggleExpanded }] = useDisclosure();
  const [selectedSource, setSelectedSource] = useState<number | null>(null);

  if (!sources || sources.length === 0) {
    return null;
  }

  const visibleSources = isExpanded ? sources : sources.slice(0, 3);

  return (
    <div className={cn('space-y-3', className)}>
      {/* RAG Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Brain className="h-4 w-4" />
        <span>Retrieved from knowledge base</span>
        {isDemo && (
          <Badge variant="outline" className="text-xs">
            Demo Mode
          </Badge>
        )}
      </div>

      {/* Sources List */}
      <div className="space-y-2">
        {visibleSources.map((source, index) => (
          <Card
            key={`source-${source.metadata.documentTitle || source.metadata.title || 'document'}-${source.metadata.chunkIndex || index}`}
            className={cn(
              'cursor-pointer border border-blue-200 bg-blue-50/50 transition-all hover:shadow-sm',
              selectedSource === index && 'ring-2 ring-blue-300',
            )}
            onClick={() => setSelectedSource(selectedSource === index ? null : index)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-blue-600" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-sm font-medium">
                      {source.metadata.documentTitle || source.metadata.title || 'Document'}
                    </CardTitle>
                    {source.metadata.category && (
                      <CardDescription className="text-xs">
                        {source.metadata.category}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {Math.round(source.score * 100)}% match
                  </Badge>
                  {source.metadata.blobUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={e => {
                        e.stopPropagation();
                        window.open(source.metadata.blobUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {selectedSource === index && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="rounded border bg-white p-3 text-sm text-gray-700">
                    {source.content.length > 200
                      ? `${source.content.substring(0, 200)}...`
                      : source.content}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {source.metadata.originalFilename && (
                      <span>File: {source.metadata.originalFilename}</span>
                    )}
                    {source.metadata.chunkIndex !== undefined && (
                      <span>Chunk: {source.metadata.chunkIndex}</span>
                    )}
                    {source.metadata.source && <span>Source: {source.metadata.source}</span>}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Show More/Less Button */}
      {sources.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              Show less sources
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              Show {sources.length - 3} more sources
            </>
          )}
        </Button>
      )}
    </div>
  );
}

interface RAGToolCallProps {
  type: 'addResource' | 'getInformation';
  args: any;
  isReadonly?: boolean;
}

export function RAGToolCall({ type, args, isReadonly: _isReadonly }: RAGToolCallProps) {
  if (type === 'addResource') {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-green-600" />
            <CardTitle className="text-sm">Adding to Knowledge Base</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">Adding content to knowledge base...</p>
            {args.metadata?.title && (
              <p className="text-xs text-muted-foreground">Title: {args.metadata.title}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'getInformation') {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm">Searching Knowledge Base</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">Searching for: &ldquo;{args.question}&rdquo;</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Looking for top {args.topK || 5} results</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

interface RAGToolResultProps {
  type: 'addResource' | 'getInformation';
  result: any;
  isReadonly?: boolean;
}

export function RAGToolResult({ type, result, isReadonly: _isReadonly }: RAGToolResultProps) {
  if (type === 'addResource') {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-green-600" />
            <CardTitle className="text-sm">Added to Knowledge Base</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-green-700">✓ Successfully added content to knowledge base</p>
            {typeof result === 'string' && (
              <p className="text-xs text-muted-foreground">{result}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'getInformation') {
    // result should be an array of sources
    const sources = Array.isArray(result) ? result : [];

    if (sources.length === 0) {
      return (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-4">
            <p className="text-sm text-yellow-700">
              No relevant information found in knowledge base
            </p>
          </CardContent>
        </Card>
      );
    }

    return <RAGSources sources={sources} />;
  }

  return null;
}
