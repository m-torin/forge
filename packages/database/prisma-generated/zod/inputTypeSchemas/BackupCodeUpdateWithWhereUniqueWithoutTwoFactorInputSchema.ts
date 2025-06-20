import type { Prisma } from '../../client';

import { z } from 'zod';
import { BackupCodeWhereUniqueInputSchema } from './BackupCodeWhereUniqueInputSchema';
import { BackupCodeUpdateWithoutTwoFactorInputSchema } from './BackupCodeUpdateWithoutTwoFactorInputSchema';
import { BackupCodeUncheckedUpdateWithoutTwoFactorInputSchema } from './BackupCodeUncheckedUpdateWithoutTwoFactorInputSchema';

export const BackupCodeUpdateWithWhereUniqueWithoutTwoFactorInputSchema: z.ZodType<Prisma.BackupCodeUpdateWithWhereUniqueWithoutTwoFactorInput> = z.object({
  where: z.lazy(() => BackupCodeWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BackupCodeUpdateWithoutTwoFactorInputSchema),z.lazy(() => BackupCodeUncheckedUpdateWithoutTwoFactorInputSchema) ]),
}).strict();

export default BackupCodeUpdateWithWhereUniqueWithoutTwoFactorInputSchema;
