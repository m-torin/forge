import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrFindReplaceRejectUpdateManyMutationInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectUpdateManyMutationInputSchema'
import { JrFindReplaceRejectUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectUncheckedUpdateManyInputSchema'
import { JrFindReplaceRejectWhereInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectWhereInputSchema'

export const JrFindReplaceRejectUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyAndReturnArgs> = z.object({
  data: z.union([ JrFindReplaceRejectUpdateManyMutationInputSchema,JrFindReplaceRejectUncheckedUpdateManyInputSchema ]),
  where: JrFindReplaceRejectWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default JrFindReplaceRejectUpdateManyAndReturnArgsSchema;
