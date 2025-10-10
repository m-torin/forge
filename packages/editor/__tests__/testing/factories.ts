import { CollaborationEvent, Collaborator, DocumentState } from '#/types';
import { nanoid } from 'nanoid';

export function createMockCollaborator(overrides: Partial<Collaborator> = {}): Collaborator {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  return {
    id: nanoid(),
    name: 'Test User',
    email: 'test@example.com',
    color: colors[Math.floor(Math.random() * colors.length)],
    isActive: true,
    lastSeen: new Date(),
    ...overrides,
  };
}

export function createMockCollaborationEvent(
  overrides: Partial<CollaborationEvent> = {},
): CollaborationEvent {
  return {
    id: nanoid(),
    type: 'edit',
    userId: nanoid(),
    timestamp: new Date(),
    data: {},
    ...overrides,
  };
}

function createMockDocumentState(overrides: Partial<DocumentState> = {}): DocumentState {
  return {
    id: nanoid(),
    content: { text: 'Hello world' },
    version: 1,
    lastModified: new Date(),
    collaborators: [],
    ...overrides,
  };
}

function createMockCollaboratorList(count: number): Collaborator[] {
  const names = [
    'Alice Johnson',
    'Bob Smith',
    'Carol Williams',
    'David Brown',
    'Eve Davis',
    'Frank Miller',
    'Grace Wilson',
    'Henry Taylor',
  ];

  return Array.from({ length: count }, (_, index) =>
    createMockCollaborator({
      name: names[index % names.length],
      email: `user${index + 1}@example.com`,
      isActive: Math.random() > 0.3, // 70% chance of being active
    }),
  );
}

function createMockEditEvent(userId: string, content: string, operation?: any): CollaborationEvent {
  return createMockCollaborationEvent({
    type: 'edit',
    userId,
    data: {
      content,
      operation: operation || { type: 'replace', content },
    },
  });
}

function createMockPresenceEvent(
  userId: string,
  action: 'join' | 'leave' | 'update',
  data?: any,
): CollaborationEvent {
  return createMockCollaborationEvent({
    type: 'presence',
    userId,
    data: { action, ...data },
  });
}

function createMockCursorEvent(userId: string, x: number, y: number): CollaborationEvent {
  return createMockCollaborationEvent({
    type: 'cursor',
    userId,
    data: { cursor: { x, y } },
  });
}
