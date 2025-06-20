import type { Prisma } from '../../client';

import { z } from 'zod';
import { BackupCodeCreateManyTwoFactorInputSchema } from './BackupCodeCreateManyTwoFactorInputSchema';

export const BackupCodeCreateManyTwoFactorInputEnvelopeSchema: z.ZodType<Prisma.BackupCodeCreateManyTwoFactorInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => BackupCodeCreateManyTwoFactorInputSchema),z.lazy(() => BackupCodeCreateManyTwoFactorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default BackupCodeCreateManyTwoFactorInputEnvelopeSchema;
