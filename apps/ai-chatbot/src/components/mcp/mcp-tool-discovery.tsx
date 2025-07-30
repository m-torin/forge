'use client';

import { Button } from '#/components/ui/button';
import type { MCPConnection, MCPTool } from '#/lib/mcp/types';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  ChevronRight,
  Copy,
  Database,
  FileText,
  Globe,
  Package,
  Play,
  Search,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface MCPToolDiscoveryProps {
  connections: MCPConnection[];
  onToolSelect: (tool: MCPTool, connectionId: string) => void;
  onToolTest: (tool: MCPTool, connectionId: string) => void;
  className?: string;
}

export function MCPToolDiscovery({
  connections,
  onToolSelect,
  onToolTest,
  className,
}: MCPToolDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [_selectedTool, _setSelectedTool] = useState<string | null>(null);
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  // Flatten all tools with their connection info
  const allTools = connections.flatMap(connection =>
    connection.tools.map(tool => ({
      ...tool,
      connectionId: connection.id,
      connectionName: connection.name,
      connectionStatus: connection.status,
    })),
  );

  // Tool categories based on patterns in tool names/descriptions
  const categorizeTools = (tools: typeof allTools) => {
    const categories: Record<string, typeof allTools> = {
      'file-system': [],
      'web-search': [],
      'data-processing': [],
      'code-execution': [],
      communication: [],
      other: [],
    };

    tools.forEach(tool => {
      const name = tool.name.toLowerCase();
      const _desc = tool.description.toLowerCase();

      if (name.includes('file') || name.includes('read') || name.includes('write')) {
        categories['file-system'].push(tool);
      } else if (name.includes('search') || name.includes('web') || name.includes('fetch')) {
        categories['web-search'].push(tool);
      } else if (name.includes('data') || name.includes('process') || name.includes('analyze')) {
        categories['data-processing'].push(tool);
      } else if (name.includes('execute') || name.includes('run') || name.includes('code')) {
        categories['code-execution'].push(tool);
      } else if (name.includes('send') || name.includes('email') || name.includes('message')) {
        categories['communication'].push(tool);
      } else {
        categories['other'].push(tool);
      }
    });

    return categories;
  };

  const categorizedTools = categorizeTools(allTools);

  const categoryConfig = {
    'file-system': { icon: FileText, label: 'File System', color: 'text-blue-500' },
    'web-search': { icon: Globe, label: 'Web & Search', color: 'text-green-500' },
    'data-processing': { icon: Database, label: 'Data Processing', color: 'text-purple-500' },
    'code-execution': { icon: Terminal, label: 'Code Execution', color: 'text-orange-500' },
    communication: { icon: Zap, label: 'Communication', color: 'text-pink-500' },
    other: { icon: Package, label: 'Other', color: 'text-gray-500' },
  };

  // Filter tools based on search
  const filteredTools = allTools.filter(tool => {
    const matchesSearch =
      searchQuery === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.connectionName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (!selectedCategory) return true;

    return categorizedTools[selectedCategory]?.some(
      t => t.name === tool.name && t.connectionId === tool.connectionId,
    );
  });

  const toggleToolExpansion = (toolId: string) => {
    setExpandedTools(prev => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
  };

  return (
    <div className={cx('space-y-4', className)}>
      {/* Header */}
      <div>
        <h3 className="mb-1 text-lg font-semibold">Discovered Tools</h3>
        <p className="text-sm text-muted-foreground">
          {allTools.length} tools available from {connections.length} connections
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tools..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cx(
            'rounded-lg px-3 py-1.5 text-sm transition-colors',
            !selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80',
          )}
        >
          All Tools
        </button>
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = categorizedTools[key].length;

          if (count === 0) return null;

          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={cx(
                'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                selectedCategory === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80',
              )}
            >
              <Icon className="h-3 w-3" />
              {config.label}
              <span className="text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Tools List */}
      <div className="space-y-2">
        {filteredTools.map(tool => {
          const toolId = `${tool.connectionId}-${tool.name}`;
          const isExpanded = expandedTools.has(toolId);
          const category =
            Object.entries(categorizedTools).find(([_, tools]) =>
              tools.some(t => t.name === tool.name && t.connectionId === tool.connectionId),
            )?.[0] || 'other';
          const config = categoryConfig[category as keyof typeof categoryConfig];
          const Icon = config.icon;

          return (
            <ToolCard
              key={toolId}
              tool={tool}
              icon={Icon}
              color={config.color}
              isExpanded={isExpanded}
              onToggle={() => toggleToolExpansion(toolId)}
              onSelect={() => onToolSelect(tool, tool.connectionId)}
              onTest={() => onToolTest(tool, tool.connectionId)}
            />
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="py-8 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-20" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'No tools match your search' : 'No tools discovered yet'}
          </p>
        </div>
      )}

      {/* Suggestions */}
      {connections.length === 0 && (
        <div className="rounded-lg border border-dashed p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Get started with MCP</p>
              <p className="text-sm text-muted-foreground">
                Connect to MCP servers to discover powerful tools for your AI assistant
              </p>
              <Button size="sm" variant="link" className="h-auto p-0">
                Browse Marketplace →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tool Card Component
function ToolCard({
  tool,
  icon: Icon,
  color,
  isExpanded,
  onToggle,
  onSelect,
  onTest,
}: {
  tool: any;
  icon: any;
  color: string;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onTest: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tool.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      className={cx(
        'rounded-lg border transition-all',
        isExpanded ? 'bg-muted/30' : 'hover:bg-muted/30',
      )}
    >
      <button onClick={onToggle} className="w-full p-3 text-left">
        <div className="flex items-start gap-3">
          <div className={cx('mt-0.5 rounded-lg bg-muted p-2', color)}>
            <Icon className="h-4 w-4" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{tool.name}</h4>
              <div className="flex items-center gap-2">
                {tool.connectionStatus !== 'connected' && (
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                )}
                <ChevronRight
                  className={cx(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    isExpanded && 'rotate-90',
                  )}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{tool.description}</p>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {tool.connectionName}
              </span>
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-3 pb-3">
              {/* Parameters */}
              {tool.parameters && Object.keys(tool.parameters).length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-muted-foreground">Parameters</h5>
                  <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                    {JSON.stringify(tool.parameters, null, 2)}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copy Name
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onTest}
                  className="gap-2"
                  disabled={tool.connectionStatus !== 'connected'}
                >
                  <Play className="h-3 w-3" />
                  Test Tool
                </Button>
                <Button size="sm" onClick={onSelect} className="gap-2">
                  <Sparkles className="h-3 w-3" />
                  Use in Chat
                </Button>
              </div>

              {/* Connection Warning */}
              {tool.connectionStatus !== 'connected' && (
                <div className="flex items-center gap-2 rounded bg-yellow-500/10 p-2 text-xs">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  <span>Connection not active. Reconnect to use this tool.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
