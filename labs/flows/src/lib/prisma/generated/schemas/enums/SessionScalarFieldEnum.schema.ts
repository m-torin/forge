import { z } from 'zod';

export const SessionScalarFieldEnumSchema = z.enum([
  'createdAt',
  'expires',
  'id',
  'sessionToken',
  'userId',
]);
