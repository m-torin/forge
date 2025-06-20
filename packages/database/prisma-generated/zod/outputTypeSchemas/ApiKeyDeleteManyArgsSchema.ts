import { z } from 'zod';
import type { Prisma } from '../../client';
import { ApiKeyWhereInputSchema } from '../inputTypeSchemas/ApiKeyWhereInputSchema'

export const ApiKeyDeleteManyArgsSchema: z.ZodType<Prisma.ApiKeyDeleteManyArgs> = z.object({
  where: ApiKeyWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ApiKeyDeleteManyArgsSchema;
