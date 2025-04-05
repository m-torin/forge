import { describe, expect, it, vi } from "vitest";

// Import the module under test after mocks are set up
import { notifications } from "../index";

// Mock the modules before importing the module under test
vi.mock("@knocklabs/node", () => ({
  Knock: vi.fn().mockImplementation(() => ({
    feeds: {},
    messages: {},
    objects: {},
    users: {},
    workflows: {},
  })),
}));

vi.mock("../keys", () => ({
  keys: vi.fn().mockReturnValue(() => ({
    KNOCK_SECRET_API_KEY: "test-knock-secret-api-key",
  })),
}));

describe.skip("Notifications", function () {
  it("provides access to Knock API methods", () => {
    // Check that the notifications object has the expected methods
    expect(notifications.users).toBeDefined();
    expect(notifications.workflows).toBeDefined();
    expect(notifications.objects).toBeDefined();
    expect(notifications.messages).toBeDefined();
    expect(notifications.feeds).toBeDefined();
  });
});
