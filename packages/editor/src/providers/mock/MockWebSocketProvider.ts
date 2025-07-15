import { EventEmitter } from 'events';
import * as Y from 'yjs';

export interface MockWebSocketConfig {
  documentId: string;
  userId: string;
  userName: string;
  userColor?: string;
  simulateLatency?: boolean;
  latencyMs?: number;
  simulateDrops?: boolean;
  dropRate?: number;
}

export class MockWebSocketProvider extends EventEmitter {
  private ydoc: Y.Doc;
  private documentId: string;
  private userId: string;
  private userName: string;
  private userColor: string;
  private isConnected: boolean = false;
  private simulateLatency: boolean;
  private latencyMs: number;
  private simulateDrops: boolean;
  private dropRate: number;
  private broadcastChannel: BroadcastChannel;
  private awareness: Map<string, any> = new Map();
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(config: MockWebSocketConfig, ydoc: Y.Doc) {
    super();

    this.ydoc = ydoc;
    this.documentId = config.documentId;
    this.userId = config.userId;
    this.userName = config.userName;
    this.userColor = config.userColor || this.generateRandomColor();
    this.simulateLatency = config.simulateLatency ?? true;
    this.latencyMs = config.latencyMs ?? 50;
    this.simulateDrops = config.simulateDrops ?? false;
    this.dropRate = config.dropRate ?? 0.05;

    // Use BroadcastChannel for cross-tab communication
    this.broadcastChannel = new BroadcastChannel(`yjs-mock-${this.documentId}`);

    this.setupEventHandlers();
    this.connect();
  }

  private setupEventHandlers(): void {
    // Listen for document updates
    this.ydoc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== this) {
        this.broadcastUpdate(update);
      }
    });

    // Listen for broadcasts from other instances
    this.broadcastChannel.onmessage = event => {
      const { type, data, senderId } = event.data;

      if (senderId === this.userId) return; // Ignore own messages

      this.simulateNetworkDelay(() => {
        switch (type) {
          case 'update':
            Y.applyUpdate(this.ydoc, data, this);
            break;
          case 'sync-request':
            this.handleSyncRequest(data, senderId);
            break;
          case 'sync-response':
            this.handleSyncResponse(data);
            break;
          case 'awareness-update':
            this.handleAwarenessUpdate(data, senderId);
            break;
          case 'user-connected':
            this.handleUserConnected(data);
            break;
          case 'user-disconnected':
            this.handleUserDisconnected(data);
            break;
        }
      });
    };
  }

  private connect(): void {
    this.simulateNetworkDelay(() => {
      this.isConnected = true;

      // Announce connection
      this.broadcastMessage('user-connected', {
        userId: this.userId,
        userName: this.userName,
        userColor: this.userColor,
      });

      // Request sync with existing peers
      this.requestSync();

      // Start heartbeat
      this.startHeartbeat();

      this.emit('connect');
      this.emit('status', 'connected');
    });
  }

  disconnect(): void {
    this.isConnected = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Announce disconnection
    this.broadcastMessage('user-disconnected', {
      userId: this.userId,
    });

    this.broadcastChannel.close();
    this.emit('disconnect');
    this.emit('status', 'disconnected');
  }

  reconnect(): void {
    if (this.isConnected) {
      this.disconnect();
    }

    setTimeout(() => {
      this.broadcastChannel = new BroadcastChannel(`yjs-mock-${this.documentId}`);
      this.setupEventHandlers();
      this.connect();
    }, 100);
  }

  private requestSync(): void {
    const stateVector = Y.encodeStateVector(this.ydoc);
    this.broadcastMessage('sync-request', stateVector);
  }

  private handleSyncRequest(stateVector: Uint8Array, senderId: string): void {
    const update = Y.encodeStateAsUpdate(this.ydoc, stateVector);
    if (update.length > 0) {
      this.sendDirectMessage(senderId, 'sync-response', update);
    }
  }

  private handleSyncResponse(update: Uint8Array): void {
    Y.applyUpdate(this.ydoc, update, this);
    this.emit('synced');
  }

  private broadcastUpdate(update: Uint8Array): void {
    if (this.shouldDropMessage()) return;

    this.broadcastMessage('update', update);
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

  private handleAwarenessUpdate(awarenessData: any, senderId: string): void {
    this.awareness.set(senderId, awarenessData);
    this.emit('awarenessUpdate', {
      added: [],
      updated: [senderId],
      removed: [],
    });
    this.emit('awarenessChange', { states: this.awareness });
  }

  private handleUserConnected(userData: any): void {
    this.awareness.set(userData.userId, {
      user: {
        name: userData.userName,
        color: userData.userColor,
      },
    });

    this.emit('awarenessUpdate', {
      added: [userData.userId],
      updated: [],
      removed: [],
    });
    this.emit('awarenessChange', { states: this.awareness });
  }

  private handleUserDisconnected(userData: any): void {
    this.awareness.delete(userData.userId);

    this.emit('awarenessUpdate', {
      added: [],
      updated: [],
      removed: [userData.userId],
    });
    this.emit('awarenessChange', { states: this.awareness });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.setAwarenessField('user', {
          name: this.userName,
          color: this.userColor,
          lastSeen: Date.now(),
        });
      }
    }, 5000);
  }

  setAwarenessField(field: string, value: any): void {
    const currentAwareness = this.awareness.get(this.userId) || {};
    currentAwareness[field] = value;
    this.awareness.set(this.userId, currentAwareness);

    this.broadcastMessage('awareness-update', currentAwareness);

    this.emit('awarenessUpdate', {
      added: [],
      updated: [this.userId],
      removed: [],
    });
    this.emit('awarenessChange', { states: this.awareness });
  }

  getAwarenessStates(): Map<string, any> {
    return new Map(this.awareness);
  }

  private simulateNetworkDelay(callback: () => void): void {
    if (this.simulateLatency) {
      const delay = this.latencyMs + Math.random() * this.latencyMs * 0.5;
      setTimeout(callback, delay);
    } else {
      callback();
    }
  }

  private shouldDropMessage(): boolean {
    return this.simulateDrops && Math.random() < this.dropRate;
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

  // Public API compatibility with real providers
  get connected(): boolean {
    return this.isConnected;
  }

  destroy(): void {
    this.disconnect();
    this.removeAllListeners();
  }
}
