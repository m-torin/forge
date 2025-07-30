import { CollaborationEvent, CollaborationHookResult, Collaborator } from '#/types';
import { vi } from 'vitest';

export const mockCollaborators: Collaborator[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    color: '#FF6B6B',
    isActive: true,
    lastSeen: new Date(),
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    color: '#4ECDC4',
    isActive: false,
    lastSeen: new Date(Date.now() - 300000),
  },
  {
    id: 'user-3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    color: '#45B7D1',
    isActive: true,
    lastSeen: new Date(),
    cursor: { x: 100, y: 200 },
  },
];

export const mockCollaborationEvent: CollaborationEvent = {
  id: 'event-1',
  type: 'edit',
  userId: 'user-1',
  timestamp: new Date(),
  data: {
    content: 'Hello world',
    operation: { type: 'insert', position: 0, text: 'Hello' },
  },
};

export function createMockCollaborationHook(
  overrides: Partial<CollaborationHookResult> = {},
): CollaborationHookResult {
  return {
    collaborators: mockCollaborators,
    isConnected: true,
    sendEvent: vi.fn(),
    updatePresence: vi.fn(),
    disconnect: vi.fn(),
    ...overrides,
  };
}

export const mockCollaborationHook = createMockCollaborationHook();

// Mock the useCollaboration hook
vi.mock('../hooks/use-collaboration.js', () => ({
  useCollaboration: vi.fn(() => mockCollaborationHook),
}));

// Mock the useCollaborativeEditing hook
vi.mock('../hooks/use-collaborative-editing.js', () => ({
  useCollaborativeEditing: vi.fn(() => ({
    ...mockCollaborationHook,
    documentVersion: 1,
    pendingOperations: [],
    isAutoSaving: false,
    sendEdit: vi.fn(),
    applyOperation: vi.fn(),
  })),
}));

// Mock WebSocket for testing
export class MockWebSocket {
  url: string;
  readyState: number = WebSocket.OPEN;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 100);
  }

  send = vi.fn();
  close = vi.fn();

  // Helper methods for testing
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }

  simulateClose() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
}

// Replace global WebSocket with mock
if (typeof global !== 'undefined') {
  global.WebSocket = MockWebSocket as any;
}
