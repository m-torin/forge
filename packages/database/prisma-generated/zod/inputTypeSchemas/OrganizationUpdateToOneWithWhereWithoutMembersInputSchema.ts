import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationWhereInputSchema } from './OrganizationWhereInputSchema';
import { OrganizationUpdateWithoutMembersInputSchema } from './OrganizationUpdateWithoutMembersInputSchema';
import { OrganizationUncheckedUpdateWithoutMembersInputSchema } from './OrganizationUncheckedUpdateWithoutMembersInputSchema';

export const OrganizationUpdateToOneWithWhereWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationUpdateToOneWithWhereWithoutMembersInput> = z.object({
  where: z.lazy(() => OrganizationWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrganizationUpdateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutMembersInputSchema) ]),
}).strict();

export default OrganizationUpdateToOneWithWhereWithoutMembersInputSchema;
