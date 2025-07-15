'use client';

/**
 * Analytics Demo Component
 *
 * Demonstrates advanced analytics patterns including:
 * - Event batching
 * - Rich context building
 * - User session tracking
 * - Metadata enrichment
 */

import {
  createAnonymousSession,
  createUserSession,
  identify,
  track,
  trackEvent,
} from '#/lib/analytics';
import { Badge, Button, Card, Code, Group, Stack, Text, Title } from '@mantine/core';
import { logInfo, logWarn } from '@repo/observability';
import { IconActivity, IconFlag, IconStack, IconUser } from '@tabler/icons-react';
import { useState } from 'react';

export function AnalyticsDemo() {
  const [eventCount, setEventCount] = useState(0);
  const [lastEvent, setLastEvent] = useState<string>('');

  // Example: Single event tracking
  const trackSingleEvent = async () => {
    try {
      await trackEvent('Demo Button Clicked', {
        demo_type: 'single_event',
        click_count: eventCount + 1,
        timestamp: new Date().toISOString(),
      });

      setEventCount(prev => prev + 1);
      setLastEvent('Single Event Tracked');
      logInfo('[Analytics Demo] Single event tracked', { eventCount: eventCount + 1 });
    } catch (error) {
      logWarn('Single event tracking failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Example: Event batching
  const trackBatchEvents = async () => {
    try {
      // Track multiple related events
      await trackEvent('Demo Batch Started', {
        batch_id: `batch_${Date.now()}`,
        event_count: 3,
      });

      await trackEvent('Demo Interaction', {
        interaction_type: 'batch_demo',
        step: 1,
      });

      await trackEvent('Demo Batch Completed', {
        batch_id: `batch_${Date.now()}`,
        success: true,
      });

      setLastEvent('Batch of 3 events tracked');
      logInfo('[Analytics Demo] Batch of 3 events tracked', { batchType: 'demo_batch' });
    } catch (error) {
      logWarn('Batch event tracking failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Example: Rich context tracking
  const trackWithRichContext = async () => {
    try {
      await trackEvent('Rich Context Demo', {
        demo_type: 'rich_context',
        features_demonstrated: ['context_builder', 'device_info', 'campaign_data'],
        screen_resolution: `${screen.width}x${screen.height}`,
        experiment_id: 'analytics_demo_v1',
        demo_mode: true,
      });

      setLastEvent('Rich context event tracked');
      logInfo('[Analytics Demo] Rich context event tracked', {
        contextType: 'rich_context',
        hasMetadata: true,
      });
    } catch (error) {
      logWarn('Rich context tracking failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Example: User session tracking
  const trackUserSession = async () => {
    try {
      // Create a user session (simplified approach)
      const _session = createUserSession('demo_user_456', 'session_demo_789');

      // Track user identification using direct emitter
      await identify('demo_user_456', {
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'analytics_explorer',
        demo_participant: true,
      });

      // Track session activity using direct emitter
      await track('Session Activity', {
        activity_type: 'demo_exploration',
        session_duration: Math.floor(Math.random() * 300), // Random duration
        features_used: ['single_events', 'batch_events', 'rich_context'],
        user_id: 'demo_user_456',
        session_id: 'session_demo_789',
      });

      setLastEvent('User session events tracked');
      logInfo('[Analytics Demo] User session tracked', {
        sessionType: 'user_session',
        userId: 'demo_user_456',
      });
    } catch (error) {
      logWarn('User session tracking failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Example: Anonymous session tracking
  const trackAnonymousSession = async () => {
    try {
      // Create anonymous session (simplified approach)
      const anonSessionId = `anon_${Date.now()}`;
      const _anonSession = createAnonymousSession(anonSessionId);

      // Track anonymous behavior using direct emitter
      await track('Anonymous Behavior', {
        behavior_type: 'demo_interaction',
        engagement_level: 'high',
        features_explored: 4,
        time_spent: Math.floor(Math.random() * 120),
        session_id: anonSessionId,
        user_type: 'anonymous',
      });

      setLastEvent('Anonymous session tracked');
      logInfo('[Analytics Demo] Anonymous session tracked', { sessionType: 'anonymous_session' });
    } catch (error) {
      logWarn('Anonymous session tracking failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <Card withBorder p="lg" radius="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={3}>
            <IconActivity size={24} style={{ marginRight: 8 }} />
            Analytics Demo
          </Title>
          <Badge variant="light" color="blue">
            Events: {eventCount}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed">
          Try these analytics patterns and check the browser console for tracking output.
        </Text>

        {lastEvent && (
          <Code block p="xs" c="green">
            ✅ {lastEvent}
          </Code>
        )}

        <Group gap="sm" grow>
          <Button
            leftSection={<IconActivity size={16} />}
            variant="light"
            onClick={trackSingleEvent}
          >
            Single Event
          </Button>

          <Button
            leftSection={<IconStack size={16} />}
            variant="light"
            color="orange"
            onClick={trackBatchEvents}
          >
            Event Batch
          </Button>
        </Group>

        <Group gap="sm" grow>
          <Button
            leftSection={<IconFlag size={16} />}
            variant="light"
            color="grape"
            onClick={trackWithRichContext}
          >
            Rich Context
          </Button>

          <Button
            leftSection={<IconUser size={16} />}
            variant="light"
            color="teal"
            onClick={trackUserSession}
          >
            User Session
          </Button>
        </Group>

        <Button variant="outline" color="gray" onClick={trackAnonymousSession} fullWidth>
          Anonymous Session
        </Button>

        <Text size="xs" c="dimmed" ta="center">
          💡 Open browser console to see detailed analytics output
        </Text>
      </Stack>
    </Card>
  );
}
