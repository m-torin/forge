'use client';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { cn } from '#/lib/utils';
import { useDisclosure } from '@mantine/hooks';
import { ChevronDown, ChevronUp, ExternalLink, Globe, Search } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface PerplexitySource {
  url: string;
  title?: string;
  description?: string;
  favicon?: string;
  domain?: string;
  publishedDate?: string;
  snippet?: string;
}

interface SourcesProps {
  sources: PerplexitySource[];
  className?: string;
}

export function Sources({ sources, className }: SourcesProps) {
  const [isExpanded, { toggle: toggleExpanded }] = useDisclosure();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  if (!sources || sources.length === 0) {
    return null;
  }

  const visibleSources = isExpanded ? sources : sources.slice(0, 3);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Sources Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span>Sources from web search</span>
        <Badge variant="outline" className="text-xs">
          {sources.length} source{sources.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Sources List */}
      <div className="space-y-2">
        {visibleSources.map(source => (
          <Card
            key={`source-${source.url}`}
            className={cn(
              'cursor-pointer border border-emerald-200 bg-emerald-50/50 transition-all hover:shadow-sm',
              selectedSource === source.url && 'ring-2 ring-emerald-300',
            )}
            onClick={() => setSelectedSource(selectedSource === source.url ? null : source.url)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {source.favicon ? (
                    <Image
                      src={source.favicon}
                      alt=""
                      width={16}
                      height={16}
                      className="h-4 w-4 shrink-0"
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Globe className="h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-sm font-medium">
                      {source.title || 'Web Source'}
                    </CardTitle>
                    {(source.domain || source.url) && (
                      <CardDescription className="text-xs">
                        {source.domain || new URL(source.url).hostname}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {source.publishedDate && (
                    <Badge variant="outline" className="text-xs">
                      {new Date(source.publishedDate).toLocaleDateString()}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={e => {
                      e.stopPropagation();
                      window.open(source.url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {selectedSource === source.url && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {source.description && (
                    <div className="rounded border bg-white p-3 text-sm text-gray-700">
                      {source.description.length > 300
                        ? `${source.description.substring(0, 300)}...`
                        : source.description}
                    </div>
                  )}
                  {source.snippet && source.snippet !== source.description && (
                    <div className="rounded border bg-gray-50 p-3 text-sm text-gray-600">
                      <div className="mb-1 text-xs font-medium text-gray-500">Snippet:</div>
                      {source.snippet.length > 200
                        ? `${source.snippet.substring(0, 200)}...`
                        : source.snippet}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="break-all">{source.url}</span>
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

interface CitationsProps {
  citations: Array<{
    title: string;
    url: string;
    index?: number;
  }>;
  className?: string;
}

export function Citations({ citations, className }: CitationsProps) {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Citations</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {citations.map((citation, index) => (
          <Button
            key={`citation-${citation.url}-${citation.index || index}`}
            variant="outline"
            size="sm"
            className="h-7 text-xs hover:bg-emerald-50"
            onClick={() => window.open(citation.url, '_blank', 'noopener,noreferrer')}
          >
            <span className="mr-1">[{citation.index || index + 1}]</span>
            <span className="max-w-32 truncate">{citation.title}</span>
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        ))}
      </div>
    </div>
  );
}
