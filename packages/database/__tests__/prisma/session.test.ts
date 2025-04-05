import { describe, it, expect } from "vitest";
import { prismaMock, setupOrmTests } from "../test-utils";
import type { Session } from "@prisma/client";

// Set up in-memory database environment
setupOrmTests();

describe("Session model", () => {
  describe("find operations", () => {
    it("should find a session by token", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_session",
          email: "session@example.com",
          name: "Session User",
        },
      });

      // Create a session
      const sessionData = {
        userId: "user_session",
        sessionToken: "session_token_123",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      };

      await prismaMock.session.create({
        data: sessionData,
      });

      // Find the session we just created
      const foundSession = await prismaMock.session.findUnique({
        where: { sessionToken: "session_token_123" },
      });

      // Verify the session was found with the correct data
      expect(foundSession).toBeDefined();
      expect(foundSession?.sessionToken).toBe("session_token_123");
      expect(foundSession?.userId).toBe("user_session");
    });

    it("should find sessions with their related user", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_with_session",
          email: "with_session@example.com",
          name: "User With Session",
        },
      });

      // Create a session for the user
      await prismaMock.session.create({
        data: {
          userId: "user_with_session",
          sessionToken: "include_user_token",
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Find the session with included user
      const sessionWithUser = await prismaMock.session.findUnique({
        where: { sessionToken: "include_user_token" },
        include: { user: true },
      });

      // Verify the session and user data
      expect(sessionWithUser).toBeDefined();
      expect(sessionWithUser?.sessionToken).toBe("include_user_token");
      expect(sessionWithUser?.user).toBeDefined();
      expect(sessionWithUser?.user.id).toBe("user_with_session");
      expect(sessionWithUser?.user.email).toBe("with_session@example.com");
    });
  });

  describe("create operations", () => {
    it("should create a session", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_for_new_session",
          email: "new_session@example.com",
          name: "New Session User",
        },
      });

      const sessionData = {
        userId: "user_for_new_session",
        sessionToken: "new_session_token",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      // Create a session
      const createdSession = await prismaMock.session.create({
        data: sessionData,
      });

      // Verify session was created with the correct data
      expect(createdSession.sessionToken).toBe("new_session_token");
      expect(createdSession.userId).toBe("user_for_new_session");

      // Verify we can find the created session
      const foundSession = await prismaMock.session.findUnique({
        where: { sessionToken: "new_session_token" },
      });

      expect(foundSession).toBeDefined();
    });
  });

  describe("delete operations", () => {
    it("should delete a session", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_delete_session",
          email: "delete_session@example.com",
          name: "Delete Session User",
        },
      });

      // Create a session to delete
      await prismaMock.session.create({
        data: {
          userId: "user_delete_session",
          sessionToken: "delete_session_token",
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Delete the session
      const deletedSession = await prismaMock.session.delete({
        where: { sessionToken: "delete_session_token" },
      });

      // Verify the deleted session info is returned
      expect(deletedSession.sessionToken).toBe("delete_session_token");
      expect(deletedSession.userId).toBe("user_delete_session");

      // Verify the session is actually gone
      const foundSession = await prismaMock.session.findUnique({
        where: { sessionToken: "delete_session_token" },
      });
      expect(foundSession).toBeNull();
    });
  });

  describe("update operations", () => {
    it("should update a session's expiry", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_update_session",
          email: "update_session@example.com",
          name: "Update Session User",
        },
      });

      // Initial expiry date
      const initialExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now

      // Create a session to update
      await prismaMock.session.create({
        data: {
          userId: "user_update_session",
          sessionToken: "update_session_token",
          expires: initialExpiry,
        },
      });

      // New expiry date
      const newExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

      // Update the session
      const updatedSession = await prismaMock.session.update({
        where: { sessionToken: "update_session_token" },
        data: { expires: newExpiry },
      });

      // Verify the update worked correctly
      expect(updatedSession.sessionToken).toBe("update_session_token");
      expect(updatedSession.expires.getTime()).toBe(newExpiry.getTime());

      // Double check by finding the session again
      const foundSession = await prismaMock.session.findUnique({
        where: { sessionToken: "update_session_token" },
      });

      expect(foundSession?.expires.getTime()).toBe(newExpiry.getTime());
    });
  });
});
