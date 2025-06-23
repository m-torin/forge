import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorCreateWithoutBackupCodesInputSchema } from './TwoFactorCreateWithoutBackupCodesInputSchema';
import { TwoFactorUncheckedCreateWithoutBackupCodesInputSchema } from './TwoFactorUncheckedCreateWithoutBackupCodesInputSchema';
import { TwoFactorCreateOrConnectWithoutBackupCodesInputSchema } from './TwoFactorCreateOrConnectWithoutBackupCodesInputSchema';
import { TwoFactorWhereUniqueInputSchema } from './TwoFactorWhereUniqueInputSchema';

export const TwoFactorCreateNestedOneWithoutBackupCodesInputSchema: z.ZodType<Prisma.TwoFactorCreateNestedOneWithoutBackupCodesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => TwoFactorCreateWithoutBackupCodesInputSchema),
          z.lazy(() => TwoFactorUncheckedCreateWithoutBackupCodesInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => TwoFactorCreateOrConnectWithoutBackupCodesInputSchema)
        .optional(),
      connect: z.lazy(() => TwoFactorWhereUniqueInputSchema).optional(),
    })
    .strict();

export default TwoFactorCreateNestedOneWithoutBackupCodesInputSchema;
