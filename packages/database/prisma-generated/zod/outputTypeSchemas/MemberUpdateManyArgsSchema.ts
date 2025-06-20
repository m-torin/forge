import { z } from 'zod';
import type { Prisma } from '../../client';
import { MemberUpdateManyMutationInputSchema } from '../inputTypeSchemas/MemberUpdateManyMutationInputSchema'
import { MemberUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/MemberUncheckedUpdateManyInputSchema'
import { MemberWhereInputSchema } from '../inputTypeSchemas/MemberWhereInputSchema'

export const MemberUpdateManyArgsSchema: z.ZodType<Prisma.MemberUpdateManyArgs> = z.object({
  data: z.union([ MemberUpdateManyMutationInputSchema,MemberUncheckedUpdateManyInputSchema ]),
  where: MemberWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MemberUpdateManyArgsSchema;
