import { z } from 'zod';

export const InstanceScalarFieldEnumSchema = z.enum([
  'createdAt',
  'description',
  'id',
  'image',
  'logo',
  'name',
  'metadata',
  'updatedAt',
  'userId',
]);
