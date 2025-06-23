import { z } from 'zod';

export const FandomScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'slug',
  'isFictional',
  'copy',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'deletedById',
]);

export default FandomScalarFieldEnumSchema;
