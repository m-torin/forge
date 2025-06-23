import { z } from 'zod';
import type { Prisma } from '../../client';
import { SeriesWhereInputSchema } from '../inputTypeSchemas/SeriesWhereInputSchema';
import { SeriesOrderByWithAggregationInputSchema } from '../inputTypeSchemas/SeriesOrderByWithAggregationInputSchema';
import { SeriesScalarFieldEnumSchema } from '../inputTypeSchemas/SeriesScalarFieldEnumSchema';
import { SeriesScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/SeriesScalarWhereWithAggregatesInputSchema';

export const SeriesGroupByArgsSchema: z.ZodType<Prisma.SeriesGroupByArgs> = z
  .object({
    where: SeriesWhereInputSchema.optional(),
    orderBy: z
      .union([
        SeriesOrderByWithAggregationInputSchema.array(),
        SeriesOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: SeriesScalarFieldEnumSchema.array(),
    having: SeriesScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default SeriesGroupByArgsSchema;
