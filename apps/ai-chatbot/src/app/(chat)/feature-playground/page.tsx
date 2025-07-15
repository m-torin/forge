'use client';

import { FeatureShowcase } from '#/components/features/feature-showcase';
import { Button } from '#/components/ui/button';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import type { ChatMessage } from '#/lib/types';
import { cn } from '#/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  Brain,
  Code,
  Database,
  Eye,
  FileText,
  GitBranch,
  Globe,
  Layers,
  Link2,
  MessageSquare,
  Network,
  Play,
  Settings,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

// Import all the components we built
import { ConversationBranching } from '#/components/conversation-branching';
import { AIMemoryUI, MemoryStats } from '#/components/features/ai-memory-ui';
import { MultiModelComparison } from '#/components/features/multi-model-comparison';
import { NetworkStatus } from '#/components/network-status';
import { useNotifications } from '#/components/notification-queue';
import { PromptTemplatesUI } from '#/components/prompt-templates-ui';
import {
  RAGAnalytics,
  RAGDashboard,
  RAGKnowledgeBase,
  RAGPlayground,
  RAGSettings,
} from '#/components/rag';
import { VirtualMessages } from '#/components/virtual-messages';
// MCP Components - Create placeholder components for now
/**
 * Mock MCP Connection Manager component for demonstration
 * @param onConnectionsChange - Callback for connection changes
 */
const MCPConnectionManager = ({ onConnectionsChange }: { onConnectionsChange: () => void }) => (
  <div className="rounded-lg border p-4">
    <p>MCP Connection Manager component - coming soon...</p>
    <button
      onClick={onConnectionsChange}
      className="mt-2 rounded bg-blue-500 px-3 py-1 text-sm text-white"
    >
      Mock Connection Change
    </button>
  </div>
);

/**
 * Mock MCP Marketplace component for demonstration
 * @param onInstall - Callback for server installation
 */
const MCPMarketplace = ({ onInstall }: { onInstall: (server: any) => void }) => (
  <div className="rounded-lg border p-4">
    <p>MCP Marketplace component - coming soon...</p>
    <button
      onClick={() => onInstall({ name: 'Mock Server' })}
      className="mt-2 rounded bg-green-500 px-3 py-1 text-sm text-white"
    >
      Mock Install Server
    </button>
  </div>
);

/**
 * Mock MCP Permission Manager component for demonstration
 * @param connection - MCP connection object
 * @param onPermissionChange - Callback for permission changes
 */
const MCPPermissionManager = ({
  connection,
  onPermissionChange,
}: {
  connection: any;
  onPermissionChange: () => void;
}) => (
  <div className="rounded-lg border p-4">
    <p>MCP Permissions Manager component - coming soon...</p>
    <p className="mt-1 text-sm text-gray-600">Connection: {connection.name}</p>
    <button
      onClick={onPermissionChange}
      className="mt-2 rounded bg-orange-500 px-3 py-1 text-sm text-white"
    >
      Mock Permission Change
    </button>
  </div>
);

/**
 * Mock MCP Tool Chain Builder component for demonstration
 * @param availableTools - Available tools for chaining
 * @param onExecute - Callback for chain execution
 * @param onSave - Callback for chain saving
 */
const MCPToolChainBuilder = ({
  availableTools,
  onExecute,
  onSave,
}: {
  availableTools: any[];
  onExecute: (chain: any) => void;
  onSave: (chain: any) => void;
}) => (
  <div className="rounded-lg border p-4">
    <p>MCP Tool Chain Builder component - coming soon...</p>
    <p className="mt-1 text-sm text-gray-600">Available tools: {availableTools.length}</p>
    <div className="mt-2 flex gap-2">
      <button
        onClick={() => onExecute({ tools: availableTools })}
        className="rounded bg-purple-500 px-3 py-1 text-sm text-white"
      >
        Mock Execute Chain
      </button>
      <button
        onClick={() => onSave({ tools: availableTools })}
        className="rounded bg-indigo-500 px-3 py-1 text-sm text-white"
      >
        Mock Save Chain
      </button>
    </div>
  </div>
);

/**
 * Mock Enhanced Chat with MCP component for demonstration
 * @param id - Chat ID
 * @param initialMessages - Initial chat messages
 * @param votes - Message votes
 * @param isReadonly - Whether chat is readonly
 */
const EnhancedChatWithMCP = ({
  id,
  initialMessages,
  votes: _votes,
  isReadonly: _isReadonly,
}: {
  id: string;
  initialMessages: any[];
  votes: any[];
  isReadonly: boolean;
}) => (
  <div className="h-full rounded-lg border p-4">
    <p>Enhanced Chat with MCP component - coming soon...</p>
    <p className="mt-1 text-sm text-gray-600">Chat ID: {id}</p>
    <p className="text-sm text-gray-600">Messages: {initialMessages.length}</p>
  </div>
);

/**
 * Test component for notification queue system
 */
function NotificationTestComponent() {
  const { addNotification } = useNotifications();

  return (
    <div className="space-y-4">
      <Button
        onClick={() =>
          addNotification({
            type: 'SUCCESS',
            title: 'Test Notification',
            message: 'This is a test notification using the new queue system!',
          })
        }
        variant="outline"
      >
        Test Notification Queue
      </Button>
    </div>
  );
}

/**
 * Feature playground page showcasing various chat and AI features
 */
export default function FeaturePlaygroundPage() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState<'showcase' | 'live'>('showcase');
  const { variants } = useAnimationSystem();

  // Memoize mock data to prevent recreation on every render
  const mockMessages: ChatMessage[] = useMemo(
    () => [
      {
        id: '1',
        role: 'user' as const,
        parts: [{ type: 'text', text: 'Hello, can you help me with React?' }],
        metadata: { createdAt: new Date().toISOString() },
      },
      {
        id: '2',
        role: 'assistant' as const,
        parts: [
          {
            type: 'text',
            text: "Of course! I'd be happy to help you with React. What specific aspect would you like to learn about?",
          },
        ],
        metadata: { createdAt: new Date().toISOString() },
      },
    ],
    [],
  );

  const mockMCPConnection = useMemo(
    () => ({
      id: 'demo-1',
      name: 'Demo MCP Server',
      description: 'A demo server for showcasing MCP features',
      transport: 'sse' as const,
      config: { transport: 'sse' as const, name: 'Demo', description: 'Demo server' },
      status: 'connected' as const,
      tools: [
        { name: 'web_search', description: 'Search the web', parameters: {} },
        { name: 'code_execute', description: 'Execute code', parameters: {} },
      ],
      connectedAt: new Date().toISOString(),
      metrics: {
        totalCalls: 42,
        successfulCalls: 40,
        failedCalls: 2,
        averageLatency: 234,
      },
    }),
    [],
  );

  // Memoize feature list to prevent recreation
  const features = useMemo(
    () => [
      { id: 'micromoments', icon: Sparkles, label: 'Micromoments' },
      { id: 'network-status', icon: Network, label: 'Network Status' },
      { id: 'message-reactions', icon: MessageSquare, label: 'Message Reactions' },
      { id: 'virtual-scrolling', icon: Layers, label: 'Virtual Scrolling' },
      { id: 'rag-dashboard', icon: Brain, label: 'RAG Dashboard' },
      { id: 'rag-knowledge-base', icon: Database, label: 'RAG Knowledge Base' },
      { id: 'rag-analytics', icon: BarChart3, label: 'RAG Analytics' },
      { id: 'rag-playground', icon: Play, label: 'RAG Playground' },
      { id: 'rag-settings', icon: Settings, label: 'RAG Settings' },
      { id: 'mcp-connections', icon: Link2, label: 'MCP Connections' },
      { id: 'mcp-marketplace', icon: Globe, label: 'MCP Marketplace' },
      { id: 'mcp-permissions', icon: Shield, label: 'MCP Permissions' },
      { id: 'mcp-toolchain', icon: GitBranch, label: 'Tool Chain Builder' },
      { id: 'multi-model', icon: Brain, label: 'Multi-Model Compare' },
      { id: 'conversation-branching', icon: GitBranch, label: 'Conversation Branching' },
      { id: 'ai-memory', icon: Database, label: 'AI Memory' },
      { id: 'prompt-templates', icon: FileText, label: 'Prompt Templates' },
    ],
    [],
  );

  // Memoize demo mode handlers to prevent recreation
  const handleShowcaseMode = useCallback(() => setDemoMode('showcase'), []);
  const handleLiveMode = useCallback(() => setDemoMode('live'), []);
  const handleFeatureSelect = useCallback((feature: any) => {
    setSelectedFeature(feature.id);
    setDemoMode('live');
  }, []);
  const handleBack = useCallback(() => window.history.back(), []);

  /**
   * Renders the appropriate demo component based on feature ID
   * @param featureId - ID of the feature to demonstrate
   * @returns React component for the feature demo
   */
  const renderFeatureDemo = (featureId: string) => {
    switch (featureId) {
      // UI/UX Features
      case 'micromoments':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Micromoments Demo</h3>
            <div className="grid gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-lg border p-4"
                variants={variants.pulseSubtleVariants}
                animate="pulse"
              >
                <p>Hover and click for subtle animations</p>
              </motion.div>
              <div className="flex gap-2">
                <motion.div variants={variants.scaleInVariants} initial="hidden" animate="visible">
                  <Button>Scale In</Button>
                </motion.div>
                <motion.div variants={variants.shakeVariants} whileHover="shake">
                  <Button>Shake</Button>
                </motion.div>
                <Button>
                  <motion.span variants={variants.thinkingDotsVariants} animate="thinking">
                    Processing...
                  </motion.span>
                </Button>
              </div>
            </div>
          </div>
        );

      case 'network-status':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Network Status Demo</h3>
            <NetworkStatus />
            <NotificationTestComponent />
          </div>
        );

      case 'message-reactions':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Message Reactions Demo</h3>
            <div className="rounded-lg border p-4">
              <p className="mb-4">AI Response: Here&apos;s how to use React hooks...</p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  👍
                </Button>
                <Button size="sm" variant="ghost">
                  👎
                </Button>
                <Button size="sm" variant="ghost">
                  ⭐
                </Button>
                <Button size="sm" variant="ghost">
                  📋 Copy
                </Button>
                <Button size="sm" variant="ghost">
                  🔄 Retry
                </Button>
              </div>
            </div>
          </div>
        );

      // Performance Features
      case 'virtual-scrolling':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Virtual Scrolling Demo</h3>
            <div className="h-96 rounded-lg border">
              <VirtualMessages
                chatId="demo"
                messages={Array(1000)
                  .fill(null)
                  .map((_, i) => ({
                    id: `msg-${i}`,
                    role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
                    parts: [
                      {
                        type: 'text',
                        text: `Message ${i + 1}: This is a demo message to show virtual scrolling performance`,
                      },
                    ],
                    metadata: { createdAt: new Date().toISOString() },
                  }))}
                votes={[]}
                status="ready"
                setMessages={() => {}}
                reload={() => Promise.resolve(null)}
                scrollOnNewMessage={true}
                isReadonly={false}
              />
            </div>
          </div>
        );

      // RAG Features
      case 'rag-dashboard':
        return (
          <div className="h-full">
            <RAGDashboard />
          </div>
        );

      case 'rag-knowledge-base':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">RAG Knowledge Base Demo</h3>
            <RAGKnowledgeBase />
          </div>
        );

      case 'rag-analytics':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">RAG Analytics Demo</h3>
            <RAGAnalytics />
          </div>
        );

      case 'rag-playground':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">RAG Playground Demo</h3>
            <RAGPlayground />
          </div>
        );

      case 'rag-settings':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">RAG Settings Demo</h3>
            <RAGSettings />
          </div>
        );

      // MCP Features
      case 'mcp-connections':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">MCP Connection Manager Demo</h3>
            <MCPConnectionManager onConnectionsChange={() => {}} />
          </div>
        );

      case 'mcp-marketplace':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">MCP Marketplace Demo</h3>
            <MCPMarketplace
              onInstall={_server => {
                /* Installing server */
              }}
            />
          </div>
        );

      case 'mcp-permissions':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">MCP Permissions Demo</h3>
            <MCPPermissionManager connection={mockMCPConnection} onPermissionChange={() => {}} />
          </div>
        );

      case 'mcp-toolchain':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">MCP Tool Chain Builder Demo</h3>
            <MCPToolChainBuilder
              availableTools={mockMCPConnection.tools.map(t => ({
                ...t,
                connectionId: mockMCPConnection.id,
                connectionName: mockMCPConnection.name,
              }))}
              onExecute={_chain => {
                /* Executing chain */
              }}
              onSave={_chain => {
                /* Saving chain */
              }}
            />
          </div>
        );

      // AI Features
      case 'multi-model':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Multi-Model Comparison Demo</h3>
            <MultiModelComparison
              onCompare={async (_prompt, _models) => {
                // Comparing prompt across models
              }}
            />
          </div>
        );

      case 'conversation-branching':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Conversation Branching Demo</h3>
            <ConversationBranching
              chatId="demo"
              messages={mockMessages}
              onBranchSwitch={(_branchId, _messages) => {
                // Switching to branch
              }}
              onMessageEdit={(_messageId, _content) => {
                // Editing message
              }}
            />
          </div>
        );

      case 'ai-memory':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">AI Memory System Demo</h3>
            <MemoryStats />
            <AIMemoryUI />
          </div>
        );

      case 'prompt-templates':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Prompt Templates Demo</h3>
            <PromptTemplatesUI
              onUseTemplate={(_template, _vars) => {
                // Using template with variables
              }}
            />
          </div>
        );

      default:
        return <p>Select a feature to see the demo</p>;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Feature Playground</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={demoMode === 'showcase' ? 'default' : 'outline'}
              size="sm"
              onClick={handleShowcaseMode}
            >
              <Eye className="mr-2 h-4 w-4" />
              Showcase
            </Button>
            <Button
              variant={demoMode === 'live' ? 'default' : 'outline'}
              size="sm"
              onClick={handleLiveMode}
            >
              <Play className="mr-2 h-4 w-4" />
              Live Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {demoMode === 'showcase' ? (
          <div className="h-full overflow-y-auto p-8">
            <FeatureShowcase onFeatureSelect={handleFeatureSelect} />
          </div>
        ) : (
          <div className="flex h-full">
            {/* Feature Selector Sidebar */}
            <div className="w-64 overflow-y-auto border-r p-4">
              <h3 className="mb-4 font-semibold">Features</h3>
              <div className="space-y-1">
                {features.map(feature => {
                  const Icon = feature.icon;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => setSelectedFeature(feature.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                        selectedFeature === feature.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {feature.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Demo Area */}
            <div className="flex-1 overflow-y-auto p-8">
              <AnimatePresence mode="wait">
                {selectedFeature ? (
                  <motion.div
                    key={selectedFeature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {renderFeatureDemo(selectedFeature)}
                  </motion.div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="space-y-4 text-center">
                      <Code className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Select a feature from the sidebar to see a live demo
                      </p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Full Chat Demo */}
      {demoMode === 'live' && selectedFeature === 'full-demo' && (
        <div className="fixed inset-0 z-50 bg-background">
          <EnhancedChatWithMCP
            id="demo-chat"
            initialMessages={mockMessages}
            votes={[]}
            isReadonly={false}
          />
        </div>
      )}
    </div>
  );
}
