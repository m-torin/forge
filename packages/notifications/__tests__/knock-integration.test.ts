// @ts-nocheck - This test file uses mocked Knock SDK that doesn't match exact types
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Knock SDK with proper structure to match the actual SDK API
const mockKnock = {
  messages: {
    batchSetStatus: vi.fn(),
    get: vi.fn(),
    list: vi.fn(),
    setStatus: vi.fn(),
  },
  notify: vi.fn(),
  tenants: {
    create: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
  },
  users: {
    identify: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
  },
  workflows: {
    cancel: vi.fn(),
    trigger: vi.fn(),
  },
} as any;

const MockKnockConstructor = vi.fn().mockImplementation(() => mockKnock);

vi.mock('@knocklabs/node', () => ({
  Knock: MockKnockConstructor,
}));

// Mock the keys module
const mockKeys = vi.fn();
vi.mock('../keys', () => ({
  keys: mockKeys,
}));

describe('Knock Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // Reset warning state
    (global as any).hasLoggedWarning = false;

    // Clear console.warn spy
    vi.clearAllMocks();
  });

  describe('with valid Knock API key', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        KNOCK_SECRET_API_KEY: 'sk_test_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      });
    });

    it('should initialize Knock instance with API key', async () => {
      await import('../index');

      expect(MockKnockConstructor).toHaveBeenCalledWith({
        apiKey: 'sk_test_123456789',
      });
    });

    it('should provide access to Knock methods through proxy', async () => {
      const { notifications } = await import('../index');

      expect(notifications.notify).toBe(mockKnock.notify);
      expect(notifications.users).toBe(mockKnock.users);
      expect(notifications.workflows).toBe(mockKnock.workflows);
      expect(notifications.messages).toBe(mockKnock.messages);
    });

    it('should support user identification', async () => {
      const { notifications } = await import('../index');

      const userData = {
        id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockKnock.users.identify.mockResolvedValue({ success: true });

      const result = await notifications.users.identify('user_123', userData);

      expect(mockKnock.users.identify).toHaveBeenCalledWith('user_123', userData);
      expect(result).toEqual({ success: true });
    });

    it('should support workflow triggering', async () => {
      const { notifications } = await import('../index');

      const workflowData = {
        data: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        recipients: ['user_123'],
        workflow: 'welcome-email',
      };

      mockKnock.workflows.trigger.mockResolvedValue({
        workflow_run_id: 'run_123',
        status: 'queued',
      });

      const result = await notifications.workflows.trigger(workflowData);

      expect(mockKnock.workflows.trigger).toHaveBeenCalledWith(workflowData);
      expect(result).toEqual({
        workflow_run_id: 'run_123',
        status: 'queued',
      });
    });

    it('should support notification sending', async () => {
      const { notifications } = await import('../index');

      const notificationData = {
        data: {
          comment: 'Hello world!',
        },
        template: 'new-comment',
        users: ['user_123'],
      };

      mockKnock.notify.mockResolvedValue({
        message_id: 'msg_123',
        status: 'sent',
      });

      const result = await notifications.notify(notificationData);

      expect(mockKnock.notify).toHaveBeenCalledWith(notificationData);
      expect(result).toEqual({
        message_id: 'msg_123',
        status: 'sent',
      });
    });

    it('should support message operations', async () => {
      const { notifications } = await import('../index');

      mockKnock.messages.get.mockResolvedValue({
        id: 'msg_123',
        recipient: 'user_123',
        status: 'delivered',
      });

      const result = await notifications.messages.get('msg_123');

      expect(mockKnock.messages.get).toHaveBeenCalledWith('msg_123');
      expect(result).toEqual({
        id: 'msg_123',
        recipient: 'user_123',
        status: 'delivered',
      });
    });

    it('should support message status updates', async () => {
      const { notifications } = await import('../index');

      mockKnock.messages.setStatus.mockResolvedValue({ success: true });

      const result = await notifications.messages.setStatus('msg_123', 'read');

      expect(mockKnock.messages.setStatus).toHaveBeenCalledWith('msg_123', 'read');
      expect(result).toEqual({ success: true });
    });

    it('should support tenant operations', async () => {
      const { notifications } = await import('../index');

      const tenantData = {
        id: 'tenant_123',
        name: 'Acme Corp',
        settings: {
          branding: {
            primary_color: '#007bff',
          },
        },
      };

      mockKnock.tenants.create.mockResolvedValue(tenantData);

      const result = await notifications.tenants.create('tenant_123', tenantData);

      expect(mockKnock.tenants.create).toHaveBeenCalledWith('tenant_123', tenantData);
      expect(result).toEqual(tenantData);
    });
  });

  describe('without Knock API key', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        KNOCK_SECRET_API_KEY: undefined,
        NEXT_PUBLIC_KNOCK_API_KEY: undefined,
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
      });
    });

    it('should use fallback API key when none provided', async () => {
      await import('../index');

      expect(MockKnockConstructor).toHaveBeenCalledWith({
        apiKey: 'test-knock-key',
      });
    });

    it('should not log warning when fallback key is used', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { notifications } = await import('../index');

      // Access a property to trigger potential warning
      notifications.notify;

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should provide access to Knock methods with fallback key', async () => {
      const { notifications } = await import('../index');

      expect(notifications.notify).toBe(mockKnock.notify);
      expect(notifications.users).toBe(mockKnock.users);
    });
  });

  describe('with empty API key', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        KNOCK_SECRET_API_KEY: '',
        NEXT_PUBLIC_KNOCK_API_KEY: '',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: '',
      });
    });

    it('should use fallback key when API key is empty string', async () => {
      await import('../index');

      expect(MockKnockConstructor).toHaveBeenCalledWith({
        apiKey: 'test-knock-key',
      });
    });
  });

  describe('proxy behavior', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        KNOCK_SECRET_API_KEY: 'sk_test_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      });
    });

    it('should initialize Knock on first property access', async () => {
      const { notifications } = await import('../index');

      // Knock should be initialized during module import
      expect(MockKnockConstructor).toHaveBeenCalledTimes(1);

      // Accessing properties should not create new instances
      notifications.notify;
      notifications.users;

      expect(MockKnockConstructor).toHaveBeenCalledTimes(1);
    });

    it('should forward all property access to Knock instance', async () => {
      const { notifications } = await import('../index');

      // Mock additional properties
      (mockKnock as any).customProperty = { test: vi.fn() };

      expect(notifications.notify).toBe(mockKnock.notify);
      expect(notifications.users).toBe(mockKnock.users);
      expect((notifications as any).customProperty).toBe((mockKnock as any).customProperty);
    });

    it('should return undefined for non-existent properties', async () => {
      const { notifications } = await import('../index');

      const nonExistentProperty = (notifications as any).nonExistentProperty;

      expect(nonExistentProperty).toBeUndefined();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        KNOCK_SECRET_API_KEY: 'sk_test_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      });
    });

    it('should propagate Knock API errors', async () => {
      const { notifications } = await import('../index');

      const error = new Error('Invalid API key');
      mockKnock.notify.mockRejectedValue(error);

      await expect(
        notifications.notify({
          template: 'test',
          users: ['user_123'],
        }),
      ).rejects.toThrow('Invalid API key');
    });

    it('should handle Knock constructor errors', async () => {
      MockKnockConstructor.mockImplementationOnce(() => {
        throw new Error('Knock initialization failed');
      });

      await expect(() => import('../index')).rejects.toThrow('Knock initialization failed');
    });

    it('should handle keys function errors', async () => {
      mockKeys.mockImplementation(() => {
        throw new Error('Keys configuration error');
      });

      await expect(() => import('../index')).rejects.toThrow('Keys configuration error');
    });
  });

  describe('API compatibility', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        KNOCK_SECRET_API_KEY: 'sk_test_123456789',
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      });
    });

    it('should support all Knock SDK user methods', async () => {
      const { notifications } = await import('../index');

      expect(notifications.users.identify).toBe(mockKnock.users.identify);
      expect(notifications.users.get).toBe(mockKnock.users.get);
      expect(notifications.users.update).toBe(mockKnock.users.update);
      expect(notifications.users.delete).toBe(mockKnock.users.delete);
      expect(notifications.users.list).toBe(mockKnock.users.list);
    });

    it('should support all Knock SDK workflow methods', async () => {
      const { notifications } = await import('../index');

      expect(notifications.workflows.trigger).toBe(mockKnock.workflows.trigger);
      expect(notifications.workflows.cancel).toBe(mockKnock.workflows.cancel);
    });

    it('should support all Knock SDK message methods', async () => {
      const { notifications } = await import('../index');

      expect(notifications.messages.get).toBe(mockKnock.messages.get);
      expect(notifications.messages.list).toBe(mockKnock.messages.list);
      expect(notifications.messages.setStatus).toBe(mockKnock.messages.setStatus);
      expect(notifications.messages.batchSetStatus).toBe(mockKnock.messages.batchSetStatus);
    });

    it('should support all Knock SDK tenant methods', async () => {
      const { notifications } = await import('../index');

      expect(notifications.tenants.get).toBe(mockKnock.tenants.get);
      expect(notifications.tenants.list).toBe(mockKnock.tenants.list);
      expect(notifications.tenants.create).toBe(mockKnock.tenants.create);
      expect(notifications.tenants.update).toBe(mockKnock.tenants.update);
      expect(notifications.tenants.delete).toBe(mockKnock.tenants.delete);
    });
  });
});
