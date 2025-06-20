import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrFindReplaceRejectUpdateManyMutationInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectUpdateManyMutationInputSchema'
import { JrFindReplaceRejectUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectUncheckedUpdateManyInputSchema'
import { JrFindReplaceRejectWhereInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectWhereInputSchema'

export const JrFindReplaceRejectUpdateManyArgsSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyArgs> = z.object({
  data: z.union([ JrFindReplaceRejectUpdateManyMutationInputSchema,JrFindReplaceRejectUncheckedUpdateManyInputSchema ]),
  where: JrFindReplaceRejectWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default JrFindReplaceRejectUpdateManyArgsSchema;
