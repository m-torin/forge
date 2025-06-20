import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationCreateWithoutInvitationsInputSchema } from './OrganizationCreateWithoutInvitationsInputSchema';
import { OrganizationUncheckedCreateWithoutInvitationsInputSchema } from './OrganizationUncheckedCreateWithoutInvitationsInputSchema';
import { OrganizationCreateOrConnectWithoutInvitationsInputSchema } from './OrganizationCreateOrConnectWithoutInvitationsInputSchema';
import { OrganizationUpsertWithoutInvitationsInputSchema } from './OrganizationUpsertWithoutInvitationsInputSchema';
import { OrganizationWhereUniqueInputSchema } from './OrganizationWhereUniqueInputSchema';
import { OrganizationUpdateToOneWithWhereWithoutInvitationsInputSchema } from './OrganizationUpdateToOneWithWhereWithoutInvitationsInputSchema';
import { OrganizationUpdateWithoutInvitationsInputSchema } from './OrganizationUpdateWithoutInvitationsInputSchema';
import { OrganizationUncheckedUpdateWithoutInvitationsInputSchema } from './OrganizationUncheckedUpdateWithoutInvitationsInputSchema';

export const OrganizationUpdateOneRequiredWithoutInvitationsNestedInputSchema: z.ZodType<Prisma.OrganizationUpdateOneRequiredWithoutInvitationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrganizationCreateWithoutInvitationsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutInvitationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutInvitationsInputSchema).optional(),
  upsert: z.lazy(() => OrganizationUpsertWithoutInvitationsInputSchema).optional(),
  connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrganizationUpdateToOneWithWhereWithoutInvitationsInputSchema),z.lazy(() => OrganizationUpdateWithoutInvitationsInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutInvitationsInputSchema) ]).optional(),
}).strict();

export default OrganizationUpdateOneRequiredWithoutInvitationsNestedInputSchema;
