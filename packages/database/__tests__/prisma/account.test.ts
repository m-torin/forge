import { describe, it, expect } from "vitest";
import { prismaMock, setupOrmTests } from "../test-utils";
import type { Account } from "@prisma/client";

// Set up in-memory database environment
setupOrmTests();

describe("Account model", () => {
  describe("find operations", () => {
    it("should find an account by provider and providerAccountId", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_123",
          email: "test@example.com",
          name: "Test User",
        },
      });

      // Create an account
      const accountData = {
        userId: "user_123",
        type: "oauth",
        provider: "github",
        providerAccountId: "12345",
        refresh_token: "refresh_token",
        access_token: "access_token",
        expires_at: 1672531200,
        token_type: "bearer",
        scope: "user",
        id_token: "id_token",
      };

      await prismaMock.account.create({
        data: accountData,
      });

      // Find the account we just created
      const foundAccount = await prismaMock.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "github",
            providerAccountId: "12345",
          },
        },
      });

      // Verify the account was found with the correct data
      expect(foundAccount).toBeDefined();
      expect(foundAccount?.provider).toBe("github");
      expect(foundAccount?.providerAccountId).toBe("12345");
      expect(foundAccount?.userId).toBe("user_123");
    });

    it("should find many accounts by userId", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_multi",
          email: "multi@example.com",
          name: "Multi Account User",
        },
      });

      // Create multiple accounts for the same user
      const accounts = [
        {
          userId: "user_multi",
          type: "oauth",
          provider: "github",
          providerAccountId: "12345",
          refresh_token: "refresh_token_1",
          access_token: "access_token_1",
          expires_at: 1672531200,
          token_type: "bearer",
          scope: "user",
          id_token: "id_token_1",
        },
        {
          userId: "user_multi",
          type: "oauth",
          provider: "google",
          providerAccountId: "67890",
          refresh_token: "refresh_token_2",
          access_token: "access_token_2",
          expires_at: 1672617600,
          token_type: "bearer",
          scope: "email profile",
          id_token: "id_token_2",
        },
      ];

      // Create accounts in the database
      for (const accountData of accounts) {
        await prismaMock.account.create({ data: accountData });
      }

      // Find all accounts for the user
      const foundAccounts = await prismaMock.account.findMany({
        where: { userId: "user_multi" },
      });

      // Verify correct accounts were found
      expect(foundAccounts).toHaveLength(2);
      expect(foundAccounts[0].provider).toBe("github");
      expect(foundAccounts[1].provider).toBe("google");
    });
  });

  describe("create operations", () => {
    it("should create an account", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_new",
          email: "new@example.com",
          name: "New User",
        },
      });

      const accountData = {
        userId: "user_new",
        type: "oauth",
        provider: "github",
        providerAccountId: "new12345",
        refresh_token: "refresh_token",
        access_token: "access_token",
        expires_at: 1672531200,
        token_type: "bearer",
        scope: "user",
        id_token: "id_token",
      };

      // Create an account
      const createdAccount = await prismaMock.account.create({
        data: accountData,
      });

      // Verify account was created with the correct data
      expect(createdAccount.provider).toBe("github");
      expect(createdAccount.providerAccountId).toBe("new12345");
      expect(createdAccount.userId).toBe("user_new");

      // Verify we can find the created account
      const foundAccount = await prismaMock.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "github",
            providerAccountId: "new12345",
          },
        },
      });

      expect(foundAccount).toBeDefined();
    });
  });

  describe("delete operations", () => {
    it("should delete an account", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_delete",
          email: "delete@example.com",
          name: "Delete User",
        },
      });

      // Create an account to delete
      await prismaMock.account.create({
        data: {
          userId: "user_delete",
          type: "oauth",
          provider: "github",
          providerAccountId: "delete12345",
          refresh_token: "refresh_token",
          access_token: "access_token",
          expires_at: 1672531200,
          token_type: "bearer",
          scope: "user",
          id_token: "id_token",
        },
      });

      // Delete the account
      const deletedAccount = await prismaMock.account.delete({
        where: {
          provider_providerAccountId: {
            provider: "github",
            providerAccountId: "delete12345",
          },
        },
      });

      // Verify the deleted account info is returned
      expect(deletedAccount.provider).toBe("github");
      expect(deletedAccount.providerAccountId).toBe("delete12345");

      // Verify the account is actually gone
      const foundAccount = await prismaMock.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "github",
            providerAccountId: "delete12345",
          },
        },
      });
      expect(foundAccount).toBeNull();
    });
  });
});
