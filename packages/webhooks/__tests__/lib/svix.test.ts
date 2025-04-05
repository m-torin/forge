import { Svix } from "svix";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@repo/auth/server";

import { keys } from "../../keys";
import { getAppPortal, send } from "../../lib/svix";

// Import the mocked modules
vi.mock("svix");
vi.mock("@repo/auth/server");
vi.mock("../../keys");

describe("Svix Module", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock the keys function to return a specific value
    (keys as any).mockReturnValue({
      SVIX_TOKEN: "sk_test_svix_token",
    });

    // Mock the auth function to return a specific value
    (auth as any).mockResolvedValue({
      orgId: "test-org-id",
      userId: "test-user-id",
    });

    // Mock the Svix constructor
    (Svix as any).mockImplementation(() => ({
      authentication: {
        appPortalAccess: vi.fn().mockResolvedValue({
          url: "https://app.svix.com/portal/test",
          token: "test-token",
        }),
      },
      message: {
        create: vi.fn().mockResolvedValue({
          id: "msg_test123",
          eventType: "test.event",
          payload: {},
        }),
      },
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("send", () => {
    it("creates a Svix instance with the correct token", async () => {
      await send("test.event", { data: "test" });

      expect(Svix).toHaveBeenCalledWith("sk_test_svix_token");
    });

    it("throws an error if SVIX_TOKEN is not set", async () => {
      // Mock the keys function to return undefined SVIX_TOKEN
      (keys as any).mockReturnValue({
        SVIX_TOKEN: undefined,
      });

      await expect(send("test.event", { data: "test" })).rejects.toThrow(
        "SVIX_TOKEN is not set",
      );
    });

    it("calls auth to get the orgId", async () => {
      await send("test.event", { data: "test" });

      expect(auth).toHaveBeenCalled();
    });

    it("returns early if orgId is not available", async () => {
      // Mock the auth function to return undefined orgId
      (auth as any).mockResolvedValue({
        userId: "test-user-id",
      });

      const result = await send("test.event", { data: "test" });

      expect(result).toBeUndefined();
    });

    it("calls svix.message.create with the correct parameters", async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        id: "msg_test123",
        eventType: "test.event",
        payload: { data: "test" },
      });

      // Mock the Svix constructor to return a specific implementation
      (Svix as any).mockImplementation(() => ({
        message: {
          create: mockCreate,
        },
      }));

      await send("test.event", { data: "test" });

      expect(mockCreate).toHaveBeenCalledWith("test-org-id", {
        application: {
          uid: "test-org-id",
          name: "test-org-id",
        },
        eventType: "test.event",
        payload: {
          data: "test",
          eventType: "test.event",
        },
      });
    });

    it("returns the result from svix.message.create", async () => {
      const expectedResult = {
        id: "msg_test123",
        eventType: "test.event",
        payload: { data: "test" },
      };

      const mockCreate = vi.fn().mockResolvedValue(expectedResult);

      // Mock the Svix constructor to return a specific implementation
      (Svix as any).mockImplementation(() => ({
        message: {
          create: mockCreate,
        },
      }));

      const result = await send("test.event", { data: "test" });

      expect(result).toEqual(expectedResult);
    });
  });

  describe("getAppPortal", () => {
    it("creates a Svix instance with the correct token", async () => {
      await getAppPortal();

      expect(Svix).toHaveBeenCalledWith("sk_test_svix_token");
    });

    it("throws an error if SVIX_TOKEN is not set", async () => {
      // Mock the keys function to return undefined SVIX_TOKEN
      (keys as any).mockReturnValue({
        SVIX_TOKEN: undefined,
      });

      await expect(getAppPortal()).rejects.toThrow("SVIX_TOKEN is not set");
    });

    it("calls auth to get the orgId", async () => {
      await getAppPortal();

      expect(auth).toHaveBeenCalled();
    });

    it("returns early if orgId is not available", async () => {
      // Mock the auth function to return undefined orgId
      (auth as any).mockResolvedValue({
        userId: "test-user-id",
      });

      const result = await getAppPortal();

      expect(result).toBeUndefined();
    });

    it("calls svix.authentication.appPortalAccess with the correct parameters", async () => {
      const mockAppPortalAccess = vi.fn().mockResolvedValue({
        url: "https://app.svix.com/portal/test",
        token: "test-token",
      });

      // Mock the Svix constructor to return a specific implementation
      (Svix as any).mockImplementation(() => ({
        authentication: {
          appPortalAccess: mockAppPortalAccess,
        },
      }));

      await getAppPortal();

      expect(mockAppPortalAccess).toHaveBeenCalledWith("test-org-id", {
        application: {
          uid: "test-org-id",
          name: "test-org-id",
        },
      });
    });

    it("returns the result from svix.authentication.appPortalAccess", async () => {
      const expectedResult = {
        url: "https://app.svix.com/portal/test",
        token: "test-token",
      };

      const mockAppPortalAccess = vi.fn().mockResolvedValue(expectedResult);

      // Mock the Svix constructor to return a specific implementation
      (Svix as any).mockImplementation(() => ({
        authentication: {
          appPortalAccess: mockAppPortalAccess,
        },
      }));

      const result = await getAppPortal();

      expect(result).toEqual(expectedResult);
    });
  });
});
