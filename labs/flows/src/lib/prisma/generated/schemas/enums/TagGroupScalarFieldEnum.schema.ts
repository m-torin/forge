import { z } from 'zod';

export const TagGroupScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'color',
  'deleted',
  'createdAt',
  'updatedAt',
  'metadata',
  'instanceId',
]);
