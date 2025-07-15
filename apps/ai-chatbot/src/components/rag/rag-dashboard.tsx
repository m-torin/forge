'use client';

import { Button } from '#/components/ui/button';
import { shouldUseMockRAG } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { useDisclosure } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Brain, Database, Play, Settings, TrendingUp, Users, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';

import { EnhancedRAGAnalytics } from './rag-analytics-enhanced';
import { RAGKnowledgeBase } from './rag-knowledge-base';
import { RAGPlayground } from './rag-playground';
import { RAGQuickActions } from './rag-quick-actions';
import { RAGSettings } from './rag-settings';
import { RAGStatusIndicator } from './rag-status-indicator';

interface RAGDashboardProps {
  className?: string;
}

type DashboardTab = 'overview' | 'knowledge' | 'analytics' | 'playground' | 'settings';

export function RAGDashboard({ className }: RAGDashboardProps) {
  const prototypeMode = isPrototypeMode();
  const useMockRAG = shouldUseMockRAG();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [showQuickActions, { toggle: toggleQuickActions }] = useDisclosure(true);

  const handleQuickAction = useCallback((action: string, _data?: any) => {
    switch (action) {
      case 'quick-search':
        setActiveTab('playground');
        break;
      case 'add-current':
        setActiveTab('knowledge');
        break;
      case 'smart-suggest':
        setActiveTab('playground');
        break;
      case 'trending-topics':
        setActiveTab('analytics');
        break;
    }
  }, []);

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: TrendingUp,
      description: 'Dashboard overview and quick actions',
    },
    {
      id: 'knowledge' as const,
      label: 'Knowledge Base',
      icon: Database,
      description: 'manage documents and content',
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Performance metrics and insights',
    },
    {
      id: 'playground' as const,
      label: 'Playground',
      icon: Play,
      description: 'Test and experiment with RAG',
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
      description: 'Configure RAG parameters',
    },
  ];

  if (!useMockRAG) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Brain className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">RAG Dashboard</h2>
        <p className="mt-2 text-muted-foreground">
          Configure your vector database to enable the RAG dashboard.
        </p>
        <Button className="mt-6" onClick={() => setActiveTab('settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Configure RAG
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col ${className || ''}`}>
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">RAG Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Retrieval-Augmented Generation Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RAGStatusIndicator size="md" showLabel />
            {activeTab === 'overview' && (
              <Button onClick={toggleQuickActions} variant="outline" size="sm" className="gap-2">
                <Zap className="h-4 w-4" />
                {showQuickActions ? 'Hide' : 'Show'} Quick Actions
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="flex-shrink-0 gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto p-6"
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
                    <AnimatePresence>
                      {showQuickActions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <RAGQuickActions onActionSelect={handleQuickAction} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <h2 className="mb-4 text-lg font-semibold">System Status</h2>
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Vector Database</span>
                        <span className="text-sm font-medium text-green-600">Connected</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Embedding Model</span>
                        <span className="text-sm font-medium">text-embedding-3-small</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Index Status</span>
                        <span className="text-sm font-medium text-blue-600">Synced</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Preview */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Recent Activity</h2>
                    <Button
                      onClick={() => setActiveTab('analytics')}
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      View Analytics
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        label: 'Queries Today',
                        value: '247',
                        trend: '+12%',
                        color: 'text-blue-600',
                      },
                      {
                        label: 'Avg Response Time',
                        value: '340ms',
                        trend: '-15ms',
                        color: 'text-green-600',
                      },
                      {
                        label: 'Success Rate',
                        value: '94.2%',
                        trend: '+2.1%',
                        color: 'text-green-600',
                      },
                      { label: 'Documents', value: '1,247', trend: '+5', color: 'text-purple-600' },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-lg border bg-background p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{stat.label}</span>
                          <span className={`text-xs ${stat.color}`}>{stat.trend}</span>
                        </div>
                        <div className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Navigation */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold">Quick Navigation</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {tabs.slice(1).map((tab, index) => {
                      const Icon = tab.icon;

                      return (
                        <motion.div
                          key={tab.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Button
                            onClick={() => setActiveTab(tab.id)}
                            variant="outline"
                            className="h-auto w-full flex-col gap-3 p-6"
                          >
                            <Icon className="h-8 w-8" />
                            <div className="text-center">
                              <div className="font-medium">{tab.label}</div>
                              <div className="text-xs text-muted-foreground">{tab.description}</div>
                            </div>
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'knowledge' && <RAGKnowledgeBase />}
            {activeTab === 'analytics' && <EnhancedRAGAnalytics />}
            {activeTab === 'playground' && <RAGPlayground />}
            {activeTab === 'settings' && <RAGSettings />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      {prototypeMode && (
        <div className="border-t bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">
              <strong>Prototype Mode:</strong> This is a comprehensive RAG dashboard mock. In
              production, this would connect to your actual vector database and AI systems.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
