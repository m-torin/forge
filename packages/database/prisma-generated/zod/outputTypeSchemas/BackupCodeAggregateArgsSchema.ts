import { z } from 'zod';
import type { Prisma } from '../../client';
import { BackupCodeWhereInputSchema } from '../inputTypeSchemas/BackupCodeWhereInputSchema';
import { BackupCodeOrderByWithRelationInputSchema } from '../inputTypeSchemas/BackupCodeOrderByWithRelationInputSchema';
import { BackupCodeWhereUniqueInputSchema } from '../inputTypeSchemas/BackupCodeWhereUniqueInputSchema';

export const BackupCodeAggregateArgsSchema: z.ZodType<Prisma.BackupCodeAggregateArgs> = z
  .object({
    where: BackupCodeWhereInputSchema.optional(),
    orderBy: z
      .union([
        BackupCodeOrderByWithRelationInputSchema.array(),
        BackupCodeOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: BackupCodeWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default BackupCodeAggregateArgsSchema;
