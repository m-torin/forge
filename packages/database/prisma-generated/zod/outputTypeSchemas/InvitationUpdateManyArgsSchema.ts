import { z } from 'zod';
import type { Prisma } from '../../client';
import { InvitationUpdateManyMutationInputSchema } from '../inputTypeSchemas/InvitationUpdateManyMutationInputSchema'
import { InvitationUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/InvitationUncheckedUpdateManyInputSchema'
import { InvitationWhereInputSchema } from '../inputTypeSchemas/InvitationWhereInputSchema'

export const InvitationUpdateManyArgsSchema: z.ZodType<Prisma.InvitationUpdateManyArgs> = z.object({
  data: z.union([ InvitationUpdateManyMutationInputSchema,InvitationUncheckedUpdateManyInputSchema ]),
  where: InvitationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default InvitationUpdateManyArgsSchema;
