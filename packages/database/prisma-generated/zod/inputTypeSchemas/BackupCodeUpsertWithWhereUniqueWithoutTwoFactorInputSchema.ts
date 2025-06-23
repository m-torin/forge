import type { Prisma } from '../../client';

import { z } from 'zod';
import { BackupCodeWhereUniqueInputSchema } from './BackupCodeWhereUniqueInputSchema';
import { BackupCodeUpdateWithoutTwoFactorInputSchema } from './BackupCodeUpdateWithoutTwoFactorInputSchema';
import { BackupCodeUncheckedUpdateWithoutTwoFactorInputSchema } from './BackupCodeUncheckedUpdateWithoutTwoFactorInputSchema';
import { BackupCodeCreateWithoutTwoFactorInputSchema } from './BackupCodeCreateWithoutTwoFactorInputSchema';
import { BackupCodeUncheckedCreateWithoutTwoFactorInputSchema } from './BackupCodeUncheckedCreateWithoutTwoFactorInputSchema';

export const BackupCodeUpsertWithWhereUniqueWithoutTwoFactorInputSchema: z.ZodType<Prisma.BackupCodeUpsertWithWhereUniqueWithoutTwoFactorInput> =
  z
    .object({
      where: z.lazy(() => BackupCodeWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => BackupCodeUpdateWithoutTwoFactorInputSchema),
        z.lazy(() => BackupCodeUncheckedUpdateWithoutTwoFactorInputSchema),
      ]),
      create: z.union([
        z.lazy(() => BackupCodeCreateWithoutTwoFactorInputSchema),
        z.lazy(() => BackupCodeUncheckedCreateWithoutTwoFactorInputSchema),
      ]),
    })
    .strict();

export default BackupCodeUpsertWithWhereUniqueWithoutTwoFactorInputSchema;
