import { z } from 'zod';
import type { Prisma } from '../../client';
import { ApiKeyCreateManyInputSchema } from '../inputTypeSchemas/ApiKeyCreateManyInputSchema'

export const ApiKeyCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ApiKeyCreateManyAndReturnArgs> = z.object({
  data: z.union([ ApiKeyCreateManyInputSchema,ApiKeyCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ApiKeyCreateManyAndReturnArgsSchema;
