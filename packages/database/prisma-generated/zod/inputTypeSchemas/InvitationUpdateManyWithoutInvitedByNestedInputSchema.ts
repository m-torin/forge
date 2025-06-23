import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationCreateWithoutInvitedByInputSchema } from './InvitationCreateWithoutInvitedByInputSchema';
import { InvitationUncheckedCreateWithoutInvitedByInputSchema } from './InvitationUncheckedCreateWithoutInvitedByInputSchema';
import { InvitationCreateOrConnectWithoutInvitedByInputSchema } from './InvitationCreateOrConnectWithoutInvitedByInputSchema';
import { InvitationUpsertWithWhereUniqueWithoutInvitedByInputSchema } from './InvitationUpsertWithWhereUniqueWithoutInvitedByInputSchema';
import { InvitationCreateManyInvitedByInputEnvelopeSchema } from './InvitationCreateManyInvitedByInputEnvelopeSchema';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';
import { InvitationUpdateWithWhereUniqueWithoutInvitedByInputSchema } from './InvitationUpdateWithWhereUniqueWithoutInvitedByInputSchema';
import { InvitationUpdateManyWithWhereWithoutInvitedByInputSchema } from './InvitationUpdateManyWithWhereWithoutInvitedByInputSchema';
import { InvitationScalarWhereInputSchema } from './InvitationScalarWhereInputSchema';

export const InvitationUpdateManyWithoutInvitedByNestedInputSchema: z.ZodType<Prisma.InvitationUpdateManyWithoutInvitedByNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => InvitationCreateWithoutInvitedByInputSchema),
          z.lazy(() => InvitationCreateWithoutInvitedByInputSchema).array(),
          z.lazy(() => InvitationUncheckedCreateWithoutInvitedByInputSchema),
          z.lazy(() => InvitationUncheckedCreateWithoutInvitedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => InvitationCreateOrConnectWithoutInvitedByInputSchema),
          z.lazy(() => InvitationCreateOrConnectWithoutInvitedByInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => InvitationUpsertWithWhereUniqueWithoutInvitedByInputSchema),
          z.lazy(() => InvitationUpsertWithWhereUniqueWithoutInvitedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => InvitationCreateManyInvitedByInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => InvitationWhereUniqueInputSchema),
          z.lazy(() => InvitationWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => InvitationWhereUniqueInputSchema),
          z.lazy(() => InvitationWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => InvitationWhereUniqueInputSchema),
          z.lazy(() => InvitationWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => InvitationWhereUniqueInputSchema),
          z.lazy(() => InvitationWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => InvitationUpdateWithWhereUniqueWithoutInvitedByInputSchema),
          z.lazy(() => InvitationUpdateWithWhereUniqueWithoutInvitedByInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => InvitationUpdateManyWithWhereWithoutInvitedByInputSchema),
          z.lazy(() => InvitationUpdateManyWithWhereWithoutInvitedByInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => InvitationScalarWhereInputSchema),
          z.lazy(() => InvitationScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default InvitationUpdateManyWithoutInvitedByNestedInputSchema;
