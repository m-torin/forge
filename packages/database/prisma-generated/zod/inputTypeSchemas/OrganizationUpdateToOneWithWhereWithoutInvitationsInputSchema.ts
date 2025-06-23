import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationWhereInputSchema } from './OrganizationWhereInputSchema';
import { OrganizationUpdateWithoutInvitationsInputSchema } from './OrganizationUpdateWithoutInvitationsInputSchema';
import { OrganizationUncheckedUpdateWithoutInvitationsInputSchema } from './OrganizationUncheckedUpdateWithoutInvitationsInputSchema';

export const OrganizationUpdateToOneWithWhereWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationUpdateToOneWithWhereWithoutInvitationsInput> =
  z
    .object({
      where: z.lazy(() => OrganizationWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => OrganizationUpdateWithoutInvitationsInputSchema),
        z.lazy(() => OrganizationUncheckedUpdateWithoutInvitationsInputSchema),
      ]),
    })
    .strict();

export default OrganizationUpdateToOneWithWhereWithoutInvitationsInputSchema;
