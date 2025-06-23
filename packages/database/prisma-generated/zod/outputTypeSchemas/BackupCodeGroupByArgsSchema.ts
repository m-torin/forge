import { z } from 'zod';
import type { Prisma } from '../../client';
import { BackupCodeWhereInputSchema } from '../inputTypeSchemas/BackupCodeWhereInputSchema';
import { BackupCodeOrderByWithAggregationInputSchema } from '../inputTypeSchemas/BackupCodeOrderByWithAggregationInputSchema';
import { BackupCodeScalarFieldEnumSchema } from '../inputTypeSchemas/BackupCodeScalarFieldEnumSchema';
import { BackupCodeScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/BackupCodeScalarWhereWithAggregatesInputSchema';

export const BackupCodeGroupByArgsSchema: z.ZodType<Prisma.BackupCodeGroupByArgs> = z
  .object({
    where: BackupCodeWhereInputSchema.optional(),
    orderBy: z
      .union([
        BackupCodeOrderByWithAggregationInputSchema.array(),
        BackupCodeOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: BackupCodeScalarFieldEnumSchema.array(),
    having: BackupCodeScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default BackupCodeGroupByArgsSchema;
