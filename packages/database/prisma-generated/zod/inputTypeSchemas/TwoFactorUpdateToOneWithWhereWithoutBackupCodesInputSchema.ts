import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorWhereInputSchema } from './TwoFactorWhereInputSchema';
import { TwoFactorUpdateWithoutBackupCodesInputSchema } from './TwoFactorUpdateWithoutBackupCodesInputSchema';
import { TwoFactorUncheckedUpdateWithoutBackupCodesInputSchema } from './TwoFactorUncheckedUpdateWithoutBackupCodesInputSchema';

export const TwoFactorUpdateToOneWithWhereWithoutBackupCodesInputSchema: z.ZodType<Prisma.TwoFactorUpdateToOneWithWhereWithoutBackupCodesInput> =
  z
    .object({
      where: z.lazy(() => TwoFactorWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => TwoFactorUpdateWithoutBackupCodesInputSchema),
        z.lazy(() => TwoFactorUncheckedUpdateWithoutBackupCodesInputSchema),
      ]),
    })
    .strict();

export default TwoFactorUpdateToOneWithWhereWithoutBackupCodesInputSchema;
