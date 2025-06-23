import { z } from 'zod';
import type { Prisma } from '../../client';
import { JollyRogerWhereInputSchema } from '../inputTypeSchemas/JollyRogerWhereInputSchema';
import { JollyRogerOrderByWithAggregationInputSchema } from '../inputTypeSchemas/JollyRogerOrderByWithAggregationInputSchema';
import { JollyRogerScalarFieldEnumSchema } from '../inputTypeSchemas/JollyRogerScalarFieldEnumSchema';
import { JollyRogerScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/JollyRogerScalarWhereWithAggregatesInputSchema';

export const JollyRogerGroupByArgsSchema: z.ZodType<Prisma.JollyRogerGroupByArgs> = z
  .object({
    where: JollyRogerWhereInputSchema.optional(),
    orderBy: z
      .union([
        JollyRogerOrderByWithAggregationInputSchema.array(),
        JollyRogerOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: JollyRogerScalarFieldEnumSchema.array(),
    having: JollyRogerScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default JollyRogerGroupByArgsSchema;
