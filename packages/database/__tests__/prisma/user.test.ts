import { describe, it, expect } from "vitest";
import { prismaMock, setupOrmTests, clearAllData } from "../test-utils";
import type { User } from "@prisma/client";

// Set up in-memory database environment
setupOrmTests();

describe("User model", () => {
  describe("find operations", () => {
    it("should find a user by id", async () => {
      // Create a user first
      const userData = {
        id: "user_123",
        email: "test@example.com",
        name: "Test User",
        image: "https://example.com/image.jpg",
      };

      // Actually create the user in the in-memory database
      const createdUser = await prismaMock.user.create({
        data: userData,
      });

      // Now find the user we just created
      const foundUser = await prismaMock.user.findUnique({
        where: { id: "user_123" },
      });

      // Verify the user was found with the correct data
      expect(foundUser).toMatchObject(userData);
      expect(foundUser?.id).toBe("user_123");
    });

    it("should find many users", async () => {
      // Create test data
      const users = [
        {
          id: "user_123",
          email: "test1@example.com",
          name: "Test User 1",
          image: "https://example.com/image1.jpg",
        },
        {
          id: "user_456",
          email: "test2@example.com",
          name: "Test User 2",
          image: "https://example.com/image2.jpg",
        },
      ];

      // Create users in the database
      for (const userData of users) {
        await prismaMock.user.create({ data: userData });
      }

      // Find all users
      const foundUsers = await prismaMock.user.findMany();

      // Verify correct users were found
      expect(foundUsers).toHaveLength(2);
      expect(foundUsers[0].email).toBe("test1@example.com");
      expect(foundUsers[1].email).toBe("test2@example.com");
    });
  });

  describe("create operations", () => {
    it("should create a user", async () => {
      const userData = {
        email: "new@example.com",
        name: "New User",
      };

      // Create a user
      const result = await prismaMock.user.create({
        data: userData,
      });

      // Verify user was created with the correct data
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
      expect(result.id).toBeDefined();
    });
  });

  describe("update operations", () => {
    it("should update a user", async () => {
      // Create a user first
      const user = await prismaMock.user.create({
        data: {
          id: "user_to_update",
          email: "before@example.com",
          name: "Before Update",
        },
      });

      // Update the user
      const updatedUser = await prismaMock.user.update({
        where: { id: "user_to_update" },
        data: {
          email: "after@example.com",
          name: "After Update",
        },
      });

      // Verify the update worked
      expect(updatedUser.id).toBe("user_to_update");
      expect(updatedUser.email).toBe("after@example.com");
      expect(updatedUser.name).toBe("After Update");

      // Double-check by finding the user again
      const foundUser = await prismaMock.user.findUnique({
        where: { id: "user_to_update" },
      });
      expect(foundUser?.email).toBe("after@example.com");
    });
  });

  describe("delete operations", () => {
    it("should delete a user", async () => {
      // Create a user to delete
      await prismaMock.user.create({
        data: {
          id: "user_to_delete",
          email: "delete@example.com",
          name: "Delete Me",
        },
      });

      // Delete the user
      const deletedUser = await prismaMock.user.delete({
        where: { id: "user_to_delete" },
      });

      // Verify the deleted user info is returned
      expect(deletedUser.id).toBe("user_to_delete");
      expect(deletedUser.email).toBe("delete@example.com");

      // Verify the user is actually gone
      const foundUser = await prismaMock.user.findUnique({
        where: { id: "user_to_delete" },
      });
      expect(foundUser).toBeNull();
    });
  });
});
