import { z } from 'zod';
import type { Prisma } from '../../client';
import { BackupCodeCreateManyInputSchema } from '../inputTypeSchemas/BackupCodeCreateManyInputSchema'

export const BackupCodeCreateManyArgsSchema: z.ZodType<Prisma.BackupCodeCreateManyArgs> = z.object({
  data: z.union([ BackupCodeCreateManyInputSchema,BackupCodeCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default BackupCodeCreateManyArgsSchema;
