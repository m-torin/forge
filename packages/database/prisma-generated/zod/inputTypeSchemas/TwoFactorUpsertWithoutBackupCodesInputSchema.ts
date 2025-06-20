import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorUpdateWithoutBackupCodesInputSchema } from './TwoFactorUpdateWithoutBackupCodesInputSchema';
import { TwoFactorUncheckedUpdateWithoutBackupCodesInputSchema } from './TwoFactorUncheckedUpdateWithoutBackupCodesInputSchema';
import { TwoFactorCreateWithoutBackupCodesInputSchema } from './TwoFactorCreateWithoutBackupCodesInputSchema';
import { TwoFactorUncheckedCreateWithoutBackupCodesInputSchema } from './TwoFactorUncheckedCreateWithoutBackupCodesInputSchema';
import { TwoFactorWhereInputSchema } from './TwoFactorWhereInputSchema';

export const TwoFactorUpsertWithoutBackupCodesInputSchema: z.ZodType<Prisma.TwoFactorUpsertWithoutBackupCodesInput> = z.object({
  update: z.union([ z.lazy(() => TwoFactorUpdateWithoutBackupCodesInputSchema),z.lazy(() => TwoFactorUncheckedUpdateWithoutBackupCodesInputSchema) ]),
  create: z.union([ z.lazy(() => TwoFactorCreateWithoutBackupCodesInputSchema),z.lazy(() => TwoFactorUncheckedCreateWithoutBackupCodesInputSchema) ]),
  where: z.lazy(() => TwoFactorWhereInputSchema).optional()
}).strict();

export default TwoFactorUpsertWithoutBackupCodesInputSchema;
