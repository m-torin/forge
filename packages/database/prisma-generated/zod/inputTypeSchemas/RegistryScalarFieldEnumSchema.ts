import { z } from 'zod';

export const RegistryScalarFieldEnumSchema = z.enum([
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'deletedById',
  'title',
  'description',
  'type',
  'isPublic',
  'eventDate',
  'createdByUserId',
]);

export default RegistryScalarFieldEnumSchema;
