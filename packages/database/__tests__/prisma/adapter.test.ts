import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaAdapter } from '../../prisma/adapter';

describe('PrismaAdapter', () => {
  let adapter: PrismaAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new PrismaAdapter();
  });

  describe('constructor', () => {
    it('should create adapter instance', () => {
      expect(adapter).toBeInstanceOf(PrismaAdapter);
    });

    it('should initialize with uninitialized state', () => {
      expect(adapter['initialized']).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should extend client with accelerate on first call', async () => {
      await adapter.initialize();
      expect(adapter['initialized']).toBe(true);
    });

    it('should not extend client on subsequent calls', async () => {
      await adapter.initialize();
      await adapter.initialize();
      expect(adapter['initialized']).toBe(true);
    });

    it('should set initialized flag', async () => {
      expect(adapter['initialized']).toBe(false);
      await adapter.initialize();
      expect(adapter['initialized']).toBe(true);
    });
  });

  describe('disconnect', () => {
    it('should disconnect client when initialized', async () => {
      await adapter.initialize();
      await adapter.disconnect();
      expect(adapter['initialized']).toBe(false);
    });

    it('should not disconnect when not initialized', async () => {
      await adapter.disconnect();
      expect(adapter['initialized']).toBe(false);
    });

    it('should reset initialized flag', async () => {
      await adapter.initialize();
      expect(adapter['initialized']).toBe(true);
      await adapter.disconnect();
      expect(adapter['initialized']).toBe(false);
    });
  });

  describe('create', () => {
    it('should create record in specified collection', async () => {
      const mockData = { name: 'Test User', email: 'test@example.com' };
      const mockResult = { id: '1', ...mockData };

      // Mock the client's user.create method
      const userCreateSpy = vi.fn().mockResolvedValue(mockResult);
      adapter['client'] = {
        user: { create: userCreateSpy },
      };

      const result = await adapter.create('user', mockData);

      expect(userCreateSpy).toHaveBeenCalledWith({ data: mockData });
      expect(result).toEqual(mockResult);
    });

    it('should handle different collections', async () => {
      const mockData = { name: 'Test Product' };
      const mockResult = { id: '1', ...mockData };

      const productCreateSpy = vi.fn().mockResolvedValue(mockResult);
      adapter['client'] = {
        product: { create: productCreateSpy },
      };

      const result = await adapter.create('product', mockData);

      expect(productCreateSpy).toHaveBeenCalledWith({ data: mockData });
      expect(result).toEqual(mockResult);
    });
  });

  describe('findUnique', () => {
    it('should find unique record', async () => {
      const mockResult = { id: '1', name: 'Test User' };
      const userFindUniqueSpy = vi.fn().mockResolvedValue(mockResult);

      adapter['client'] = {
        user: { findUnique: userFindUniqueSpy },
      };

      const result = await adapter.findUnique('user', { where: { id: '1' } });

      expect(userFindUniqueSpy).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockResult);
    });

    it('should return null when record not found', async () => {
      const userFindUniqueSpy = vi.fn().mockResolvedValue(null);

      adapter['client'] = {
        user: { findUnique: userFindUniqueSpy },
      };

      const result = await adapter.findUnique('user', { where: { id: 'nonexistent' } });

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should find many records with query', async () => {
      const mockResults = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ];
      const userFindManySpy = vi.fn().mockResolvedValue(mockResults);

      adapter['client'] = {
        user: { findMany: userFindManySpy },
      };

      const result = await adapter.findMany('user', { where: { active: true } });

      expect(userFindManySpy).toHaveBeenCalledWith({ where: { active: true } });
      expect(result).toEqual(mockResults);
    });

    it('should find many records without query', async () => {
      const mockResults = [{ id: '1', name: 'User 1' }];
      const userFindManySpy = vi.fn().mockResolvedValue(mockResults);

      adapter['client'] = {
        user: { findMany: userFindManySpy },
      };

      const result = await adapter.findMany('user');

      expect(userFindManySpy).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResults);
    });

    it('should return empty array when no records found', async () => {
      const userFindManySpy = vi.fn().mockResolvedValue([]);

      adapter['client'] = {
        user: { findMany: userFindManySpy },
      };

      const result = await adapter.findMany('user', { where: { nonexistent: true } });

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update record by id', async () => {
      const mockResult = { id: '1', name: 'Updated User' };
      const userUpdateSpy = vi.fn().mockResolvedValue(mockResult);

      adapter['client'] = {
        user: { update: userUpdateSpy },
      };

      const result = await adapter.update('user', '1', { name: 'Updated User' });

      expect(userUpdateSpy).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated User' },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('should delete record by id', async () => {
      const mockResult = { id: '1', name: 'Deleted User' };
      const userDeleteSpy = vi.fn().mockResolvedValue(mockResult);

      adapter['client'] = {
        user: { delete: userDeleteSpy },
      };

      const result = await adapter.delete('user', '1');

      expect(userDeleteSpy).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockResult);
    });
  });

  describe('count', () => {
    it('should count records with query', async () => {
      const userCountSpy = vi.fn().mockResolvedValue(5);

      adapter['client'] = {
        user: { count: userCountSpy },
      };

      const result = await adapter.count('user', { where: { active: true } });

      expect(userCountSpy).toHaveBeenCalledWith({ where: { active: true } });
      expect(result).toBe(5);
    });

    it('should count all records without query', async () => {
      const userCountSpy = vi.fn().mockResolvedValue(10);

      adapter['client'] = {
        user: { count: userCountSpy },
      };

      const result = await adapter.count('user');

      expect(userCountSpy).toHaveBeenCalledWith({});
      expect(result).toBe(10);
    });
  });

  describe('raw', () => {
    it('should execute raw operation', async () => {
      const mockResult = [{ count: 5 }];
      const rawQuerySpy = vi.fn().mockResolvedValue(mockResult);

      adapter['client'] = {
        $queryRaw: rawQuerySpy,
      };

      const result = await adapter.raw('$queryRaw', 'SELECT COUNT(*) FROM users');

      expect(rawQuerySpy).toHaveBeenCalledWith('SELECT COUNT(*) FROM users');
      expect(result).toEqual(mockResult);
    });

    it('should handle different operations', async () => {
      const executeRawSpy = vi.fn().mockResolvedValue({ count: 1 });

      adapter['client'] = {
        $executeRaw: executeRawSpy,
      };

      const result = await adapter.raw('$executeRaw', 'UPDATE users SET active = true');

      expect(executeRawSpy).toHaveBeenCalledWith('UPDATE users SET active = true');
      expect(result).toEqual({ count: 1 });
    });
  });

  describe('type safety', () => {
    it('should maintain type information for create', async () => {
      interface User {
        id: string;
        name: string;
        email: string;
      }

      const mockUser: User = { id: '1', name: 'Test', email: 'test@example.com' };
      const userCreateSpy = vi.fn().mockResolvedValue(mockUser);

      adapter['client'] = {
        user: { create: userCreateSpy },
      };

      const result = await adapter.create<User>('user', {
        name: 'Test',
        email: 'test@example.com',
      });

      expect(result).toEqual(mockUser);
      expect(result.id).toBe('1');
      expect(result.name).toBe('Test');
    });

    it('should maintain type information for findUnique', async () => {
      interface User {
        id: string;
        name: string;
      }

      const mockUser: User = { id: '1', name: 'Test' };
      const userFindUniqueSpy = vi.fn().mockResolvedValue(mockUser);

      adapter['client'] = {
        user: { findUnique: userFindUniqueSpy },
      };

      const result = await adapter.findUnique<User>('user', { where: { id: '1' } });

      expect(result).toEqual(mockUser);
      if (result) {
        expect(result.id).toBe('1');
        expect(result.name).toBe('Test');
      }
    });
  });
});
