'use client';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { Progress } from '#/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { logError } from '@repo/observability';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  MessageSquare,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { RAGPerformanceMetrics } from '../../lib/ai/rag-config';

interface EnhancedRAGAnalytics {
  // Performance metrics
  performance: RAGPerformanceMetrics;

  // Search analytics
  searchMetrics: {
    totalQueries: number;
    successfulQueries: number;
    averageResponseTime: number;
    topQueries: Array<{ query: string; count: number; avgScore: number }>;
    hybridSearchUsage: {
      vectorOnly: number;
      keywordOnly: number;
      hybrid: number;
    };
  };

  // Knowledge base stats
  knowledgeBase: {
    totalDocuments: number;
    totalEmbeddings: number;
    averageDocumentSize: number;
    categoryDistribution: Array<{ category: string; count: number }>;
    recentAdditions: number;
    memoryUsage: number;
  };

  // Conversation memory stats
  conversationMemory?: {
    totalConversations: number;
    averageLength: number;
    memoryRetention: number;
    topTopics: Array<{ topic: string; count: number }>;
    sentimentDistribution: { positive: number; neutral: number; negative: number };
  };

  // System health
  systemHealth: {
    vectorDbStatus: 'healthy' | 'degraded' | 'down';
    embeddingServiceStatus: 'healthy' | 'degraded' | 'down';
    memoryServiceStatus: 'healthy' | 'degraded' | 'down';
    lastHealthCheck: string;
    uptime: number;
  };
}

export function EnhancedRAGAnalytics() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<EnhancedRAGAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/rag/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          timeRange: 'day',
          includePerformanceMetrics: true,
          includeConversationMemory: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analytics fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalytics(data);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      logError('RAG analytics fetch failed', { error: err, userId: session?.user?.id });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  if (loading && !analytics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading enhanced analytics...</span>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <div className="text-center">
          <h3 className="font-semibold">Analytics Unavailable</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={fetchAnalytics} className="mt-4" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Database className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'down':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced RAG Analytics</h2>
          <p className="text-muted-foreground">Last updated: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <Button onClick={fetchAnalytics} disabled={loading} size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              {getStatusIcon(analytics.systemHealth.vectorDbStatus)}
              <div>
                <p className="text-sm font-medium">Vector Database</p>
                <Badge className={getStatusColor(analytics.systemHealth.vectorDbStatus)}>
                  {analytics.systemHealth.vectorDbStatus}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(analytics.systemHealth.embeddingServiceStatus)}
              <div>
                <p className="text-sm font-medium">Embedding Service</p>
                <Badge className={getStatusColor(analytics.systemHealth.embeddingServiceStatus)}>
                  {analytics.systemHealth.embeddingServiceStatus}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(analytics.systemHealth.memoryServiceStatus)}
              <div>
                <p className="text-sm font-medium">Memory Service</p>
                <Badge className={getStatusColor(analytics.systemHealth.memoryServiceStatus)}>
                  {analytics.systemHealth.memoryServiceStatus}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>Uptime: {Math.round(analytics.systemHealth.uptime / 3600)}h</span>
            <span>
              Last Check: {new Date(analytics.systemHealth.lastHealthCheck).toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {analytics.performance.averageResponseTime.toFixed(0)}ms
              </span>
              {analytics.performance.averageResponseTime < 1000 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <Progress
              value={Math.min(100, (1000 / analytics.performance.averageResponseTime) * 100)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {analytics.performance.successRate.toFixed(1)}%
              </span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <Progress value={analytics.performance.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {analytics.searchMetrics.totalQueries.toLocaleString()}
              </span>
              <Search className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {analytics.searchMetrics.successfulQueries} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {analytics.knowledgeBase.totalDocuments.toLocaleString()}
              </span>
              <Database className="h-4 w-4 text-purple-600" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              +{analytics.knowledgeBase.recentAdditions} recent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Search Analytics</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="memory">Conversation Memory</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Hybrid Search Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Hybrid Search Usage</CardTitle>
                <CardDescription>Distribution of search methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Vector Only</span>
                  <Badge variant="outline">
                    {analytics.searchMetrics.hybridSearchUsage.vectorOnly}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Keyword Only</span>
                  <Badge variant="outline">
                    {analytics.searchMetrics.hybridSearchUsage.keywordOnly}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hybrid (Vector + Keyword)</span>
                  <Badge variant="default">
                    {analytics.searchMetrics.hybridSearchUsage.hybrid}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Top Queries */}
            <Card>
              <CardHeader>
                <CardTitle>Top Search Queries</CardTitle>
                <CardDescription>Most frequent queries today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.searchMetrics.topQueries.slice(0, 5).map((query, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 truncate">
                        <p className="truncate text-sm font-medium">{query.query}</p>
                        <p className="text-xs text-muted-foreground">
                          {query.count} queries • {query.avgScore.toFixed(2)} avg score
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Knowledge Base Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Documents</span>
                  <Badge variant="outline">
                    {analytics.knowledgeBase.totalDocuments.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Embeddings</span>
                  <Badge variant="outline">
                    {analytics.knowledgeBase.totalEmbeddings.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Document Size</span>
                  <Badge variant="outline">
                    {(analytics.knowledgeBase.averageDocumentSize / 1024).toFixed(1)}KB
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Usage</span>
                  <Badge
                    variant={analytics.knowledgeBase.memoryUsage > 80 ? 'destructive' : 'outline'}
                  >
                    {analytics.knowledgeBase.memoryUsage.toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Document Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.knowledgeBase.categoryDistribution
                    .slice(0, 6)
                    .map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{category.category}</span>
                        <Badge variant="outline">{category.count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          {analytics.conversationMemory ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Memory Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversation Memory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Conversations</span>
                    <Badge variant="outline">
                      {analytics.conversationMemory.totalConversations.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Length</span>
                    <Badge variant="outline">
                      {analytics.conversationMemory.averageLength.toFixed(1)} messages
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Retention</span>
                    <Badge variant="outline">
                      {analytics.conversationMemory.memoryRetention.toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Positive</span>
                    <Badge className="bg-green-50 text-green-600">
                      {analytics.conversationMemory.sentimentDistribution.positive}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Neutral</span>
                    <Badge variant="outline">
                      {analytics.conversationMemory.sentimentDistribution.neutral}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Negative</span>
                    <Badge className="bg-red-50 text-red-600">
                      {analytics.conversationMemory.sentimentDistribution.negative}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Conversation memory is not enabled
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.performance.recommendedOptimizations.length > 0 ? (
                <div className="space-y-3">
                  {analytics.performance.recommendedOptimizations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">All systems running optimally</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
