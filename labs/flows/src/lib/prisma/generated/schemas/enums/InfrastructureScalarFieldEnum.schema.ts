import { z } from 'zod';

export const InfrastructureScalarFieldEnumSchema = z.enum([
  'arn',
  'canControl',
  'createdAt',
  'data',
  'id',
  'name',
  'type',
  'metadata',
  'updatedAt',
  'deleted',
]);
