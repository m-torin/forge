import type { Editor } from '@tiptap/core';
import type { IndexeddbPersistence } from 'y-indexeddb';
import type { WebsocketProvider } from 'y-websocket';
import type * as Y from 'yjs';
import { z } from 'zod/v4';
import type { MockBroadcastProvider } from '../providers/mock/MockBroadcastProvider';
import type { MockWebSocketProvider } from '../providers/mock/MockWebSocketProvider';

export const CollaborationEventSchema = z.object({
  id: z.string(),
  type: z.enum(['cursor', 'selection', 'edit', 'presence', 'typing']),
  userId: z.string(),
  timestamp: z.date().or(
    z.string().transform((str, ctx) => {
      const date = new Date(str);
      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid date string',
        });
        return z.NEVER;
      }
      return date;
    }),
  ),
  data: z.record(z.string(), z.unknown()),
});

export const CollaboratorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
  color: z.string(),
  isActive: z.boolean(),
  isTyping: z.boolean().optional(),
  lastSeen: z.date().or(
    z.string().transform((str, ctx) => {
      const date = new Date(str);
      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid date string',
        });
        return z.NEVER;
      }
      return date;
    }),
  ),
  cursor: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
});

export const DocumentStateSchema = z.object({
  id: z.string(),
  content: z.record(z.string(), z.unknown()),
  version: z.number(),
  lastModified: z.date().or(
    z.string().transform((str, ctx) => {
      const date = new Date(str);
      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid date string',
        });
        return z.NEVER;
      }
      return date;
    }),
  ),
  collaborators: z.array(CollaboratorSchema),
});

export type CollaborationEvent = z.infer<typeof CollaborationEventSchema>;
export type Collaborator = z.infer<typeof CollaboratorSchema>;
export type DocumentState = z.infer<typeof DocumentStateSchema>;

// Y.js collaboration types
export type CollaborationProviderType =
  | WebsocketProvider
  | MockWebSocketProvider
  | MockBroadcastProvider;

export interface YjsCollaborationOptions {
  documentId: string;
  userId: string;
  userName?: string;
  userColor?: string;
  userAvatar?: string;
  websocketUrl?: string;
  enablePersistence?: boolean;
  enablePresence?: boolean;
  enableCursors?: boolean;
  extensions?: any[];
  // Mock provider options
  useMockProvider?: boolean;
  mockProviderType?: 'websocket' | 'broadcast';
  simulateLatency?: boolean;
  latencyMs?: number;
  simulateDrops?: boolean;
  dropRate?: number;
}

export interface YjsCollaborationResult {
  editor: Editor | null;
  provider: CollaborationProviderType | null;
  persistence: IndexeddbPersistence | null;
  ydoc: Y.Doc;
  collaborators: Collaborator[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  disconnect: () => void;
  reconnect: () => void;
}

// Legacy collaboration types (for backwards compatibility)
export interface CollaborationOptions {
  documentId: string;
  userId: string;
  enablePresence?: boolean;
  enableCursors?: boolean;
  autoSave?: boolean;
  saveInterval?: number;
}

export interface CollaborationHookResult {
  collaborators: Collaborator[];
  isConnected: boolean;
  sendEvent: (event: Omit<CollaborationEvent, 'id' | 'timestamp'>) => void;
  updatePresence: (data: Partial<Collaborator>) => void;
  disconnect: () => void;
}

// Collaboration server types
export interface CollaborationServerConfig {
  websocketUrl: string;
  apiUrl?: string;
  authToken?: string;
  roomPrefix?: string;
}

export interface UserPresence {
  userId: string;
  userName: string;
  userColor: string;
  userAvatar?: string;
  isTyping?: boolean;
  cursor?: {
    anchor: number;
    head: number;
  };
  selection?: {
    from: number;
    to: number;
  };
  lastSeen: Date;
}

// Provider factory types
export interface ProviderFactory {
  createWebsocketProvider: (
    websocketUrl: string,
    documentId: string,
    ydoc: Y.Doc,
    options?: any,
  ) => WebsocketProvider;
  createPersistence: (documentId: string, ydoc: Y.Doc) => IndexeddbPersistence;
}
