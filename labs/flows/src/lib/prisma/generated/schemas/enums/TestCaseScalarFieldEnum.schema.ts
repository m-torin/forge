import { z } from 'zod';

export const TestCaseScalarFieldEnumSchema = z.enum([
  'color',
  'createdAt',
  'flowId',
  'id',
  'name',
  'metadata',
  'updatedAt',
  'deleted',
]);
