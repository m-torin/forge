import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryWhereInputSchema } from '../inputTypeSchemas/RegistryWhereInputSchema';
import { RegistryOrderByWithAggregationInputSchema } from '../inputTypeSchemas/RegistryOrderByWithAggregationInputSchema';
import { RegistryScalarFieldEnumSchema } from '../inputTypeSchemas/RegistryScalarFieldEnumSchema';
import { RegistryScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/RegistryScalarWhereWithAggregatesInputSchema';

export const RegistryGroupByArgsSchema: z.ZodType<Prisma.RegistryGroupByArgs> = z
  .object({
    where: RegistryWhereInputSchema.optional(),
    orderBy: z
      .union([
        RegistryOrderByWithAggregationInputSchema.array(),
        RegistryOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: RegistryScalarFieldEnumSchema.array(),
    having: RegistryScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default RegistryGroupByArgsSchema;
