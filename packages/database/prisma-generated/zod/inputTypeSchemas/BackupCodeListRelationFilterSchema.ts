import type { Prisma } from '../../client';

import { z } from 'zod';
import { BackupCodeWhereInputSchema } from './BackupCodeWhereInputSchema';

export const BackupCodeListRelationFilterSchema: z.ZodType<Prisma.BackupCodeListRelationFilter> = z.object({
  every: z.lazy(() => BackupCodeWhereInputSchema).optional(),
  some: z.lazy(() => BackupCodeWhereInputSchema).optional(),
  none: z.lazy(() => BackupCodeWhereInputSchema).optional()
}).strict();

export default BackupCodeListRelationFilterSchema;
