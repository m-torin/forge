import { KnockFeedProvider, KnockProvider } from "@knocklabs/react";
import { beforeEach, describe, expect, it, render, screen, vi } from "vitest";

import { NotificationsProvider } from "../../components/provider";
import { keys } from "../../keys";

// Import the mocked modules
vi.mock("@knocklabs/react");
vi.mock("../../keys");

describe.skip("NotificationsProvider", function () {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock KnockProvider and KnockFeedProvider to render their children
    (KnockProvider as any).mockImplementation(({ children }) => (
      <div data-testid="knock-provider">{children}</div>
    ));

    (KnockFeedProvider as any).mockImplementation(({ children }) => (
      <div data-testid="knock-feed-provider">{children}</div>
    ));
  });

  it("renders children when Knock API keys are available", () => {
    // Mock keys to return a function that returns valid API keys
    (keys as any).mockReturnValue(() => ({
      NEXT_PUBLIC_KNOCK_API_KEY: "test-knock-public-api-key",
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: "test-knock-feed-channel-id",
    }));

    render(
      <NotificationsProvider userId="test-user-id">
        <div data-testid="test-child">Test Child</div>
      </NotificationsProvider>,
    );

    // Check that the providers are rendered
    expect(screen.getByTestId("knock-provider")).toBeInTheDocument();
    expect(screen.getByTestId("knock-feed-provider")).toBeInTheDocument();

    // Check that the child is rendered
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();

    // Check that the providers are initialized with the correct props
    expect(KnockProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "test-knock-public-api-key",
        userId: "test-user-id",
      }),
      expect.anything(),
    );

    expect(KnockFeedProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        feedId: "test-knock-feed-channel-id",
      }),
      expect.anything(),
    );
  });

  it("renders only children when Knock API key is missing", () => {
    // Mock keys to return a function that returns undefined API key
    (keys as any).mockReturnValue(() => ({
      NEXT_PUBLIC_KNOCK_API_KEY: undefined,
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: "test-knock-feed-channel-id",
    }));

    render(
      <NotificationsProvider userId="test-user-id">
        <div data-testid="test-child">Test Child</div>
      </NotificationsProvider>,
    );

    // Check that the providers are not rendered
    expect(screen.queryByTestId("knock-provider")).not.toBeInTheDocument();
    expect(screen.queryByTestId("knock-feed-provider")).not.toBeInTheDocument();

    // Check that the child is still rendered
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();

    // Check that the providers are not initialized
    expect(KnockProvider).not.toHaveBeenCalled();
    expect(KnockFeedProvider).not.toHaveBeenCalled();
  });

  it("renders only children when Knock feed channel ID is missing", () => {
    // Mock keys to return a function that returns undefined feed channel ID
    (keys as any).mockReturnValue(() => ({
      NEXT_PUBLIC_KNOCK_API_KEY: "test-knock-public-api-key",
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
    }));

    render(
      <NotificationsProvider userId="test-user-id">
        <div data-testid="test-child">Test Child</div>
      </NotificationsProvider>,
    );

    // Check that the providers are not rendered
    expect(screen.queryByTestId("knock-provider")).not.toBeInTheDocument();
    expect(screen.queryByTestId("knock-feed-provider")).not.toBeInTheDocument();

    // Check that the child is still rendered
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();

    // Check that the providers are not initialized
    expect(KnockProvider).not.toHaveBeenCalled();
    expect(KnockFeedProvider).not.toHaveBeenCalled();
  });

  it("passes the correct userId to KnockProvider", () => {
    // Mock keys to return a function that returns valid API keys
    (keys as any).mockReturnValue(() => ({
      NEXT_PUBLIC_KNOCK_API_KEY: "test-knock-public-api-key",
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: "test-knock-feed-channel-id",
    }));

    render(
      <NotificationsProvider userId="custom-user-id">
        <div>Test Child</div>
      </NotificationsProvider>,
    );

    // Check that the KnockProvider is initialized with the correct userId
    expect(KnockProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "custom-user-id",
      }),
      expect.anything(),
    );
  });
});
