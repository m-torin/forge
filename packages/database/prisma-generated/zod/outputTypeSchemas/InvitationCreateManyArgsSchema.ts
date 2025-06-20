import { z } from 'zod';
import type { Prisma } from '../../client';
import { InvitationCreateManyInputSchema } from '../inputTypeSchemas/InvitationCreateManyInputSchema'

export const InvitationCreateManyArgsSchema: z.ZodType<Prisma.InvitationCreateManyArgs> = z.object({
  data: z.union([ InvitationCreateManyInputSchema,InvitationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default InvitationCreateManyArgsSchema;
