import { z } from 'zod';

export const SecretScalarFieldEnumSchema = z.enum([
  'name',
  'category',
  'createdAt',
  'flowId',
  'id',
  'nodeId',
  'secret',
  'shouldEncrypt',
  'metadata',
  'updatedAt',
  'deleted',
]);
