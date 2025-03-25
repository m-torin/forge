import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@repo/testing/vitest';
import { NotificationsTrigger } from '../../components/trigger';
import {
  NotificationIconButton,
  NotificationFeedPopover,
} from '@knocklabs/react';
import { keys } from '../../keys';

// Import the mocked modules
vi.mock('@knocklabs/react');
vi.mock('../../keys');
vi.mock('@knocklabs/react/dist/index.css', () => ({}));
vi.mock('../../styles.css', () => ({}));

describe.skip('NotificationsTrigger', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock NotificationIconButton to render a button with a ref
    (NotificationIconButton as any).mockImplementation((props) => (
      <button
        data-testid="notification-icon-button"
        onClick={props.onClick}
        ref={props.ref}
      />
    ));

    // Mock NotificationFeedPopover to render a div
    (NotificationFeedPopover as any).mockImplementation((props) => (
      <div
        data-testid="notification-feed-popover"
        data-is-visible={props.isVisible}
        data-button-ref={props.buttonRef ? 'exists' : 'missing'}
      />
    ));

    // Mock keys to return a function that returns valid API key
    (keys as any).mockReturnValue(() => ({
      NEXT_PUBLIC_KNOCK_API_KEY: 'test-knock-public-api-key',
    }));
  });

  it('renders the NotificationIconButton when API key is available', () => {
    render(<NotificationsTrigger />);

    expect(screen.getByTestId('notification-icon-button')).toBeInTheDocument();
  });

  it('does not render anything when API key is missing', () => {
    // Mock keys to return a function that returns undefined API key
    (keys as any).mockReturnValue(() => ({
      NEXT_PUBLIC_KNOCK_API_KEY: undefined,
    }));

    render(<NotificationsTrigger />);

    expect(
      screen.queryByTestId('notification-icon-button'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('notification-feed-popover'),
    ).not.toBeInTheDocument();
  });

  it('toggles the popover visibility when the button is clicked', () => {
    render(<NotificationsTrigger />);

    // Initially, the popover should not be visible
    const popover = screen.queryByTestId('notification-feed-popover');
    expect(popover).not.toBeInTheDocument();

    // Click the button to show the popover
    fireEvent.click(screen.getByTestId('notification-icon-button'));

    // Now the popover should be visible
    const visiblePopover = screen.getByTestId('notification-feed-popover');
    expect(visiblePopover).toBeInTheDocument();
    expect(visiblePopover.getAttribute('data-is-visible')).toBe('true');

    // Click the button again to hide the popover
    fireEvent.click(screen.getByTestId('notification-icon-button'));

    // The popover should still be in the document but not visible
    const hiddenPopover = screen.getByTestId('notification-feed-popover');
    expect(hiddenPopover).toBeInTheDocument();
    expect(hiddenPopover.getAttribute('data-is-visible')).toBe('false');
  });

  it('passes the button ref to the popover', () => {
    render(<NotificationsTrigger />);

    // Click the button to show the popover
    fireEvent.click(screen.getByTestId('notification-icon-button'));

    // Check that the button ref is passed to the popover
    const popover = screen.getByTestId('notification-feed-popover');
    expect(popover.getAttribute('data-button-ref')).toBe('exists');
  });

  it('closes the popover when clicking outside', () => {
    render(<NotificationsTrigger />);

    // Click the button to show the popover
    fireEvent.click(screen.getByTestId('notification-icon-button'));

    // Get the onClose handler
    const popover = screen.getByTestId('notification-feed-popover');
    const { onClose } = NotificationFeedPopover.mock.calls[0][0];

    // Simulate clicking outside by calling onClose with a mock event
    const mockEvent = { target: document.body } as unknown as Event;
    onClose(mockEvent);

    // The popover should be updated to not be visible
    expect(NotificationFeedPopover).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isVisible: false,
      }),
      expect.anything(),
    );
  });

  it('does not close the popover when clicking the button', () => {
    render(<NotificationsTrigger />);

    // Click the button to show the popover
    const button = screen.getByTestId('notification-icon-button');
    fireEvent.click(button);

    // Get the onClose handler and the button ref
    const { onClose, buttonRef } = NotificationFeedPopover.mock.calls[0][0];

    // Set up the button ref to point to the button element
    Object.defineProperty(buttonRef, 'current', {
      value: button,
      writable: true,
    });

    // Simulate clicking the button by calling onClose with a mock event
    const mockEvent = { target: button } as unknown as Event;
    onClose(mockEvent);

    // The popover should still be visible
    expect(NotificationFeedPopover).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isVisible: true,
      }),
      expect.anything(),
    );
  });
});
