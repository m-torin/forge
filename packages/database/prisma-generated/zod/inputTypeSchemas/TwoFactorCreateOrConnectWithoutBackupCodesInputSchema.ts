import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorWhereUniqueInputSchema } from './TwoFactorWhereUniqueInputSchema';
import { TwoFactorCreateWithoutBackupCodesInputSchema } from './TwoFactorCreateWithoutBackupCodesInputSchema';
import { TwoFactorUncheckedCreateWithoutBackupCodesInputSchema } from './TwoFactorUncheckedCreateWithoutBackupCodesInputSchema';

export const TwoFactorCreateOrConnectWithoutBackupCodesInputSchema: z.ZodType<Prisma.TwoFactorCreateOrConnectWithoutBackupCodesInput> =
  z
    .object({
      where: z.lazy(() => TwoFactorWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => TwoFactorCreateWithoutBackupCodesInputSchema),
        z.lazy(() => TwoFactorUncheckedCreateWithoutBackupCodesInputSchema),
      ]),
    })
    .strict();

export default TwoFactorCreateOrConnectWithoutBackupCodesInputSchema;
