'use client';

import {
  AlertCircleIcon,
  CheckIcon,
  CodeIcon,
  FileIcon,
  LinkIcon,
  SearchIcon,
} from '#/components/icons';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card';
import { cn } from '#/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface MCPDisplayProps {
  type: 'web-search' | 'code-interpreter' | 'file-operations' | 'connection-status' | 'generic';
  data: any;
  className?: string;
}

export function MCPDisplay({ type, data, className }: MCPDisplayProps) {
  const [expandedResult, setExpandedResult] = useState<number | null>(null);

  if (!data) return null;

  const containerAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  if (type === 'web-search') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon size={16} />
              Web Search Results
              {data.query && <Badge variant="outline">{data.query}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.results && data.results.length > 0 ? (
              <div className="space-y-4">
                {data.results.map((result: any, index: number) => (
                  <div
                    key={`result-${result.title || result.url || index}`}
                    className="space-y-2 rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="cursor-pointer text-sm font-medium hover:text-primary">
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          {result.title}
                        </a>
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedResult(expandedResult === index ? null : index)}
                      >
                        {expandedResult === index ? '−' : '+'}
                      </Button>
                    </div>

                    {result.url && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <LinkIcon size={12} />
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {result.url}
                        </a>
                      </div>
                    )}

                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {result.snippet || result.description}
                    </p>

                    {expandedResult === index && result.content && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 rounded bg-muted p-3 text-sm"
                      >
                        {result.content}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No results found.</p>
            )}

            {data.metadata && (
              <div className="mt-4 flex flex-wrap gap-1 border-t pt-4">
                {data.metadata.totalResults && (
                  <Badge variant="secondary">{data.metadata.totalResults} results</Badge>
                )}
                {data.metadata.searchTime && (
                  <Badge variant="secondary">{data.metadata.searchTime}ms</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (type === 'code-interpreter') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CodeIcon size={16} />
              Code Execution
              {data.language && <Badge variant="outline">{data.language}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.code && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Code:</h4>
                <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-sm">
                  <code>{data.code}</code>
                </pre>
              </div>
            )}

            {data.output && (
              <div>
                <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                  Output:
                  {data.success ? (
                    <span className="text-green-500">
                      <CheckIcon size={14} />
                    </span>
                  ) : (
                    <span className="text-red-500">
                      <AlertCircleIcon size={14} />
                    </span>
                  )}
                </h4>
                <pre
                  className={cn(
                    'overflow-x-auto rounded-lg border p-3 text-sm',
                    data.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50',
                  )}
                >
                  <code>{data.output}</code>
                </pre>
              </div>
            )}

            {data.error && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-red-600">Error:</h4>
                <pre className="overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
                  <code className="text-red-700">{data.error}</code>
                </pre>
              </div>
            )}

            {data.executionTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                Execution time: {data.executionTime}ms
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (type === 'file-operations') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileIcon size={16} />
              File Operations
              {data.operation && <Badge variant="outline">{data.operation}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.files && data.files.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Files:</h4>
                <div className="space-y-2">
                  {data.files.map((file: any, index: number) => (
                    <div
                      key={`file-${file.path || file.name || index}`}
                      className="flex items-center gap-2 rounded border p-2"
                    >
                      <FileIcon size={14} />
                      <span className="font-mono text-sm">{file.path || file.name}</span>
                      {file.size && (
                        <Badge variant="secondary" className="text-xs">
                          {file.size}
                        </Badge>
                      )}
                      {file.status && (
                        <Badge
                          variant={file.status === 'success' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {file.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.result && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Result:</h4>
                <div className="rounded-lg bg-muted p-3">
                  {typeof data.result === 'string' ? (
                    <p className="text-sm">{data.result}</p>
                  ) : (
                    <pre className="overflow-x-auto text-xs">
                      {JSON.stringify(data.result, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {data.error && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-red-600">Error:</h4>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{data.error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (type === 'connection-status') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div
                className={cn('h-3 w-3 rounded-full', data.healthy ? 'bg-green-500' : 'bg-red-500')}
              />
              MCP Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.connections && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Connections:</h4>
                <div className="space-y-2">
                  {Object.entries(data.connections).map(([name, status]: [string, any]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded border p-2"
                    >
                      <span className="text-sm font-medium">{name}</span>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            status === 'connected' ? 'bg-green-500' : 'bg-red-500',
                          )}
                        />
                        <Badge variant={status === 'connected' ? 'default' : 'destructive'}>
                          {status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.issues && data.issues.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-red-600">Issues:</h4>
                <div className="space-y-1">
                  {data.issues.map((issue: string) => (
                    <div
                      key={`issue-${issue.substring(0, 20)}`}
                      className="flex items-start gap-2 text-sm text-red-600"
                    >
                      <span className="mt-0.5 flex-shrink-0">
                        <AlertCircleIcon size={14} />
                      </span>
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.lastCheck && (
              <div className="text-xs text-muted-foreground">
                Last checked: {new Date(data.lastCheck).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Generic MCP tool result display
  return (
    <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CodeIcon size={16} />
            MCP Tool Result
            {data.toolName && <Badge variant="outline">{data.toolName}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.success !== undefined && (
            <div className="mb-4">
              <Badge variant={data.success ? 'default' : 'destructive'}>
                {data.success ? 'Success' : 'Failed'}
              </Badge>
            </div>
          )}

          {data.result && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Result:</h4>
              {typeof data.result === 'string' ? (
                <p className="rounded bg-muted p-3 text-sm">{data.result}</p>
              ) : (
                <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                  {JSON.stringify(data.result, null, 2)}
                </pre>
              )}
            </div>
          )}

          {data.error && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600">Error:</h4>
              <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {data.error}
              </p>
            </div>
          )}

          {data.metadata && (
            <div className="mt-4 border-t pt-4">
              <h4 className="mb-2 text-sm font-medium">Metadata:</h4>
              <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                {JSON.stringify(data.metadata, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
