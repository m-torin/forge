/**
 * Tests for shared teams functionality
 */

import { describe, expect } from 'vitest';

describe('shared teams functionality', () => {
  describe('dEFAULT_TEAM_ROLES', () => {
    test('should export default team roles', async () => {
      const teamsModule = await import('../../src/shared/teams');

      expect(teamsModule.DEFAULT_TEAM_ROLES).toBeDefined();
      expect(typeof teamsModule.DEFAULT_TEAM_ROLES).toBe('object');
    });

    test('should include all expected roles', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const roles = teamsModule.DEFAULT_TEAM_ROLES;

      expect(roles.owner).toBeDefined();
      expect(roles.admin).toBeDefined();
      expect(roles.manager).toBeDefined();
      expect(roles.member).toBeDefined();
      expect(roles.guest).toBeDefined();
    });

    test('should have proper role hierarchy', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const roles = teamsModule.DEFAULT_TEAM_ROLES;

      expect(roles.owner.level).toBeGreaterThan(roles.admin.level);
      expect(roles.admin.level).toBeGreaterThan(roles.manager.level);
      expect(roles.manager.level).toBeGreaterThan(roles.member.level);
      expect(roles.member.level).toBeGreaterThan(roles.guest.level);
    });

    test('should have valid permissions for each role', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const roles = teamsModule.DEFAULT_TEAM_ROLES;

      Object.values(roles).forEach(role => {
        expect(role.permissions).toBeInstanceOf(Array);
        expect(role.permissions.length).toBeGreaterThan(0);
        role.permissions.forEach(permission => {
          expect(typeof permission).toBe('string');
          expect(permission.length).toBeGreaterThan(0);
        });
      });
    });

    test('should have owner with highest level permissions', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const owner = teamsModule.DEFAULT_TEAM_ROLES.owner;

      expect(owner.level).toBe(100);
      expect(owner.permissions).toContain('team:delete');
      expect(owner.permissions).toContain('members:manage');
      expect(owner.permissions).toContain('billing:manage');
    });

    test('should have guest with minimal permissions', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const guest = teamsModule.DEFAULT_TEAM_ROLES.guest;

      expect(guest.level).toBe(10);
      expect(guest.permissions).toStrictEqual(['team:read']);
    });
  });

  describe('tEAM_PERMISSIONS', () => {
    test('should export team permissions', async () => {
      const teamsModule = await import('../../src/shared/teams');

      expect(teamsModule.TEAM_PERMISSIONS).toBeDefined();
      expect(typeof teamsModule.TEAM_PERMISSIONS).toBe('object');
    });

    test('should have all permission categories', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const permissions = teamsModule.TEAM_PERMISSIONS;

      expect(permissions.TEAM).toBeDefined();
      expect(permissions.MEMBERS).toBeDefined();
      expect(permissions.INVITATIONS).toBeDefined();
      expect(permissions.SETTINGS).toBeDefined();
      expect(permissions.BILLING).toBeDefined();
    });

    test('should have string values for all permissions', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const permissions = teamsModule.TEAM_PERMISSIONS;

      Object.values(permissions).forEach(category => {
        Object.values(category as Record<string, string>).forEach(permission => {
          expect(typeof permission).toBe('string');
          expect(permission.length).toBeGreaterThan(0);
        });
      });
    });

    test('should follow consistent naming convention', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const permissions = teamsModule.TEAM_PERMISSIONS;

      Object.values(permissions).forEach(category => {
        Object.values(category as Record<string, string>).forEach(permission => {
          expect(permission).toMatch(/^[a-z]+:[a-z]+$/);
        });
      });
    });
  });

  describe('roleHasPermission', () => {
    test('should return true for role with permission', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.roleHasPermission('owner', 'team:delete');

      expect(result).toBeTruthy();
    });

    test('should return false for role without permission', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.roleHasPermission('guest', 'team:delete');

      expect(result).toBeFalsy();
    });

    test('should return false for unknown role', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.roleHasPermission('unknown', 'team:read');

      expect(result).toBeFalsy();
    });

    test('should handle invalid permissions', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.roleHasPermission('owner', 'invalid:permission');

      expect(result).toBeFalsy();
    });

    test('should be case sensitive', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result1 = teamsModule.roleHasPermission('Owner', 'team:read');
      const result2 = teamsModule.roleHasPermission('owner', 'Team:Read');

      expect(result1).toBeFalsy();
      expect(result2).toBeFalsy();
    });
  });

  describe('canActOnUser', () => {
    test('should allow owner to act on any role', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const roles = ['admin', 'manager', 'member', 'guest'];

      roles.forEach(role => {
        const result = teamsModule.canActOnUser('owner', role, 'members:remove');
        expect(result).toBeTruthy();
      });
    });

    test('should not allow lower roles to act on higher roles', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result1 = teamsModule.canActOnUser('admin', 'owner', 'members:remove');
      const result2 = teamsModule.canActOnUser('member', 'admin', 'members:remove');

      expect(result1).toBeFalsy();
      expect(result2).toBeFalsy();
    });

    test('should allow same level actions based on permissions', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.canActOnUser('admin', 'admin', 'members:read');

      expect(result).toBeTruthy();
    });

    test('should respect permission requirements', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.canActOnUser('member', 'guest', 'members:remove');

      expect(result).toBeFalsy(); // Member doesn't have remove permission
    });

    test('should handle unknown roles', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result1 = teamsModule.canActOnUser('unknown', 'member', 'members:read');
      const result2 = teamsModule.canActOnUser('admin', 'unknown', 'members:read');

      expect(result1).toBeFalsy();
      expect(result2).toBeFalsy();
    });
  });

  describe('getHighestRole', () => {
    test('should return highest role from array', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.getHighestRole(['member', 'admin', 'guest']);

      expect(result).toBe('admin');
    });

    test('should handle single role', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.getHighestRole(['member']);

      expect(result).toBe('member');
    });

    test('should return owner as highest', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.getHighestRole(['admin', 'owner', 'member']);

      expect(result).toBe('owner');
    });

    test('should handle empty array', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.getHighestRole([]);

      expect(result).toBe('guest'); // Default fallback
    });

    test('should handle unknown roles', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.getHighestRole(['unknown', 'invalid']);

      expect(result).toBe('guest'); // Fallback when no valid roles
    });

    test('should ignore unknown roles and return highest valid', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.getHighestRole(['unknown', 'admin', 'invalid']);

      expect(result).toBe('admin');
    });
  });

  describe('isValidRole', () => {
    test('should return true for valid roles', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const validRoles = ['owner', 'admin', 'manager', 'member', 'guest'];

      validRoles.forEach(role => {
        expect(teamsModule.isValidRole(role)).toBeTruthy();
      });
    });

    test('should return false for invalid roles', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const invalidRoles = ['unknown', 'invalid', '', 'ADMIN', 'Owner'];

      invalidRoles.forEach(role => {
        expect(teamsModule.isValidRole(role)).toBeFalsy();
      });
    });

    test('should be case sensitive', async () => {
      const teamsModule = await import('../../src/shared/teams');

      expect(teamsModule.isValidRole('Admin')).toBeFalsy();
      expect(teamsModule.isValidRole('OWNER')).toBeFalsy();
    });
  });

  describe('getAllRoles', () => {
    test('should return all available roles', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const roles = teamsModule.getAllRoles();

      expect(roles).toBeInstanceOf(Array);
      expect(roles).toHaveLength(5); // owner, admin, manager, member, guest
    });

    test('should return roles sorted by level descending', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const roles = teamsModule.getAllRoles();

      for (let i = 0; i < roles.length - 1; i++) {
        expect(roles[i].level).toBeGreaterThanOrEqual(roles[i + 1].level);
      }
    });

    test('should include all role properties', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const roles = teamsModule.getAllRoles();

      roles.forEach(role => {
        expect(role).toHaveProperty('id');
        expect(role).toHaveProperty('name');
        expect(role).toHaveProperty('description');
        expect(role).toHaveProperty('level');
        expect(role).toHaveProperty('permissions');
        expect(typeof role.id).toBe('string');
        expect(typeof role.name).toBe('string');
        expect(typeof role.description).toBe('string');
        expect(typeof role.level).toBe('number');
        expect(Array.isArray(role.permissions)).toBeTruthy();
      });
    });
  });

  describe('getAssignableRoles', () => {
    test('should return roles assignable by owner', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const roles = teamsModule.getAssignableRoles('owner');

      expect(roles).toHaveLength(4); // Can assign admin, manager, member, guest
      expect(roles.find(r => r.id === 'owner')).toBeUndefined();
    });

    test('should return roles assignable by admin', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const roles = teamsModule.getAssignableRoles('admin');

      expect(roles).toHaveLength(3); // Can assign manager, member, guest
      expect(roles.find(r => r.id === 'owner')).toBeUndefined();
      expect(roles.find(r => r.id === 'admin')).toBeUndefined();
    });

    test('should return empty array for guest', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const roles = teamsModule.getAssignableRoles('guest');

      expect(roles).toStrictEqual([]);
    });

    test('should return empty array for unknown role', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const roles = teamsModule.getAssignableRoles('unknown');

      expect(roles).toStrictEqual([]);
    });

    test('should return roles in descending order by level', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const roles = teamsModule.getAssignableRoles('owner');

      for (let i = 0; i < roles.length - 1; i++) {
        expect(roles[i].level).toBeGreaterThanOrEqual(roles[i + 1].level);
      }
    });
  });

  describe('canAssignRole', () => {
    test('should allow owner to assign any role except owner', async () => {
      const teamsModule = await import('../../src/shared/teams');

      expect(teamsModule.canAssignRole('owner', 'admin')).toBeTruthy();
      expect(teamsModule.canAssignRole('owner', 'manager')).toBeTruthy();
      expect(teamsModule.canAssignRole('owner', 'member')).toBeTruthy();
      expect(teamsModule.canAssignRole('owner', 'guest')).toBeTruthy();
      expect(teamsModule.canAssignRole('owner', 'owner')).toBeFalsy();
    });

    test('should allow admin to assign lower roles only', async () => {
      const teamsModule = await import('../../src/shared/teams');

      expect(teamsModule.canAssignRole('admin', 'manager')).toBeTruthy();
      expect(teamsModule.canAssignRole('admin', 'member')).toBeTruthy();
      expect(teamsModule.canAssignRole('admin', 'guest')).toBeTruthy();
      expect(teamsModule.canAssignRole('admin', 'admin')).toBeFalsy();
      expect(teamsModule.canAssignRole('admin', 'owner')).toBeFalsy();
    });

    test('should not allow lower roles to assign higher roles', async () => {
      const teamsModule = await import('../../src/shared/teams');

      expect(teamsModule.canAssignRole('member', 'admin')).toBeFalsy();
      expect(teamsModule.canAssignRole('guest', 'member')).toBeFalsy();
    });

    test('should handle unknown roles', async () => {
      const teamsModule = await import('../../src/shared/teams');

      expect(teamsModule.canAssignRole('unknown', 'member')).toBeFalsy();
      expect(teamsModule.canAssignRole('admin', 'unknown')).toBeFalsy();
    });
  });

  describe('getDefaultTeamPermissions', () => {
    test('should return default permissions array', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const permissions = teamsModule.getDefaultTeamPermissions();

      expect(permissions).toBeInstanceOf(Array);
      expect(permissions.length).toBeGreaterThan(0);
    });

    test('should return basic team permissions', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const permissions = teamsModule.getDefaultTeamPermissions();

      expect(permissions).toContain('team:read');
      expect(permissions).toContain('members:read');
    });

    test('should only include safe default permissions', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const permissions = teamsModule.getDefaultTeamPermissions();

      // Should not include destructive permissions
      expect(permissions).not.toContain('team:delete');
      expect(permissions).not.toContain('members:remove');
      expect(permissions).not.toContain('billing:manage');
    });
  });

  describe('getPermissionsForRole', () => {
    test('should return permissions for valid roles', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const ownerPermissions = teamsModule.getPermissionsForRole('owner');
      const guestPermissions = teamsModule.getPermissionsForRole('guest');

      expect(ownerPermissions).toBeInstanceOf(Array);
      expect(guestPermissions).toBeInstanceOf(Array);
      expect(ownerPermissions.length).toBeGreaterThan(guestPermissions.length);
    });

    test('should return empty array for unknown role', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const permissions = teamsModule.getPermissionsForRole('unknown');

      expect(permissions).toStrictEqual([]);
    });

    test('should match DEFAULT_TEAM_ROLES permissions', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const adminPermissions = teamsModule.getPermissionsForRole('admin');
      const expectedPermissions = teamsModule.DEFAULT_TEAM_ROLES.admin.permissions;

      expect(adminPermissions).toStrictEqual(expectedPermissions);
    });

    test('should handle case sensitivity', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const permissions = teamsModule.getPermissionsForRole('Admin');

      expect(permissions).toStrictEqual([]);
    });
  });

  describe('isValidTeamPermission', () => {
    test('should return true for valid permissions', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const validPermissions = [
        'team:read',
        'team:write',
        'team:delete',
        'members:read',
        'members:write',
        'members:remove',
        'members:manage',
        'invitations:create',
        'settings:read',
        'billing:read',
      ];

      validPermissions.forEach(permission => {
        expect(teamsModule.isValidTeamPermission(permission)).toBeTruthy();
      });
    });

    test('should return false for invalid permissions', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const invalidPermissions = [
        'invalid:permission',
        'team:invalid',
        'invalid:read',
        '',
        'team',
        'read',
        'team:',
        ':read',
      ];

      invalidPermissions.forEach(permission => {
        expect(teamsModule.isValidTeamPermission(permission)).toBeFalsy();
      });
    });

    test('should be case sensitive', async () => {
      const teamsModule = await import('../../src/shared/teams');

      expect(teamsModule.isValidTeamPermission('Team:Read')).toBeFalsy();
      expect(teamsModule.isValidTeamPermission('TEAM:READ')).toBeFalsy();
    });

    test('should validate permission format', async () => {
      const teamsModule = await import('../../src/shared/teams');

      expect(teamsModule.isValidTeamPermission('team:read:extra')).toBeFalsy();
      expect(teamsModule.isValidTeamPermission('team.read')).toBeFalsy();
      expect(teamsModule.isValidTeamPermission('team read')).toBeFalsy();
    });
  });

  describe('edge cases', () => {
    test('should handle null and undefined inputs', async () => {
      const teamsModule = await import('../../src/shared/teams');

      expect(teamsModule.roleHasPermission(null as any, 'team:read')).toBeFalsy();
      expect(teamsModule.roleHasPermission('admin', null as any)).toBeFalsy();
      expect(teamsModule.isValidRole(undefined as any)).toBeFalsy();
      expect(teamsModule.getPermissionsForRole(null as any)).toStrictEqual([]);
    });

    test('should handle empty strings', async () => {
      const teamsModule = await import('../../src/shared/teams');

      expect(teamsModule.roleHasPermission('', 'team:read')).toBeFalsy();
      expect(teamsModule.roleHasPermission('admin', '')).toBeFalsy();
      expect(teamsModule.isValidRole('')).toBeFalsy();
      expect(teamsModule.isValidTeamPermission('')).toBeFalsy();
    });

    test('should handle arrays with duplicate roles', async () => {
      const teamsModule = await import('../../src/shared/teams');

      const result = teamsModule.getHighestRole(['admin', 'member', 'admin', 'guest']);

      expect(result).toBe('admin');
    });

    test('should maintain consistent permission validation', async () => {
      const teamsModule = await import('../../src/shared/teams');

      // All permissions from DEFAULT_TEAM_ROLES should be valid
      Object.values(teamsModule.DEFAULT_TEAM_ROLES).forEach(role => {
        role.permissions.forEach(permission => {
          expect(teamsModule.isValidTeamPermission(permission)).toBeTruthy();
        });
      });
    });
  });
});
