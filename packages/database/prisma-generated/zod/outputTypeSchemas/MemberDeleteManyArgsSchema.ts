import { z } from 'zod';
import type { Prisma } from '../../client';
import { MemberWhereInputSchema } from '../inputTypeSchemas/MemberWhereInputSchema'

export const MemberDeleteManyArgsSchema: z.ZodType<Prisma.MemberDeleteManyArgs> = z.object({
  where: MemberWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MemberDeleteManyArgsSchema;
