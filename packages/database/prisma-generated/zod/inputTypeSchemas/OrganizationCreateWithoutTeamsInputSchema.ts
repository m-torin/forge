import type { Prisma } from '../../client';

import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { MemberCreateNestedManyWithoutOrganizationInputSchema } from './MemberCreateNestedManyWithoutOrganizationInputSchema';
import { InvitationCreateNestedManyWithoutOrganizationInputSchema } from './InvitationCreateNestedManyWithoutOrganizationInputSchema';

export const OrganizationCreateWithoutTeamsInputSchema: z.ZodType<Prisma.OrganizationCreateWithoutTeamsInput> = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional().nullable(),
  members: z.lazy(() => MemberCreateNestedManyWithoutOrganizationInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutOrganizationInputSchema).optional()
}).strict();

export default OrganizationCreateWithoutTeamsInputSchema;
