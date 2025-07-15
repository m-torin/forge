import { z } from 'zod';

export const NodeScalarFieldEnumSchema = z.enum([
  'arn',
  'createdAt',
  'flowId',
  'id',
  'infrastructureId',
  'name',
  'position',
  'metadata',
  'rfId',
  'type',
  'updatedAt',
  'deleted',
]);
