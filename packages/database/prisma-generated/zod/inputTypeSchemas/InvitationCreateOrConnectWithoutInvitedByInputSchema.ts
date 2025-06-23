import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';
import { InvitationCreateWithoutInvitedByInputSchema } from './InvitationCreateWithoutInvitedByInputSchema';
import { InvitationUncheckedCreateWithoutInvitedByInputSchema } from './InvitationUncheckedCreateWithoutInvitedByInputSchema';

export const InvitationCreateOrConnectWithoutInvitedByInputSchema: z.ZodType<Prisma.InvitationCreateOrConnectWithoutInvitedByInput> =
  z
    .object({
      where: z.lazy(() => InvitationWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => InvitationCreateWithoutInvitedByInputSchema),
        z.lazy(() => InvitationUncheckedCreateWithoutInvitedByInputSchema),
      ]),
    })
    .strict();

export default InvitationCreateOrConnectWithoutInvitedByInputSchema;
