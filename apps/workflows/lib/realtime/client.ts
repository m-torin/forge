'use client';

import { type ClientSubscription, type RealtimeEvent, type WebSocketMessage } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  subscriptions?: {
    workflowIds?: string[];
    eventTypes?: string[];
  };
  url?: string;
}

interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
  reconnectAttempts: number;
  subscriptions: ClientSubscription | null;
}

type EventHandler = (event: RealtimeEvent) => void;

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3101/ws',
    autoConnect = true,
    maxReconnectAttempts = 10,
    reconnectInterval = 5000,
    subscriptions = {},
  } = options;

  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    lastMessage: null,
    reconnectAttempts: 0,
    subscriptions: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventHandlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isIntentionalClose = useRef(false);

  // Event handler management
  const subscribe = useCallback((eventType: string, handler: EventHandler) => {
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, new Set());
    }
    eventHandlersRef.current.get(eventType)!.add(handler);

    return () => {
      eventHandlersRef.current.get(eventType)?.delete(handler);
      if (eventHandlersRef.current.get(eventType)?.size === 0) {
        eventHandlersRef.current.delete(eventType);
      }
    };
  }, []);

  const emit = useCallback((eventType: string, event: RealtimeEvent) => {
    const handlers = eventHandlersRef.current.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }

    // Also emit to 'all' handlers
    const allHandlers = eventHandlersRef.current.get('*');
    if (allHandlers) {
      allHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in wildcard event handler:', error);
        }
      });
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || state.connecting) {
      return;
    }

    setState((prev) => ({ ...prev, connecting: true, error: null }));
    isIntentionalClose.current = false;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setState((prev) => ({
          ...prev,
          connected: true,
          connecting: false,
          error: null,
          reconnectAttempts: 0,
        }));

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'ping',
                timestamp: new Date().toISOString(),
              }),
            );
          }
        }, 30000); // Ping every 30 seconds

        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          setState((prev) => ({ ...prev, lastMessage: message }));

          // Handle different message types
          switch (message.type) {
            case 'connection-established':
              setState((prev) => ({
                ...prev,
                subscriptions: message.data.clientId
                  ? {
                      clientId: message.data.clientId,
                      eventTypes: [],
                      workflowIds: [],
                    }
                  : null,
              }));

              // Send initial subscriptions if provided
              if (subscriptions.workflowIds || subscriptions.eventTypes) {
                updateSubscriptions(
                  subscriptions.workflowIds || [],
                  subscriptions.eventTypes || [],
                );
              }
              break;

            case 'subscription-updated':
              setState((prev) => ({
                ...prev,
                subscriptions: message.data,
              }));
              break;

            case 'pong':
              // Handle pong response
              break;

            case 'error':
              console.error('WebSocket server error:', message.data.error);
              setState((prev) => ({ ...prev, error: message.data.error }));
              break;

            default:
              // Handle workflow events
              if (
                message.data &&
                typeof message.data === 'object' &&
                'workflowId' in message.data
              ) {
                emit(message.type, message.data as RealtimeEvent);
              }
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        setState((prev) => ({
          ...prev,
          connected: false,
          connecting: false,
        }));

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        console.log(`WebSocket closed: ${event.code} - ${event.reason}`);

        // Auto-reconnect if not intentional close and under attempt limit
        if (!isIntentionalClose.current && state.reconnectAttempts < maxReconnectAttempts) {
          setState((prev) => ({
            ...prev,
            reconnectAttempts: prev.reconnectAttempts + 1,
          }));

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(
              `Attempting to reconnect (${state.reconnectAttempts + 1}/${maxReconnectAttempts})...`,
            );
            connect();
          }, reconnectInterval);
        } else if (state.reconnectAttempts >= maxReconnectAttempts) {
          setState((prev) => ({
            ...prev,
            error: 'Maximum reconnection attempts reached',
          }));
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState((prev) => ({
          ...prev,
          connecting: false,
          error: 'WebSocket connection error',
        }));
      };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error.message : 'Failed to create WebSocket',
      }));
    }
  }, [
    url,
    state.connecting,
    state.reconnectAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    subscriptions,
    emit,
  ]);

  const disconnect = useCallback(() => {
    isIntentionalClose.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      connected: false,
      connecting: false,
      error: null,
      subscriptions: null,
    }));
  }, []);

  const updateSubscriptions = useCallback((workflowIds: string[], eventTypes: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Cannot update subscriptions: WebSocket not connected');
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: 'subscribe',
        data: {
          eventTypes,
          workflowIds,
        },
      }),
    );
  }, []);

  const removeSubscriptions = useCallback((workflowIds: string[], eventTypes: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Cannot remove subscriptions: WebSocket not connected');
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: 'unsubscribe',
        data: {
          eventTypes,
          workflowIds,
        },
      }),
    );
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    connected: state.connected,
    connecting: state.connecting,
    error: state.error,
    lastMessage: state.lastMessage,
    reconnectAttempts: state.reconnectAttempts,
    subscriptions: state.subscriptions,

    // Actions
    connect,
    disconnect,
    removeSubscriptions,
    subscribe,
    updateSubscriptions,

    // Convenience methods
    subscribeToWorkflow: (workflowId: string, handler: EventHandler) => {
      updateSubscriptions([workflowId], []);
      return subscribe('*', (event) => {
        if ('workflowId' in event && event.workflowId === workflowId) {
          handler(event);
        }
      });
    },

    subscribeToExecution: (executionId: string, handler: EventHandler) => {
      return subscribe('*', (event) => {
        if ('executionId' in event && event.executionId === executionId) {
          handler(event);
        }
      });
    },

    subscribeToEventType: (eventType: string, handler: EventHandler) => {
      updateSubscriptions([], [eventType]);
      return subscribe(eventType, handler);
    },
  };
}

// Convenience hooks for specific use cases
export function useWorkflowEvents(workflowId: string, eventTypes?: string[]) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  const ws = useWebSocket({
    subscriptions: {
      eventTypes: eventTypes || ['workflow-started', 'workflow-completed', 'workflow-failed'],
      workflowIds: [workflowId],
    },
  });

  useEffect(() => {
    const unsubscribe = ws.subscribe('*', (event) => {
      if ('workflowId' in event && event.workflowId === workflowId) {
        setEvents((prev) => [...prev, event]);
      }
    });

    return unsubscribe;
  }, [ws, workflowId]);

  return {
    ...ws,
    clearEvents: () => setEvents([]),
    events,
  };
}

export function useExecutionEvents(executionId: string) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  const ws = useWebSocket();

  useEffect(() => {
    const unsubscribe = ws.subscribe('*', (event) => {
      if ('executionId' in event && event.executionId === executionId) {
        setEvents((prev) => [...prev, event]);
      }
    });

    return unsubscribe;
  }, [ws, executionId]);

  return {
    ...ws,
    clearEvents: () => setEvents([]),
    events,
  };
}
