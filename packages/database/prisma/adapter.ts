import { withAccelerate } from '@prisma/extension-accelerate';

import { PrismaClient } from '../generated/client';
import { type DatabaseAdapter } from '../types';

export class PrismaAdapter implements DatabaseAdapter {
  private client: any; // Use any to allow for extended client types
  private initialized = false;

  constructor() {
    this.client = new PrismaClient();
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      this.client = this.client.$extends(withAccelerate());
      this.initialized = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.initialized) {
      await this.client.$disconnect();
      this.initialized = false;
    }
  }

  async create<T>(collection: string, data: any): Promise<T> {
    // @ts-ignore - Dynamic access to Prisma models
    return this.client[collection].create({
      data,
    }) as Promise<T>;
  }

  async findUnique<T>(collection: string, query: any): Promise<T | null> {
    // @ts-ignore - Dynamic access to Prisma models
    return this.client[collection].findUnique(query) as Promise<T | null>;
  }

  async findMany<T>(collection: string, query?: any): Promise<T[]> {
    // @ts-ignore - Dynamic access to Prisma models
    return this.client[collection].findMany(query || {}) as Promise<T[]>;
  }

  async update<T>(collection: string, id: string, data: any): Promise<T> {
    // @ts-ignore - Dynamic access to Prisma models
    return this.client[collection].update({
      data,
      where: { id },
    }) as Promise<T>;
  }

  async delete<T>(collection: string, id: string): Promise<T> {
    // @ts-ignore - Dynamic access to Prisma models
    return this.client[collection].delete({
      where: { id },
    }) as Promise<T>;
  }

  async count(collection: string, query?: any): Promise<number> {
    // @ts-ignore - Dynamic access to Prisma models
    return this.client[collection].count(query || {});
  }

  async raw<T = any>(operation: string, params: any): Promise<T> {
    // For direct access to Prisma client operations
    // @ts-ignore - Dynamic access to Prisma operations
    return this.client[operation](params) as Promise<T>;
  }

  // Get the underlying Prisma client for direct access
  getClient(): PrismaClient {
    return this.client;
  }
}
