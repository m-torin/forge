import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutMembersInputSchema } from './UserCreateNestedOneWithoutMembersInputSchema';
import { OrganizationCreateNestedOneWithoutMembersInputSchema } from './OrganizationCreateNestedOneWithoutMembersInputSchema';

export const MemberCreateInputSchema: z.ZodType<Prisma.MemberCreateInput> = z
  .object({
    id: z.string(),
    role: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional().nullable(),
    user: z.lazy(() => UserCreateNestedOneWithoutMembersInputSchema),
    organization: z.lazy(() => OrganizationCreateNestedOneWithoutMembersInputSchema),
  })
  .strict();

export default MemberCreateInputSchema;
