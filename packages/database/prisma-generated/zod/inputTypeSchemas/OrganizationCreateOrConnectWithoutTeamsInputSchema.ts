import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationWhereUniqueInputSchema } from './OrganizationWhereUniqueInputSchema';
import { OrganizationCreateWithoutTeamsInputSchema } from './OrganizationCreateWithoutTeamsInputSchema';
import { OrganizationUncheckedCreateWithoutTeamsInputSchema } from './OrganizationUncheckedCreateWithoutTeamsInputSchema';

export const OrganizationCreateOrConnectWithoutTeamsInputSchema: z.ZodType<Prisma.OrganizationCreateOrConnectWithoutTeamsInput> = z.object({
  where: z.lazy(() => OrganizationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutTeamsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutTeamsInputSchema) ]),
}).strict();

export default OrganizationCreateOrConnectWithoutTeamsInputSchema;
