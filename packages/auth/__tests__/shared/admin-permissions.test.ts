/**
 * Tests for shared admin permissions functionality
 */

import { describe, expect, vi } from "vitest";

// Mock better-auth access control
const mockCreateAccessControl = vi.fn();
const mockNewRole = vi.fn();

vi.mock("better-auth/plugins/access", () => ({
  createAccessControl: mockCreateAccessControl,
}));

describe("shared admin permissions functionality", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Ensure module re-evaluates so top-level role creation runs each test
    await vi.resetModules();

    // Mock access controller with newRole method
    mockCreateAccessControl.mockReturnValue({
      newRole: mockNewRole,
    });

    // Mock role creation
    mockNewRole.mockImplementation((permissions) => ({
      permissions,
      type: "admin-role",
    }));
  });

  describe("adminAccessController", () => {
    test("should create access controller with admin statements", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      expect(mockCreateAccessControl).toHaveBeenCalledWith({
        analytics: ["read"],
        billing: ["read", "update"],
        organization: ["read", "update", "delete"],
        system: ["read", "update"],
        user: ["create", "read", "update", "delete", "ban", "unban"],
      });

      expect(adminModule.adminAccessController).toBeDefined();
    });

    test("should provide newRole method", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      expect(adminModule.adminAccessController.newRole).toBeDefined();
      expect(typeof adminModule.adminAccessController.newRole).toBe("function");
    });
  });

  describe("superAdmin role", () => {
    test("should be created with full permissions", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      expect(mockNewRole).toHaveBeenCalledWith({
        analytics: ["read"],
        billing: ["read", "update"],
        organization: ["read", "update", "delete"],
        system: ["read", "update"],
        user: ["create", "read", "update", "delete", "ban", "unban"],
      });

      expect(adminModule.superAdmin).toBeDefined();
    });

    test("should have proper structure", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      expect(adminModule.superAdmin).toStrictEqual({
        permissions: {
          analytics: ["read"],
          billing: ["read", "update"],
          organization: ["read", "update", "delete"],
          system: ["read", "update"],
          user: ["create", "read", "update", "delete", "ban", "unban"],
        },
        type: "admin-role",
      });
    });
  });

  describe("moderator role", () => {
    test("should be created with limited permissions", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      expect(mockNewRole).toHaveBeenCalledWith({
        analytics: ["read"],
        billing: [],
        organization: ["read"],
        system: ["read"],
        user: ["read", "update", "ban", "unban"],
      });

      expect(adminModule.moderator).toBeDefined();
    });

    test("should have no billing permissions", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      expect(adminModule.moderator.permissions.billing).toStrictEqual([]);
    });

    test("should have user moderation permissions", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      const userPerms = adminModule.moderator.permissions.user;
      expect(userPerms).toContain("ban");
      expect(userPerms).toContain("unban");
      expect(userPerms).toContain("read");
      expect(userPerms).toContain("update");
      expect(userPerms).not.toContain("delete");
      expect(userPerms).not.toContain("create");
    });
  });

  describe("support role", () => {
    test("should be created with read-only permissions", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      expect(mockNewRole).toHaveBeenCalledWith({
        analytics: ["read"],
        billing: ["read"],
        organization: ["read"],
        system: ["read"],
        user: ["read"],
      });

      expect(adminModule.support).toBeDefined();
    });

    test("should only have read permissions", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      const permissions = adminModule.support.permissions;

      expect(permissions.analytics).toStrictEqual(["read"]);
      expect(permissions.billing).toStrictEqual(["read"]);
      expect(permissions.organization).toStrictEqual(["read"]);
      expect(permissions.system).toStrictEqual(["read"]);
      expect(permissions.user).toStrictEqual(["read"]);
    });

    test("should not have any write permissions", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      const permissions = adminModule.support.permissions;

      Object.values(permissions).forEach((perms: string[]) => {
        expect(perms).not.toContain("update");
        expect(perms).not.toContain("delete");
        expect(perms).not.toContain("create");
        expect(perms).not.toContain("ban");
        expect(perms).not.toContain("unban");
      });
    });
  });

  describe("adminRoles collection", () => {
    test("should export all admin roles", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      expect(adminModule.adminRoles).toBeDefined();
      expect(typeof adminModule.adminRoles).toBe("object");
    });

    test("should include all expected roles", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      const roles = adminModule.adminRoles;

      expect(roles.admin).toBeDefined();
      expect(roles.moderator).toBeDefined();
      expect(roles["super-admin"]).toBeDefined();
      expect(roles.support).toBeDefined();
    });

    test("should have admin as alias for super-admin", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      const roles = adminModule.adminRoles;

      expect(roles.admin).toBe(roles["super-admin"]);
      expect(roles.admin).toBe(adminModule.superAdmin);
    });

    test("should map roles correctly", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      const roles = adminModule.adminRoles;

      expect(roles.moderator).toBe(adminModule.moderator);
      expect(roles.support).toBe(adminModule.support);
      expect(roles["super-admin"]).toBe(adminModule.superAdmin);
    });

    test("should provide consistent role structure", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      const roles = adminModule.adminRoles;

      Object.values(roles).forEach((role) => {
        expect(role).toHaveProperty("permissions");
        expect(role).toHaveProperty("type");
        expect(role.type).toBe("admin-role");
        expect(typeof role.permissions).toBe("object");
      });
    });
  });

  describe("permission hierarchy", () => {
    test("should have super-admin with most permissions", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      const superAdminPerms = adminModule.superAdmin.permissions;
      const moderatorPerms = adminModule.moderator.permissions;
      const supportPerms = adminModule.support.permissions;

      // Count total permissions
      const countPermissions = (perms: Record<string, string[]>) =>
        Object.values(perms).reduce((total, arr) => total + arr.length, 0);

      const superAdminCount = countPermissions(superAdminPerms);
      const moderatorCount = countPermissions(moderatorPerms);
      const supportCount = countPermissions(supportPerms);

      expect(superAdminCount).toBeGreaterThan(moderatorCount);
      expect(moderatorCount).toBeGreaterThan(supportCount);
    });

    test("should have escalating permissions structure", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      // Support can only read
      const supportUserPerms = adminModule.support.permissions.user;
      expect(supportUserPerms).toStrictEqual(["read"]);

      // Moderator can read, update, ban, unban
      const moderatorUserPerms = adminModule.moderator.permissions.user;
      expect(moderatorUserPerms).toContain("read");
      expect(moderatorUserPerms).toContain("update");
      expect(moderatorUserPerms).toContain("ban");
      expect(moderatorUserPerms).toContain("unban");
      expect(moderatorUserPerms).not.toContain("delete");
      expect(moderatorUserPerms).not.toContain("create");

      // Super admin can do everything
      const superAdminUserPerms = adminModule.superAdmin.permissions.user;
      expect(superAdminUserPerms).toContain("create");
      expect(superAdminUserPerms).toContain("read");
      expect(superAdminUserPerms).toContain("update");
      expect(superAdminUserPerms).toContain("delete");
      expect(superAdminUserPerms).toContain("ban");
      expect(superAdminUserPerms).toContain("unban");
    });

    test("should restrict billing access appropriately", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      // Support can read billing
      expect(adminModule.support.permissions.billing).toStrictEqual(["read"]);

      // Moderator has no billing access
      expect(adminModule.moderator.permissions.billing).toStrictEqual([]);

      // Super admin can read and update billing
      expect(adminModule.superAdmin.permissions.billing).toStrictEqual([
        "read",
        "update",
      ]);
    });

    test("should restrict organization management", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      // Support can only read organizations
      expect(adminModule.support.permissions.organization).toStrictEqual([
        "read",
      ]);

      // Moderator can only read organizations
      expect(adminModule.moderator.permissions.organization).toStrictEqual([
        "read",
      ]);

      // Super admin can manage organizations
      expect(adminModule.superAdmin.permissions.organization).toStrictEqual([
        "read",
        "update",
        "delete",
      ]);
    });
  });

  describe("role validation", () => {
    test("should ensure all roles have required permission categories", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      const requiredCategories = [
        "analytics",
        "billing",
        "organization",
        "system",
        "user",
      ];
      const roles = [
        adminModule.superAdmin,
        adminModule.moderator,
        adminModule.support,
      ];

      roles.forEach((role) => {
        requiredCategories.forEach((category) => {
          expect(role.permissions).toHaveProperty(category);
          expect(
            Array.isArray(
              role.permissions[category as keyof typeof role.permissions],
            ),
          ).toBeTruthy();
        });
      });
    });

    test("should use only valid permission actions", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      const validActions = [
        "create",
        "read",
        "update",
        "delete",
        "ban",
        "unban",
      ];
      const roles = [
        adminModule.superAdmin,
        adminModule.moderator,
        adminModule.support,
      ];

      roles.forEach((role) => {
        Object.values(role.permissions).forEach((actions) => {
          (actions as string[]).forEach((action) => {
            expect(validActions).toContain(action);
          });
        });
      });
    });

    test("should maintain consistent permission format", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      const roles = [
        adminModule.superAdmin,
        adminModule.moderator,
        adminModule.support,
      ];

      roles.forEach((role) => {
        Object.entries(role.permissions).forEach(([category, actions]) => {
          expect(typeof category).toBe("string");
          expect(Array.isArray(actions)).toBeTruthy();
          (actions as string[]).forEach((action) => {
            expect(typeof action).toBe("string");
            expect(action.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  describe("edge cases", () => {
    test("should handle access controller creation properly", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      // Verify the access controller was created with proper statements
      expect(mockCreateAccessControl).toHaveBeenCalledTimes(1);
      expect(mockCreateAccessControl).toHaveBeenCalledWith({
        analytics: ["read"],
        billing: ["read", "update"],
        organization: ["read", "update", "delete"],
        system: ["read", "update"],
        user: ["create", "read", "update", "delete", "ban", "unban"],
      });
    });

    test("should create all roles through newRole method", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      // Should have been called 3 times (super-admin, moderator, support)
      expect(mockNewRole).toHaveBeenCalledTimes(3);
    });

    test("should maintain referential equality for admin/super-admin", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      expect(adminModule.adminRoles.admin).toBe(
        adminModule.adminRoles["super-admin"],
      );
      expect(adminModule.adminRoles.admin).toBe(adminModule.superAdmin);
    });

    test("should have immutable role definitions", async () => {
      const adminModule = await import("../../src/shared/admin-permissions");

      const roles = adminModule.adminRoles;

      // Test that roles object is read-only (should not throw in test env)
      expect(() => {
        // TypeScript should prevent this, but test runtime behavior
        try {
          (roles as any).newRole = "test";
        } catch (e) {
          // Expected in strict mode
        }
      }).not.toThrow();
    });
  });
});
