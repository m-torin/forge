/**
 * Tests for shared role utilities
 */

import { describe, expect } from 'vitest';

describe('role utilities', () => {
  describe('hasRolePermission', () => {
    test('should allow same role', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      const hierarchy = ['admin', 'user'];
      const result = rolesModule.hasRolePermission('admin', 'admin', hierarchy);

      expect(result).toBeTruthy();
    });

    test('should allow higher role to access lower role permissions', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      const hierarchy = ['admin', 'user'];
      const result = rolesModule.hasRolePermission('admin', 'user', hierarchy);

      expect(result).toBeTruthy();
    });

    test('should deny lower role access to higher role permissions', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      const hierarchy = ['admin', 'user'];
      const result = rolesModule.hasRolePermission('user', 'admin', hierarchy);

      expect(result).toBeFalsy();
    });

    test('should deny unknown user role', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      const hierarchy = ['admin', 'user'];
      const result = rolesModule.hasRolePermission('unknown', 'user', hierarchy);

      expect(result).toBeFalsy();
    });

    test('should deny unknown required role', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      const hierarchy = ['admin', 'user'];
      const result = rolesModule.hasRolePermission('admin', 'unknown', hierarchy);

      expect(result).toBeFalsy();
    });

    test('should work with complex hierarchy', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      const hierarchy = ['super-admin', 'admin', 'moderator', 'user', 'guest'];

      expect(rolesModule.hasRolePermission('super-admin', 'guest', hierarchy)).toBeTruthy();
      expect(rolesModule.hasRolePermission('admin', 'user', hierarchy)).toBeTruthy();
      expect(rolesModule.hasRolePermission('user', 'admin', hierarchy)).toBeFalsy();
      expect(rolesModule.hasRolePermission('guest', 'user', hierarchy)).toBeFalsy();
    });
  });

  describe('hasOrganizationPermission', () => {
    test('should allow owner all permissions', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.hasOrganizationPermission('owner', 'admin')).toBeTruthy();
      expect(rolesModule.hasOrganizationPermission('owner', 'member')).toBeTruthy();
      expect(rolesModule.hasOrganizationPermission('owner', 'guest')).toBeTruthy();
    });

    test('should allow admin appropriate permissions', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.hasOrganizationPermission('admin', 'owner')).toBeFalsy();
      expect(rolesModule.hasOrganizationPermission('admin', 'admin')).toBeTruthy();
      expect(rolesModule.hasOrganizationPermission('admin', 'member')).toBeTruthy();
      expect(rolesModule.hasOrganizationPermission('admin', 'guest')).toBeTruthy();
    });

    test('should limit member permissions', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.hasOrganizationPermission('member', 'owner')).toBeFalsy();
      expect(rolesModule.hasOrganizationPermission('member', 'admin')).toBeFalsy();
      expect(rolesModule.hasOrganizationPermission('member', 'member')).toBeTruthy();
      expect(rolesModule.hasOrganizationPermission('member', 'guest')).toBeTruthy();
    });

    test('should limit guest permissions', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.hasOrganizationPermission('guest', 'owner')).toBeFalsy();
      expect(rolesModule.hasOrganizationPermission('guest', 'admin')).toBeFalsy();
      expect(rolesModule.hasOrganizationPermission('guest', 'member')).toBeFalsy();
      expect(rolesModule.hasOrganizationPermission('guest', 'guest')).toBeTruthy();
    });
  });

  describe('hasTeamPermission', () => {
    test('should allow team owner all permissions', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.hasTeamPermission('owner', 'admin')).toBeTruthy();
      expect(rolesModule.hasTeamPermission('owner', 'member')).toBeTruthy();
    });

    test('should allow team admin appropriate permissions', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.hasTeamPermission('admin', 'owner')).toBeFalsy();
      expect(rolesModule.hasTeamPermission('admin', 'admin')).toBeTruthy();
      expect(rolesModule.hasTeamPermission('admin', 'member')).toBeTruthy();
    });

    test('should limit team member permissions', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.hasTeamPermission('member', 'owner')).toBeFalsy();
      expect(rolesModule.hasTeamPermission('member', 'admin')).toBeFalsy();
      expect(rolesModule.hasTeamPermission('member', 'member')).toBeTruthy();
    });
  });

  describe('hasUserPermission', () => {
    test('should allow super-admin all permissions', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.hasUserPermission('super-admin', 'admin')).toBeTruthy();
      expect(rolesModule.hasUserPermission('super-admin', 'user')).toBeTruthy();
    });

    test('should allow admin appropriate permissions', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.hasUserPermission('admin', 'super-admin')).toBeFalsy();
      expect(rolesModule.hasUserPermission('admin', 'admin')).toBeTruthy();
      expect(rolesModule.hasUserPermission('admin', 'user')).toBeTruthy();
    });

    test('should limit user permissions', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.hasUserPermission('user', 'super-admin')).toBeFalsy();
      expect(rolesModule.hasUserPermission('user', 'admin')).toBeFalsy();
      expect(rolesModule.hasUserPermission('user', 'user')).toBeTruthy();
    });
  });

  describe('convenience functions', () => {
    test('should check organization owner correctly', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.isOrganizationOwner('owner')).toBeTruthy();
      expect(rolesModule.isOrganizationOwner('admin')).toBeFalsy();
      expect(rolesModule.isOrganizationOwner('member')).toBeFalsy();
      expect(rolesModule.isOrganizationOwner('guest')).toBeFalsy();
    });

    test('should check organization admin correctly', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.isOrganizationAdmin('owner')).toBeTruthy();
      expect(rolesModule.isOrganizationAdmin('admin')).toBeTruthy();
      expect(rolesModule.isOrganizationAdmin('member')).toBeFalsy();
      expect(rolesModule.isOrganizationAdmin('guest')).toBeFalsy();
    });

    test('should check team owner correctly', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.isTeamOwner('owner')).toBeTruthy();
      expect(rolesModule.isTeamOwner('admin')).toBeFalsy();
      expect(rolesModule.isTeamOwner('member')).toBeFalsy();
    });

    test('should check team admin correctly', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.isTeamAdmin('owner')).toBeTruthy();
      expect(rolesModule.isTeamAdmin('admin')).toBeTruthy();
      expect(rolesModule.isTeamAdmin('member')).toBeFalsy();
    });

    test('should check super admin correctly', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.isSuperAdmin('super-admin')).toBeTruthy();
      expect(rolesModule.isSuperAdmin('admin')).toBeFalsy();
      expect(rolesModule.isSuperAdmin('user')).toBeFalsy();
    });

    test('should check admin correctly', async () => {
      const rolesModule = await import('#/shared/utils/roles');

      expect(rolesModule.isAdmin('super-admin')).toBeTruthy();
      expect(rolesModule.isAdmin('admin')).toBeTruthy();
      expect(rolesModule.isAdmin('user')).toBeFalsy();
    });
  });
});
