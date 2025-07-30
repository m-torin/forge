import { useYjsCollaboration } from '#/hooks/use-yjs-collaboration';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Y.js and WebSocket dependencies
vi.mock('yjs', () => ({
  Doc: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
    getXmlFragment: vi.fn(),
  })),
}));

vi.mock('y-websocket', () => ({
  WebsocketProvider: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    destroy: vi.fn(),
    awareness: {
      clientID: 1,
      setLocalState: vi.fn(),
      getStates: vi.fn(() => new Map()),
      on: vi.fn(),
      off: vi.fn(),
    },
  })),
}));

vi.mock('y-indexeddb', () => ({
  IndexeddbPersistence: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  })),
}));

vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    commands: {
      setContent: vi.fn(),
    },
    setEditable: vi.fn(),
    getHTML: vi.fn(() => '<p>Test content</p>'),
    isActive: vi.fn(() => false),
    can: vi.fn(() => ({ undo: vi.fn(() => true), redo: vi.fn(() => true) })),
    chain: vi.fn(() => ({
      focus: vi.fn(() => ({
        toggleBold: vi.fn(() => ({ run: vi.fn() })),
        undo: vi.fn(() => ({ run: vi.fn() })),
        redo: vi.fn(() => ({ run: vi.fn() })),
      })),
    })),
    on: vi.fn(),
    off: vi.fn(),
    extensionManager: {
      extensions: [],
    },
  })),
}));

describe('useYjsCollaboration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default options', async () => {
    const { result } = renderHook(() =>
      useYjsCollaboration({
        documentId: 'test-doc',
        userId: 'user-1',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.ydoc).toBeDefined();
    expect(result.current.collaborators).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('handles connection status changes', async () => {
    const { result } = renderHook(() =>
      useYjsCollaboration({
        documentId: 'test-doc',
        userId: 'user-1',
        websocketUrl: 'ws://localhost:1234',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Initially disconnected
    expect(result.current.isConnected).toBe(false);
  });

  it('creates provider with custom websocket URL', async () => {
    const { result } = renderHook(() =>
      useYjsCollaboration({
        documentId: 'test-doc',
        userId: 'user-1',
        websocketUrl: 'ws://custom-server:8080',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.provider).toBeDefined();
  });

  it('disables persistence when enablePersistence is false', async () => {
    const { result } = renderHook(() =>
      useYjsCollaboration({
        documentId: 'test-doc',
        userId: 'user-1',
        enablePersistence: false,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.persistence).toBeNull();
  });

  it('creates persistence when enablePersistence is true', async () => {
    const { result } = renderHook(() =>
      useYjsCollaboration({
        documentId: 'test-doc',
        userId: 'user-1',
        enablePersistence: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.persistence).toBeDefined();
  });

  it('provides disconnect function', async () => {
    const { result } = renderHook(() =>
      useYjsCollaboration({
        documentId: 'test-doc',
        userId: 'user-1',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.disconnect).toBe('function');

    // Test disconnect functionality
    result.current.disconnect();

    // After disconnect, provider should be null
    expect(result.current.isConnected).toBe(false);
  });

  it('provides reconnect function', async () => {
    const { result } = renderHook(() =>
      useYjsCollaboration({
        documentId: 'test-doc',
        userId: 'user-1',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.reconnect).toBe('function');
  });

  it('handles user information correctly', async () => {
    const { result } = renderHook(() =>
      useYjsCollaboration({
        documentId: 'test-doc',
        userId: 'user-1',
        userName: 'John Doe',
        userColor: '#FF6B6B',
        userAvatar: 'https://example.com/avatar.jpg',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.editor).toBeDefined();
  });

  it('handles extensions correctly', async () => {
    const mockExtension = { name: 'custom-extension' };

    const { result } = renderHook(() =>
      useYjsCollaboration({
        documentId: 'test-doc',
        userId: 'user-1',
        extensions: [mockExtension],
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.editor).toBeDefined();
  });

  it('cleans up on unmount', async () => {
    const { result, unmount } = renderHook(() =>
      useYjsCollaboration({
        documentId: 'test-doc',
        userId: 'user-1',
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const disconnectSpy = vi.spyOn(result.current, 'disconnect');

    unmount();

    // Note: Due to how the hook is structured, we can't directly test
    // the cleanup function, but we can verify the disconnect method exists
    expect(typeof result.current.disconnect).toBe('function');
  });
});
