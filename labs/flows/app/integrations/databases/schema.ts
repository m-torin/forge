import { z } from 'zod';

/** Zod schema for Database Source connection details */
export const dbSchema = z.object({
  databaseType: z.string().min(1, 'Database Type is required'),
  databaseName: z.string().min(1, 'Database Name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().positive('Port must be a positive integer'),
  connectionString: z.string().optional(),
});
