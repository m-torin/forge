import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationCreateNestedOneWithoutInvitationsInputSchema } from './OrganizationCreateNestedOneWithoutInvitationsInputSchema';
import { TeamCreateNestedOneWithoutInvitationsInputSchema } from './TeamCreateNestedOneWithoutInvitationsInputSchema';

export const InvitationCreateWithoutInvitedByInputSchema: z.ZodType<Prisma.InvitationCreateWithoutInvitedByInput> =
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
      team: z.lazy(() => TeamCreateNestedOneWithoutInvitationsInputSchema).optional(),
    })
    .strict();

export default InvitationCreateWithoutInvitedByInputSchema;
