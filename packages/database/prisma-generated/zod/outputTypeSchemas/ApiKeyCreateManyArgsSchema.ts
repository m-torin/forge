import { z } from 'zod';
import type { Prisma } from '../../client';
import { ApiKeyCreateManyInputSchema } from '../inputTypeSchemas/ApiKeyCreateManyInputSchema';

export const ApiKeyCreateManyArgsSchema: z.ZodType<Prisma.ApiKeyCreateManyArgs> = z
  .object({
    data: z.union([ApiKeyCreateManyInputSchema, ApiKeyCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export default ApiKeyCreateManyArgsSchema;
