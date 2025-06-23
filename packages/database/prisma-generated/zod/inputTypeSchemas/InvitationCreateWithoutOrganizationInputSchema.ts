import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamCreateNestedOneWithoutInvitationsInputSchema } from './TeamCreateNestedOneWithoutInvitationsInputSchema';
import { UserCreateNestedOneWithoutInvitationsSentInputSchema } from './UserCreateNestedOneWithoutInvitationsSentInputSchema';

export const InvitationCreateWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationCreateWithoutOrganizationInput> =
  z
    .object({
      id: z.string(),
      email: z.string(),
      role: z.string(),
      status: z.string(),
      expiresAt: z.coerce.date(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional().nullable(),
      team: z.lazy(() => TeamCreateNestedOneWithoutInvitationsInputSchema).optional(),
      invitedBy: z.lazy(() => UserCreateNestedOneWithoutInvitationsSentInputSchema),
    })
    .strict();

export default InvitationCreateWithoutOrganizationInputSchema;
