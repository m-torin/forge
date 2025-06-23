import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberCreateWithoutOrganizationInputSchema } from './MemberCreateWithoutOrganizationInputSchema';
import { MemberUncheckedCreateWithoutOrganizationInputSchema } from './MemberUncheckedCreateWithoutOrganizationInputSchema';
import { MemberCreateOrConnectWithoutOrganizationInputSchema } from './MemberCreateOrConnectWithoutOrganizationInputSchema';
import { MemberUpsertWithWhereUniqueWithoutOrganizationInputSchema } from './MemberUpsertWithWhereUniqueWithoutOrganizationInputSchema';
import { MemberCreateManyOrganizationInputEnvelopeSchema } from './MemberCreateManyOrganizationInputEnvelopeSchema';
import { MemberWhereUniqueInputSchema } from './MemberWhereUniqueInputSchema';
import { MemberUpdateWithWhereUniqueWithoutOrganizationInputSchema } from './MemberUpdateWithWhereUniqueWithoutOrganizationInputSchema';
import { MemberUpdateManyWithWhereWithoutOrganizationInputSchema } from './MemberUpdateManyWithWhereWithoutOrganizationInputSchema';
import { MemberScalarWhereInputSchema } from './MemberScalarWhereInputSchema';

export const MemberUncheckedUpdateManyWithoutOrganizationNestedInputSchema: z.ZodType<Prisma.MemberUncheckedUpdateManyWithoutOrganizationNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => MemberCreateWithoutOrganizationInputSchema),
          z.lazy(() => MemberCreateWithoutOrganizationInputSchema).array(),
          z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema),
          z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => MemberCreateOrConnectWithoutOrganizationInputSchema),
          z.lazy(() => MemberCreateOrConnectWithoutOrganizationInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => MemberUpsertWithWhereUniqueWithoutOrganizationInputSchema),
          z.lazy(() => MemberUpsertWithWhereUniqueWithoutOrganizationInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => MemberCreateManyOrganizationInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => MemberWhereUniqueInputSchema),
          z.lazy(() => MemberWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => MemberWhereUniqueInputSchema),
          z.lazy(() => MemberWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => MemberWhereUniqueInputSchema),
          z.lazy(() => MemberWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => MemberWhereUniqueInputSchema),
          z.lazy(() => MemberWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => MemberUpdateWithWhereUniqueWithoutOrganizationInputSchema),
          z.lazy(() => MemberUpdateWithWhereUniqueWithoutOrganizationInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => MemberUpdateManyWithWhereWithoutOrganizationInputSchema),
          z.lazy(() => MemberUpdateManyWithWhereWithoutOrganizationInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => MemberScalarWhereInputSchema),
          z.lazy(() => MemberScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default MemberUncheckedUpdateManyWithoutOrganizationNestedInputSchema;
