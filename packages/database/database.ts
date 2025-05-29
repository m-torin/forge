import 'server-only';
import { DatabaseAdapter, DatabaseProvider } from './types';

export class Database {
  private adapter: DatabaseAdapter;
  private static instance: Database;
  private provider: DatabaseProvider;

  private constructor(provider: DatabaseProvider = 'prisma') {
    this.provider = provider;
    // The actual adapter will be lazy-loaded when needed
    this.adapter = null as unknown as DatabaseAdapter;
  }

  private async getAdapter(): Promise<DatabaseAdapter> {
    if (!this.adapter) {
      switch (this.provider) {
        case 'prisma': {
          const { PrismaAdapter } = await import('./prisma/adapter');
          this.adapter = new PrismaAdapter();
          break;
        }
        case 'firestore': {
          const { FirestoreAdapter } = await import('./firestore/adapter');
          this.adapter = new FirestoreAdapter();
          break;
        }
        default: {
          const { PrismaAdapter } = await import('./prisma/adapter');
          this.adapter = new PrismaAdapter();
        }
      }
      await this.adapter.initialize();
    }
    return this.adapter;
  }

  public static getInstance(provider?: DatabaseProvider): Database {
    if (!Database.instance) {
      Database.instance = new Database(provider);
    }
    return Database.instance;
  }

  // Proxy methods to the adapter
  public async create<T>(collection: string, data: any): Promise<T> {
    const adapter = await this.getAdapter();
    return adapter.create<T>(collection, data);
  }

  public async findUnique<T>(collection: string, query: any): Promise<T | null> {
    const adapter = await this.getAdapter();
    return adapter.findUnique<T>(collection, query);
  }

  public async findMany<T>(collection: string, query?: any): Promise<T[]> {
    const adapter = await this.getAdapter();
    return adapter.findMany<T>(collection, query);
  }

  public async update<T>(collection: string, id: string, data: any): Promise<T> {
    const adapter = await this.getAdapter();
    return adapter.update<T>(collection, id, data);
  }

  public async delete<T>(collection: string, id: string): Promise<T> {
    const adapter = await this.getAdapter();
    return adapter.delete<T>(collection, id);
  }

  public async count(collection: string, query?: any): Promise<number> {
    const adapter = await this.getAdapter();
    return adapter.count(collection, query);
  }

  public async raw<T = any>(operation: string, params: any): Promise<T> {
    const adapter = await this.getAdapter();
    return adapter.raw<T>(operation, params);
  }

  // Get the current provider
  public getProvider(): DatabaseProvider {
    return this.provider;
  }

  // Allow switching providers at runtime (useful for testing)
  public async setProvider(provider: DatabaseProvider): Promise<void> {
    if (this.provider !== provider) {
      if (this.adapter) {
        await this.adapter.disconnect();
      }
      this.provider = provider;
      this.adapter = null as unknown as DatabaseAdapter;
    }
  }
}

// Create and export database instance
export const database = Database.getInstance(
  (process.env.DATABASE_PROVIDER as DatabaseProvider) || 'prisma'
);
