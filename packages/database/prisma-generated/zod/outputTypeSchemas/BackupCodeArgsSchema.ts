import { z } from 'zod';
import type { Prisma } from '../../client';
import { BackupCodeSelectSchema } from '../inputTypeSchemas/BackupCodeSelectSchema';
import { BackupCodeIncludeSchema } from '../inputTypeSchemas/BackupCodeIncludeSchema';

export const BackupCodeArgsSchema: z.ZodType<Prisma.BackupCodeDefaultArgs> = z
  .object({
    select: z.lazy(() => BackupCodeSelectSchema).optional(),
    include: z.lazy(() => BackupCodeIncludeSchema).optional(),
  })
  .strict();

export default BackupCodeArgsSchema;
