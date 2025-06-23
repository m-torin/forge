import type { Prisma } from '../../client';

import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { TeamUncheckedCreateNestedManyWithoutOrganizationInputSchema } from './TeamUncheckedCreateNestedManyWithoutOrganizationInputSchema';
import { InvitationUncheckedCreateNestedManyWithoutOrganizationInputSchema } from './InvitationUncheckedCreateNestedManyWithoutOrganizationInputSchema';

export const OrganizationUncheckedCreateWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationUncheckedCreateWithoutMembersInput> =
  z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      logo: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      metadata: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional().nullable(),
      teams: z.lazy(() => TeamUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
      invitations: z
        .lazy(() => InvitationUncheckedCreateNestedManyWithoutOrganizationInputSchema)
        .optional(),
    })
    .strict();

export default OrganizationUncheckedCreateWithoutMembersInputSchema;
