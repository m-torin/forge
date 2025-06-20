import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationUpdateWithoutInvitationsInputSchema } from './OrganizationUpdateWithoutInvitationsInputSchema';
import { OrganizationUncheckedUpdateWithoutInvitationsInputSchema } from './OrganizationUncheckedUpdateWithoutInvitationsInputSchema';
import { OrganizationCreateWithoutInvitationsInputSchema } from './OrganizationCreateWithoutInvitationsInputSchema';
import { OrganizationUncheckedCreateWithoutInvitationsInputSchema } from './OrganizationUncheckedCreateWithoutInvitationsInputSchema';
import { OrganizationWhereInputSchema } from './OrganizationWhereInputSchema';

export const OrganizationUpsertWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationUpsertWithoutInvitationsInput> = z.object({
  update: z.union([ z.lazy(() => OrganizationUpdateWithoutInvitationsInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutInvitationsInputSchema) ]),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutInvitationsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutInvitationsInputSchema) ]),
  where: z.lazy(() => OrganizationWhereInputSchema).optional()
}).strict();

export default OrganizationUpsertWithoutInvitationsInputSchema;
