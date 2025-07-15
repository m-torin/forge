import { z } from 'zod';

export const FlowScalarFieldEnumSchema = z.enum([
  'createdAt',
  'id',
  'instanceId',
  'isEnabled',
  'method',
  'name',
  'metadata',
  'updatedAt',
  'viewport',
  'deleted',
]);
