import type { Prisma } from '../../client';

import { z } from 'zod';
import { BackupCodeWhereUniqueInputSchema } from './BackupCodeWhereUniqueInputSchema';
import { BackupCodeCreateWithoutTwoFactorInputSchema } from './BackupCodeCreateWithoutTwoFactorInputSchema';
import { BackupCodeUncheckedCreateWithoutTwoFactorInputSchema } from './BackupCodeUncheckedCreateWithoutTwoFactorInputSchema';

export const BackupCodeCreateOrConnectWithoutTwoFactorInputSchema: z.ZodType<Prisma.BackupCodeCreateOrConnectWithoutTwoFactorInput> = z.object({
  where: z.lazy(() => BackupCodeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BackupCodeCreateWithoutTwoFactorInputSchema),z.lazy(() => BackupCodeUncheckedCreateWithoutTwoFactorInputSchema) ]),
}).strict();

export default BackupCodeCreateOrConnectWithoutTwoFactorInputSchema;
