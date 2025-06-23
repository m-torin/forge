import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryItemWhereInputSchema } from '../inputTypeSchemas/RegistryItemWhereInputSchema';
import { RegistryItemOrderByWithRelationInputSchema } from '../inputTypeSchemas/RegistryItemOrderByWithRelationInputSchema';
import { RegistryItemWhereUniqueInputSchema } from '../inputTypeSchemas/RegistryItemWhereUniqueInputSchema';

export const RegistryItemAggregateArgsSchema: z.ZodType<Prisma.RegistryItemAggregateArgs> = z
  .object({
    where: RegistryItemWhereInputSchema.optional(),
    orderBy: z
      .union([
        RegistryItemOrderByWithRelationInputSchema.array(),
        RegistryItemOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: RegistryItemWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default RegistryItemAggregateArgsSchema;
