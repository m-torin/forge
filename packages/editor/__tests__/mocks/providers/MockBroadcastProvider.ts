import { logWarn } from '@repo/observability';
import { EventEmitter } from 'events';
import * as Y from 'yjs';

export interface MockBroadcastConfig {
  documentId: string;
  userId: string;
  userName: string;
  userColor?: string;
  enablePersistence?: boolean;
}

/**
 * MockBroadcastProvider enables real cross-tab collaboration using BroadcastChannel API
 * This provider works across multiple browser tabs/windows for the same document
 */
export class MockBroadcastProvider extends EventEmitter {
  private ydoc: Y.Doc;
  private documentId: string;
  private userId: string;
  private userName: string;
  private userColor: string;
  private isConnected: boolean = false;
  private broadcastChannel: BroadcastChannel;
  private awareness: Map<string, any> = new Map();
  private enablePersistence: boolean;
  private storageKey: string;
  private heartbeatInterval?: NodeJS.Timeout;
  private syncTimeout?: NodeJS.Timeout;

  constructor(config: MockBroadcastConfig, ydoc: Y.Doc) {
    super();

    this.ydoc = ydoc;
    this.documentId = config.documentId;
    this.userId = config.userId;
    this.userName = config.userName;
    this.userColor = config.userColor || this.generateRandomColor();
    this.enablePersistence = config.enablePersistence ?? true;
    this.storageKey = `yjs-broadcast-doc-${this.documentId}`;

    this.broadcastChannel = new BroadcastChannel(`yjs-broadcast-${this.documentId}`);

    this.setupEventHandlers();
    this.connect();
  }

  private setupEventHandlers(): void {
    // Listen for document updates
    this.ydoc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== this) {
        this.broadcastUpdate(update);
        if (this.enablePersistence) {
          this.saveToStorage();
        }
      }
    });

    // Listen for messages from other tabs
    this.broadcastChannel.onmessage = event => {
      const { type, data, senderId, timestamp: _timestamp } = event.data;

      if (senderId === this.userId) return; // Ignore own messages

      switch (type) {
        case 'update':
          this.handleUpdate(data);
          break;
        case 'sync-request':
          this.handleSyncRequest(senderId);
          break;
        case 'sync-response':
          this.handleSyncResponse(data);
          break;
        case 'awareness-update':
          this.handleAwarenessUpdate(data, senderId);
          break;
        case 'ping':
          this.handlePing(senderId);
          break;
        case 'pong':
          this.handlePong(data, senderId);
          break;
        case 'user-joined':
          this.handleUserJoined(data);
          break;
        case 'user-left':
          this.handleUserLeft(data);
          break;
      }
    };

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.handleTabVisible();
      } else {
        this.handleTabHidden();
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.announceUserLeft();
    });
  }

  private connect(): void {
    // Load from storage if enabled
    if (this.enablePersistence) {
      this.loadFromStorage();
    }

    this.isConnected = true;

    // Announce presence
    this.announceUserJoined();

    // Request sync from other tabs
    this.requestSync();

    // Start heartbeat
    this.startHeartbeat();

    this.emit('connect');
    this.emit('status', 'connected');

    // Emit synced after a short delay to allow for initial sync
    this.syncTimeout = setTimeout(() => {
      this.emit('synced');
    }, 100);
  }

  disconnect(): void {
    this.isConnected = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.announceUserLeft();
    this.broadcastChannel.close();

    this.emit('disconnect');
    this.emit('status', 'disconnected');
  }

  reconnect(): void {
    if (this.isConnected) {
      this.disconnect();
    }

    setTimeout(() => {
      this.broadcastChannel = new BroadcastChannel(`yjs-broadcast-${this.documentId}`);
      this.setupEventHandlers();
      this.connect();
    }, 100);
  }

  private handleUpdate(update: Uint8Array): void {
    Y.applyUpdate(this.ydoc, update, this);
  }

  private broadcastUpdate(update: Uint8Array): void {
    this.broadcastMessage('update', update);
  }

  private requestSync(): void {
    this.broadcastMessage('sync-request', null);
  }

  private handleSyncRequest(senderId: string): void {
    const state = Y.encodeStateAsUpdate(this.ydoc);
    this.sendDirectMessage(senderId, 'sync-response', state);
  }

  private handleSyncResponse(update: Uint8Array): void {
    if (update && update.length > 0) {
      Y.applyUpdate(this.ydoc, update, this);
    }
  }

  private announceUserJoined(): void {
    this.broadcastMessage('user-joined', {
      userId: this.userId,
      userName: this.userName,
      userColor: this.userColor,
      timestamp: Date.now(),
    });

    // Set initial awareness
    this.setAwarenessField('user', {
      name: this.userName,
      color: this.userColor,
      isActive: true,
      lastSeen: Date.now(),
    });
  }

  private announceUserLeft(): void {
    this.broadcastMessage('user-left', {
      userId: this.userId,
    });
  }

  private handleUserJoined(userData: any): void {
    this.awareness.set(userData.userId, {
      user: {
        name: userData.userName,
        color: userData.userColor,
        isActive: true,
        lastSeen: userData.timestamp,
      },
    });

    this.emit('awarenessUpdate', {
      added: [userData.userId],
      updated: [],
      removed: [],
    });
    this.emit('awarenessChange', { states: this.awareness });
  }

  private handleUserLeft(userData: any): void {
    this.awareness.delete(userData.userId);

    this.emit('awarenessUpdate', {
      added: [],
      updated: [],
      removed: [userData.userId],
    });
    this.emit('awarenessChange', { states: this.awareness });
  }

  private handleAwarenessUpdate(awarenessData: any, senderId: string): void {
    this.awareness.set(senderId, awarenessData);

    this.emit('awarenessUpdate', {
      added: [],
      updated: [senderId],
      removed: [],
    });
    this.emit('awarenessChange', { states: this.awareness });
  }

  private handlePing(senderId: string): void {
    this.sendDirectMessage(senderId, 'pong', {
      userId: this.userId,
      timestamp: Date.now(),
    });
  }

  private handlePong(data: any, senderId: string): void {
    // Update last seen for the user
    const currentAwareness = this.awareness.get(senderId);
    if (currentAwareness) {
      currentAwareness.user = {
        ...currentAwareness.user,
        lastSeen: data.timestamp,
        isActive: true,
      };
      this.awareness.set(senderId, currentAwareness);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        // Ping other tabs
        this.broadcastMessage('ping', {
          userId: this.userId,
          timestamp: Date.now(),
        });

        // Update own awareness
        this.setAwarenessField('user', {
          name: this.userName,
          color: this.userColor,
          isActive: !document.hidden,
          lastSeen: Date.now(),
        });

        // Clean up stale awareness entries
        this.cleanupStaleAwareness();
      }
    }, 5000);
  }

  private cleanupStaleAwareness(): void {
    const now = Date.now();
    const staleThreshold = 30000; // 30 seconds
    const removedUsers: string[] = [];

    for (const [userId, awareness] of this.awareness.entries()) {
      if (userId !== this.userId && awareness.user?.lastSeen) {
        if (now - awareness.user.lastSeen > staleThreshold) {
          this.awareness.delete(userId);
          removedUsers.push(userId);
        }
      }
    }

    if (removedUsers.length > 0) {
      this.emit('awarenessUpdate', {
        added: [],
        updated: [],
        removed: removedUsers,
      });
      this.emit('awarenessChange', { states: this.awareness });
    }
  }

  private handleTabVisible(): void {
    if (this.isConnected) {
      this.setAwarenessField('user', {
        name: this.userName,
        color: this.userColor,
        isActive: true,
        lastSeen: Date.now(),
      });
    }
  }

  private handleTabHidden(): void {
    if (this.isConnected) {
      this.setAwarenessField('user', {
        name: this.userName,
        color: this.userColor,
        isActive: false,
        lastSeen: Date.now(),
      });
    }
  }

  setAwarenessField(field: string, value: any): void {
    const currentAwareness = this.awareness.get(this.userId) || {};
    currentAwareness[field] = value;
    this.awareness.set(this.userId, currentAwareness);

    this.broadcastMessage('awareness-update', currentAwareness);
  }

  getAwarenessStates(): Map<string, any> {
    return new Map(this.awareness);
  }

  private broadcastMessage(type: string, data: any): void {
    this.broadcastChannel.postMessage({
      type,
      data,
      senderId: this.userId,
      timestamp: Date.now(),
    });
  }

  private sendDirectMessage(recipientId: string, type: string, data: any): void {
    this.broadcastChannel.postMessage({
      type,
      data,
      senderId: this.userId,
      recipientId,
      timestamp: Date.now(),
    });
  }

  private saveToStorage(): void {
    try {
      const state = Y.encodeStateAsUpdate(this.ydoc);
      const base64 = btoa(String.fromCharCode(...state));
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          state: base64,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      logWarn('Failed to save document to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const { state } = JSON.parse(stored);
        const uint8Array = new Uint8Array(
          atob(state)
            .split('')
            .map(char => char.charCodeAt(0)),
        );
        Y.applyUpdate(this.ydoc, uint8Array, 'storage');
      }
    } catch (error) {
      logWarn('Failed to load document from storage:', error);
    }
  }

  private generateRandomColor(): string {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#FF9F43',
      '#6C5CE7',
      '#A29BFE',
      '#FD79A8',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Public API compatibility
  get connected(): boolean {
    return this.isConnected;
  }

  destroy(): void {
    this.disconnect();
    this.removeAllListeners();
  }
}
