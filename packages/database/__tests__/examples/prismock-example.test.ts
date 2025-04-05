/**
 * Example test demonstrating Prismock usage with Vitest
 *
 * This file shows how to use Prismock for in-memory database testing
 * with the auth models defined in the schema.
 */
import { describe, it, expect } from "vitest";
import {
  setupPrismockTests,
  prismock,
  PrismockClient,
} from "../../src/testing/index.js";

// Set up Prismock for all tests in this file
setupPrismockTests();

describe("Prismock Example Tests", () => {
  describe("User Model Tests", () => {
    it("should create a user", async () => {
      // Create a user with Prismock
      const user = await prismock.user.create({
        data: {
          name: "Test User",
          email: "test@example.com",
        },
      });

      // Verify the user was created
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");

      // Verify we can find the user
      const foundUser = await prismock.user.findUnique({
        where: {
          email: "test@example.com",
        },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(user.id);
    });

    it("should update a user", async () => {
      // Create a user
      const user = await prismock.user.create({
        data: {
          name: "Initial Name",
          email: "update-test@example.com",
        },
      });

      // Update the user
      const updatedUser = await prismock.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: "Updated Name",
          image: "https://example.com/avatar.png",
        },
      });

      // Verify the update
      expect(updatedUser.name).toBe("Updated Name");
      expect(updatedUser.email).toBe("update-test@example.com");
      expect(updatedUser.image).toBe("https://example.com/avatar.png");
    });

    it("should delete a user", async () => {
      // Create a user
      const user = await prismock.user.create({
        data: {
          name: "To Be Deleted",
          email: "delete-test@example.com",
        },
      });

      // Delete the user
      await prismock.user.delete({
        where: {
          id: user.id,
        },
      });

      // Verify the user was deleted
      const foundUser = await prismock.user.findUnique({
        where: {
          id: user.id,
        },
      });

      expect(foundUser).toBeNull();
    });
  });

  describe("Relationship Tests", () => {
    it("should create a user with related accounts", async () => {
      // Create a user with a related account
      const user = await prismock.user.create({
        data: {
          name: "Relationship Test User",
          email: "relationship-test@example.com",
          accounts: {
            create: {
              type: "oauth",
              provider: "github",
              providerAccountId: "12345",
              access_token: "mock-token",
            },
          },
        },
        include: {
          accounts: true,
        },
      });

      // Verify the user and account were created
      expect(user).toBeDefined();
      expect(user.accounts).toHaveLength(1);
      expect(user.accounts[0].provider).toBe("github");
      expect(user.accounts[0].providerAccountId).toBe("12345");

      // Find the user with the account relationship
      const foundUser = await prismock.user.findUnique({
        where: {
          id: user.id,
        },
        include: {
          accounts: true,
        },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser?.accounts).toHaveLength(1);
    });
  });

  describe("Transaction Tests", () => {
    it("should support transactions", async () => {
      // Execute operations in a transaction
      const result = await prismock.$transaction(async (tx) => {
        // Create a user in the transaction
        const user = await tx.user.create({
          data: {
            name: "Transaction User",
            email: "transaction@example.com",
          },
        });

        // Create a session for the user in the same transaction
        const session = await tx.session.create({
          data: {
            sessionToken: "mock-session-token",
            userId: user.id,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
          },
        });

        return { user, session };
      });

      // Verify both operations succeeded
      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.session.userId).toBe(result.user.id);

      // Verify we can find both objects outside the transaction
      const user = await prismock.user.findUnique({
        where: { id: result.user.id },
      });

      const session = await prismock.session.findUnique({
        where: { sessionToken: "mock-session-token" },
      });

      expect(user).toBeDefined();
      expect(session).toBeDefined();
    });
  });
});
