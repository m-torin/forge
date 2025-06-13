'use client';

import React, { useCallback } from 'react';
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
} from '@mantine/core';
import {
  IconClick,
  IconShoppingCart,
  IconEye,
  IconHeart,
  IconShare,
  IconChartLine,
} from '@tabler/icons-react';

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
    const event = {
      type: 'view',
      eventName,
      index,
      objectIDs,
      timestamp: new Date().toISOString(),
    };
    this.events.push(event);
    console.log('[Algolia Insights] View tracked: ', event);
  }

  // Get all events (for demo purposes)
  getEvents() {
    return this.events;
  }
}

// Initialize insights client
const insights = new AlgoliaInsights();

// Product card with insights tracking
function InsightfulProductCard({ hit, position }: { hit: any; position: number }) {
  const { query } = useSearchBox();

  const trackClick = useCallback(() => {
    insights.clickedObjectIDsAfterSearch({
      eventName: 'Product Clicked',
      index: 'instant_search',
      objectIDs: [hit.objectID],
      positions: [position],
      queryID: hit.__queryID,
    });
  }, [hit, position]);

  const trackAddToCart = useCallback(() => {
    insights.convertedObjectIDsAfterSearch({
      eventName: 'Product Added to Cart',
      index: 'instant_search',
      objectIDs: [hit.objectID],
      queryID: hit.__queryID,
    });
  }, [hit]);

  const trackView = useCallback(() => {
    insights.viewedObjectIDs({
      eventName: 'Product Viewed',
      index: 'instant_search',
      objectIDs: [hit.objectID],
    });
  }, [hit]);

  // Track view on mount
  React.useEffect(() => {
    trackView();
  }, [trackView]);

  return (
    <Card shadow="sm" padding="md" radius="sm" withBorder={true}>
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600}>{hit.name || hit.title}</Text>
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
          ObjectID: {hit.objectID}
          {hit.__queryID && `\nQueryID: ${hit.__queryID}`}
        </Code>
      </Stack>
    </Card>
  );
}

// Main component demonstrating Algolia Insights
export default function AlgoliaInsightsDemo() {
  const { hits } = useHits();
  const [events, setEvents] = React.useState<any[]>([]);

  // Update events display
  const refreshEvents = useCallback(() => {
    setEvents(insights.getEvents());
  }, []);

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="md">
          Algolia Insights API Demo
        </Title>
        <Text c="dimmed">Track user interactions for personalization and analytics</Text>
      </div>

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

      <Group>
        <Title order={3}>Interactive Products</Title>
        <Button size="xs" variant="light" onClick={refreshEvents}>
          Refresh Event Log
        </Button>
      </Group>

      {/* Product grid with insights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}
      >
        {hits.slice(0, 6).map((hit, index) => (
          <InsightfulProductCard key={hit.objectID} hit={hit} position={index} />
        ))}
      </div>

      {/* Events log */}
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
                <Card key={index} padding="sm" withBorder={true}>
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
                        {event.type}
                      </Badge>
                      <Text size="md" fw={500}>
                        {event.eventName}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </Text>
                  </Group>
                  <Code block mt="xs">
                    {JSON.stringify(
                      {
                        objectIDs: event.objectIDs,
                        ...(event.positions && { positions: event.positions }),
                        ...(event.queryID && { queryID: event.queryID.substring(0, 8) + '...' }),
                      },
                      null,
                      2,
                    )}
                  </Code>
                </Card>
              ))
          )}
        </Stack>
      </Card>

      {/* Implementation notes */}
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
    </Stack>
  );
}
