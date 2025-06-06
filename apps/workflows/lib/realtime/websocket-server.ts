import { createServer } from 'http';
import { parse } from 'url';

import { type ClientSubscription, type RealtimeEvent, type WebSocketMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { WebSocket, WebSocketServer } from 'ws';

interface ConnectedClient {
  id: string;
  lastPing: Date;
  metadata: {
    userAgent?: string;
    ip?: string;
    connectedAt: Date;
  };
  subscriptions: ClientSubscription;
  ws: WebSocket;
}

export class WorkflowWebSocketServer {
  private wss: WebSocketServer | null = null;
  private server: any = null;
  private clients = new Map<string, ConnectedClient>();
  private isRunning = false;
  private pingInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor(private port = 3101) {}

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('WebSocket server already running');
      return;
    }

    try {
      // Create HTTP server
      this.server = createServer();

      // Create WebSocket server
      this.wss = new WebSocketServer({
        path: '/ws',
        server: this.server,
      });

      this.setupWebSocketHandlers();
      this.setupPingInterval();
      this.setupMetricsInterval();

      // Start HTTP server
      await new Promise<void>((resolve, reject) => {
        this.server.listen(this.port, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      this.isRunning = true;
      console.log(`🚀 WebSocket server running on ws://localhost:${this.port}/ws`);
    } catch (error) {
      console.error('Failed to start WebSocket server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    // Close all client connections
    this.clients.forEach((client) => {
      client.ws.close(1000, 'Server shutting down');
    });
    this.clients.clear();

    // Close WebSocket server
    if (this.wss) {
      await new Promise<void>((resolve) => {
        this.wss!.close(resolve);
      });
    }

    // Close HTTP server
    if (this.server) {
      await new Promise<void>((resolve, reject) => {
        this.server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    console.log('WebSocket server stopped');
  }

  private setupWebSocketHandlers(): void {
    if (!this.wss) return;

    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = uuidv4();
      const url = parse(request.url || '', true);

      const client: ConnectedClient = {
        id: clientId,
        lastPing: new Date(),
        metadata: {
          connectedAt: new Date(),
          ip: request.socket.remoteAddress,
          userAgent: request.headers['user-agent'],
        },
        subscriptions: {
          clientId,
          eventTypes: ['workflow-started', 'workflow-completed', 'workflow-failed'],
          workflowIds: [],
        },
        ws,
      };

      this.clients.set(clientId, client);

      console.log(`Client connected: ${clientId} (${this.clients.size} total)`);

      // Send welcome message
      this.sendToClient(clientId, {
        id: uuidv4(),
        type: 'connection-established',
        data: {
          clientId,
          serverTime: new Date(),
          supportedEvents: [
            'workflow-started',
            'workflow-completed',
            'workflow-failed',
            'step-started',
            'step-completed',
            'step-failed',
            'metrics-updated',
          ],
        },
        timestamp: new Date(),
      });

      // Handle messages
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(clientId, message);
        } catch (error) {
          console.error(`Invalid message from client ${clientId}:`, error);
          this.sendError(clientId, 'Invalid JSON message');
        }
      });

      // Handle disconnection
      ws.on('close', (code: number, reason: Buffer) => {
        this.clients.delete(clientId);
        console.log(`Client disconnected: ${clientId} (${code}: ${reason.toString()})`);
      });

      // Handle errors
      ws.on('error', (error: Error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      // Handle pong responses
      ws.on('pong', () => {
        const client = this.clients.get(clientId);
        if (client) {
          client.lastPing = new Date();
        }
      });
    });

    this.wss.on('error', (error: Error) => {
      console.error('WebSocket server error:', error);
    });
  }

  private handleClientMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(clientId, message.data);
        break;

      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message.data);
        break;

      case 'ping':
        this.sendToClient(clientId, {
          id: uuidv4(),
          type: 'pong',
          data: { serverTime: new Date() },
          timestamp: new Date(),
        });
        break;

      default:
        console.warn(`Unknown message type from client ${clientId}:`, message.type);
        this.sendError(clientId, `Unknown message type: ${message.type}`);
    }
  }

  private handleSubscribe(clientId: string, data: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      if (data.workflowIds && Array.isArray(data.workflowIds)) {
        client.subscriptions.workflowIds = [
          ...new Set([...client.subscriptions.workflowIds, ...data.workflowIds]),
        ];
      }

      if (data.eventTypes && Array.isArray(data.eventTypes)) {
        client.subscriptions.eventTypes = [
          ...new Set([...client.subscriptions.eventTypes, ...data.eventTypes]),
        ];
      }

      this.sendToClient(clientId, {
        id: uuidv4(),
        type: 'subscription-updated',
        data: client.subscriptions,
        timestamp: new Date(),
      });

      console.log(`Client ${clientId} subscribed to:`, {
        events: data.eventTypes?.length || 0,
        workflows: data.workflowIds?.length || 0,
      });
    } catch (error) {
      console.error(`Failed to handle subscribe for client ${clientId}:`, error);
      this.sendError(clientId, 'Failed to process subscription');
    }
  }

  private handleUnsubscribe(clientId: string, data: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      if (data.workflowIds && Array.isArray(data.workflowIds)) {
        client.subscriptions.workflowIds = client.subscriptions.workflowIds.filter(
          (id) => !data.workflowIds.includes(id),
        );
      }

      if (data.eventTypes && Array.isArray(data.eventTypes)) {
        client.subscriptions.eventTypes = client.subscriptions.eventTypes.filter(
          (type) => !data.eventTypes.includes(type),
        );
      }

      this.sendToClient(clientId, {
        id: uuidv4(),
        type: 'subscription-updated',
        data: client.subscriptions,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(`Failed to handle unsubscribe for client ${clientId}:`, error);
      this.sendError(clientId, 'Failed to process unsubscription');
    }
  }

  private sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send message to client ${clientId}:`, error);
      this.clients.delete(clientId);
    }
  }

  private sendError(clientId: string, error: string): void {
    this.sendToClient(clientId, {
      id: uuidv4(),
      type: 'error',
      data: { error },
      timestamp: new Date(),
    });
  }

  private setupPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = new Date();
      const timeout = 30000; // 30 seconds

      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          // Check if client is still responsive
          if (now.getTime() - client.lastPing.getTime() > timeout) {
            console.log(`Client ${clientId} timeout, disconnecting`);
            client.ws.close(1008, 'Ping timeout');
            this.clients.delete(clientId);
          } else {
            // Send ping
            client.ws.ping();
          }
        } else {
          this.clients.delete(clientId);
        }
      });
    }, 15000); // Check every 15 seconds
  }

  private setupMetricsInterval(): void {
    this.metricsInterval = setInterval(() => {
      this.broadcastMetrics();
    }, 5000); // Broadcast metrics every 5 seconds
  }

  private broadcastMetrics(): void {
    const metrics = {
      connectedClients: this.clients.size,
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      timestamp: new Date(),
      uptime: process.uptime(),
    };

    this.broadcast({
      id: uuidv4(),
      type: 'server-metrics',
      data: metrics,
      timestamp: new Date(),
    });
  }

  // Public API for broadcasting workflow events
  broadcast(message: WebSocketMessage, filter?: (client: ConnectedClient) => boolean): void {
    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        if (!filter || filter(client)) {
          this.sendToClient(clientId, message);
        }
      }
    });
  }

  broadcastWorkflowEvent(event: RealtimeEvent): void {
    const message: WebSocketMessage = {
      id: uuidv4(),
      type: event.type,
      data: event,
      timestamp: event.timestamp,
    };

    this.broadcast(message, (client) => {
      // Check if client is subscribed to this event type
      if (!client.subscriptions.eventTypes.includes(event.type)) {
        return false;
      }

      // Check if client is subscribed to this workflow
      if ('workflowId' in event && event.workflowId) {
        if (
          client.subscriptions.workflowIds.length > 0 &&
          !client.subscriptions.workflowIds.includes(event.workflowId)
        ) {
          return false;
        }
      }

      return true;
    });
  }

  getConnectedClients(): number {
    return this.clients.size;
  }

  getClientInfo(): {
    id: string;
    metadata: ConnectedClient['metadata'];
    subscriptions: ClientSubscription;
  }[] {
    return Array.from(this.clients.values()).map((client) => ({
      id: client.id,
      metadata: client.metadata,
      subscriptions: client.subscriptions,
    }));
  }
}

// Singleton instance
export const wsServer = new WorkflowWebSocketServer(parseInt(process.env.WS_PORT || '3101'));

// Auto-start in development
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  wsServer.start().catch(console.error);

  // Graceful shutdown
  process.on('SIGTERM', () => wsServer.stop());
  process.on('SIGINT', () => wsServer.stop());
}
