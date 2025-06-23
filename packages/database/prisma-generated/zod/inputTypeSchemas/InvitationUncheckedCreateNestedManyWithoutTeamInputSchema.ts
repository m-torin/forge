import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationCreateWithoutTeamInputSchema } from './InvitationCreateWithoutTeamInputSchema';
import { InvitationUncheckedCreateWithoutTeamInputSchema } from './InvitationUncheckedCreateWithoutTeamInputSchema';
import { InvitationCreateOrConnectWithoutTeamInputSchema } from './InvitationCreateOrConnectWithoutTeamInputSchema';
import { InvitationCreateManyTeamInputEnvelopeSchema } from './InvitationCreateManyTeamInputEnvelopeSchema';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';

export const InvitationUncheckedCreateNestedManyWithoutTeamInputSchema: z.ZodType<Prisma.InvitationUncheckedCreateNestedManyWithoutTeamInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => InvitationCreateWithoutTeamInputSchema),
          z.lazy(() => InvitationCreateWithoutTeamInputSchema).array(),
          z.lazy(() => InvitationUncheckedCreateWithoutTeamInputSchema),
          z.lazy(() => InvitationUncheckedCreateWithoutTeamInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => InvitationCreateOrConnectWithoutTeamInputSchema),
          z.lazy(() => InvitationCreateOrConnectWithoutTeamInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => InvitationCreateManyTeamInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => InvitationWhereUniqueInputSchema),
          z.lazy(() => InvitationWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default InvitationUncheckedCreateNestedManyWithoutTeamInputSchema;
