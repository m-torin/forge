'use client';

import { logError } from '@repo/observability';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { MockBroadcastProvider } from '../providers/mock/MockBroadcastProvider';
import { MockWebSocketProvider } from '../providers/mock/MockWebSocketProvider';
import type {
  Collaborator,
  YjsCollaborationOptions,
  YjsCollaborationResult,
} from '../types/collaboration';

const DEFAULT_WEBSOCKET_URL = 'ws://localhost:1234';
const DEFAULT_USER_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

function getRandomColor(): string {
  return DEFAULT_USER_COLORS[Math.floor(Math.random() * DEFAULT_USER_COLORS.length)];
}

export function useYjsCollaboration(options: YjsCollaborationOptions): YjsCollaborationResult {
  const {
    documentId,
    userId,
    userName = 'Anonymous',
    userColor = getRandomColor(),
    userAvatar,
    websocketUrl = DEFAULT_WEBSOCKET_URL,
    enablePersistence = true,
    enablePresence = true,
    enableCursors = true,
    extensions = [],
    useMockProvider = false,
    mockProviderType = 'websocket',
    simulateLatency = true,
    latencyMs = 50,
    simulateDrops = false,
    dropRate = 0.05,
  } = options;

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<
    WebsocketProvider | MockWebSocketProvider | MockBroadcastProvider | null
  >(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);

  // Initialize Y.Doc
  if (!ydocRef.current) {
    ydocRef.current = new Y.Doc();
  }

  const ydoc = ydocRef.current;

  // Create editor extensions
  const editorExtensions = [
    StarterKit.configure({
      // Disable default undoRedo extension as collaboration has its own
      undoRedo: false,
    }),
    Collaboration.configure({
      document: ydoc,
    }),
    Placeholder.configure({
      placeholder: 'Start typing...',
    }),
    TextStyle,
    Color,
    Highlight,
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({
      openOnClick: false,
    }),
    ...extensions,
  ];

  // Add collaboration caret if enabled
  if (enableCursors && enablePresence) {
    editorExtensions.push(
      CollaborationCaret.configure({
        provider: providerRef.current,
        user: {
          name: userName,
          color: userColor,
          avatar: userAvatar,
        },
      }),
    );
  }

  // Initialize editor
  const editor = useEditor({
    extensions: editorExtensions,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  // Initialize providers
  useEffect(() => {
    try {
      setError(null);
      setIsLoading(true);

      // Create provider based on configuration
      let provider: WebsocketProvider | MockWebSocketProvider | MockBroadcastProvider;

      if (useMockProvider) {
        if (mockProviderType === 'broadcast') {
          provider = new MockBroadcastProvider(
            {
              documentId,
              userId,
              userName,
              userColor,
              enablePersistence,
            },
            ydoc,
          );
        } else {
          provider = new MockWebSocketProvider(
            {
              documentId,
              userId,
              userName,
              userColor,
              simulateLatency,
              latencyMs,
              simulateDrops,
              dropRate,
            },
            ydoc,
          );
        }
      } else {
        provider = new WebsocketProvider(websocketUrl, documentId, ydoc, {
          connect: true,
        });
      }

      providerRef.current = provider;

      // Create persistence if enabled
      let persistence: IndexeddbPersistence | null = null;
      if (enablePersistence) {
        persistence = new IndexeddbPersistence(documentId, ydoc);
        persistenceRef.current = persistence;
      }

      // Set up provider event listeners
      if (useMockProvider) {
        // Mock provider events - type assertion for mock providers
        const mockProvider = provider as MockWebSocketProvider | MockBroadcastProvider;

        (mockProvider as any).on('connect', () => {
          setIsConnected(true);
        });

        (mockProvider as any).on('disconnect', () => {
          setIsConnected(false);
        });

        (mockProvider as any).on('status', (status: string) => {
          setIsConnected(status === 'connected');
        });

        (mockProvider as any).on('error', (error: Error) => {
          logError('Mock collaboration error:', error);
          setError(`Connection failed: ${error.message}`);
          setIsConnected(false);
        });

        // Handle awareness changes for mock providers
        if (enablePresence) {
          const updateCollaborators = (event: { states: Map<string, any> }) => {
            const collaboratorsMap = new Map<string, Collaborator>();

            event.states.forEach((state, clientId) => {
              if (clientId !== userId && state.user) {
                const collaborator: Collaborator = {
                  id: clientId,
                  name: state.user.name || 'Anonymous',
                  color: state.user.color || getRandomColor(),
                  avatar: state.user.avatar,
                  email: state.user.email,
                  isActive: state.user.isActive ?? true,
                  lastSeen: state.user.lastSeen ? new Date(state.user.lastSeen) : new Date(),
                  cursor: state.cursor
                    ? {
                        x: state.cursor.x || 0,
                        y: state.cursor.y || 0,
                      }
                    : undefined,
                };
                collaboratorsMap.set(collaborator.id, collaborator);
              }
            });

            setCollaborators(Array.from(collaboratorsMap.values()));
          };

          (mockProvider as any).on('awarenessChange', updateCollaborators);

          // Clean up awareness on unmount
          return () => {
            (mockProvider as any).off('awarenessChange', updateCollaborators);
          };
        }
      } else {
        // Real WebSocket provider events
        const wsProvider = provider as WebsocketProvider;

        (wsProvider as any).on('status', (event: { status: string }) => {
          setIsConnected(event.status === 'connected');
        });

        (wsProvider as any).on('connection-error', (error: Error) => {
          logError('Collaboration connection error:', error);
          setError(`Connection failed: ${error.message}`);
          setIsConnected(false);
        });

        // Handle awareness changes for real providers
        if (enablePresence) {
          const awareness = (provider as WebsocketProvider).awareness;

          awareness.setLocalState({
            user: {
              name: userName,
              color: userColor,
              avatar: userAvatar,
            },
          });

          const updateCollaborators = () => {
            const collaboratorsMap = new Map<string, Collaborator>();

            awareness.getStates().forEach((state, clientId) => {
              if (clientId !== awareness.clientID && state.user) {
                const collaborator: Collaborator = {
                  id: clientId.toString(),
                  name: state.user.name || 'Anonymous',
                  color: state.user.color || getRandomColor(),
                  avatar: state.user.avatar,
                  email: state.user.email,
                  isActive: true,
                  lastSeen: new Date(),
                  cursor: state.cursor
                    ? {
                        x: state.cursor.x,
                        y: state.cursor.y,
                      }
                    : undefined,
                };
                collaboratorsMap.set(collaborator.id, collaborator);
              }
            });

            setCollaborators(Array.from(collaboratorsMap.values()));
          };

          awareness.on('change', updateCollaborators);
          updateCollaborators();

          // Clean up awareness on unmount
          return () => {
            awareness.off('change', updateCollaborators);
          };
        }
      }

      // Set loading to false once everything is set up
      setIsLoading(false);
    } catch (err) {
      logError('Failed to initialize collaboration:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  }, [
    documentId,
    userId,
    userName,
    userColor,
    userAvatar,
    websocketUrl,
    enablePersistence,
    enablePresence,
    enableCursors,
  ]);

  // Update collaboration caret extension when provider changes
  useEffect(() => {
    if (editor && providerRef.current && enableCursors && enablePresence) {
      const collaborationCaret = editor.extensionManager.extensions.find(
        ext => ext.name === 'collaborationCaret',
      );

      if (collaborationCaret) {
        // Update the provider reference in the extension
        collaborationCaret.options.provider = providerRef.current;
        collaborationCaret.options.user = {
          name: userName,
          color: userColor,
          avatar: userAvatar,
        };
      }
    }
  }, [editor, userName, userColor, userAvatar, enableCursors, enablePresence]);

  const disconnect = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.disconnect();
      providerRef.current.destroy();
      providerRef.current = null;
    }

    if (persistenceRef.current) {
      persistenceRef.current.destroy();
      persistenceRef.current = null;
    }

    setIsConnected(false);
    setCollaborators([]);
  }, []);

  const reconnect = useCallback(() => {
    if (providerRef.current) {
      // Type-safe connect method call
      const provider = providerRef.current;
      if ('connect' in provider && typeof (provider as any).connect === 'function') {
        (provider as any).connect();
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    editor,
    provider: providerRef.current,
    persistence: persistenceRef.current,
    ydoc,
    collaborators,
    isConnected,
    isLoading,
    error,
    disconnect,
    reconnect,
  };
}
