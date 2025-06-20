import type { Prisma } from '../../client';

import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { MemberUncheckedCreateNestedManyWithoutOrganizationInputSchema } from './MemberUncheckedCreateNestedManyWithoutOrganizationInputSchema';
import { TeamUncheckedCreateNestedManyWithoutOrganizationInputSchema } from './TeamUncheckedCreateNestedManyWithoutOrganizationInputSchema';

export const OrganizationUncheckedCreateWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationUncheckedCreateWithoutInvitationsInput> = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional().nullable(),
  members: z.lazy(() => MemberUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
  teams: z.lazy(() => TeamUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional()
}).strict();

export default OrganizationUncheckedCreateWithoutInvitationsInputSchema;
