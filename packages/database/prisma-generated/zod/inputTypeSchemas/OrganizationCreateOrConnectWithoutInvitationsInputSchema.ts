import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationWhereUniqueInputSchema } from './OrganizationWhereUniqueInputSchema';
import { OrganizationCreateWithoutInvitationsInputSchema } from './OrganizationCreateWithoutInvitationsInputSchema';
import { OrganizationUncheckedCreateWithoutInvitationsInputSchema } from './OrganizationUncheckedCreateWithoutInvitationsInputSchema';

export const OrganizationCreateOrConnectWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationCreateOrConnectWithoutInvitationsInput> = z.object({
  where: z.lazy(() => OrganizationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutInvitationsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutInvitationsInputSchema) ]),
}).strict();

export default OrganizationCreateOrConnectWithoutInvitationsInputSchema;
