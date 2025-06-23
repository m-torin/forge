import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';
import { InvitationUpdateWithoutOrganizationInputSchema } from './InvitationUpdateWithoutOrganizationInputSchema';
import { InvitationUncheckedUpdateWithoutOrganizationInputSchema } from './InvitationUncheckedUpdateWithoutOrganizationInputSchema';

export const InvitationUpdateWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationUpdateWithWhereUniqueWithoutOrganizationInput> =
  z
    .object({
      where: z.lazy(() => InvitationWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => InvitationUpdateWithoutOrganizationInputSchema),
        z.lazy(() => InvitationUncheckedUpdateWithoutOrganizationInputSchema),
      ]),
    })
    .strict();

export default InvitationUpdateWithWhereUniqueWithoutOrganizationInputSchema;
