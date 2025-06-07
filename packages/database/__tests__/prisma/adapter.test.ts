import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaAdapter } from '../../prisma/adapter';

// Mock Prisma client and extensions
const mockPrismaClient = {
  $disconnect: vi.fn(),
  $extends: vi.fn().mockImplementation((extension) => ({
    ...mockPrismaClient,
    user: mockPrismaClient.user,
    product: mockPrismaClient.product,
    $queryRaw: mockPrismaClient.$queryRaw,
    $executeRaw: mockPrismaClient.$executeRaw,
  })),
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  product: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $queryRaw: vi.fn(),
  $executeRaw: vi.fn(),
};

vi.mock('@prisma/extension-accelerate', () => ({
  withAccelerate: vi.fn().mockReturnValue({
    name: 'accelerate-extension',
  }),
}));

vi.mock('../../generated/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    ...mockPrismaClient,
  })),
}));

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

      expect(mockPrismaClient.$extends).toHaveBeenCalled();
      expect(adapter['initialized']).toBe(true);
    });

    it('should not extend client on subsequent calls', async () => {
      await adapter.initialize();
      await adapter.initialize();

      expect(mockPrismaClient.$extends).toHaveBeenCalledTimes(1);
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

      expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
      expect(adapter['initialized']).toBe(false);
    });

    it('should not disconnect when not initialized', async () => {
      await adapter.disconnect();

      expect(mockPrismaClient.$disconnect).not.toHaveBeenCalled();
    });

    it('should reset initialized flag', async () => {
      await adapter.initialize();
      await adapter.disconnect();

      expect(adapter['initialized']).toBe(false);
    });
  });

  describe('create', () => {
    const mockData = { name: 'Test User', email: 'test@example.com' };
    const mockResult = { id: '1', ...mockData };

    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should create record in specified collection', async () => {
      mockPrismaClient.user.create.mockResolvedValue(mockResult);

      const result = await adapter.create('user', mockData);

      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({ data: mockData });
      expect(result).toEqual(mockResult);
    });

    it('should handle different collections', async () => {
      const productData = { name: 'Test Product', price: 100 };
      mockPrismaClient.product.create.mockResolvedValue({ id: '1', ...productData });

      await adapter.create('product', productData);

      expect(mockPrismaClient.product.create).toHaveBeenCalledWith({ data: productData });
    });
  });

  describe('findUnique', () => {
    const mockQuery = { where: { id: '1' } };
    const mockResult = { id: '1', name: 'Test User' };

    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should find unique record', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockResult);

      const result = await adapter.findUnique('user', mockQuery);

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockResult);
    });

    it('should return null when record not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await adapter.findUnique('user', mockQuery);

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    const mockQuery = { where: { active: true } };
    const mockResults = [
      { id: '1', name: 'User 1' },
      { id: '2', name: 'User 2' },
    ];

    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should find many records with query', async () => {
      mockPrismaClient.user.findMany.mockResolvedValue(mockResults);

      const result = await adapter.findMany('user', mockQuery);

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockResults);
    });

    it('should find many records without query', async () => {
      mockPrismaClient.user.findMany.mockResolvedValue(mockResults);

      const result = await adapter.findMany('user');

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResults);
    });

    it('should return empty array when no records found', async () => {
      mockPrismaClient.user.findMany.mockResolvedValue([]);

      const result = await adapter.findMany('user', mockQuery);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const mockId = '1';
    const mockData = { name: 'Updated User' };
    const mockResult = { id: mockId, ...mockData };

    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should update record by id', async () => {
      mockPrismaClient.user.update.mockResolvedValue(mockResult);

      const result = await adapter.update('user', mockId, mockData);

      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: mockId },
        data: mockData,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    const mockId = '1';
    const mockResult = { id: mockId, name: 'Deleted User' };

    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should delete record by id', async () => {
      mockPrismaClient.user.delete.mockResolvedValue(mockResult);

      const result = await adapter.delete('user', mockId);

      expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({
        where: { id: mockId },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('count', () => {
    const mockQuery = { where: { active: true } };
    const mockCount = 5;

    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should count records with query', async () => {
      mockPrismaClient.user.count.mockResolvedValue(mockCount);

      const result = await adapter.count('user', mockQuery);

      expect(mockPrismaClient.user.count).toHaveBeenCalledWith(mockQuery);
      expect(result).toBe(mockCount);
    });

    it('should count all records without query', async () => {
      mockPrismaClient.user.count.mockResolvedValue(mockCount);

      const result = await adapter.count('user');

      expect(mockPrismaClient.user.count).toHaveBeenCalledWith({});
      expect(result).toBe(mockCount);
    });
  });

  describe('raw', () => {
    const mockParams = { query: 'SELECT * FROM users' };
    const mockResult = [{ id: '1', name: 'User 1' }];

    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should execute raw operation', async () => {
      mockPrismaClient.$queryRaw.mockResolvedValue(mockResult);

      const result = await adapter.raw('$queryRaw', mockParams);

      expect(mockPrismaClient.$queryRaw).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual(mockResult);
    });

    it('should handle different operations', async () => {
      mockPrismaClient.$executeRaw.mockResolvedValue(1);

      const result = await adapter.raw('$executeRaw', mockParams);

      expect(mockPrismaClient.$executeRaw).toHaveBeenCalledWith(mockParams);
      expect(result).toBe(1);
    });
  });

  describe('getClient', () => {
    it('should return underlying Prisma client', () => {
      const client = adapter.getClient();

      expect(client).toBe(mockPrismaClient);
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should propagate Prisma errors', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.user.create.mockRejectedValue(error);

      await expect(adapter.create('user', { name: 'Test' })).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle disconnect errors gracefully', async () => {
      const error = new Error('Disconnect failed');
      mockPrismaClient.$disconnect.mockRejectedValue(error);

      await expect(adapter.disconnect()).rejects.toThrow('Disconnect failed');
    });
  });

  describe('type safety', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should maintain type information for create', async () => {
      interface User {
        id: string;
        name: string;
        email: string;
      }

      const userData = { name: 'Test User', email: 'test@example.com' };
      const expectedUser: User = { id: '1', ...userData };
      mockPrismaClient.user.create.mockResolvedValue(expectedUser);

      const result = await adapter.create<User>('user', userData);

      expect(result).toEqual(expectedUser);
      expect(result.id).toBe('1');
      expect(result.name).toBe('Test User');
    });

    it('should maintain type information for findUnique', async () => {
      interface User {
        id: string;
        name: string;
      }

      const expectedUser: User = { id: '1', name: 'Test User' };
      mockPrismaClient.user.findUnique.mockResolvedValue(expectedUser);

      const result = await adapter.findUnique<User>('user', { where: { id: '1' } });

      expect(result).toEqual(expectedUser);
    });
  });
});
