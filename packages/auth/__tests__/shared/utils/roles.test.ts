/**
 * Tests for shared role utilities
 */

import { describe, expect, it } from 'vitest';

describe('role utilities', () => {
  describe('hasRolePermission', () => {
    it('should allow same role', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      const hierarchy = ['admin', 'user'];
      const result = rolesModule.hasRolePermission('admin', 'admin', hierarchy);

      expect(result).toBe(true);
    });

    it('should allow higher role to access lower role permissions', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      const hierarchy = ['admin', 'user'];
      const result = rolesModule.hasRolePermission('admin', 'user', hierarchy);

      expect(result).toBe(true);
    });

    it('should deny lower role access to higher role permissions', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      const hierarchy = ['admin', 'user'];
      const result = rolesModule.hasRolePermission('user', 'admin', hierarchy);

      expect(result).toBe(false);
    });

    it('should deny unknown user role', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      const hierarchy = ['admin', 'user'];
      // @ts-expect-error - testing invalid role
      const result = rolesModule.hasRolePermission('unknown', 'user', hierarchy);

      expect(result).toBe(false);
    });

    it('should deny unknown required role', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      const hierarchy = ['admin', 'user'];
      // @ts-expect-error - testing invalid role
      const result = rolesModule.hasRolePermission('admin', 'unknown', hierarchy);

      expect(result).toBe(false);
    });

    it('should work with complex hierarchy', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      const hierarchy = ['super-admin', 'admin', 'moderator', 'user', 'guest'];

      expect(rolesModule.hasRolePermission('super-admin', 'guest', hierarchy)).toBe(true);
      expect(rolesModule.hasRolePermission('admin', 'user', hierarchy)).toBe(true);
      expect(rolesModule.hasRolePermission('user', 'admin', hierarchy)).toBe(false);
      expect(rolesModule.hasRolePermission('guest', 'user', hierarchy)).toBe(false);
    });
  });

  describe('hasOrganizationPermission', () => {
    it('should allow owner all permissions', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.hasOrganizationPermission('owner', 'admin')).toBe(true);
      expect(rolesModule.hasOrganizationPermission('owner', 'member')).toBe(true);
      expect(rolesModule.hasOrganizationPermission('owner', 'guest')).toBe(true);
    });

    it('should allow admin appropriate permissions', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.hasOrganizationPermission('admin', 'owner')).toBe(false);
      expect(rolesModule.hasOrganizationPermission('admin', 'admin')).toBe(true);
      expect(rolesModule.hasOrganizationPermission('admin', 'member')).toBe(true);
      expect(rolesModule.hasOrganizationPermission('admin', 'guest')).toBe(true);
    });

    it('should limit member permissions', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.hasOrganizationPermission('member', 'owner')).toBe(false);
      expect(rolesModule.hasOrganizationPermission('member', 'admin')).toBe(false);
      expect(rolesModule.hasOrganizationPermission('member', 'member')).toBe(true);
      expect(rolesModule.hasOrganizationPermission('member', 'guest')).toBe(true);
    });

    it('should limit guest permissions', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.hasOrganizationPermission('guest', 'owner')).toBe(false);
      expect(rolesModule.hasOrganizationPermission('guest', 'admin')).toBe(false);
      expect(rolesModule.hasOrganizationPermission('guest', 'member')).toBe(false);
      expect(rolesModule.hasOrganizationPermission('guest', 'guest')).toBe(true);
    });
  });

  describe('hasTeamPermission', () => {
    it('should allow team owner all permissions', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.hasTeamPermission('owner', 'admin')).toBe(true);
      expect(rolesModule.hasTeamPermission('owner', 'member')).toBe(true);
    });

    it('should allow team admin appropriate permissions', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.hasTeamPermission('admin', 'owner')).toBe(false);
      expect(rolesModule.hasTeamPermission('admin', 'admin')).toBe(true);
      expect(rolesModule.hasTeamPermission('admin', 'member')).toBe(true);
    });

    it('should limit team member permissions', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.hasTeamPermission('member', 'owner')).toBe(false);
      expect(rolesModule.hasTeamPermission('member', 'admin')).toBe(false);
      expect(rolesModule.hasTeamPermission('member', 'member')).toBe(true);
    });
  });

  describe('hasUserPermission', () => {
    it('should allow super-admin all permissions', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.hasUserPermission('super-admin', 'admin')).toBe(true);
      expect(rolesModule.hasUserPermission('super-admin', 'user')).toBe(true);
    });

    it('should allow admin appropriate permissions', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.hasUserPermission('admin', 'super-admin')).toBe(false);
      expect(rolesModule.hasUserPermission('admin', 'admin')).toBe(true);
      expect(rolesModule.hasUserPermission('admin', 'user')).toBe(true);
    });

    it('should limit user permissions', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.hasUserPermission('user', 'super-admin')).toBe(false);
      expect(rolesModule.hasUserPermission('user', 'admin')).toBe(false);
      expect(rolesModule.hasUserPermission('user', 'user')).toBe(true);
    });
  });

  describe('convenience functions', () => {
    it('should check organization owner correctly', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.isOrganizationOwner('owner')).toBe(true);
      expect(rolesModule.isOrganizationOwner('admin')).toBe(false);
      expect(rolesModule.isOrganizationOwner('member')).toBe(false);
      expect(rolesModule.isOrganizationOwner('guest')).toBe(false);
    });

    it('should check organization admin correctly', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.isOrganizationAdmin('owner')).toBe(true);
      expect(rolesModule.isOrganizationAdmin('admin')).toBe(true);
      expect(rolesModule.isOrganizationAdmin('member')).toBe(false);
      expect(rolesModule.isOrganizationAdmin('guest')).toBe(false);
    });

    it('should check team owner correctly', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.isTeamOwner('owner')).toBe(true);
      expect(rolesModule.isTeamOwner('admin')).toBe(false);
      expect(rolesModule.isTeamOwner('member')).toBe(false);
    });

    it('should check team admin correctly', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.isTeamAdmin('owner')).toBe(true);
      expect(rolesModule.isTeamAdmin('admin')).toBe(true);
      expect(rolesModule.isTeamAdmin('member')).toBe(false);
    });

    it('should check super admin correctly', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.isSuperAdmin('super-admin')).toBe(true);
      expect(rolesModule.isSuperAdmin('admin')).toBe(false);
      expect(rolesModule.isSuperAdmin('user')).toBe(false);
    });

    it('should check admin correctly', async () => {
      const rolesModule = await import('@/shared/utils/roles');

      expect(rolesModule.isAdmin('super-admin')).toBe(true);
      expect(rolesModule.isAdmin('admin')).toBe(true);
      expect(rolesModule.isAdmin('user')).toBe(false);
    });
  });
});
