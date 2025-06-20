import { z } from 'zod';
import type { Prisma } from '../../client';
import { MemberCreateManyInputSchema } from '../inputTypeSchemas/MemberCreateManyInputSchema'

export const MemberCreateManyArgsSchema: z.ZodType<Prisma.MemberCreateManyArgs> = z.object({
  data: z.union([ MemberCreateManyInputSchema,MemberCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default MemberCreateManyArgsSchema;
