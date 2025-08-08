import '@repo/qa/vitest/mocks/packages/mantine';
import { beforeEach, describe, expect, vi } from 'vitest';

// Access the mocked notifications object that QA sets up
const { notifications } = vi.mocked(await import('@mantine/notifications'));
const mockMantineNotifications = notifications;

describe('mantine Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('notify.success', () => {
    test('should show success notification with correct config', async () => {
      const { notify } = await import('../mantine-notifications');

      notify.success('Operation successful');

      expect(mockMantineNotifications.show).toHaveBeenCalledWith({
        autoClose: 5000,
        color: 'green',
        icon: expect.any(Object),
        message: 'Operation successful',
        position: 'top-right',
        radius: 'md',
        styles: {
          description: { marginTop: '4px' },
          root: { paddingBottom: '12px', paddingTop: '12px' },
          title: { fontWeight: 600 },
        },
        withCloseButton: true,
      });
    });

    test('should merge custom options with default config', async () => {
      const { notify } = await import('../mantine-notifications');

      notify.success('Custom success', {
        autoClose: 3000,
        position: 'bottom-left',
        title: 'Success!',
      });

      expect(mockMantineNotifications.show).toHaveBeenCalledWith({
        autoClose: 3000, // overridden
        color: 'green',
        icon: expect.any(Object),
        message: 'Custom success',
        position: 'bottom-left', // overridden
        radius: 'md',
        styles: {
          description: { marginTop: '4px' },
          root: { paddingBottom: '12px', paddingTop: '12px' },
          title: { fontWeight: 600 },
        },
        title: 'Success!', // added
        withCloseButton: true,
      });
    });
  });

  describe('notify.error', () => {
    test('should show error notification with correct config', async () => {
      const { notify } = await import('../mantine-notifications');

      notify.error('Something went wrong');

      expect(mockMantineNotifications.show).toHaveBeenCalledWith({
        autoClose: 5000,
        color: 'red',
        icon: expect.any(Object),
        message: 'Something went wrong',
        position: 'top-right',
        radius: 'md',
        styles: {
          description: { marginTop: '4px' },
          root: { paddingBottom: '12px', paddingTop: '12px' },
          title: { fontWeight: 600 },
        },
        withCloseButton: true,
      });
    });

    test('should support custom error options', async () => {
      const { notify } = await import('../mantine-notifications');

      notify.error('Database error', {
        autoClose: false,
        title: 'Error',
      });

      expect(mockMantineNotifications.show).toHaveBeenCalledWith({
        autoClose: false, // overridden
        color: 'red',
        icon: expect.any(Object),
        message: 'Database error',
        position: 'top-right',
        radius: 'md',
        styles: {
          description: { marginTop: '4px' },
          root: { paddingBottom: '12px', paddingTop: '12px' },
          title: { fontWeight: 600 },
        },
        title: 'Error',
        withCloseButton: true,
      });
    });
  });

  describe('notify.info', () => {
    test('should show info notification with correct config', async () => {
      const { notify } = await import('../mantine-notifications');

      notify.info('Here is some information');

      expect(mockMantineNotifications.show).toHaveBeenCalledWith({
        autoClose: 5000,
        color: 'blue',
        icon: expect.any(Object),
        message: 'Here is some information',
        position: 'top-right',
        radius: 'md',
        styles: {
          description: { marginTop: '4px' },
          root: { paddingBottom: '12px', paddingTop: '12px' },
          title: { fontWeight: 600 },
        },
        withCloseButton: true,
      });
    });
  });

  describe('notify.warning', () => {
    test('should show warning notification with correct config', async () => {
      const { notify } = await import('../mantine-notifications');

      notify.warning('This is a warning');

      expect(mockMantineNotifications.show).toHaveBeenCalledWith({
        autoClose: 5000,
        color: 'yellow',
        icon: expect.any(Object),
        message: 'This is a warning',
        position: 'top-right',
        radius: 'md',
        styles: {
          description: { marginTop: '4px' },
          root: { paddingBottom: '12px', paddingTop: '12px' },
          title: { fontWeight: 600 },
        },
        withCloseButton: true,
      });
    });
  });

  describe('notification management methods', () => {
    test('should expose hide method', async () => {
      const { notify } = await import('../mantine-notifications');

      notify.hide('notification-id');

      expect(mockMantineNotifications.hide).toHaveBeenCalledWith('notification-id');
    });

    test('should expose clean method', async () => {
      const { notify } = await import('../mantine-notifications');

      notify.clean();

      expect(mockMantineNotifications.clean).toHaveBeenCalledWith();
    });

    test('should expose cleanQueue method', async () => {
      const { notify } = await import('../mantine-notifications');

      notify.cleanQueue();

      expect(mockMantineNotifications.cleanQueue).toHaveBeenCalledWith();
    });

    test('should expose custom method for direct Mantine access', async () => {
      const { notify } = await import('../mantine-notifications');

      const customConfig = {
        autoClose: 1000,
        color: 'orange',
        message: 'Custom notification',
      };

      notify.custom(customConfig);

      expect(mockMantineNotifications.show).toHaveBeenCalledWith(customConfig);
    });

    test('should expose update method', async () => {
      const { notify } = await import('../mantine-notifications');

      const updateConfig = {
        id: 'notification-id',
        color: 'green',
        message: 'Updated message',
      };

      notify.update(updateConfig);

      expect(mockMantineNotifications.update).toHaveBeenCalledWith(updateConfig);
    });
  });

  describe('default configuration', () => {
    test('should have consistent default config across notification types', async () => {
      const { notify } = await import('../mantine-notifications');

      const expectedDefaults = {
        autoClose: 5000,
        position: 'top-right',
        radius: 'md',
        styles: {
          description: { marginTop: '4px' },
          root: { paddingBottom: '12px', paddingTop: '12px' },
          title: { fontWeight: 600 },
        },
        withCloseButton: true,
      };

      notify.success('test');
      notify.error('test');
      notify.info('test');
      notify.warning('test');

      // All calls should include the same default config
      expect(mockMantineNotifications.show).toHaveBeenCalledTimes(4);

      const calls = vi.mocked(mockMantineNotifications.show).mock.calls;
      calls.forEach((call: any) => {
        const config = call[0];
        expect(config).toMatchObject(expectedDefaults);
      });
    });

    test('should apply type-specific colors and icons', async () => {
      const { notify } = await import('../mantine-notifications');

      notify.success('success');
      notify.error('error');
      notify.info('info');
      notify.warning('warning');

      const calls = vi.mocked(mockMantineNotifications.show).mock.calls;

      // Success notification
      expect(calls[0][0]).toMatchObject({
        color: 'green',
        icon: expect.any(Object),
        message: 'success',
      });

      // Error notification
      expect(calls[1][0]).toMatchObject({
        color: 'red',
        icon: expect.any(Object),
        message: 'error',
      });

      // Info notification
      expect(calls[2][0]).toMatchObject({
        color: 'blue',
        icon: expect.any(Object),
        message: 'info',
      });

      // Warning notification
      expect(calls[3][0]).toMatchObject({
        color: 'yellow',
        icon: expect.any(Object),
        message: 'warning',
      });
    });
  });

  describe('icon rendering', () => {
    test('should include icons in notification calls', async () => {
      const { notify } = await import('../mantine-notifications');

      notify.success('test');
      notify.error('test');
      notify.info('test');
      notify.warning('test');

      // Verify that all notification calls include icon objects
      const calls = vi.mocked(mockMantineNotifications.show).mock.calls;
      calls.forEach((call: any) => {
        expect(call[0]).toHaveProperty('icon');
        expect(call[0].icon).toStrictEqual(expect.any(Object));
      });
    });
  });

  describe('module exports', () => {
    test('should export notify object with all methods', async () => {
      const module = await import('../mantine-notifications');

      expect(module.notify).toBeDefined();
      expect(typeof module.notify.success).toBe('function');
      expect(typeof module.notify.error).toBe('function');
      expect(typeof module.notify.info).toBe('function');
      expect(typeof module.notify.warning).toBe('function');
      expect(typeof module.notify.hide).toBe('function');
      expect(typeof module.notify.clean).toBe('function');
      expect(typeof module.notify.cleanQueue).toBe('function');
      expect(typeof module.notify.custom).toBe('function');
      expect(typeof module.notify.update).toBe('function');
    });

    test('should re-export NotificationsProvider', async () => {
      const module = await import('../mantine-notifications');

      expect(module.NotificationsProvider).toBeDefined();
      expect(typeof module.NotificationsProvider).toBe('function');
    });
  });

  describe('option merging', () => {
    test('should override default styles when custom styles provided', async () => {
      const { notify } = await import('../mantine-notifications');

      const customStyles = {
        root: { backgroundColor: 'red' },
        title: { fontSize: '18px' },
      };

      notify.success('test', { styles: customStyles });

      expect(mockMantineNotifications.show).toHaveBeenCalledWith({
        autoClose: 5000,
        color: 'green',
        icon: expect.any(Object),
        message: 'test',
        position: 'top-right',
        radius: 'md',
        styles: customStyles, // should be completely overridden
        withCloseButton: true,
      });
    });

    test('should handle undefined options gracefully', async () => {
      const { notify } = await import('../mantine-notifications');

      notify.success('test', undefined);

      expect(mockMantineNotifications.show).toHaveBeenCalledWith({
        autoClose: 5000,
        color: 'green',
        icon: expect.any(Object),
        message: 'test',
        position: 'top-right',
        radius: 'md',
        styles: {
          description: { marginTop: '4px' },
          root: { paddingBottom: '12px', paddingTop: '12px' },
          title: { fontWeight: 600 },
        },
        withCloseButton: true,
      });
    });
  });

  describe('type safety', () => {
    test('should accept valid NotificationData options', async () => {
      const { notify } = await import('../mantine-notifications');

      // Should not throw TypeScript errors (compile-time check)
      expect(() => {
        notify.success('test', {
          autoClose: 3000,
          position: 'bottom-right',
          radius: 'lg',
          title: 'Success',
          withCloseButton: false,
        });
      }).not.toThrow();
    });
  });
});
