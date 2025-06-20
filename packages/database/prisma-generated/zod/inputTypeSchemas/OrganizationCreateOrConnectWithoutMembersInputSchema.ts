import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationWhereUniqueInputSchema } from './OrganizationWhereUniqueInputSchema';
import { OrganizationCreateWithoutMembersInputSchema } from './OrganizationCreateWithoutMembersInputSchema';
import { OrganizationUncheckedCreateWithoutMembersInputSchema } from './OrganizationUncheckedCreateWithoutMembersInputSchema';

export const OrganizationCreateOrConnectWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationCreateOrConnectWithoutMembersInput> = z.object({
  where: z.lazy(() => OrganizationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutMembersInputSchema) ]),
}).strict();

export default OrganizationCreateOrConnectWithoutMembersInputSchema;
