import type { Prisma } from '../../client';

import { z } from 'zod';
import { BackupCodeCreateWithoutTwoFactorInputSchema } from './BackupCodeCreateWithoutTwoFactorInputSchema';
import { BackupCodeUncheckedCreateWithoutTwoFactorInputSchema } from './BackupCodeUncheckedCreateWithoutTwoFactorInputSchema';
import { BackupCodeCreateOrConnectWithoutTwoFactorInputSchema } from './BackupCodeCreateOrConnectWithoutTwoFactorInputSchema';
import { BackupCodeUpsertWithWhereUniqueWithoutTwoFactorInputSchema } from './BackupCodeUpsertWithWhereUniqueWithoutTwoFactorInputSchema';
import { BackupCodeCreateManyTwoFactorInputEnvelopeSchema } from './BackupCodeCreateManyTwoFactorInputEnvelopeSchema';
import { BackupCodeWhereUniqueInputSchema } from './BackupCodeWhereUniqueInputSchema';
import { BackupCodeUpdateWithWhereUniqueWithoutTwoFactorInputSchema } from './BackupCodeUpdateWithWhereUniqueWithoutTwoFactorInputSchema';
import { BackupCodeUpdateManyWithWhereWithoutTwoFactorInputSchema } from './BackupCodeUpdateManyWithWhereWithoutTwoFactorInputSchema';
import { BackupCodeScalarWhereInputSchema } from './BackupCodeScalarWhereInputSchema';

export const BackupCodeUpdateManyWithoutTwoFactorNestedInputSchema: z.ZodType<Prisma.BackupCodeUpdateManyWithoutTwoFactorNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BackupCodeCreateWithoutTwoFactorInputSchema),
          z.lazy(() => BackupCodeCreateWithoutTwoFactorInputSchema).array(),
          z.lazy(() => BackupCodeUncheckedCreateWithoutTwoFactorInputSchema),
          z.lazy(() => BackupCodeUncheckedCreateWithoutTwoFactorInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => BackupCodeCreateOrConnectWithoutTwoFactorInputSchema),
          z.lazy(() => BackupCodeCreateOrConnectWithoutTwoFactorInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => BackupCodeUpsertWithWhereUniqueWithoutTwoFactorInputSchema),
          z.lazy(() => BackupCodeUpsertWithWhereUniqueWithoutTwoFactorInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => BackupCodeCreateManyTwoFactorInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => BackupCodeWhereUniqueInputSchema),
          z.lazy(() => BackupCodeWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => BackupCodeWhereUniqueInputSchema),
          z.lazy(() => BackupCodeWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => BackupCodeWhereUniqueInputSchema),
          z.lazy(() => BackupCodeWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => BackupCodeWhereUniqueInputSchema),
          z.lazy(() => BackupCodeWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => BackupCodeUpdateWithWhereUniqueWithoutTwoFactorInputSchema),
          z.lazy(() => BackupCodeUpdateWithWhereUniqueWithoutTwoFactorInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => BackupCodeUpdateManyWithWhereWithoutTwoFactorInputSchema),
          z.lazy(() => BackupCodeUpdateManyWithWhereWithoutTwoFactorInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => BackupCodeScalarWhereInputSchema),
          z.lazy(() => BackupCodeScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default BackupCodeUpdateManyWithoutTwoFactorNestedInputSchema;
