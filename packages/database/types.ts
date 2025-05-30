export interface DatabaseAdapter {
  count(collection: string, query?: any): Promise<number>;
  create<T>(collection: string, data: any): Promise<T>;
  delete<T>(collection: string, id: string): Promise<T>;
  disconnect(): Promise<void>;
  findMany<T>(collection: string, query?: any): Promise<T[]>;
  findUnique<T>(collection: string, query: any): Promise<T | null>;
  getClient(): any;
  initialize(): Promise<void>;
  raw<T = any>(operation: string, params: any): Promise<T>;
  update<T>(collection: string, id: string, data: any): Promise<T>;
}
