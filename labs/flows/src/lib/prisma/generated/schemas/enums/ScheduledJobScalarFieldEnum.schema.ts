import { z } from 'zod';

export const ScheduledJobScalarFieldEnumSchema = z.enum([
  'createdAt',
  'createdBy',
  'endpoint',
  'frequency',
  'id',
  'name',
  'deleted',
]);
