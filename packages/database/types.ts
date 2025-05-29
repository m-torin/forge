import { PrismaClient } from './generated/client';
import { Firestore } from 'firebase-admin/firestore';

// Database provider types
export type DatabaseProvider = 'prisma' | 'firestore';

// Common database operation interface
export interface DatabaseClient {
  // Common database methods
  create<T>(collection: string, data: any): Promise<T>;
  findUnique<T>(collection: string, query: any): Promise<T | null>;
  findMany<T>(collection: string, query?: any): Promise<T[]>;
  update<T>(collection: string, id: string, data: any): Promise<T>;
  delete<T>(collection: string, id: string): Promise<T>;
  count(collection: string, query?: any): Promise<number>;
  // Add other common operations as needed
}

// Database adapter interface
export interface DatabaseAdapter extends DatabaseClient {
  initialize(): Promise<void>;
  disconnect(): Promise<void>;
  raw<T = any>(operation: string, params: any): Promise<T>;
}

// Response type for database operations
export interface DatabaseResponse<T = any> {
  data: T | null;
  error?: string;
  success: boolean;
}

// Specific client types for type safety
export type PrismaClientType = PrismaClient;
export type FirestoreClientType = Firestore;
