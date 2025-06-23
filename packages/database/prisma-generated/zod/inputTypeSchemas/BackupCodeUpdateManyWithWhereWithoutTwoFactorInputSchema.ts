import type { Prisma } from '../../client';

import { z } from 'zod';
import { BackupCodeScalarWhereInputSchema } from './BackupCodeScalarWhereInputSchema';
import { BackupCodeUpdateManyMutationInputSchema } from './BackupCodeUpdateManyMutationInputSchema';
import { BackupCodeUncheckedUpdateManyWithoutTwoFactorInputSchema } from './BackupCodeUncheckedUpdateManyWithoutTwoFactorInputSchema';

export const BackupCodeUpdateManyWithWhereWithoutTwoFactorInputSchema: z.ZodType<Prisma.BackupCodeUpdateManyWithWhereWithoutTwoFactorInput> =
  z
    .object({
      where: z.lazy(() => BackupCodeScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => BackupCodeUpdateManyMutationInputSchema),
        z.lazy(() => BackupCodeUncheckedUpdateManyWithoutTwoFactorInputSchema),
      ]),
    })
    .strict();

export default BackupCodeUpdateManyWithWhereWithoutTwoFactorInputSchema;
