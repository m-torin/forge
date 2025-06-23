import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryWhereInputSchema } from '../inputTypeSchemas/RegistryWhereInputSchema';
import { RegistryOrderByWithRelationInputSchema } from '../inputTypeSchemas/RegistryOrderByWithRelationInputSchema';
import { RegistryWhereUniqueInputSchema } from '../inputTypeSchemas/RegistryWhereUniqueInputSchema';

export const RegistryAggregateArgsSchema: z.ZodType<Prisma.RegistryAggregateArgs> = z
  .object({
    where: RegistryWhereInputSchema.optional(),
    orderBy: z
      .union([
        RegistryOrderByWithRelationInputSchema.array(),
        RegistryOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: RegistryWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default RegistryAggregateArgsSchema;
