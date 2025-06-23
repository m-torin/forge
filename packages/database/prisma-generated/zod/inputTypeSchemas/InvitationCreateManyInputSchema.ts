import type { Prisma } from '../../client';

import { z } from 'zod';

export const InvitationCreateManyInputSchema: z.ZodType<Prisma.InvitationCreateManyInput> = z
  .object({
    id: z.string(),
    email: z.string(),
    invitedById: z.string(),
    organizationId: z.string(),
    role: z.string(),
    teamId: z.string().optional().nullable(),
    status: z.string(),
    expiresAt: z.coerce.date(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional().nullable(),
  })
  .strict();

export default InvitationCreateManyInputSchema;
