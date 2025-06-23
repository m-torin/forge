import { z } from 'zod';
import type { Prisma } from '../../client';
import { VerificationWhereInputSchema } from '../inputTypeSchemas/VerificationWhereInputSchema';
import { VerificationOrderByWithAggregationInputSchema } from '../inputTypeSchemas/VerificationOrderByWithAggregationInputSchema';
import { VerificationScalarFieldEnumSchema } from '../inputTypeSchemas/VerificationScalarFieldEnumSchema';
import { VerificationScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/VerificationScalarWhereWithAggregatesInputSchema';

export const VerificationGroupByArgsSchema: z.ZodType<Prisma.VerificationGroupByArgs> = z
  .object({
    where: VerificationWhereInputSchema.optional(),
    orderBy: z
      .union([
        VerificationOrderByWithAggregationInputSchema.array(),
        VerificationOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: VerificationScalarFieldEnumSchema.array(),
    having: VerificationScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default VerificationGroupByArgsSchema;
