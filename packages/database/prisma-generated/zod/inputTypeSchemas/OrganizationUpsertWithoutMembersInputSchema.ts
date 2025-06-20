import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationUpdateWithoutMembersInputSchema } from './OrganizationUpdateWithoutMembersInputSchema';
import { OrganizationUncheckedUpdateWithoutMembersInputSchema } from './OrganizationUncheckedUpdateWithoutMembersInputSchema';
import { OrganizationCreateWithoutMembersInputSchema } from './OrganizationCreateWithoutMembersInputSchema';
import { OrganizationUncheckedCreateWithoutMembersInputSchema } from './OrganizationUncheckedCreateWithoutMembersInputSchema';
import { OrganizationWhereInputSchema } from './OrganizationWhereInputSchema';

export const OrganizationUpsertWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationUpsertWithoutMembersInput> = z.object({
  update: z.union([ z.lazy(() => OrganizationUpdateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutMembersInputSchema) ]),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutMembersInputSchema) ]),
  where: z.lazy(() => OrganizationWhereInputSchema).optional()
}).strict();

export default OrganizationUpsertWithoutMembersInputSchema;
