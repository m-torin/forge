'use client';

import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { mockMCPTools } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { useDisclosure, useHover } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Cloud,
  Code,
  Database,
  FileText,
  Globe,
  Lock,
  Search,
  Shield,
  Wrench,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// MCP Tool types
export interface MCPTool {
  id: string;
  name: string;
  description: string;
  category: 'data' | 'api' | 'compute' | 'storage' | 'search' | 'security';
  icon: React.ComponentType<{ size?: number }>;
  requiresAuth: boolean;
  isEnabled: boolean;
  permissions?: string[];
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

// Mock MCP tools for demonstration
const mockTools: MCPTool[] = [
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web for current information',
    category: 'search',
    icon: Search,
    requiresAuth: false,
    isEnabled: true,
  },
  {
    id: 'weather-api',
    name: 'Weather API',
    description: 'Get current weather and forecasts',
    category: 'api',
    icon: Cloud,
    requiresAuth: false,
    isEnabled: true,
  },
  {
    id: 'code-interpreter',
    name: 'Code Interpreter',
    description: 'Execute Python code in a sandboxed environment',
    category: 'compute',
    icon: Code,
    requiresAuth: true,
    isEnabled: false,
    permissions: ['execute_code'],
  },
  {
    id: 'file-system',
    name: 'File System',
    description: 'Read and write files in your workspace',
    category: 'storage',
    icon: FileText,
    requiresAuth: true,
    isEnabled: false,
    permissions: ['read_files', 'write_files'],
  },
  {
    id: 'database-query',
    name: 'Database Query',
    description: 'Query connected databases',
    category: 'data',
    icon: Database,
    requiresAuth: true,
    isEnabled: false,
    permissions: ['read_database'],
  },
  {
    id: 'calendar-access',
    name: 'Calendar Access',
    description: 'Access and manage calendar events',
    category: 'api',
    icon: Calendar,
    requiresAuth: true,
    isEnabled: false,
    permissions: ['read_calendar', 'write_calendar'],
  },
];

interface MCPToolsPanelProps {
  onToolSelect?: (tool: MCPTool) => void;
  className?: string;
}

export function MCPToolsPanel({ onToolSelect, className }: MCPToolsPanelProps) {
  const [isOpen, { open: _open, close, toggle }] = useDisclosure(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [_hoveredTool, setHoveredTool] = useState<string | null>(null);

  // Use appropriate tools based on mode
  const prototypeMode = isPrototypeMode();
  const tools = prototypeMode ? mockMCPTools : mockTools;

  const categories = useMemo(() => {
    const cats = new Set(tools.map(t => t.category));
    return Array.from(cats);
  }, [tools]);

  const filteredTools = useMemo(() => {
    if (!selectedCategory) return tools;
    return tools.filter(t => t.category === selectedCategory);
  }, [selectedCategory, tools]);

  const categoryIcons = {
    data: Database,
    api: Globe,
    compute: Zap,
    storage: FileText,
    search: Search,
    security: Shield,
  };

  return (
    <>
      {/* Tool Trigger Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggle}
            className={cx(
              'relative transition-all duration-200',
              'hover:scale-105 active:scale-95',
              isOpen && 'ring-2 ring-primary ring-offset-2',
              className,
            )}
            data-testid="mcp-tools-trigger"
          >
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <Wrench size={16} />
            </motion.div>

            {/* Available tools indicator */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-green-500"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>MCP Tools</TooltipContent>
      </Tooltip>

      {/* Tools Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border bg-background shadow-lg"
          >
            {/* Header */}
            <div className="border-b p-4">
              <h3 className="font-semibold">Available MCP Tools</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Select tools to enhance AI capabilities
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 border-b p-4">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-xs"
              >
                All
              </Button>
              {categories.map(cat => {
                const Icon = categoryIcons[cat as keyof typeof categoryIcons];
                return (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="gap-1 text-xs"
                  >
                    <Icon size={12} />
                    {cat}
                  </Button>
                );
              })}
            </div>

            {/* Tools List */}
            <div className="max-h-96 overflow-y-auto p-2">
              {filteredTools.map((tool, index) => (
                <ToolItem
                  key={tool.id}
                  tool={tool}
                  index={index}
                  onHover={setHoveredTool}
                  onSelect={() => {
                    onToolSelect?.(tool as any);
                    close();
                  }}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t p-4 text-xs text-muted-foreground">
              {tools.filter(t => t.isEnabled).length} of {tools.length} tools enabled
              {prototypeMode && (
                <span className="ml-2 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-600">
                  DEMO
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Individual tool item component
interface ToolItemProps {
  tool: MCPTool;
  index: number;
  onHover: (id: string | null) => void;
  onSelect: () => void;
}

function ToolItem({ tool, index, onHover, onSelect }: ToolItemProps) {
  const { hovered, ref } = useHover();
  const Icon = tool.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => onHover(tool.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onSelect}
      className={cx(
        'relative flex cursor-pointer items-start gap-3 rounded-lg p-3',
        'transition-all duration-200',
        'hover:bg-muted/50',
        tool.isEnabled ? 'opacity-100' : 'opacity-50',
      )}
      data-testid={`mcp-tool-${tool.id}`}
    >
      {/* Icon */}
      <div
        className={cx(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          'transition-all duration-200',
          tool.isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
          hovered && 'scale-110',
        )}
      >
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">{tool.name}</h4>
          {tool.requiresAuth && <Lock size={12} className="text-muted-foreground" />}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{tool.description}</p>

        {/* Permissions */}
        {tool.permissions && hovered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 flex flex-wrap gap-1"
          >
            {tool.permissions.map(perm => (
              <span
                key={perm}
                className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-600 dark:text-yellow-400"
              >
                {perm}
              </span>
            ))}
          </motion.div>
        )}
      </div>

      {/* Status */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.05 + 0.1 }}
        className={cx('h-2 w-2 rounded-full', tool.isEnabled ? 'bg-green-500' : 'bg-gray-400')}
      />
    </motion.div>
  );
}

// Tool invocation indicator
interface ToolInvocationIndicatorProps {
  tool: MCPTool;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  className?: string;
}

export function ToolInvocationIndicator({
  tool,
  status,
  result,
  error,
  className,
}: ToolInvocationIndicatorProps) {
  const Icon = tool.icon;

  const statusConfig = {
    pending: {
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      animation: { scale: [1, 1.1, 1] },
      label: 'Preparing...',
    },
    running: {
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      animation: { rotate: [0, 360] },
      label: 'Running...',
    },
    success: {
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      animation: { scale: [1, 1.2, 1] },
      label: 'Complete',
    },
    error: {
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      animation: { x: [-2, 2, -2, 2, 0] },
      label: 'Failed',
    },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cx('flex items-center gap-3 rounded-lg p-3', config.bgColor, className)}
      data-testid="tool-invocation-indicator"
    >
      <motion.div
        animate={config.animation}
        transition={{
          duration: status === 'running' ? 2 : 0.5,
          repeat: status === 'running' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className={cx('rounded-lg p-2', config.color)}
      >
        <Icon size={20} />
      </motion.div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{tool.name}</span>
          <span className={cx('text-xs', config.color)}>{config.label}</span>
        </div>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

        {result && status === 'success' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-1 text-xs text-muted-foreground"
          >
            Result ready
          </motion.div>
        )}
      </div>

      {/* Progress indicator */}
      {status === 'running' && (
        <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
          <motion.div
            animate={{ x: [-48, 48] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-full w-1/3 rounded-full bg-blue-500"
          />
        </div>
      )}
    </motion.div>
  );
}
