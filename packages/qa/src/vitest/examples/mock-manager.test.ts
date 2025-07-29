/**
 * Example mock manager testing for Vitest
 * This demonstrates how to use the mock manager utilities
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mockDiscovery, mockManager } from '../utils/mock-manager';

// Example services for testing
interface UserService {
  getUser(id: string): Promise<{ id: string; name: string }>;
  createUser(data: { name: string }): Promise<{ id: string; name: string }>;
}

interface AuthService {
  login(credentials: { email: string; password: string }): Promise<{ token: string }>;
  logout(): Promise<void>;
}

describe('mock Manager Examples', () => {
  beforeEach(() => {
    // Clear registry before each test
    mockManager.clearRegistry();
  });

  afterEach(() => {
    // Clean up after each test
    mockManager.clearRegistry();
  });

  describe('mock Registration', () => {
    test('should register and retrieve mocks', () => {
      const userServiceMock = vi.fn();
      userServiceMock.mockName('UserService.getUser');

      const mockId = mockManager.register(userServiceMock, {
        name: 'UserService.getUser',
        type: 'function',
        description: 'Mock for getting user by ID',
        tags: ['user', 'service'],
      });

      expect(mockId).toBeTruthy();
      expect(mockId).toMatch(/^mock-\d+-[a-z0-9]+$/);

      const retrievedMock = mockManager.get(mockId);
      expect(retrievedMock).toBe(userServiceMock);

      const metadata = mockManager.getMetadata(mockId);
      expect(metadata).toBeTruthy();
      expect(metadata!.name).toBe('UserService.getUser');
      expect(metadata!.type).toBe('function');
      expect(metadata!.description).toBe('Mock for getting user by ID');
      expect(metadata!.tags).toStrictEqual(['user', 'service']);
    });

    test('should unregister mocks', () => {
      const mock = vi.fn();
      const mockId = mockManager.register(mock);

      expect(mockManager.get(mockId)).toBe(mock);

      const success = mockManager.unregister(mockId);
      expect(success).toBeTruthy();
      expect(mockManager.get(mockId)).toBeNull();
    });

    test('should handle invalid mock IDs', () => {
      expect(mockManager.get('invalid-id')).toBeNull();
      expect(mockManager.getMetadata('invalid-id')).toBeNull();
      expect(mockManager.unregister('invalid-id')).toBeFalsy();
    });
  });

  describe('mock Groups', () => {
    test('should create and manage groups', () => {
      const success = mockManager.createGroup('user-services', 'Mocks for user-related services');
      expect(success).toBeTruthy();

      // Can't create group with same name
      const duplicate = mockManager.createGroup('user-services');
      expect(duplicate).toBeFalsy();

      const mock1 = vi.fn();
      const mock2 = vi.fn();

      const mockId1 = mockManager.register(mock1, {
        name: 'UserService.getUser',
        group: 'user-services',
      });

      const mockId2 = mockManager.register(mock2, {
        name: 'UserService.createUser',
        group: 'user-services',
      });

      const groupMocks = mockManager.getGroup('user-services');
      expect(groupMocks.size).toBe(2);
      expect(groupMocks.has(mockId1)).toBeTruthy();
      expect(groupMocks.has(mockId2)).toBeTruthy();
    });

    test('should add and remove mocks from groups', () => {
      mockManager.createGroup('auth-services');

      const authMock = vi.fn();
      const mockId = mockManager.register(authMock, {
        name: 'AuthService.login',
      });

      const addSuccess = mockManager.addToGroup(mockId, 'auth-services');
      expect(addSuccess).toBeTruthy();

      const groupMocks = mockManager.getGroup('auth-services');
      expect(groupMocks.has(mockId)).toBeTruthy();

      const removeSuccess = mockManager.removeFromGroup(mockId, 'auth-services');
      expect(removeSuccess).toBeTruthy();

      const updatedGroupMocks = mockManager.getGroup('auth-services');
      expect(updatedGroupMocks.has(mockId)).toBeFalsy();
    });

    test('should delete groups', () => {
      mockManager.createGroup('temp-group');

      const mock = vi.fn();
      const mockId = mockManager.register(mock, {
        name: 'TempService.method',
        group: 'temp-group',
      });

      const deleteSuccess = mockManager.deleteGroup('temp-group');
      expect(deleteSuccess).toBeTruthy();

      const groupMocks = mockManager.getGroup('temp-group');
      expect(groupMocks.size).toBe(0);

      // Mock should still exist but group should be null
      const metadata = mockManager.getMetadata(mockId);
      expect(metadata!.group).toBeNull();
    });

    test('should get all groups', () => {
      mockManager.createGroup('group1');
      mockManager.createGroup('group2');

      const mock1 = vi.fn();
      const mock2 = vi.fn();

      mockManager.register(mock1, { group: 'group1' });
      mockManager.register(mock2, { group: 'group2' });

      const allGroups = mockManager.getAllGroups();
      expect(allGroups.size).toBe(2);
      expect(allGroups.has('group1')).toBeTruthy();
      expect(allGroups.has('group2')).toBeTruthy();
    });
  });

  describe('mock Search and Filtering', () => {
    test('should find mocks by criteria', () => {
      const userMock = vi.fn();
      const authMock = vi.fn();
      const utilMock = vi.fn();

      mockManager.register(userMock, {
        name: 'UserService.getUser',
        type: 'function',
        tags: ['user', 'service'],
      });

      mockManager.register(authMock, {
        name: 'AuthService.login',
        type: 'function',
        tags: ['auth', 'service'],
      });

      mockManager.register(utilMock, {
        name: 'UtilClass.helper',
        type: 'class',
        tags: ['utility'],
      });

      // Find by type
      const functionMocks = mockManager.find({ type: 'function' });
      expect(functionMocks.size).toBe(2);

      const classMocks = mockManager.find({ type: 'class' });
      expect(classMocks.size).toBe(1);

      // Find by tags
      const serviceMocks = mockManager.find({ tags: ['service'] });
      expect(serviceMocks.size).toBe(2);

      const userMocks = mockManager.find({ tags: ['user'] });
      expect(userMocks.size).toBe(1);

      // Find by name
      const specificMock = mockManager.find({ name: 'UserService.getUser' });
      expect(specificMock.size).toBe(1);
    });

    test('should find unused mocks', () => {
      const usedMock = vi.fn();
      const unusedMock = vi.fn();

      mockManager.register(usedMock, { name: 'UsedService.method' });
      mockManager.register(unusedMock, { name: 'UnusedService.method' });

      // Use one mock
      usedMock('test');

      const unusedMocks = mockManager.find({ unused: true });
      expect(unusedMocks.size).toBe(1);

      const usedMocks = mockManager.find({ unused: false });
      expect(usedMocks.size).toBe(1);
    });

    test('should find mocks by group', () => {
      mockManager.createGroup('api-services');

      const apiMock1 = vi.fn();
      const apiMock2 = vi.fn();
      const otherMock = vi.fn();

      mockManager.register(apiMock1, {
        name: 'ApiService.get',
        group: 'api-services',
      });

      mockManager.register(apiMock2, {
        name: 'ApiService.post',
        group: 'api-services',
      });

      mockManager.register(otherMock, {
        name: 'OtherService.method',
      });

      const apiMocks = mockManager.find({ group: 'api-services' });
      expect(apiMocks.size).toBe(2);

      const ungroupedMocks = mockManager.find({ group: undefined });
      expect(ungroupedMocks.size).toBe(1);
    });
  });

  describe('mock Metadata Management', () => {
    test('should update mock metadata', () => {
      const mock = vi.fn();
      const mockId = mockManager.register(mock, {
        name: 'InitialName',
        description: 'Initial description',
      });

      const updateSuccess = mockManager.updateMetadata(mockId, {
        name: 'UpdatedName',
        description: 'Updated description',
        tags: ['updated', 'test'],
      });

      expect(updateSuccess).toBeTruthy();

      const metadata = mockManager.getMetadata(mockId);
      expect(metadata!.name).toBe('UpdatedName');
      expect(metadata!.description).toBe('Updated description');
      expect(metadata!.tags).toStrictEqual(['updated', 'test']);
    });

    test('should mark mocks as used', () => {
      const mock = vi.fn();
      const mockId = mockManager.register(mock);

      const metadata = mockManager.getMetadata(mockId);
      expect(metadata!.lastUsed).toBeNull();

      const markSuccess = mockManager.markAsUsed(mockId);
      expect(markSuccess).toBeTruthy();

      const updatedMetadata = mockManager.getMetadata(mockId);
      expect(updatedMetadata!.lastUsed).toBeTruthy();
      expect(updatedMetadata!.lastUsed).toBeInstanceOf(Date);
    });

    test('should handle invalid metadata updates', () => {
      const updateSuccess = mockManager.updateMetadata('invalid-id', {
        name: 'NewName',
      });

      expect(updateSuccess).toBeFalsy();

      const markSuccess = mockManager.markAsUsed('invalid-id');
      expect(markSuccess).toBeFalsy();
    });
  });

  describe('mock Cleanup', () => {
    test('should cleanup specific mocks', () => {
      const mock1 = vi.fn();
      const mock2 = vi.fn();
      const mock3 = vi.fn();

      const mockId1 = mockManager.register(mock1, { name: 'Mock1' });
      const mockId2 = mockManager.register(mock2, { name: 'Mock2' });
      const mockId3 = mockManager.register(mock3, { name: 'Mock3' });

      const cleanedCount = mockManager.cleanup({
        specific: [mockId1, mockId3],
      });

      expect(cleanedCount).toBe(2);
      expect(mockManager.get(mockId1)).toBeNull();
      expect(mockManager.get(mockId2)).toBeTruthy();
      expect(mockManager.get(mockId3)).toBeNull();
    });

    test('should cleanup by groups', () => {
      mockManager.createGroup('cleanup-group');

      const mock1 = vi.fn();
      const mock2 = vi.fn();
      const mock3 = vi.fn();

      mockManager.register(mock1, {
        name: 'Mock1',
        group: 'cleanup-group',
      });

      mockManager.register(mock2, {
        name: 'Mock2',
        group: 'cleanup-group',
      });

      mockManager.register(mock3, {
        name: 'Mock3',
        // No group
      });

      const cleanedCount = mockManager.cleanup({
        groups: ['cleanup-group'],
      });

      expect(cleanedCount).toBe(2);
      expect(mockManager.getGroup('cleanup-group').size).toBe(0);
      expect(mockManager.find({ name: 'Mock3' }).size).toBe(1);
    });

    test('should cleanup unused mocks', () => {
      const usedMock = vi.fn();
      const unusedMock1 = vi.fn();
      const unusedMock2 = vi.fn();

      mockManager.register(usedMock, { name: 'UsedMock' });
      mockManager.register(unusedMock1, { name: 'UnusedMock1' });
      mockManager.register(unusedMock2, { name: 'UnusedMock2' });

      // Use one mock
      usedMock('test');

      const cleanedCount = mockManager.cleanup({
        cleanupUnused: true,
      });

      expect(cleanedCount).toBe(2);
      expect(mockManager.find({ name: 'UsedMock' }).size).toBe(1);
      expect(mockManager.find({ name: 'UnusedMock1' }).size).toBe(0);
      expect(mockManager.find({ name: 'UnusedMock2' }).size).toBe(0);
    });

    test('should cleanup by age threshold', () => {
      const oldMock = vi.fn();
      const newMock = vi.fn();

      // Register mocks with different ages (simulated)
      const oldMockId = mockManager.register(oldMock, { name: 'OldMock' });
      const newMockId = mockManager.register(newMock, { name: 'NewMock' });

      // Simulate old mock by updating its created date
      const oldMetadata = mockManager.getMetadata(oldMockId);
      expect(oldMetadata).toBeTruthy();
      oldMetadata!.created = new Date(Date.now() - 120000); // 2 minutes ago

      const cleanedCount = mockManager.cleanup({
        ageThreshold: 60000, // 1 minute
      });

      expect(cleanedCount).toBe(1);
      expect(mockManager.get(oldMockId)).toBeNull();
      expect(mockManager.get(newMockId)).toBeTruthy();
    });
  });

  describe('mock Statistics', () => {
    test('should provide registry statistics', () => {
      mockManager.createGroup('stats-group');

      const functionMock = vi.fn();
      const classMock = vi.fn();
      const objectMock = vi.fn();

      mockManager.register(functionMock, {
        name: 'FunctionMock',
        type: 'function',
        group: 'stats-group',
        tags: ['test'],
      });

      mockManager.register(classMock, {
        name: 'ClassMock',
        type: 'class',
        tags: ['test', 'utility'],
      });

      mockManager.register(objectMock, {
        name: 'ObjectMock',
        type: 'object',
      });

      // Use some mocks
      functionMock('test');
      classMock('test');
      // objectMock is unused

      const stats = mockManager.getStats();

      expect(stats.total).toBe(3);
      expect(stats.byType.function).toBe(1);
      expect(stats.byType.class).toBe(1);
      expect(stats.byType.object).toBe(1);
      expect(stats.byGroup['stats-group']).toBe(1);
      expect(stats.used).toBe(2);
      expect(stats.unused).toBe(1);
      expect(stats.withTags).toBe(2);
      expect(stats.averageAge).toBeGreaterThan(0);
    });

    test('should handle empty registry statistics', () => {
      const stats = mockManager.getStats();

      expect(stats.total).toBe(0);
      expect(stats.used).toBe(0);
      expect(stats.unused).toBe(0);
      expect(stats.withTags).toBe(0);
      expect(stats.averageAge).toBe(0);
    });
  });

  describe('mock Discovery', () => {
    test('should discover mocks with default options', async () => {
      const discovered = await mockDiscovery.discoverMocks();

      expect(discovered).toBeTruthy();
      expect(Array.isArray(discovered)).toBeTruthy();
      expect(discovered.length).toBeGreaterThan(0);
    });

    test('should discover internal mocks', async () => {
      const internalMocks = await mockDiscovery.discoverInternalMocks();

      expect(internalMocks).toContain('src/mocks/user.mock.ts');
      expect(internalMocks).toContain('src/mocks/api.mock.ts');
      expect(internalMocks).toContain('src/mocks/database.mock.ts');
    });

    test('should discover package mocks', async () => {
      const packageMocks = await mockDiscovery.discoverPackageMocks();

      expect(packageMocks).toContain('src/mocks/react.mock.ts');
      expect(packageMocks).toContain('src/mocks/next.mock.ts');
      expect(packageMocks).toContain('src/mocks/prisma.mock.ts');
    });

    test('should discover provider mocks', async () => {
      const providerMocks = await mockDiscovery.discoverProviderMocks();

      expect(providerMocks).toContain('src/mocks/auth.mock.ts');
      expect(providerMocks).toContain('src/mocks/analytics.mock.ts');
      expect(providerMocks).toContain('src/mocks/payments.mock.ts');
    });

    test('should get mock usage', async () => {
      const usage = await mockDiscovery.getMockUsage('src/mocks/user.mock.ts');

      expect(usage.files).toBeTruthy();
      expect(Array.isArray(usage.files)).toBeTruthy();
      expect(usage.usage).toBeTruthy();
      expect(Array.isArray(usage.usage)).toBeTruthy();
    });

    test('should find unused mocks', async () => {
      const unusedMocks = await mockDiscovery.findUnusedMocks();

      expect(unusedMocks).toBeTruthy();
      expect(Array.isArray(unusedMocks)).toBeTruthy();
    });

    test('should generate dependency graph', async () => {
      const dependencyGraph = await mockDiscovery.generateDependencyGraph();

      expect(dependencyGraph).toBeInstanceOf(Map);
      expect(dependencyGraph.size).toBeGreaterThan(0);
    });

    test('should discover with custom options', async () => {
      const discovered = await mockDiscovery.discoverMocks({
        includeInternal: true,
        includePackages: false,
        includeProviders: false,
      });

      expect(discovered).toBeTruthy();
      expect(Array.isArray(discovered)).toBeTruthy();
      // Should only include internal mocks
      expect(discovered.every(path => path.includes('src/mocks/'))).toBeTruthy();
    });
  });

  describe('integration Examples', () => {
    test('should manage complex mock scenario', () => {
      // Create groups for different types of services
      mockManager.createGroup('user-services');
      mockManager.createGroup('auth-services');
      mockManager.createGroup('api-services');

      // Create mocks for user services
      const getUserMock = vi.fn<UserService['getUser']>();
      const createUserMock = vi.fn<UserService['createUser']>();

      // Create mocks for auth services
      const loginMock = vi.fn<AuthService['login']>();
      const logoutMock = vi.fn<AuthService['logout']>();

      // Register all mocks
      const getUserId = mockManager.register(getUserMock, {
        name: 'UserService.getUser',
        type: 'function',
        group: 'user-services',
        tags: ['user', 'read'],
        description: 'Get user by ID',
      });

      const createUserId = mockManager.register(createUserMock, {
        name: 'UserService.createUser',
        type: 'function',
        group: 'user-services',
        tags: ['user', 'write'],
        description: 'Create new user',
      });

      const loginId = mockManager.register(loginMock, {
        name: 'AuthService.login',
        type: 'function',
        group: 'auth-services',
        tags: ['auth', 'login'],
        description: 'User login',
      });

      const logoutId = mockManager.register(logoutMock, {
        name: 'AuthService.logout',
        type: 'function',
        group: 'auth-services',
        tags: ['auth', 'logout'],
        description: 'User logout',
      });

      // Configure mock implementations
      getUserMock.mockImplementation(async (id: string) => ({
        id,
        name: `User ${id}`,
      }));

      createUserMock.mockImplementation(async (data: { name: string }) => ({
        id: Math.random().toString(36).substring(7),
        name: data.name,
      }));

      loginMock.mockImplementation(async credentials => ({
        token: 'mock-token-123',
      }));

      logoutMock.mockImplementation(async () => {
        // Mock logout implementation
      });

      // Use some mocks
      getUserMock('user-123');
      createUserMock({ name: 'John Doe' });
      loginMock({ email: 'john@example.com', password: 'password' });
      // logoutMock is unused

      // Verify setup
      expect(mockManager.getGroup('user-services').size).toBe(2);
      expect(mockManager.getGroup('auth-services').size).toBe(2);

      // Find all used mocks
      const usedMocks = mockManager.find({ unused: false });
      expect(usedMocks.size).toBe(3);

      // Find all unused mocks
      const unusedMocks = mockManager.find({ unused: true });
      expect(unusedMocks.size).toBe(1);

      // Get statistics
      const stats = mockManager.getStats();
      expect(stats.total).toBe(4);
      expect(stats.byGroup['user-services']).toBe(2);
      expect(stats.byGroup['auth-services']).toBe(2);
      expect(stats.used).toBe(3);
      expect(stats.unused).toBe(1);

      // Cleanup unused mocks
      const cleanedCount = mockManager.cleanup({
        cleanupUnused: true,
      });
      expect(cleanedCount).toBe(1);

      // Verify cleanup
      expect(mockManager.getGroup('auth-services').size).toBe(1);
      expect(mockManager.find({ name: 'AuthService.logout' }).size).toBe(0);
    });
  });
});
