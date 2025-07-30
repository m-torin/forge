'use client';

import { Button } from '#/components/ui/button';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  Database,
  FileText,
  GitBranch,
  Globe,
  Layers,
  Link2,
  MessageSquare,
  Network,
  Palette,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface Feature {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  components: string[];
  status: 'completed' | 'in-progress' | 'planned';
  demoPath?: string;
}

interface FeatureShowcaseProps {
  onFeatureSelect?: (feature: Feature) => void;
  className?: string;
}

export function FeatureShowcase({ onFeatureSelect, className }: FeatureShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features: Feature[] = [
    // Micromoments & UI Enhancements
    {
      id: 'micromoments',
      category: 'UI/UX',
      title: 'Micromoments & Animations',
      description: 'Subtle animations providing immediate feedback for every interaction',
      icon: Sparkles,
      color: 'text-purple-500',
      components: ['Tailwind animations', 'Framer Motion', 'Loading states', 'Transitions'],
      status: 'completed',
    },
    {
      id: 'network-status',
      category: 'UI/UX',
      title: 'Network & System Status',
      description: 'Real-time network quality indicators and connection monitoring',
      icon: Network,
      color: 'text-green-500',
      components: ['Network detector', 'Connection quality', 'Offline mode', 'Auto-reconnect'],
      status: 'completed',
    },
    {
      id: 'message-reactions',
      category: 'UI/UX',
      title: 'Message Reactions & Feedback',
      description: 'Quick reactions, ratings, and feedback for AI responses',
      icon: MessageSquare,
      color: 'text-blue-500',
      components: ['Reaction picker', 'Star ratings', 'Copy/Share', 'Report issues'],
      status: 'completed',
    },

    // Performance Optimizations
    {
      id: 'virtual-scrolling',
      category: 'Performance',
      title: 'Virtual Scrolling',
      description: 'Efficiently render thousands of messages without performance loss',
      icon: Layers,
      color: 'text-orange-500',
      components: ['React Window', 'Dynamic heights', 'Smooth scrolling', 'Memory optimization'],
      status: 'completed',
    },
    {
      id: 'performance-monitor',
      category: 'Performance',
      title: 'Performance Monitoring',
      description: 'Real-time FPS, memory usage, and component metrics',
      icon: Activity,
      color: 'text-red-500',
      components: ['FPS counter', 'Memory tracker', 'Render profiler', 'Performance tips'],
      status: 'completed',
    },

    // MCP Integration
    {
      id: 'mcp-connections',
      category: 'MCP Tools',
      title: 'MCP Connection Manager',
      description: 'Connect to local and remote tool servers with visual management',
      icon: Link2,
      color: 'text-indigo-500',
      components: ['Connection wizard', 'Tool discovery', 'Status monitoring', 'Auto-reconnect'],
      status: 'completed',
    },
    {
      id: 'mcp-marketplace',
      category: 'MCP Tools',
      title: 'MCP Marketplace',
      description: 'Discover and install pre-built MCP servers and tools',
      icon: Globe,
      color: 'text-cyan-500',
      components: ['Server browser', 'Categories', 'Ratings', 'Quick install'],
      status: 'completed',
    },
    {
      id: 'mcp-permissions',
      category: 'MCP Tools',
      title: 'Permission Management',
      description: 'Granular security controls for MCP tool access',
      icon: Shield,
      color: 'text-yellow-500',
      components: ['Permission levels', 'Risk indicators', 'Audit logs', 'Security tips'],
      status: 'completed',
    },
    {
      id: 'mcp-toolchain',
      category: 'MCP Tools',
      title: 'Tool Chain Builder',
      description: 'Visual tool chaining with drag-and-drop workflow creation',
      icon: GitBranch,
      color: 'text-pink-500',
      components: ['Drag-drop builder', 'Parameter mapping', 'Export/Import', 'Execution preview'],
      status: 'completed',
    },

    // AI Features
    {
      id: 'multi-model',
      category: 'AI Features',
      title: 'Multi-Model Comparison',
      description: 'Compare responses from multiple AI models side-by-side',
      icon: Brain,
      color: 'text-purple-500',
      components: ['Model selector', 'Parallel execution', 'Diff view', 'Performance metrics'],
      status: 'completed',
    },
    {
      id: 'conversation-branching',
      category: 'AI Features',
      title: 'Conversation Branching',
      description: 'Fork conversations to explore different paths',
      icon: GitBranch,
      color: 'text-green-500',
      components: ['Branch visualization', 'Fork points', 'Merge options', 'History tree'],
      status: 'completed',
    },
    {
      id: 'ai-memory',
      category: 'AI Features',
      title: 'AI Memory System',
      description: 'Persistent memory for personalized interactions',
      icon: Database,
      color: 'text-blue-500',
      components: ['Memory cards', 'Categories', 'Search', 'Import/Export'],
      status: 'completed',
    },
    {
      id: 'prompt-templates',
      category: 'AI Features',
      title: 'Prompt Templates',
      description: 'Reusable prompt templates with variables',
      icon: FileText,
      color: 'text-orange-500',
      components: ['Template editor', 'Variables', 'Categories', 'Sharing'],
      status: 'completed',
    },
  ];

  const categories = [
    { id: 'UI/UX', label: 'UI/UX Enhancements', icon: Palette, count: 3 },
    { id: 'Performance', label: 'Performance', icon: Zap, count: 2 },
    { id: 'MCP Tools', label: 'MCP Integration', icon: Terminal, count: 4 },
    { id: 'AI Features', label: 'AI Features', icon: Brain, count: 4 },
  ];

  const filteredFeatures = selectedCategory
    ? features.filter(f => f.category === selectedCategory)
    : features;

  return (
    <div className={cx('space-y-8', className)}>
      {/* Header */}
      <div className="space-y-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">AI Chatbot Feature Showcase</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold"
        >
          Everything We&apos;ve Built
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-2xl text-lg text-muted-foreground"
        >
          Explore all the features, optimizations, and enhancements we&apos;ve added to create the
          ultimate AI chatbot experience
        </motion.p>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        {categories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={cx(
                'cursor-pointer rounded-lg border p-6 transition-all',
                selectedCategory === cat.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50 hover:bg-muted/50',
              )}
            >
              <Icon className="mb-2 h-8 w-8 text-primary" />
              <h3 className="font-semibold">{cat.label}</h3>
              <p className="mt-1 text-2xl font-bold">{cat.count}</p>
              <p className="text-sm text-muted-foreground">Features</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Feature Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
                onClick={() => onFeatureSelect?.(feature)}
                className={cx(
                  'relative cursor-pointer rounded-lg border p-6 transition-all',
                  'hover:border-primary hover:shadow-lg',
                  hoveredFeature === feature.id && 'bg-muted/50',
                )}
              >
                {/* Status Badge */}
                <div className="absolute right-4 top-4">
                  {feature.status === 'completed' && (
                    <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">
                      <Check className="h-3 w-3" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>

                {/* Icon */}
                <div
                  className={cx(
                    'mb-4 flex h-12 w-12 items-center justify-center rounded-lg',
                    'bg-primary/10',
                  )}
                >
                  <Icon className={cx('h-6 w-6', feature.color)} />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{feature.description}</p>

                {/* Components */}
                <div className="mb-4 flex flex-wrap gap-1">
                  {feature.components.map(component => (
                    <span
                      key={`component-${component}`}
                      className="rounded bg-muted px-2 py-1 text-xs"
                    >
                      {component}
                    </span>
                  ))}
                </div>

                {/* Action */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{feature.category}</span>
                  <motion.div animate={{ x: hoveredFeature === feature.id ? 5 : 0 }}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4 pt-8 text-center"
      >
        <h2 className="text-2xl font-semibold">Ready to Experience It All?</h2>
        <p className="text-muted-foreground">
          Start a new chat to see all these features in action
        </p>
        <Button size="lg" className="gap-2">
          <MessageSquare className="h-5 w-5" />
          Start New Chat
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}
