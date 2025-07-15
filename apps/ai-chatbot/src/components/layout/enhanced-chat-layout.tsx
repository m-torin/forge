'use client';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { useViewportSize } from '@mantine/hooks';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChatLayout, LayoutControls, ResizableLayoutProvider } from './resizable-layout';

// Create cn utility function for this package
const cn = (...classes: (string | undefined | null | boolean)[]) => clsx(classes);

// Simple mobile detection hook
const useMobileDetection = () => {
  const { width } = useViewportSize();
  return { isMobile: width < 768 };
};

interface ChatInspectorProps {
  className?: string;
}

function ChatInspector({ className }: ChatInspectorProps) {
  const [activeTab, setActiveTab] = useState<'context' | 'history' | 'tools' | 'performance'>(
    'context',
  );
  const { isMobile } = useMobileDetection();
  const { variants, performance } = useAnimationSystem({
    enableHardwareAccel: true,
    respectReducedMotion: true,
  });

  // Optimize tab switching with performance monitoring
  const handleTabChange = useCallback(
    (newTab: typeof activeTab) => {
      performance.startMonitoring();
      setActiveTab(newTab);
      // Stop monitoring after animation completes
      setTimeout(() => performance.stopMonitoring(), 200);
    },
    [performance],
  );

  const tabs = useMemo(
    () => [
      { id: 'context' as const, label: 'Context', icon: '🧠' },
      { id: 'history' as const, label: 'History', icon: '📝' },
      { id: 'tools' as const, label: 'Tools', icon: '🔧' },
      { id: 'performance' as const, label: 'Perf', icon: '⚡' },
    ],
    [],
  );

  if (isMobile) {
    return null; // Hide inspector on mobile
  }

  return (
    <motion.div
      className={cn('flex h-full flex-col bg-muted/30', className)}
      variants={variants.slideRightVariants}
      initial="hidden"
      animate="visible"
      style={{
        willChange: 'transform, opacity',
      }}
    >
      {/* Inspector Header */}
      <motion.div
        className="flex items-center justify-between border-b p-3"
        variants={variants.slideDownVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-sm font-semibold">Chat Inspector</h3>
        <Badge variant="outline" className="text-xs">
          Debug
        </Badge>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        className="flex border-b"
        variants={variants.staggerContainerFast}
        initial="hidden"
        animate="visible"
      >
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            variants={variants.slideUpVariants}
            whileHover={variants.hoverVariants.hover}
            whileTap={variants.hoverVariants.tap}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'relative flex-1 px-3 py-2 text-xs font-medium transition-colors',
              'hover:bg-muted/50 focus:bg-muted/50 focus:outline-none',
              activeTab === tab.id
                ? 'border-b-2 border-primary bg-background text-primary'
                : 'text-muted-foreground',
            )}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={variants.slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              duration: performance.optimizedDuration(0.15),
              ease: [0.4, 0.0, 0.2, 1],
            }}
          >
            {activeTab === 'context' && <ContextPanel />}
            {activeTab === 'history' && <HistoryPanel />}
            {activeTab === 'tools' && <ToolsPanel />}
            {activeTab === 'performance' && <PerformancePanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ContextPanel() {
  const { variants } = useAnimationSystem();
  const contextItems = useMemo(
    () => [
      { label: 'Model', value: 'claude-3-5-sonnet' },
      { label: 'Temperature', value: '0.7' },
      { label: 'Max Tokens', value: '4096' },
      { label: 'System Prompt', value: 'Active' },
      { label: 'Tools Available', value: '12' },
    ],
    [],
  );

  return (
    <motion.div
      className="space-y-3"
      variants={variants.staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.h4
        className="text-sm font-medium text-muted-foreground"
        variants={variants.slideUpVariants}
      >
        Current Context
      </motion.h4>
      <div className="space-y-2">
        {contextItems.map(item => (
          <motion.div
            key={`context-${item.label}`}
            className="flex items-center justify-between text-xs"
            variants={variants.slideRightVariants}
            whileHover={variants.hoverVariants.hover}
          >
            <span className="text-muted-foreground">{item.label}</span>
            <Badge variant="secondary" className="text-xs">
              {item.value}
            </Badge>
          </motion.div>
        ))}
      </div>

      <motion.div className="border-t pt-3" variants={variants.slideUpVariants}>
        <motion.h4
          className="mb-2 text-sm font-medium text-muted-foreground"
          variants={variants.slideUpVariants}
        >
          Memory Usage
        </motion.h4>
        <div className="space-y-2">
          <motion.div
            className="flex justify-between text-xs"
            variants={variants.slideRightVariants}
          >
            <span>Messages</span>
            <span>8/50</span>
          </motion.div>
          <motion.div
            className="h-1.5 w-full rounded-full bg-muted"
            variants={variants.scaleVariants}
          >
            <motion.div
              className="h-1.5 rounded-full bg-primary"
              style={{ width: '16%' }}
              variants={variants.progressVariants}
              initial="hidden"
              animate="visible"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function HistoryPanel() {
  const historyItems = [
    { type: 'user', preview: 'How do I implement...' },
    { type: 'assistant', preview: 'To implement this feature...' },
    { type: 'user', preview: 'What about error handling?' },
    { type: 'assistant', preview: 'For error handling, you should...' },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Recent Messages</h4>
      <div className="space-y-2">
        {historyItems.map(item => (
          <div
            key={`history-${item.type}-${item.preview.substring(0, 10)}`}
            className={cn(
              'rounded border p-2 text-xs',
              item.type === 'user' ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/50',
            )}
          >
            <div className="mb-1 flex items-center gap-2">
              <Badge variant={item.type === 'user' ? 'default' : 'secondary'} className="text-xs">
                {item.type}
              </Badge>
              <span className="text-xs text-muted-foreground">2m ago</span>
            </div>
            <p className="truncate text-muted-foreground">{item.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolsPanel() {
  const tools = [
    { name: 'Code Generator', active: true, uses: 3 },
    { name: 'Image Generator', active: false, uses: 0 },
    { name: 'Web Search', active: true, uses: 1 },
    { name: 'File Manager', active: false, uses: 0 },
    { name: 'Calculator', active: true, uses: 2 },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Available Tools</h4>
      <div className="space-y-2">
        {tools.map(tool => (
          <div
            key={`tool-${tool.name}`}
            className={cn(
              'flex items-center justify-between rounded border p-2',
              tool.active
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                : 'bg-muted/30',
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  tool.active ? 'bg-green-500' : 'bg-muted-foreground',
                )}
              />
              <span className="text-xs font-medium">{tool.name}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {tool.uses}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformancePanel() {
  const metrics = [
    { label: 'Response Time', value: '2.3s', trend: 'up' },
    { label: 'Token Rate', value: '145/s', trend: 'stable' },
    { label: 'Cache Hit', value: '89%', trend: 'down' },
    { label: 'Error Rate', value: '0.1%', trend: 'stable' },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Performance Metrics</h4>
      <div className="space-y-3">
        {metrics.map(metric => (
          <div key={`metric-${metric.label}`} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{metric.label}</span>
              <div className="flex items-center gap-1">
                <span className="font-mono">{metric.value}</span>
                <div
                  className={cn(
                    'h-1 w-1 rounded-full',
                    metric.trend === 'up' && 'bg-green-500',
                    metric.trend === 'down' && 'bg-red-500',
                    metric.trend === 'stable' && 'bg-yellow-500',
                  )}
                />
              </div>
            </div>
            <div className="h-1 w-full rounded-full bg-muted">
              <div
                className={cn(
                  'h-1 rounded-full transition-all',
                  metric.trend === 'up' && 'bg-green-500',
                  metric.trend === 'down' && 'bg-red-500',
                  metric.trend === 'stable' && 'bg-yellow-500',
                )}
                style={{ width: `${Math.random() * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-3">
        <Button variant="outline" size="sm" className="w-full text-xs">
          Reset Metrics
        </Button>
      </div>
    </div>
  );
}

interface EnhancedChatLayoutProps {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  showInspector?: boolean;
  inspectorProps?: any;
  className?: string;
}

export function EnhancedChatLayout({
  sidebar,
  children,
  showInspector = false,
  inspectorProps = {},
  className,
}: EnhancedChatLayoutProps) {
  const { isMobile } = useMobileDetection();
  const [inspectorEnabled, setInspectorEnabled] = useState(showInspector && !isMobile);
  const { variants, performance, cleanup } = useAnimationSystem({
    enableHardwareAccel: true,
    respectReducedMotion: true,
  });

  // Auto-hide inspector on mobile
  useEffect(() => {
    if (isMobile) {
      setInspectorEnabled(false);
    }
  }, [isMobile]);

  // Performance monitoring and cleanup
  useEffect(() => {
    performance.startMonitoring();
    return () => {
      performance.stopMonitoring();
      cleanup();
    };
  }, [performance, cleanup]);

  // Optimized inspector toggle
  const handleInspectorToggle = useCallback(() => {
    performance.batchUpdates([() => setInspectorEnabled(!inspectorEnabled)]);
  }, [inspectorEnabled, performance]);

  return (
    <ResizableLayoutProvider>
      <motion.div
        className={cn('flex h-full flex-col', className)}
        variants={variants.fadeVariants}
        initial="hidden"
        animate="visible"
        style={{
          willChange: 'transform, opacity',
        }}
      >
        {/* Header with Layout Controls */}
        <motion.div
          className="flex items-center justify-between border-b bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          variants={variants.slideDownVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="flex items-center gap-2"
            variants={variants.staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 className="text-sm font-semibold" variants={variants.slideRightVariants}>
              AI Chatbot
            </motion.h1>
            <motion.div variants={variants.scaleVariants}>
              <Badge variant="outline" className="text-xs">
                Enhanced
              </Badge>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex items-center gap-2"
            variants={variants.staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            {!isMobile && (
              <>
                <motion.div variants={variants.slideLeftVariants}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={variants.hoverVariants.hover}
                        whileTap={variants.hoverVariants.tap}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleInspectorToggle}
                          className={cn(
                            'h-8 w-8 p-0',
                            inspectorEnabled && 'bg-primary/10 text-primary',
                          )}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14,2 14,8 20,8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10,9 9,9 8,9" />
                          </svg>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Toggle inspector panel</TooltipContent>
                  </Tooltip>
                </motion.div>

                <motion.div variants={variants.slideLeftVariants}>
                  <LayoutControls />
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Main Layout */}
        <motion.div
          className="flex-1 overflow-hidden"
          variants={variants.slideUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <ChatLayout
            sidebar={sidebar || undefined}
            chat={children}
            inspector={inspectorEnabled ? <ChatInspector /> : undefined}
            inspectorProps={{
              defaultSize: 320,
              minSize: 250,
              maxSize: 500,
              collapsible: true,
              ...inspectorProps,
            }}
          />
        </motion.div>
      </motion.div>
    </ResizableLayoutProvider>
  );
}

// Export individual components for flexibility
export { ChatInspector, ChatLayout, LayoutControls, ResizableLayoutProvider };
