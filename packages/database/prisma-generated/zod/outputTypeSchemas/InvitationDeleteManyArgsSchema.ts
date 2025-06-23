import { z } from 'zod';
import type { Prisma } from '../../client';
import { InvitationWhereInputSchema } from '../inputTypeSchemas/InvitationWhereInputSchema';

export const InvitationDeleteManyArgsSchema: z.ZodType<Prisma.InvitationDeleteManyArgs> = z
  .object({
    where: InvitationWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default InvitationDeleteManyArgsSchema;
