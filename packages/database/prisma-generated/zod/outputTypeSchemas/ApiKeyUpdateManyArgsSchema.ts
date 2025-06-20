import { z } from 'zod';
import type { Prisma } from '../../client';
import { ApiKeyUpdateManyMutationInputSchema } from '../inputTypeSchemas/ApiKeyUpdateManyMutationInputSchema'
import { ApiKeyUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ApiKeyUncheckedUpdateManyInputSchema'
import { ApiKeyWhereInputSchema } from '../inputTypeSchemas/ApiKeyWhereInputSchema'

export const ApiKeyUpdateManyArgsSchema: z.ZodType<Prisma.ApiKeyUpdateManyArgs> = z.object({
  data: z.union([ ApiKeyUpdateManyMutationInputSchema,ApiKeyUncheckedUpdateManyInputSchema ]),
  where: ApiKeyWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ApiKeyUpdateManyArgsSchema;
