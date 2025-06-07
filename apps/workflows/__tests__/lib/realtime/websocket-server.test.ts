import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorkflowWebSocketServer } from '@/lib/realtime/websocket-server';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

// Mock ws module
vi.mock('ws');

// Mock http module
vi.mock('http');

// Mock uuid
let uuidCounter = 0;
vi.mock('uuid', () => ({
  v4: vi.fn(() => `mock-uuid-${++uuidCounter}`),
}));

describe('WorkflowWebSocketServer', () => {
  let server: WorkflowWebSocketServer;
  let mockHttpServer: any;
  let mockWSS: any;
  let mockWS: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset UUID counter
    uuidCounter = 0;

    // Setup HTTP server mock
    mockHttpServer = {
      listen: vi.fn((port, callback) => callback()),
      close: vi.fn((callback) => callback()),
    };
    vi.mocked(createServer).mockReturnValue(mockHttpServer);

    // Setup WebSocket server mock
    mockWSS = {
      on: vi.fn(),
      close: vi.fn((callback) => callback()),
    };
    vi.mocked(WebSocketServer).mockImplementation(() => mockWSS);

    // Setup WebSocket mock
    mockWS = {
      send: vi.fn(),
      close: vi.fn(),
      ping: vi.fn(),
      on: vi.fn(),
      readyState: WebSocket.OPEN,
    };

    server = new WorkflowWebSocketServer(3102);
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
    vi.clearAllTimers();
  });

  describe('server lifecycle', () => {
    it('should start server successfully', async () => {
      await server.start();

      expect(createServer).toHaveBeenCalled();
      expect(WebSocketServer).toHaveBeenCalledWith({
        server: mockHttpServer,
        path: '/ws',
      });
      expect(mockHttpServer.listen).toHaveBeenCalledWith(3102, expect.any(Function));
    });

    it('should not start server if already running', async () => {
      await server.start();

      // Try to start again
      await server.start();

      // Should only be called once
      expect(createServer).toHaveBeenCalledTimes(1);
    });

    it('should handle server start errors', async () => {
      const error = new Error('Port already in use');
      mockHttpServer.listen.mockImplementation((port: any, callback: any) => callback(error));

      await expect(server.start()).rejects.toThrow('Port already in use');
    });

    it('should stop server successfully', async () => {
      await server.start();
      await server.stop();

      expect(mockWSS.close).toHaveBeenCalled();
      expect(mockHttpServer.close).toHaveBeenCalled();
    });

    it('should not error when stopping server that is not running', async () => {
      await expect(server.stop()).resolves.not.toThrow();
    });
  });

  describe('client connections', () => {
    let connectionHandler: Function;

    beforeEach(async () => {
      await server.start();

      // Get the connection handler
      const onCall = mockWSS.on.mock.calls.find((call: any) => call[0] === 'connection');
      connectionHandler = onCall[1];
    });

    it('should handle new client connections', () => {
      const mockRequest = {
        url: '/ws',
        headers: {
          'user-agent': 'test-browser',
        },
        socket: {
          remoteAddress: '127.0.0.1',
        },
      };

      connectionHandler(mockWS, mockRequest);

      expect(mockWS.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockWS.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockWS.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockWS.on).toHaveBeenCalledWith('pong', expect.any(Function));
      expect(mockWS.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"connection-established"'),
      );
    });

    it('should send welcome message with client info', () => {
      const mockRequest = {
        url: '/ws',
        headers: { 'user-agent': 'test-browser' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      connectionHandler(mockWS, mockRequest);

      expect(mockWS.send).toHaveBeenCalledWith(expect.stringContaining('"clientId":"mock-uuid-1"'));
      expect(mockWS.send).toHaveBeenCalledWith(expect.stringContaining('"supportedEvents"'));
    });

    it('should track connected clients', () => {
      const mockRequest = {
        url: '/ws',
        headers: {},
        socket: {},
      };

      connectionHandler(mockWS, mockRequest);

      expect(server.getConnectedClients()).toBe(1);
    });

    it('should handle client disconnection', () => {
      const mockRequest = {
        url: '/ws',
        headers: {},
        socket: {},
      };

      connectionHandler(mockWS, mockRequest);
      expect(server.getConnectedClients()).toBe(1);

      // Get the close handler and call it
      const closeCall = mockWS.on.mock.calls.find((call: any) => call[0] === 'close');
      const closeHandler = closeCall[1];
      closeHandler(1000, Buffer.from('Normal closure'));

      expect(server.getConnectedClients()).toBe(0);
    });

    it('should handle client errors', () => {
      const mockRequest = {
        url: '/ws',
        headers: {},
        socket: {},
      };

      connectionHandler(mockWS, mockRequest);
      expect(server.getConnectedClients()).toBe(1);

      // Get the error handler and call it
      const errorCall = mockWS.on.mock.calls.find((call: any) => call[0] === 'error');
      const errorHandler = errorCall[1];
      errorHandler(new Error('WebSocket error'));

      expect(server.getConnectedClients()).toBe(0);
    });
  });

  describe('message handling', () => {
    let connectionHandler: Function;
    let messageHandler: Function;

    beforeEach(async () => {
      await server.start();

      const onCall = mockWSS.on.mock.calls.find((call: any) => call[0] === 'connection');
      connectionHandler = onCall[1];

      const mockRequest = {
        url: '/ws',
        headers: {},
        socket: {},
      };

      connectionHandler(mockWS, mockRequest);

      // Get the message handler
      const messageCall = mockWS.on.mock.calls.find((call: any) => call[0] === 'message');
      messageHandler = messageCall[1];
    });

    it('should handle subscribe messages', () => {
      const subscribeMessage = {
        type: 'subscribe',
        data: {
          workflowIds: ['workflow-1', 'workflow-2'],
          eventTypes: ['workflow-started', 'workflow-completed'],
        },
      };

      messageHandler(Buffer.from(JSON.stringify(subscribeMessage)));

      expect(mockWS.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"subscription-updated"'),
      );
    });

    it('should handle unsubscribe messages', () => {
      // First subscribe
      const subscribeMessage = {
        type: 'subscribe',
        data: {
          workflowIds: ['workflow-1', 'workflow-2'],
          eventTypes: ['workflow-started', 'workflow-completed'],
        },
      };
      messageHandler(Buffer.from(JSON.stringify(subscribeMessage)));

      // Then unsubscribe
      const unsubscribeMessage = {
        type: 'unsubscribe',
        data: {
          workflowIds: ['workflow-1'],
        },
      };
      messageHandler(Buffer.from(JSON.stringify(unsubscribeMessage)));

      expect(mockWS.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"subscription-updated"'),
      );
    });

    it('should handle ping messages', () => {
      const pingMessage = {
        type: 'ping',
      };

      messageHandler(Buffer.from(JSON.stringify(pingMessage)));

      expect(mockWS.send).toHaveBeenCalledWith(expect.stringContaining('"type":"pong"'));
    });

    it('should handle invalid JSON messages', () => {
      messageHandler(Buffer.from('invalid json'));

      expect(mockWS.send).toHaveBeenCalledWith(expect.stringContaining('"type":"error"'));
      expect(mockWS.send).toHaveBeenCalledWith(expect.stringContaining('Invalid JSON message'));
    });

    it('should handle unknown message types', () => {
      const unknownMessage = {
        type: 'unknown-type',
      };

      messageHandler(Buffer.from(JSON.stringify(unknownMessage)));

      expect(mockWS.send).toHaveBeenCalledWith(expect.stringContaining('"type":"error"'));
      expect(mockWS.send).toHaveBeenCalledWith(expect.stringContaining('Unknown message type'));
    });
  });

  describe('broadcasting', () => {
    let connectionHandler: Function;

    beforeEach(async () => {
      await server.start();

      const onCall = mockWSS.on.mock.calls.find((call: any) => call[0] === 'connection');
      connectionHandler = onCall[1];
    });

    it('should broadcast messages to all connected clients', () => {
      // Create separate mock WebSocket instances for each client
      const mockWS1 = {
        send: vi.fn(),
        close: vi.fn(),
        ping: vi.fn(),
        on: vi.fn(),
        readyState: WebSocket.OPEN,
      };
      const mockWS2 = {
        send: vi.fn(),
        close: vi.fn(),
        ping: vi.fn(),
        on: vi.fn(),
        readyState: WebSocket.OPEN,
      };

      // Connect first client
      connectionHandler(mockWS1, { url: '/ws', headers: {}, socket: {} });

      // Connect second client
      connectionHandler(mockWS2, { url: '/ws', headers: {}, socket: {} });

      // Verify clients are connected
      expect(server.getConnectedClients()).toBe(2);

      // Clear the welcome message sends before testing broadcast
      mockWS1.send.mockClear();
      mockWS2.send.mockClear();

      const message = {
        id: 'test-message',
        type: 'test-broadcast',
        timestamp: new Date(),
        data: { test: 'data' },
      };

      server.broadcast(message);

      // Both clients should receive the broadcast message
      expect(mockWS1.send).toHaveBeenCalledWith(JSON.stringify(message));
      expect(mockWS2.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('should not broadcast to closed connections', () => {
      const mockClosedWS = {
        ...mockWS,
        send: vi.fn(),
        readyState: WebSocket.CLOSED,
      };

      connectionHandler(mockClosedWS, { url: '/ws', headers: {}, socket: {} });

      const message = {
        id: 'test-message',
        type: 'test-broadcast',
        timestamp: new Date(),
        data: { test: 'data' },
      };

      server.broadcast(message);

      expect(mockClosedWS.send).not.toHaveBeenCalled();
    });

    it('should broadcast workflow events with filtering', () => {
      // Connect client and subscribe to specific workflow
      connectionHandler(mockWS, { url: '/ws', headers: {}, socket: {} });

      // Subscribe to specific workflow
      const messageCall = mockWS.on.mock.calls.find((call: any) => call[0] === 'message');
      const messageHandler = messageCall[1];

      const subscribeMessage = {
        type: 'subscribe',
        data: {
          workflowIds: ['workflow-1'],
          eventTypes: ['workflow-started'],
        },
      };
      messageHandler(Buffer.from(JSON.stringify(subscribeMessage)));

      // Clear previous sends
      mockWS.send.mockClear();

      // Broadcast workflow event for subscribed workflow
      server.broadcastWorkflowEvent({
        type: 'workflow-started',
        workflowId: 'workflow-1',
        executionId: 'exec-1',
        timestamp: new Date(),
        data: {},
      });

      expect(mockWS.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"workflow-started"'),
      );

      // Clear and test filtering
      mockWS.send.mockClear();

      // Broadcast workflow event for different workflow
      server.broadcastWorkflowEvent({
        type: 'workflow-started',
        workflowId: 'workflow-2',
        executionId: 'exec-2',
        timestamp: new Date(),
        data: {},
      });

      expect(mockWS.send).not.toHaveBeenCalled();
    });
  });

  describe('ping/pong mechanism', () => {
    it('should setup ping interval', async () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');

      await server.start();

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 15000);
    });

    it('should update last ping time on pong', async () => {
      await server.start();

      const onCall = mockWSS.on.mock.calls.find((call: any) => call[0] === 'connection');
      const connectionHandler = onCall[1];

      connectionHandler(mockWS, { url: '/ws', headers: {}, socket: {} });

      // Get the pong handler
      const pongCall = mockWS.on.mock.calls.find((call: any) => call[0] === 'pong');
      const pongHandler = pongCall[1];

      // Simulate pong response
      pongHandler();

      // Should not throw or cause issues
      expect(server.getConnectedClients()).toBe(1);
    });
  });

  describe('metrics broadcasting', () => {
    it('should setup metrics interval', async () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');

      await server.start();

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    });
  });

  describe('client info', () => {
    it('should return client information', async () => {
      await server.start();

      const onCall = mockWSS.on.mock.calls.find((call: any) => call[0] === 'connection');
      const connectionHandler = onCall[1];

      const mockRequest = {
        url: '/ws',
        headers: { 'user-agent': 'test-browser' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      connectionHandler(mockWS, mockRequest);

      const clientInfo = server.getClientInfo();

      expect(clientInfo).toHaveLength(1);
      expect(clientInfo[0]).toEqual({
        id: 'mock-uuid-1',
        metadata: {
          userAgent: 'test-browser',
          ip: '127.0.0.1',
          connectedAt: expect.any(Date),
        },
        subscriptions: {
          clientId: 'mock-uuid-1',
          workflowIds: [],
          eventTypes: ['workflow-started', 'workflow-completed', 'workflow-failed'],
        },
      });
    });
  });

  describe('error handling', () => {
    it('should handle WebSocket server errors', async () => {
      await server.start();

      const errorCall = mockWSS.on.mock.calls.find((call: any) => call[0] === 'error');
      const errorHandler = errorCall[1];

      // Should not throw when handling server errors
      expect(() => errorHandler(new Error('Server error'))).not.toThrow();
    });

    it('should handle send errors gracefully', async () => {
      await server.start();

      const onCall = mockWSS.on.mock.calls.find((call: any) => call[0] === 'connection');
      const connectionHandler = onCall[1];

      // Mock WebSocket that will succeed for the welcome message but fail for broadcast
      let sendCallCount = 0;
      const failingWS = {
        ...mockWS,
        send: vi.fn(() => {
          sendCallCount++;
          if (sendCallCount > 1) {
            // Fail after welcome message
            throw new Error('Send failed');
          }
        }),
        readyState: WebSocket.OPEN,
        on: vi.fn(),
      };

      connectionHandler(failingWS, { url: '/ws', headers: {}, socket: {} });

      expect(server.getConnectedClients()).toBe(1);

      // Try to broadcast - should handle error and remove client
      server.broadcast({
        id: 'test',
        type: 'test',
        timestamp: new Date(),
        data: {},
      });

      expect(server.getConnectedClients()).toBe(0);
    });
  });

  describe('shutdown cleanup', () => {
    it('should clean up intervals on stop', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      await server.start();
      await server.stop();

      expect(clearIntervalSpy).toHaveBeenCalledTimes(2); // ping and metrics intervals
    });

    it('should close all client connections on stop', async () => {
      await server.start();

      const onCall = mockWSS.on.mock.calls.find((call: any) => call[0] === 'connection');
      const connectionHandler = onCall[1];

      connectionHandler(mockWS, { url: '/ws', headers: {}, socket: {} });

      await server.stop();

      expect(mockWS.close).toHaveBeenCalledWith(1000, 'Server shutting down');
    });
  });
});
