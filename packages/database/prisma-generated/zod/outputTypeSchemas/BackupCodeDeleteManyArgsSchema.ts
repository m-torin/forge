import { z } from 'zod';
import type { Prisma } from '../../client';
import { BackupCodeWhereInputSchema } from '../inputTypeSchemas/BackupCodeWhereInputSchema'

export const BackupCodeDeleteManyArgsSchema: z.ZodType<Prisma.BackupCodeDeleteManyArgs> = z.object({
  where: BackupCodeWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default BackupCodeDeleteManyArgsSchema;
