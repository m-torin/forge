/**
 * Permissions and access control tests
 */

import { describe, expect } from 'vitest';

import { ac, admin, member, owner, roles } from '../../src/shared/permissions';

describe('access Control and Permissions', () => {
  describe('access Controller', () => {
    test('should create access controller with correct statements', () => {
      expect(ac).toBeDefined();
      expect(typeof ac.newRole).toBe('function');
    });

    test('should have all required statement types', () => {
      // Test that the access controller can create roles with the expected statements
      const testRole = ac.newRole({
        billing: ['view'],
        project: ['create'],
        settings: ['view'],
      });

      expect(testRole).toBeDefined();
    });
  });

  describe('owner Role', () => {
    test('should have full permissions', () => {
      expect(owner).toBeDefined();

      // Owner should have all billing permissions
      expect(owner.statements.billing).toContain('view');
      expect(owner.statements.billing).toContain('manage');

      // Owner should have all project permissions
      expect(owner.statements.project).toContain('create');
      expect(owner.statements.project).toContain('share');
      expect(owner.statements.project).toContain('update');
      expect(owner.statements.project).toContain('delete');

      // Owner should have all settings permissions
      expect(owner.statements.settings).toContain('view');
      expect(owner.statements.settings).toContain('update');
    });

    test('should have organization permissions from ownerAc', () => {
      // Owner should inherit organization permissions
      expect(owner.statements).toHaveProperty('organization');
      expect(owner.statements).toHaveProperty('member');
    });
  });

  describe('admin Role', () => {
    test('should have limited billing permissions', () => {
      expect(admin).toBeDefined();

      // Admin should only view billing, not manage
      expect(admin.statements.billing).toContain('view');
      expect(admin.statements.billing).not.toContain('manage');
    });

    test('should have most project permissions except delete', () => {
      expect(admin.statements.project).toContain('create');
      expect(admin.statements.project).toContain('share');
      expect(admin.statements.project).toContain('update');
      expect(admin.statements.project).not.toContain('delete');
    });

    test('should have settings permissions', () => {
      expect(admin.statements.settings).toContain('view');
      expect(admin.statements.settings).toContain('update');
    });

    test('should have organization permissions from adminAc', () => {
      expect(admin.statements).toHaveProperty('organization');
      expect(admin.statements).toHaveProperty('member');
    });
  });

  describe('member Role', () => {
    test('should have no billing permissions', () => {
      expect(member).toBeDefined();
      expect(member.statements.billing).toStrictEqual([]);
    });

    test('should have limited project permissions', () => {
      expect(member.statements.project).toContain('create');
      expect(member.statements.project).not.toContain('share');
      expect(member.statements.project).not.toContain('update');
      expect(member.statements.project).not.toContain('delete');
    });

    test('should have read-only settings permissions', () => {
      expect(member.statements.settings).toContain('view');
      expect(member.statements.settings).not.toContain('update');
    });

    test('should have organization permissions from memberAc', () => {
      expect(member.statements).toHaveProperty('organization');
      expect(member.statements).toHaveProperty('member');
    });
  });

  describe('roles Export', () => {
    test('should export all roles', () => {
      expect(roles).toHaveProperty('owner');
      expect(roles).toHaveProperty('admin');
      expect(roles).toHaveProperty('member');

      expect(roles.owner).toBe(owner);
      expect(roles.admin).toBe(admin);
      expect(roles.member).toBe(member);
    });

    test('should have the correct role hierarchy', () => {
      // Owner should have more permissions than admin
      expect(owner.statements.billing.length).toBeGreaterThan(admin.statements.billing.length);
      expect(owner.statements.project.length).toBeGreaterThan(admin.statements.project.length);

      // Admin should have more permissions than member
      expect(admin.statements.billing.length).toBeGreaterThan(member.statements.billing.length);
      expect(admin.statements.project.length).toBeGreaterThan(member.statements.project.length);
      expect(admin.statements.settings.length).toBeGreaterThan(member.statements.settings.length);
    });
  });

  describe('permission Validation', () => {
    test('should validate that permissions are arrays', () => {
      [owner, admin, member].forEach(role => {
        expect(Array.isArray(role.statements.billing)).toBeTruthy();
        expect(Array.isArray(role.statements.project)).toBeTruthy();
        expect(Array.isArray(role.statements.settings)).toBeTruthy();
      });
    });

    test('should validate that permissions contain only valid actions', () => {
      const validBillingActions = ['view', 'manage'];
      const validProjectActions = ['create', 'share', 'update', 'delete'];
      const validSettingsActions = ['view', 'update'];

      [owner, admin, member].forEach(role => {
        role.statements.billing.forEach((action: string) => {
          expect(validBillingActions).toContain(action);
        });

        role.statements.project.forEach((action: string) => {
          expect(validProjectActions).toContain(action);
        });

        role.statements.settings.forEach((action: string) => {
          expect(validSettingsActions).toContain(action);
        });
      });
    });
  });
});
