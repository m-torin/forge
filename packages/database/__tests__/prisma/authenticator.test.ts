import { describe, it, expect } from "vitest";
import { prismaMock, setupOrmTests } from "../test-utils";
import type { Authenticator } from "@prisma/client";

// Set up in-memory database environment
setupOrmTests();

describe("Authenticator model", () => {
  describe("find operations", () => {
    it("should find an authenticator by credentialID", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_auth",
          email: "auth@example.com",
          name: "Auth User",
        },
      });

      // Create an authenticator
      const authData = {
        userId: "user_auth",
        credentialID: "credential_123",
        credentialPublicKey: Buffer.from("mock-public-key"),
        counter: 0,
        credentialDeviceType: "singleDevice",
        credentialBackedUp: false,
        transports: ["usb", "ble"],
      };

      await prismaMock.authenticator.create({
        data: authData,
      });

      // Find the authenticator we just created
      const foundAuth = await prismaMock.authenticator.findUnique({
        where: { credentialID: "credential_123" },
      });

      // Verify the authenticator was found with the correct data
      expect(foundAuth).toBeDefined();
      expect(foundAuth?.credentialID).toBe("credential_123");
      expect(foundAuth?.userId).toBe("user_auth");
      expect(foundAuth?.counter).toBe(0);
    });

    it("should find authenticators by userId", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_multi_auth",
          email: "multi_auth@example.com",
          name: "Multi Auth User",
        },
      });

      // Create multiple authenticators for the same user
      const authenticators = [
        {
          userId: "user_multi_auth",
          credentialID: "credential_a",
          credentialPublicKey: Buffer.from("public-key-a"),
          counter: 0,
          credentialDeviceType: "singleDevice",
          credentialBackedUp: false,
          transports: ["usb"],
        },
        {
          userId: "user_multi_auth",
          credentialID: "credential_b",
          credentialPublicKey: Buffer.from("public-key-b"),
          counter: 0,
          credentialDeviceType: "multiDevice",
          credentialBackedUp: true,
          transports: ["internal"],
        },
      ];

      // Create authenticators in the database
      for (const authData of authenticators) {
        await prismaMock.authenticator.create({ data: authData });
      }

      // Find all authenticators for the user
      const foundAuths = await prismaMock.authenticator.findMany({
        where: { userId: "user_multi_auth" },
      });

      // Verify correct authenticators were found
      expect(foundAuths).toHaveLength(2);
      expect(foundAuths[0].credentialID).toBe("credential_a");
      expect(foundAuths[1].credentialID).toBe("credential_b");
    });
  });

  describe("create operations", () => {
    it("should create an authenticator", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_new_auth",
          email: "new_auth@example.com",
          name: "New Auth User",
        },
      });

      const authData = {
        userId: "user_new_auth",
        credentialID: "new_credential",
        credentialPublicKey: Buffer.from("new-public-key"),
        counter: 0,
        credentialDeviceType: "singleDevice",
        credentialBackedUp: false,
        transports: ["usb", "nfc"],
      };

      // Create an authenticator
      const createdAuth = await prismaMock.authenticator.create({
        data: authData,
      });

      // Verify authenticator was created with the correct data
      expect(createdAuth.credentialID).toBe("new_credential");
      expect(createdAuth.userId).toBe("user_new_auth");
      expect(createdAuth.counter).toBe(0);

      // Verify we can find the created authenticator
      const foundAuth = await prismaMock.authenticator.findUnique({
        where: { credentialID: "new_credential" },
      });

      expect(foundAuth).toBeDefined();
    });
  });

  describe("update operations", () => {
    it("should update an authenticator's counter", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_update_auth",
          email: "update_auth@example.com",
          name: "Update Auth User",
        },
      });

      // Create an authenticator to update
      await prismaMock.authenticator.create({
        data: {
          userId: "user_update_auth",
          credentialID: "update_credential",
          credentialPublicKey: Buffer.from("update-public-key"),
          counter: 0,
          credentialDeviceType: "singleDevice",
          credentialBackedUp: false,
          transports: ["usb"],
        },
      });

      // Update the authenticator's counter
      const updatedAuth = await prismaMock.authenticator.update({
        where: { credentialID: "update_credential" },
        data: { counter: 5 },
      });

      // Verify the update worked correctly
      expect(updatedAuth.credentialID).toBe("update_credential");
      expect(updatedAuth.counter).toBe(5);

      // Double check by finding the authenticator again
      const foundAuth = await prismaMock.authenticator.findUnique({
        where: { credentialID: "update_credential" },
      });

      expect(foundAuth?.counter).toBe(5);
    });
  });

  describe("delete operations", () => {
    it("should delete an authenticator", async () => {
      // Create a user first
      await prismaMock.user.create({
        data: {
          id: "user_delete_auth",
          email: "delete_auth@example.com",
          name: "Delete Auth User",
        },
      });

      // Create an authenticator to delete
      await prismaMock.authenticator.create({
        data: {
          userId: "user_delete_auth",
          credentialID: "delete_credential",
          credentialPublicKey: Buffer.from("delete-public-key"),
          counter: 0,
          credentialDeviceType: "singleDevice",
          credentialBackedUp: false,
          transports: ["usb"],
        },
      });

      // Delete the authenticator
      const deletedAuth = await prismaMock.authenticator.delete({
        where: { credentialID: "delete_credential" },
      });

      // Verify the deleted authenticator info is returned
      expect(deletedAuth.credentialID).toBe("delete_credential");
      expect(deletedAuth.userId).toBe("user_delete_auth");

      // Verify the authenticator is actually gone
      const foundAuth = await prismaMock.authenticator.findUnique({
        where: { credentialID: "delete_credential" },
      });
      expect(foundAuth).toBeNull();
    });
  });
});
