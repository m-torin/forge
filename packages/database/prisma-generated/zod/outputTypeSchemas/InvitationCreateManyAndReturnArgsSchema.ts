import { z } from 'zod';
import type { Prisma } from '../../client';
import { InvitationCreateManyInputSchema } from '../inputTypeSchemas/InvitationCreateManyInputSchema'

export const InvitationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.InvitationCreateManyAndReturnArgs> = z.object({
  data: z.union([ InvitationCreateManyInputSchema,InvitationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default InvitationCreateManyAndReturnArgsSchema;
