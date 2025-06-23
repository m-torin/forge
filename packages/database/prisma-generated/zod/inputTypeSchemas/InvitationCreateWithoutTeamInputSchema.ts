import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationCreateNestedOneWithoutInvitationsInputSchema } from './OrganizationCreateNestedOneWithoutInvitationsInputSchema';
import { UserCreateNestedOneWithoutInvitationsSentInputSchema } from './UserCreateNestedOneWithoutInvitationsSentInputSchema';

export const InvitationCreateWithoutTeamInputSchema: z.ZodType<Prisma.InvitationCreateWithoutTeamInput> =
  z
    .object({
      id: z.string(),
      email: z.string(),
      role: z.string(),
      status: z.string(),
      expiresAt: z.coerce.date(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional().nullable(),
      organization: z.lazy(() => OrganizationCreateNestedOneWithoutInvitationsInputSchema),
      invitedBy: z.lazy(() => UserCreateNestedOneWithoutInvitationsSentInputSchema),
    })
    .strict();

export default InvitationCreateWithoutTeamInputSchema;
