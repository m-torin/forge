import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrFindReplaceRejectWhereInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectWhereInputSchema'

export const JrFindReplaceRejectDeleteManyArgsSchema: z.ZodType<Prisma.JrFindReplaceRejectDeleteManyArgs> = z.object({
  where: JrFindReplaceRejectWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default JrFindReplaceRejectDeleteManyArgsSchema;
