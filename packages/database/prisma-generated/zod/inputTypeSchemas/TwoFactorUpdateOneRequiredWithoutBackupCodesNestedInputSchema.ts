import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorCreateWithoutBackupCodesInputSchema } from './TwoFactorCreateWithoutBackupCodesInputSchema';
import { TwoFactorUncheckedCreateWithoutBackupCodesInputSchema } from './TwoFactorUncheckedCreateWithoutBackupCodesInputSchema';
import { TwoFactorCreateOrConnectWithoutBackupCodesInputSchema } from './TwoFactorCreateOrConnectWithoutBackupCodesInputSchema';
import { TwoFactorUpsertWithoutBackupCodesInputSchema } from './TwoFactorUpsertWithoutBackupCodesInputSchema';
import { TwoFactorWhereUniqueInputSchema } from './TwoFactorWhereUniqueInputSchema';
import { TwoFactorUpdateToOneWithWhereWithoutBackupCodesInputSchema } from './TwoFactorUpdateToOneWithWhereWithoutBackupCodesInputSchema';
import { TwoFactorUpdateWithoutBackupCodesInputSchema } from './TwoFactorUpdateWithoutBackupCodesInputSchema';
import { TwoFactorUncheckedUpdateWithoutBackupCodesInputSchema } from './TwoFactorUncheckedUpdateWithoutBackupCodesInputSchema';

export const TwoFactorUpdateOneRequiredWithoutBackupCodesNestedInputSchema: z.ZodType<Prisma.TwoFactorUpdateOneRequiredWithoutBackupCodesNestedInput> = z.object({
  create: z.union([ z.lazy(() => TwoFactorCreateWithoutBackupCodesInputSchema),z.lazy(() => TwoFactorUncheckedCreateWithoutBackupCodesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TwoFactorCreateOrConnectWithoutBackupCodesInputSchema).optional(),
  upsert: z.lazy(() => TwoFactorUpsertWithoutBackupCodesInputSchema).optional(),
  connect: z.lazy(() => TwoFactorWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TwoFactorUpdateToOneWithWhereWithoutBackupCodesInputSchema),z.lazy(() => TwoFactorUpdateWithoutBackupCodesInputSchema),z.lazy(() => TwoFactorUncheckedUpdateWithoutBackupCodesInputSchema) ]).optional(),
}).strict();

export default TwoFactorUpdateOneRequiredWithoutBackupCodesNestedInputSchema;
