'use client';

import { mockRAGKnowledgeBase, shouldUseMockRAG } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Clock,
  Database,
  FileText,
  MessageSquare,
  Search,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import * as React from 'react';
import { useMemo } from 'react';

interface RAGAnalyticsProps {
  className?: string;
}

export function RAGAnalytics({ className }: RAGAnalyticsProps) {
  const prototypeMode = isPrototypeMode();
  const useMockRAG = shouldUseMockRAG();

  // Mock analytics data
  const analyticsData = useMemo(() => {
    if (!useMockRAG) return null;

    const documents = mockRAGKnowledgeBase.getDocuments();
    const now = new Date();
    // Dates for potential future use
    // const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    // const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      overview: {
        totalQueries: 1247,
        successfulResponses: 1185,
        averageResponseTime: 340,
        knowledgeBaseHits: 89.2,
      },
      trends: {
        dailyQueries: [45, 52, 38, 61, 73, 68, 89, 94, 76, 82, 91, 103],
        weeklySuccess: [92.1, 88.7, 91.3, 89.8, 95.2, 93.6, 89.2],
        responseTime: [420, 380, 350, 340, 330, 345, 340],
      },
      popularQueries: [
        { query: 'What is Next.js?', count: 156, successRate: 95.5 },
        { query: 'How to use React hooks?', count: 134, successRate: 92.8 },
        { query: 'Explain RAG', count: 89, successRate: 96.7 },
        { query: 'Vercel AI SDK features', count: 67, successRate: 88.1 },
        { query: 'TypeScript best practices', count: 43, successRate: 91.2 },
      ],
      sources: documents.map(doc => ({
        name: doc.title,
        category: doc.metadata.category,
        hits: Math.floor(Math.random() * 50) + 10,
        lastUsed: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      })),
      performance: {
        chunkRetrieval: 85,
        contextRelevance: 92,
        responseQuality: 88,
        userSatisfaction: 4.3,
      },
    };
  }, [useMockRAG]);

  if (!useMockRAG) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">RAG Analytics</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure your RAG system to view analytics and performance metrics.
        </p>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">RAG Analytics</h2>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard
          icon={MessageSquare}
          label="Total Queries"
          value={analyticsData.overview.totalQueries.toLocaleString()}
          change="+12.3%"
          positive
        />
        <MetricCard
          icon={Target}
          label="Success Rate"
          value={`${((analyticsData.overview.successfulResponses / analyticsData.overview.totalQueries) * 100).toFixed(1)}%`}
          change="+2.1%"
          positive
        />
        <MetricCard
          icon={Clock}
          label="Avg Response"
          value={`${analyticsData.overview.averageResponseTime}ms`}
          change="-15ms"
          positive
        />
        <MetricCard
          icon={Database}
          label="KB Hit Rate"
          value={`${analyticsData.overview.knowledgeBaseHits}%`}
          change="+5.2%"
          positive
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Query Trends */}
        <div className="rounded-lg border bg-background p-4">
          <h3 className="mb-4 flex items-center gap-2 font-medium">
            <TrendingUp className="h-4 w-4" />
            Daily Query Volume
          </h3>
          <div className="space-y-2">
            <div className="flex h-32 items-end gap-1">
              {analyticsData.trends.dailyQueries.map((value, index) => (
                <motion.div
                  key={`daily-query-${Date.now() - (analyticsData.trends.dailyQueries.length - 1 - index) * 86400000}-${value}`}
                  initial={{ height: 0 }}
                  animate={{
                    height: `${(value / Math.max(...analyticsData.trends.dailyQueries)) * 100}%`,
                  }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-1 rounded-t bg-blue-500"
                  title={`${value} queries`}
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">Last 12 hours</div>
          </div>
        </div>

        {/* Response Time Trends */}
        <div className="rounded-lg border bg-background p-4">
          <h3 className="mb-4 flex items-center gap-2 font-medium">
            <Clock className="h-4 w-4" />
            Response Time Trend
          </h3>
          <div className="space-y-2">
            <div className="flex h-32 items-end gap-1">
              {analyticsData.trends.responseTime.map((value, index) => (
                <motion.div
                  key={`response-time-${Date.now() - (analyticsData.trends.responseTime.length - 1 - index) * 86400000}-${value}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${((500 - value) / 200) * 100}%` }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-1 rounded-t bg-green-500"
                  title={`${value}ms avg`}
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">Last 7 days</div>
          </div>
        </div>
      </div>

      {/* Popular Queries */}
      <div className="rounded-lg border bg-background p-4">
        <h3 className="mb-4 flex items-center gap-2 font-medium">
          <Search className="h-4 w-4" />
          Most Popular Queries
        </h3>
        <div className="space-y-3">
          {analyticsData.popularQueries.map((query, index) => (
            <motion.div
              key={query.query}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
            >
              <div>
                <div className="text-sm font-medium">{query.query}</div>
                <div className="text-xs text-muted-foreground">
                  {query.count} queries • {query.successRate}% success rate
                </div>
              </div>
              <div className="text-sm font-medium">{query.count}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Knowledge Sources Performance */}
      <div className="rounded-lg border bg-background p-4">
        <h3 className="mb-4 flex items-center gap-2 font-medium">
          <FileText className="h-4 w-4" />
          Knowledge Source Usage
        </h3>
        <div className="space-y-3">
          {analyticsData.sources.slice(0, 5).map((source, index) => (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{source.name}</div>
                <div className="text-xs text-muted-foreground">
                  {source.category} • Last used {source.lastUsed.toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">{source.hits} hits</div>
                <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(source.hits / Math.max(...analyticsData.sources.map(s => s.hits))) * 100}%`,
                    }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <PerformanceCard
          icon={Zap}
          label="Chunk Retrieval"
          value={analyticsData.performance.chunkRetrieval}
          color="blue"
        />
        <PerformanceCard
          icon={Target}
          label="Context Relevance"
          value={analyticsData.performance.contextRelevance}
          color="green"
        />
        <PerformanceCard
          icon={Activity}
          label="Response Quality"
          value={analyticsData.performance.responseQuality}
          color="purple"
        />
        <PerformanceCard
          icon={Users}
          label="User Satisfaction"
          value={analyticsData.performance.userSatisfaction}
          color="orange"
          suffix="/5"
        />
      </div>

      {/* Prototype Mode Indicator */}
      {prototypeMode && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/20">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Prototype Mode:</strong> These are mock analytics with simulated data. In
            production, this would show real RAG performance metrics.
          </p>
        </div>
      )}
    </div>
  );
}

// Metric card component
interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

function MetricCard({ icon: Icon, label, value, change, positive }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-background p-4"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change} from last week
        </div>
      </div>
    </motion.div>
  );
}

// Performance card component
interface PerformanceCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
  suffix?: string;
}

function PerformanceCard({ icon: Icon, label, value, color, suffix = '%' }: PerformanceCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  };

  const progressColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  const maxValue = suffix === '/5' ? 5 : 100;
  const percentage = (value / maxValue) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border bg-background p-4"
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">
            {value}
            {suffix}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: 0.5, duration: 1 }}
            className={`h-full ${progressColors[color]}`}
          />
        </div>
      </div>
    </motion.div>
  );
}
