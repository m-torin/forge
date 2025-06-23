import { z } from 'zod';

export const OrganizationScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'slug',
  'logo',
  'description',
  'metadata',
  'createdAt',
  'updatedAt',
]);

export default OrganizationScalarFieldEnumSchema;
