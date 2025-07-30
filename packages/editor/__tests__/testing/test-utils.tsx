import { CollaborationProvider } from '#/providers/collaboration-provider';
import { CollaborationOptions } from '#/types';
import { MantineProvider } from '@mantine/core';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

// Remove the MantineProvider mock since we want the real one

vi.mock('@mantine/modals', () => ({
  ModalsProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@mantine/notifications', () => ({
  Notifications: () => null,
  notifications: {
    show: vi.fn(),
    hide: vi.fn(),
  },
}));

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  collaborationOptions?: Partial<CollaborationOptions>;
}

const defaultCollaborationOptions: CollaborationOptions = {
  documentId: 'test-document',
  userId: 'test-user',
  enablePresence: true,
  enableCursors: true,
  autoSave: false,
};

function CollaborationWrapper({
  children,
  options = {},
}: {
  children: ReactNode;
  options?: Partial<CollaborationOptions>;
}) {
  return (
    <MantineProvider>
      <CollaborationProvider options={{ ...defaultCollaborationOptions, ...options }}>
        {children}
      </CollaborationProvider>
    </MantineProvider>
  );
}

export function renderWithCollaboration(
  ui: ReactElement,
  options: CustomRenderOptions = {},
): ReturnType<typeof render> {
  const { collaborationOptions, ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <CollaborationWrapper options={collaborationOptions}>{children}</CollaborationWrapper>
    ),
    ...renderOptions,
  });
}

export function renderWithoutProvider(
  ui: ReactElement,
  options: RenderOptions = {},
): ReturnType<typeof render> {
  return render(ui, options);
}

// Custom matchers for collaboration testing
export const collaborationMatchers = {
  toHaveCollaborator: (collaborators: any[], userId: string) => {
    const hasCollaborator = collaborators.some(c => c.id === userId);
    return {
      pass: hasCollaborator,
      message: () =>
        hasCollaborator
          ? `Expected collaborators not to include user ${userId}`
          : `Expected collaborators to include user ${userId}`,
    };
  },

  toBeConnected: (isConnected: boolean) => ({
    pass: isConnected,
    message: () =>
      isConnected
        ? 'Expected collaboration to be disconnected'
        : 'Expected collaboration to be connected',
  }),

  toHaveActiveCollaborators: (collaborators: any[], count: number) => {
    const activeCount = collaborators.filter(c => c.isActive).length;
    return {
      pass: activeCount === count,
      message: () => `Expected ${count} active collaborators, but got ${activeCount}`,
    };
  },
};

// Extend expect with custom matchers
if (typeof expect !== 'undefined') {
  expect.extend(collaborationMatchers);
}

// Test utilities for simulating collaboration events
export function simulateUserJoin(mockWebSocket: any, userId: string, userName: string) {
  mockWebSocket.simulateMessage({
    type: 'presence',
    userId,
    data: { action: 'join', name: userName },
  });
}

export function simulateUserLeave(mockWebSocket: any, userId: string) {
  mockWebSocket.simulateMessage({
    type: 'presence',
    userId,
    data: { action: 'leave' },
  });
}

export function simulateEdit(mockWebSocket: any, userId: string, content: string) {
  mockWebSocket.simulateMessage({
    type: 'edit',
    userId,
    data: { content, operation: { type: 'replace', content } },
  });
}

export function simulateCursorMove(mockWebSocket: any, userId: string, x: number, y: number) {
  mockWebSocket.simulateMessage({
    type: 'cursor',
    userId,
    data: { cursor: { x, y } },
  });
}

// Wait for collaboration state updates
export function waitForCollaboration(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export * from '@testing-library/react';
export { renderWithCollaboration as render };
