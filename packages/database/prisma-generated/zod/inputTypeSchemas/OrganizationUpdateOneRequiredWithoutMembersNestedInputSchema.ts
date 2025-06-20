import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationCreateWithoutMembersInputSchema } from './OrganizationCreateWithoutMembersInputSchema';
import { OrganizationUncheckedCreateWithoutMembersInputSchema } from './OrganizationUncheckedCreateWithoutMembersInputSchema';
import { OrganizationCreateOrConnectWithoutMembersInputSchema } from './OrganizationCreateOrConnectWithoutMembersInputSchema';
import { OrganizationUpsertWithoutMembersInputSchema } from './OrganizationUpsertWithoutMembersInputSchema';
import { OrganizationWhereUniqueInputSchema } from './OrganizationWhereUniqueInputSchema';
import { OrganizationUpdateToOneWithWhereWithoutMembersInputSchema } from './OrganizationUpdateToOneWithWhereWithoutMembersInputSchema';
import { OrganizationUpdateWithoutMembersInputSchema } from './OrganizationUpdateWithoutMembersInputSchema';
import { OrganizationUncheckedUpdateWithoutMembersInputSchema } from './OrganizationUncheckedUpdateWithoutMembersInputSchema';

export const OrganizationUpdateOneRequiredWithoutMembersNestedInputSchema: z.ZodType<Prisma.OrganizationUpdateOneRequiredWithoutMembersNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrganizationCreateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutMembersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutMembersInputSchema).optional(),
  upsert: z.lazy(() => OrganizationUpsertWithoutMembersInputSchema).optional(),
  connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrganizationUpdateToOneWithWhereWithoutMembersInputSchema),z.lazy(() => OrganizationUpdateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutMembersInputSchema) ]).optional(),
}).strict();

export default OrganizationUpdateOneRequiredWithoutMembersNestedInputSchema;
