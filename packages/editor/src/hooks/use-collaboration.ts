/**
 * React hook for real-time collaboration features
 * Manages WebSocket connections, presence, and collaborative editing
 */

'use client';

import { notifications } from '@mantine/notifications';
import { logError } from '@repo/observability';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CollaborationEvent,
  CollaborationHookResult,
  CollaborationOptions,
  Collaborator,
} from '../types/index';

/**
 * Hook for managing collaboration features in a document editor
 * @param options - Configuration options for collaboration
 * @returns Object with collaboration state and methods
 */
export function useCollaboration(options: CollaborationOptions): CollaborationHookResult {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      // In a real implementation, this would connect to your WebSocket server
      // For now, we'll simulate the connection
      const ws = new WebSocket(
        `ws://localhost:3001/collaboration/${options.documentId}?userId=${options.userId}`,
      );

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;

        if (options.enablePresence) {
          // Send initial presence
          const presenceEvent: Omit<CollaborationEvent, 'id' | 'timestamp'> = {
            type: 'presence',
            userId: options.userId,
            data: { action: 'join' },
          };
          ws.send(JSON.stringify(presenceEvent));
        }
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          handleCollaborationEvent(data);
        } catch (error) {
          logError('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setWebsocket(null);

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          notifications.show({
            title: 'Connection Failed',
            message: 'Could not reconnect to collaboration server',
            color: 'red',
          });
        }
      };

      ws.onerror = error => {
        logError('WebSocket error:', error);
      };

      setWebsocket(ws);
    } catch (error) {
      logError('Failed to connect:', error);
      // Fallback to mock behavior for development
      setIsConnected(true);
      setCollaborators([
        {
          id: 'mock-user-1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          color: '#FF6B6B',
          isActive: true,
          lastSeen: new Date(),
        },
        {
          id: 'mock-user-2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          color: '#4ECDC4',
          isActive: false,
          lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        },
      ]);
    }
  }, [options]);

  const handleCollaborationEvent = useCallback(
    (event: CollaborationEvent) => {
      switch (event.type) {
        case 'presence':
          if (event.data.action === 'join') {
            setCollaborators(prev => {
              const exists = prev.find(c => c.id === event.userId);
              if (exists) {
                return prev.map(c =>
                  c.id === event.userId ? { ...c, isActive: true, lastSeen: new Date() } : c,
                );
              }
              return [
                ...prev,
                {
                  id: event.userId,
                  name: (event.data.name as string) || 'Unknown User',
                  email: event.data.email as string | undefined,
                  color: (event.data.color as string) || '#339AF0',
                  isActive: true,
                  lastSeen: new Date(),
                },
              ];
            });
          } else if (event.data.action === 'leave') {
            setCollaborators(prev =>
              prev.map(c =>
                c.id === event.userId ? { ...c, isActive: false, lastSeen: new Date() } : c,
              ),
            );
          }
          break;

        case 'cursor':
          if (options.enableCursors) {
            setCollaborators(prev =>
              prev.map(c =>
                c.id === event.userId
                  ? { ...c, cursor: event.data.cursor as { x: number; y: number } }
                  : c,
              ),
            );
          }
          break;

        case 'edit':
          // Handle real-time edits
          // This would typically update the document state
          break;
      }
    },
    [options.enableCursors],
  );

  const sendEvent = useCallback(
    (event: Omit<CollaborationEvent, 'id' | 'timestamp'>) => {
      const fullEvent: CollaborationEvent = {
        ...event,
        id: nanoid(),
        timestamp: new Date(),
      };

      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify(fullEvent));
      }
    },
    [websocket],
  );

  const updatePresence = useCallback(
    (data: Partial<Collaborator>) => {
      sendEvent({
        type: 'presence',
        userId: options.userId,
        data: { action: 'update', ...data },
      });
    },
    [sendEvent, options.userId],
  );

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (websocket) {
      sendEvent({
        type: 'presence',
        userId: options.userId,
        data: { action: 'leave' },
      });
      websocket.close();
    }

    setIsConnected(false);
    setWebsocket(null);
  }, [websocket, sendEvent, options.userId]);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    collaborators,
    isConnected,
    sendEvent,
    updatePresence,
    disconnect,
  };
}
