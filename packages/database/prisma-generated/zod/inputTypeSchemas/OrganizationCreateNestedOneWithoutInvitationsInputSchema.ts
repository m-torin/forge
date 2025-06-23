import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationCreateWithoutInvitationsInputSchema } from './OrganizationCreateWithoutInvitationsInputSchema';
import { OrganizationUncheckedCreateWithoutInvitationsInputSchema } from './OrganizationUncheckedCreateWithoutInvitationsInputSchema';
import { OrganizationCreateOrConnectWithoutInvitationsInputSchema } from './OrganizationCreateOrConnectWithoutInvitationsInputSchema';
import { OrganizationWhereUniqueInputSchema } from './OrganizationWhereUniqueInputSchema';

export const OrganizationCreateNestedOneWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationCreateNestedOneWithoutInvitationsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => OrganizationCreateWithoutInvitationsInputSchema),
          z.lazy(() => OrganizationUncheckedCreateWithoutInvitationsInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => OrganizationCreateOrConnectWithoutInvitationsInputSchema)
        .optional(),
      connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional(),
    })
    .strict();

export default OrganizationCreateNestedOneWithoutInvitationsInputSchema;
