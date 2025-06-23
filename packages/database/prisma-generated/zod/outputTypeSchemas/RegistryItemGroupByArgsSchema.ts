import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryItemWhereInputSchema } from '../inputTypeSchemas/RegistryItemWhereInputSchema';
import { RegistryItemOrderByWithAggregationInputSchema } from '../inputTypeSchemas/RegistryItemOrderByWithAggregationInputSchema';
import { RegistryItemScalarFieldEnumSchema } from '../inputTypeSchemas/RegistryItemScalarFieldEnumSchema';
import { RegistryItemScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/RegistryItemScalarWhereWithAggregatesInputSchema';

export const RegistryItemGroupByArgsSchema: z.ZodType<Prisma.RegistryItemGroupByArgs> = z
  .object({
    where: RegistryItemWhereInputSchema.optional(),
    orderBy: z
      .union([
        RegistryItemOrderByWithAggregationInputSchema.array(),
        RegistryItemOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: RegistryItemScalarFieldEnumSchema.array(),
    having: RegistryItemScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default RegistryItemGroupByArgsSchema;
