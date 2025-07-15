import { z } from 'zod';

export const EdgeScalarFieldEnumSchema = z.enum([
  'id',
  'sourceNodeId',
  'targetNodeId',
  'flowId',
  'rfId',
  'label',
  'isActive',
  'type',
  'normalizedKey',
  'metadata',
  'createdAt',
  'updatedAt',
  'deleted',
]);
