'use client';

import React, { useCallback, useState } from 'react';
import { useHits, useSearchBox } from 'react-instantsearch';
import {
  Card,
  Stack,
  Title,
  Text,
  Button,
  Group,
  Badge,
  Code,
  Alert,
  ThemeIcon,
  Skeleton,
} from '@mantine/core';
import {
  IconClick,
  IconShoppingCart,
  IconEye,
  IconChartLine,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Simulated Algolia Insights API integration
class AlgoliaInsights {
  private events: any[] = [];

  // Track click events
  clickedObjectIDsAfterSearch({
    eventName,
    index,
    objectIDs,
    positions,
    queryID,
  }: {
    eventName: string;
    index: string;
    objectIDs: string[];
    positions: number[];
    queryID?: string;
  }) {
    try {
      const event = {
        type: 'click',
        eventName,
        index,
        objectIDs,
        positions,
        queryID,
        timestamp: new Date().toISOString(),
      };
      this.events.push(event);
      console.log('[Algolia Insights] Click tracked: ', event);
    } catch (error) {
      console.error('[Algolia Insights] Failed to track click:', error);
    }
  }

  // Track conversion events
  convertedObjectIDsAfterSearch({
    eventName,
    index,
    objectIDs,
    queryID,
  }: {
    eventName: string;
    index: string;
    objectIDs: string[];
    queryID?: string;
  }) {
    try {
      const event = {
        type: 'conversion',
        eventName,
        index,
        objectIDs,
        queryID,
        timestamp: new Date().toISOString(),
      };
      this.events.push(event);
      console.log('[Algolia Insights] Conversion tracked: ', event);
    } catch (error) {
      console.error('[Algolia Insights] Failed to track conversion:', error);
    }
  }

  // Track view events
  viewedObjectIDs({
    eventName,
    index,
    objectIDs,
  }: {
    eventName: string;
    index: string;
    objectIDs: string[];
  }) {
    try {
      const event = {
        type: 'view',
        eventName,
        index,
        objectIDs,
        timestamp: new Date().toISOString(),
      };
      this.events.push(event);
      console.log('[Algolia Insights] View tracked: ', event);
    } catch (error) {
      console.error('[Algolia Insights] Failed to track view:', error);
    }
  }

  // Get all events (for demo purposes)
  getEvents() {
    try {
      return this.events;
    } catch (error) {
      console.error('[Algolia Insights] Failed to get events:', error);
      return [];
    }
  }
}

// Initialize insights client
const insights = new AlgoliaInsights();

// Product card with insights tracking
function InsightfulProductCard({ hit, position }: { hit: any; position: number }) {
  const { query } = useSearchBox();

  const trackClick = useCallback(() => {
    try {
      insights.clickedObjectIDsAfterSearch({
        eventName: 'Product Clicked',
        index: 'instant_search',
        objectIDs: [hit.objectID],
        positions: [position],
        queryID: hit.__queryID,
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  }, [hit, position]);

  const trackAddToCart = useCallback(() => {
    try {
      insights.convertedObjectIDsAfterSearch({
        eventName: 'Product Added to Cart',
        index: 'instant_search',
        objectIDs: [hit.objectID],
        queryID: hit.__queryID,
      });
    } catch (error) {
      console.error('Failed to track add to cart:', error);
    }
  }, [hit]);

  const trackView = useCallback(() => {
    try {
      insights.viewedObjectIDs({
        eventName: 'Product Viewed',
        index: 'instant_search',
        objectIDs: [hit.objectID],
      });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  }, [hit]);

  // Track view on mount
  React.useEffect(() => {
    try {
      trackView();
    } catch (error) {
      console.error('Failed to track view on mount:', error);
    }
  }, [trackView]);

  return (
    <ErrorBoundary
      fallback={
        <Card shadow="sm" padding="md" radius="sm" withBorder={true}>
          <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
            <Text size="sm">Product card failed to load</Text>
          </Alert>
        </Card>
      }
    >
      <Card shadow="sm" padding="md" radius="sm" withBorder={true}>
        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={600}>{hit.name || hit.title || 'Unknown Product'}</Text>
            <Badge c="blue" size="md">
              Position #{position + 1}
            </Badge>
          </Group>

          <Text size="md" c="dimmed" lineClamp={2}>
            {hit.description || 'Product description'}
          </Text>

          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              leftSection={<IconEye size={14} />}
              onClick={trackClick}
            >
              View Details
            </Button>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconShoppingCart size={14} />}
              onClick={trackAddToCart}
            >
              Add to Cart
            </Button>
          </Group>

          <Code block>
            ObjectID: {hit.objectID || 'unknown'}
            {hit.__queryID && `\nQueryID: ${hit.__queryID}`}
          </Code>
        </Stack>
      </Card>
    </ErrorBoundary>
  );
}

interface AlgoliaInsightsDemoProps {
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for AlgoliaInsightsDemo
function AlgoliaInsightsDemoSkeleton({ testId }: { testId?: string }) {
  return (
    <Stack gap="xl" data-testid={testId}>
      <div>
        <Skeleton height={32} width={400} mb="md" />
        <Skeleton height={20} width={600} />
      </div>
      <Skeleton height={100} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}
      >
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} height={200} />
          ))}
      </div>
      <Skeleton height={300} />
    </Stack>
  );
}

// Error state for AlgoliaInsightsDemo
function AlgoliaInsightsDemoError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" data-testid={testId}>
      <Text size="sm">Algolia Insights demo failed to load: {error}</Text>
    </Alert>
  );
}

// Main component demonstrating Algolia Insights
export default function AlgoliaInsightsDemo({
  loading = false,
  error,
  'data-testid': testId = 'algolia-insights-demo',
}: AlgoliaInsightsDemoProps = {}) {
  const { hits } = useHits();
  const [events, setEvents] = useState<any[]>([]);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <AlgoliaInsightsDemoSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <AlgoliaInsightsDemoError error={currentError} testId={testId} />;
  }

  // Update events display
  const refreshEvents = useCallback(() => {
    try {
      setEvents(insights.getEvents());
    } catch (err) {
      console.error('Failed to refresh events:', err);
      setInternalError('Failed to refresh events');
    }
  }, []);

  return (
    <ErrorBoundary
      fallback={<AlgoliaInsightsDemoError error="Insights demo failed to render" testId={testId} />}
    >
      <Stack gap="xl" data-testid={testId}>
        <ErrorBoundary fallback={<Skeleton height={60} />}>
          <div>
            <Title order={2} mb="md">
              Algolia Insights API Demo
            </Title>
            <Text c="dimmed">Track user interactions for personalization and analytics</Text>
          </div>
        </ErrorBoundary>

        <ErrorBoundary fallback={<Skeleton height={120} />}>
          <Alert icon={<IconChartLine />} title="How Insights Work" c="blue">
            <Text size="md">
              The Insights API tracks user interactions (clicks, conversions, views) to:
            </Text>
            <ul>
              <li>Improve search relevance through Click-Through Rate (CTR)</li>
              <li>Enable personalization based on user behavior</li>
              <li>Power A/B testing with conversion metrics</li>
              <li>Generate analytics dashboards</li>
            </ul>
          </Alert>
        </ErrorBoundary>

        <ErrorBoundary fallback={<Skeleton height={40} />}>
          <Group>
            <Title order={3}>Interactive Products</Title>
            <Button size="xs" variant="light" onClick={refreshEvents}>
              Refresh Event Log
            </Button>
          </Group>
        </ErrorBoundary>

        {/* Product grid with insights */}
        <ErrorBoundary
          fallback={
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem',
              }}
            >
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} height={200} />
                ))}
            </div>
          }
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem',
            }}
          >
            {hits.slice(0, 6).map((hit, index) => (
              <InsightfulProductCard key={hit.objectID || index} hit={hit} position={index} />
            ))}
          </div>
        </ErrorBoundary>

        {/* Events log */}
        <ErrorBoundary fallback={<Skeleton height={300} />}>
          <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
            <Group mb="md">
              <ThemeIcon size="lg" variant="light">
                <IconClick />
              </ThemeIcon>
              <div>
                <Title order={4}>Event Log</Title>
                <Text size="md" c="dimmed">
                  Real-time tracking of user interactions
                </Text>
              </div>
            </Group>

            <Stack gap="sm">
              {events.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">
                  No events tracked yet. Try clicking on products above!
                </Text>
              ) : (
                events
                  .slice(-5)
                  .reverse()
                  .map((event, index) => (
                    <ErrorBoundary key={index} fallback={<Skeleton height={80} />}>
                      <Card padding="sm" withBorder={true}>
                        <Group justify="space-between">
                          <Group>
                            <Badge
                              color={
                                event.type === 'click'
                                  ? 'blue'
                                  : event.type === 'conversion'
                                    ? 'green'
                                    : 'gray'
                              }
                            >
                              {event.type || 'unknown'}
                            </Badge>
                            <Text size="md" fw={500}>
                              {event.eventName || 'Unknown Event'}
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed">
                            {event.timestamp
                              ? new Date(event.timestamp).toLocaleTimeString()
                              : 'Unknown time'}
                          </Text>
                        </Group>
                        <Code block mt="xs">
                          {JSON.stringify(
                            {
                              objectIDs: event.objectIDs || [],
                              ...(event.positions && { positions: event.positions }),
                              ...(event.queryID && {
                                queryID: event.queryID.substring(0, 8) + '...',
                              }),
                            },
                            null,
                            2,
                          )}
                        </Code>
                      </Card>
                    </ErrorBoundary>
                  ))
              )}
            </Stack>
          </Card>
        </ErrorBoundary>

        {/* Implementation notes */}
        <ErrorBoundary fallback={<Skeleton height={200} />}>
          <Alert icon={<IconClick />} title="Implementation in Production" c="green">
            <Stack gap="sm">
              <Text size="md">To implement Algolia Insights in production:</Text>
              <Code block>
                {`// 1. Install the insights client
npm install search-insights

// 2. Initialize insights
import aa from 'search-insights';
aa('init', {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_SEARCH_API_KEY',
});

// 3. Track events
aa('clickedObjectIDsAfterSearch', {
  index: 'your_index',
  eventName: 'Product Clicked',
  objectIDs: ['product123'],
  positions: [1],
  queryID: 'query-id-from-algolia',
});`}
              </Code>
            </Stack>
          </Alert>
        </ErrorBoundary>
      </Stack>
    </ErrorBoundary>
  );
}
