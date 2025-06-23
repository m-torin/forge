import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationScalarWhereInputSchema } from './InvitationScalarWhereInputSchema';
import { InvitationUpdateManyMutationInputSchema } from './InvitationUpdateManyMutationInputSchema';
import { InvitationUncheckedUpdateManyWithoutOrganizationInputSchema } from './InvitationUncheckedUpdateManyWithoutOrganizationInputSchema';

export const InvitationUpdateManyWithWhereWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationUpdateManyWithWhereWithoutOrganizationInput> =
  z
    .object({
      where: z.lazy(() => InvitationScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => InvitationUpdateManyMutationInputSchema),
        z.lazy(() => InvitationUncheckedUpdateManyWithoutOrganizationInputSchema),
      ]),
    })
    .strict();

export default InvitationUpdateManyWithWhereWithoutOrganizationInputSchema;
