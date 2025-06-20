import type { Prisma } from '../../client';

import { z } from 'zod';

export const BackupCodeCodeHashUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.BackupCodeCodeHashUserIdCompoundUniqueInput> = z.object({
  codeHash: z.string(),
  userId: z.string()
}).strict();

export default BackupCodeCodeHashUserIdCompoundUniqueInputSchema;
