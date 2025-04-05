import { describe, it, expect } from "vitest";
import { prismaMock, setupOrmTests } from "../test-utils";
import type { VerificationToken } from "@prisma/client";

// Set up in-memory database environment
setupOrmTests();

describe("VerificationToken model", () => {
  describe("find operations", () => {
    it("should find a verification token by identifier and token", async () => {
      // Create a verification token
      const tokenData = {
        identifier: "test@example.com",
        token: "verification_token_123",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      };

      await prismaMock.verificationToken.create({
        data: tokenData,
      });

      // Find the token we just created
      const foundToken = await prismaMock.verificationToken.findUnique({
        where: {
          identifier_token: {
            identifier: "test@example.com",
            token: "verification_token_123",
          },
        },
      });

      // Verify the token was found with the correct data
      expect(foundToken).toBeDefined();
      expect(foundToken?.identifier).toBe("test@example.com");
      expect(foundToken?.token).toBe("verification_token_123");
    });

    it("should not find expired tokens", async () => {
      // Create an expired verification token
      const expiredDate = new Date(Date.now() - 1000); // 1 second in the past

      const tokenData = {
        identifier: "expired@example.com",
        token: "expired_token",
        expires: expiredDate,
      };

      await prismaMock.verificationToken.create({
        data: tokenData,
      });

      // Find active tokens only (manually filtering)
      const now = new Date();
      const activeTokens = await prismaMock.verificationToken.findMany({
        where: {
          identifier: "expired@example.com",
          expires: {
            gt: now,
          },
        },
      });

      // Should not find any active tokens
      expect(activeTokens).toHaveLength(0);
    });
  });

  describe("create operations", () => {
    it("should create a verification token", async () => {
      const tokenData = {
        identifier: "new@example.com",
        token: "new_token",
        expires: new Date(Date.now() + 3600000), // 1 hour from now
      };

      // Create a verification token
      const createdToken = await prismaMock.verificationToken.create({
        data: tokenData,
      });

      // Verify token was created with the correct data
      expect(createdToken.identifier).toBe("new@example.com");
      expect(createdToken.token).toBe("new_token");

      // Verify we can find the created token
      const foundToken = await prismaMock.verificationToken.findUnique({
        where: {
          identifier_token: {
            identifier: "new@example.com",
            token: "new_token",
          },
        },
      });

      expect(foundToken).toBeDefined();
    });
  });

  describe("delete operations", () => {
    it("should delete a verification token", async () => {
      // Create a verification token to delete
      await prismaMock.verificationToken.create({
        data: {
          identifier: "delete@example.com",
          token: "delete_token",
          expires: new Date(Date.now() + 3600000),
        },
      });

      // Delete the token
      const deletedToken = await prismaMock.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: "delete@example.com",
            token: "delete_token",
          },
        },
      });

      // Verify the deleted token info is returned
      expect(deletedToken.identifier).toBe("delete@example.com");
      expect(deletedToken.token).toBe("delete_token");

      // Verify the token is actually gone
      const foundToken = await prismaMock.verificationToken.findUnique({
        where: {
          identifier_token: {
            identifier: "delete@example.com",
            token: "delete_token",
          },
        },
      });
      expect(foundToken).toBeNull();
    });
  });

  describe("operations with composite keys", () => {
    it("should handle multiple tokens for the same identifier", async () => {
      // Create multiple tokens for the same email
      const tokens = [
        {
          identifier: "multi@example.com",
          token: "token_1",
          expires: new Date(Date.now() + 3600000),
        },
        {
          identifier: "multi@example.com",
          token: "token_2",
          expires: new Date(Date.now() + 7200000),
        },
      ];

      // Create tokens in the database
      for (const tokenData of tokens) {
        await prismaMock.verificationToken.create({ data: tokenData });
      }

      // Find all tokens for the identifier
      const foundTokens = await prismaMock.verificationToken.findMany({
        where: { identifier: "multi@example.com" },
      });

      // Verify both tokens were found
      expect(foundTokens).toHaveLength(2);

      // Verify we can find each token individually
      const token1 = await prismaMock.verificationToken.findUnique({
        where: {
          identifier_token: {
            identifier: "multi@example.com",
            token: "token_1",
          },
        },
      });

      const token2 = await prismaMock.verificationToken.findUnique({
        where: {
          identifier_token: {
            identifier: "multi@example.com",
            token: "token_2",
          },
        },
      });

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
    });
  });
});
