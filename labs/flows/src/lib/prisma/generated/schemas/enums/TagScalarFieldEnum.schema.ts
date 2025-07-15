import { z } from 'zod';

export const TagScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'createdAt',
  'updatedAt',
  'deleted',
  'metadata',
  'flowId',
  'nodeId',
  'tagGroupId',
  'instanceId',
]);
