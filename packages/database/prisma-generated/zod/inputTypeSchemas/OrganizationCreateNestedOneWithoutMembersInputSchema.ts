import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationCreateWithoutMembersInputSchema } from './OrganizationCreateWithoutMembersInputSchema';
import { OrganizationUncheckedCreateWithoutMembersInputSchema } from './OrganizationUncheckedCreateWithoutMembersInputSchema';
import { OrganizationCreateOrConnectWithoutMembersInputSchema } from './OrganizationCreateOrConnectWithoutMembersInputSchema';
import { OrganizationWhereUniqueInputSchema } from './OrganizationWhereUniqueInputSchema';

export const OrganizationCreateNestedOneWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationCreateNestedOneWithoutMembersInput> = z.object({
  create: z.union([ z.lazy(() => OrganizationCreateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutMembersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutMembersInputSchema).optional(),
  connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional()
}).strict();

export default OrganizationCreateNestedOneWithoutMembersInputSchema;
