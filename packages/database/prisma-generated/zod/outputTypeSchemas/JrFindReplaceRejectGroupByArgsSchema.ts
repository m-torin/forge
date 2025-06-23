import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrFindReplaceRejectWhereInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectWhereInputSchema';
import { JrFindReplaceRejectOrderByWithAggregationInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectOrderByWithAggregationInputSchema';
import { JrFindReplaceRejectScalarFieldEnumSchema } from '../inputTypeSchemas/JrFindReplaceRejectScalarFieldEnumSchema';
import { JrFindReplaceRejectScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectScalarWhereWithAggregatesInputSchema';

export const JrFindReplaceRejectGroupByArgsSchema: z.ZodType<Prisma.JrFindReplaceRejectGroupByArgs> =
  z
    .object({
      where: JrFindReplaceRejectWhereInputSchema.optional(),
      orderBy: z
        .union([
          JrFindReplaceRejectOrderByWithAggregationInputSchema.array(),
          JrFindReplaceRejectOrderByWithAggregationInputSchema,
        ])
        .optional(),
      by: JrFindReplaceRejectScalarFieldEnumSchema.array(),
      having: JrFindReplaceRejectScalarWhereWithAggregatesInputSchema.optional(),
      take: z.number().optional(),
      skip: z.number().optional(),
    })
    .strict();

export default JrFindReplaceRejectGroupByArgsSchema;
