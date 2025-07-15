import { z } from 'zod';

export const VerificationTokenScalarFieldEnumSchema = z.enum([
  'createdAt',
  'expires',
  'identifier',
  'token',
]);
