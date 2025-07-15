import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock the env module
const mockSafeEnv = vi.fn();
vi.mock('../env', () => ({
  safeEnv: mockSafeEnv,
}));

// Mock Knock React components with simpler implementations
vi.mock('@knocklabs/react', () => ({
  KnockFeedProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="knock-feed-provider">{children}</div>
  ),
  KnockProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="knock-provider">{children}</div>
  ),
  NotificationFeedPopover: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? <div data-testid="notification-feed-popover">Feed</div> : null,
  NotificationIconButton: React.forwardRef<HTMLButtonElement, any>(({ onClick }, ref: any) => (
    <button data-testid="notification-icon-button" ref={ref} onClick={onClick}>
      🔔
    </button>
  )),
}));

// Mock CSS imports
vi.mock('@knocklabs/react/dist/index.css', () => ({}));
vi.mock('../styles.css', () => ({}));

describe('notifications Components Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('notificationsProvider', () => {
    describe('with valid configuration', () => {
      beforeEach(() => {
        mockSafeEnv.mockReturnValue({
          NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
        });
      });

      test('should render children within Knock providers when keys are available', async () => {
        const { NotificationsProvider } = await import('../components/provider');

        render(
          <NotificationsProvider userId="user_123">
            <div data-testid="test-child">Test Content</div>
          </NotificationsProvider>,
        );

        expect(screen.getByTestId('knock-provider')).toBeInTheDocument();
        expect(screen.getByTestId('knock-feed-provider')).toBeInTheDocument();
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
      });

      test('should nest providers correctly', async () => {
        const { NotificationsProvider } = await import('../components/provider');

        render(
          <NotificationsProvider userId="user_123">
            <div data-testid="content">Content</div>
          </NotificationsProvider>,
        );

        const knockProvider = screen.getByTestId('knock-provider');
        const knockFeedProvider = screen.getByTestId('knock-feed-provider');
        const content = screen.getByTestId('content');

        expect(knockProvider).toContainElement(knockFeedProvider);
        expect(knockFeedProvider).toContainElement(content);
      });
    });

    describe('without required keys', () => {
      test('should render children directly when API key is missing', async () => {
        mockSafeEnv.mockReturnValue({
          NEXT_PUBLIC_KNOCK_API_KEY: undefined,
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
        });

        const { NotificationsProvider } = await import('../components/provider');

        render(
          <NotificationsProvider userId="user_123">
            <div data-testid="test-child">Direct Content</div>
          </NotificationsProvider>,
        );

        expect(screen.queryByTestId('knock-provider')).not.toBeInTheDocument();
        expect(screen.queryByTestId('knock-feed-provider')).not.toBeInTheDocument();
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
      });

      test('should render children directly when feed channel ID is missing', async () => {
        mockSafeEnv.mockReturnValue({
          NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
        });

        const { NotificationsProvider } = await import('../components/provider');

        render(
          <NotificationsProvider userId="user_123">
            <div data-testid="test-child">Direct Content</div>
          </NotificationsProvider>,
        );

        expect(screen.queryByTestId('knock-provider')).not.toBeInTheDocument();
        expect(screen.queryByTestId('knock-feed-provider')).not.toBeInTheDocument();
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
      });
    });
  });

  describe('notificationsTrigger', () => {
    describe('with valid API key', () => {
      beforeEach(() => {
        mockSafeEnv.mockReturnValue({
          NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
        });
      });

      test('should render notification button when API key is available', async () => {
        const { NotificationsTrigger } = await import('../components/trigger');

        render(<NotificationsTrigger />);

        expect(screen.getByTestId('notification-icon-button')).toBeInTheDocument();
      });

      test('should not show popover initially', async () => {
        const { NotificationsTrigger } = await import('../components/trigger');

        render(<NotificationsTrigger />);

        expect(screen.queryByTestId('notification-feed-popover')).not.toBeInTheDocument();
      });

      test('should show popover when button is clicked', async () => {
        const { NotificationsTrigger } = await import('../components/trigger');

        render(<NotificationsTrigger />);

        const button = screen.getByTestId('notification-icon-button');
        await user.click(button);

        expect(screen.getByTestId('notification-feed-popover')).toBeInTheDocument();
      });

      test('should toggle popover visibility on button clicks', async () => {
        const { NotificationsTrigger } = await import('../components/trigger');

        render(<NotificationsTrigger />);

        const button = screen.getByTestId('notification-icon-button');

        // Initially hidden
        expect(screen.queryByTestId('notification-feed-popover')).not.toBeInTheDocument();

        // First click - show
        await user.click(button);
        expect(screen.getByTestId('notification-feed-popover')).toBeInTheDocument();

        // Second click - hide
        await user.click(button);
        expect(screen.queryByTestId('notification-feed-popover')).not.toBeInTheDocument();

        // Third click - show again
        await user.click(button);
        expect(screen.getByTestId('notification-feed-popover')).toBeInTheDocument();
      });

      test('should handle multiple rapid clicks correctly', async () => {
        const { NotificationsTrigger } = await import('../components/trigger');

        render(<NotificationsTrigger />);

        const button = screen.getByTestId('notification-icon-button');

        // Multiple rapid clicks
        await user.click(button);
        await user.click(button);
        await user.click(button);

        // Should end up visible (odd number of clicks)
        expect(screen.getByTestId('notification-feed-popover')).toBeInTheDocument();
      });

      test('should handle keyboard interactions', async () => {
        const { NotificationsTrigger } = await import('../components/trigger');

        render(<NotificationsTrigger />);

        const button = screen.getByTestId('notification-icon-button');

        button.focus();
        expect(button).toHaveFocus();

        // Button should be interactive
        fireEvent.keyDown(button, { key: 'Enter' });
        // Note: The actual Enter key handling is typically in the Knock component
      });
    });

    describe('without API key', () => {
      beforeEach(() => {
        mockSafeEnv.mockReturnValue({
          NEXT_PUBLIC_KNOCK_API_KEY: undefined,
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
        });
      });

      test('should return null when API key is missing', async () => {
        const { NotificationsTrigger } = await import('../components/trigger');

        const { container } = render(<NotificationsTrigger />);

        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByTestId('notification-icon-button')).not.toBeInTheDocument();
        expect(screen.queryByTestId('notification-feed-popover')).not.toBeInTheDocument();
      });

      test('should return null when API key is empty string', async () => {
        mockSafeEnv.mockReturnValue({
          NEXT_PUBLIC_KNOCK_API_KEY: '',
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
        });

        const { NotificationsTrigger } = await import('../components/trigger');

        const { container } = render(<NotificationsTrigger />);

        expect(container).toBeEmptyDOMElement();
      });
    });
  });

  describe('keys integration', () => {
    test('should call keys function when components are rendered', async () => {
      mockSafeEnv.mockReturnValue({
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      });

      const { NotificationsProvider } = await import('../components/provider');
      const { NotificationsTrigger } = await import('../components/trigger');

      render(
        <NotificationsProvider userId="user_123">
          <NotificationsTrigger />
        </NotificationsProvider>,
      );

      expect(mockSafeEnv).toHaveBeenCalledWith();
    });

    test('should handle changing key values', async () => {
      // Start with valid keys
      mockSafeEnv.mockReturnValue({
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      });

      const { NotificationsProvider } = await import('../components/provider');

      const { rerender } = render(
        <NotificationsProvider userId="user_123">
          <div data-testid="content">Content</div>
        </NotificationsProvider>,
      );

      expect(screen.getByTestId('knock-provider')).toBeInTheDocument();

      // Change to invalid keys and re-render
      mockSafeEnv.mockReturnValue({
        NEXT_PUBLIC_KNOCK_API_KEY: undefined,
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
      });

      rerender(
        <NotificationsProvider userId="user_123">
          <div data-testid="content">Content</div>
        </NotificationsProvider>,
      );

      // Should still show the provider since keys are evaluated at module level
      expect(screen.getByTestId('knock-provider')).toBeInTheDocument();
    });
  });

  describe('component cleanup and unmounting', () => {
    beforeEach(() => {
      mockSafeEnv.mockReturnValue({
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      });
    });

    test('should handle provider unmounting without errors', async () => {
      const { NotificationsProvider } = await import('../components/provider');

      const { unmount } = render(
        <NotificationsProvider userId="user_123">
          <div>Content</div>
        </NotificationsProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });

    test('should handle trigger unmounting without errors', async () => {
      const { NotificationsTrigger } = await import('../components/trigger');

      const { unmount } = render(<NotificationsTrigger />);

      expect(() => unmount()).not.toThrow();
    });

    test('should handle unmounting with popover visible', async () => {
      const { NotificationsTrigger } = await import('../components/trigger');

      const { unmount } = render(<NotificationsTrigger />);

      const button = screen.getByTestId('notification-icon-button');
      await user.click(button);

      expect(screen.getByTestId('notification-feed-popover')).toBeInTheDocument();
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('component re-rendering', () => {
    beforeEach(() => {
      mockSafeEnv.mockReturnValue({
        NEXT_PUBLIC_KNOCK_API_KEY: 'pk_test_123456789',
        NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: 'channel_123',
      });
    });

    test('should handle userId prop changes', async () => {
      const { NotificationsProvider } = await import('../components/provider');

      const { rerender } = render(
        <NotificationsProvider userId="user_1">
          <div data-testid="content">Content</div>
        </NotificationsProvider>,
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();

      rerender(
        <NotificationsProvider userId="user_2">
          <div data-testid="content">Content</div>
        </NotificationsProvider>,
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    test('should handle children changes', async () => {
      const { NotificationsProvider } = await import('../components/provider');

      const { rerender } = render(
        <NotificationsProvider userId="user_123">
          <div data-testid="content-1">Content 1</div>
        </NotificationsProvider>,
      );

      expect(screen.getByTestId('content-1')).toBeInTheDocument();

      rerender(
        <NotificationsProvider userId="user_123">
          <div data-testid="content-2">Content 2</div>
        </NotificationsProvider>,
      );

      expect(screen.queryByTestId('content-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('content-2')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    test('should handle keys function throwing error in provider', async () => {
      mockSafeEnv.mockImplementation(() => {
        throw new Error('Keys configuration error');
      });

      // Since the keys() call happens at module level, we need to clear the module cache
      vi.resetModules();

      await expect(async () => {
        const { NotificationsProvider } = await import('../components/provider');
        render(
          <NotificationsProvider userId="user_123">
            <div>Content</div>
          </NotificationsProvider>,
        );
      }).rejects.toThrow('Keys configuration error');
    });

    test('should handle keys function throwing error in trigger', async () => {
      mockSafeEnv.mockImplementation(() => {
        throw new Error('Keys configuration error');
      });

      // Since the keys() call happens at module level, we need to clear the module cache
      vi.resetModules();

      await expect(async () => {
        const { NotificationsTrigger } = await import('../components/trigger');
        render(<NotificationsTrigger />);
      }).rejects.toThrow('Keys configuration error');
    });
  });
});
