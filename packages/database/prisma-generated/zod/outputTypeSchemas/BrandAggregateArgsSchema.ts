import { z } from 'zod';
import type { Prisma } from '../../client';
import { BrandWhereInputSchema } from '../inputTypeSchemas/BrandWhereInputSchema';
import { BrandOrderByWithRelationInputSchema } from '../inputTypeSchemas/BrandOrderByWithRelationInputSchema';
import { BrandWhereUniqueInputSchema } from '../inputTypeSchemas/BrandWhereUniqueInputSchema';

export const BrandAggregateArgsSchema: z.ZodType<Prisma.BrandAggregateArgs> = z
  .object({
    where: BrandWhereInputSchema.optional(),
    orderBy: z
      .union([BrandOrderByWithRelationInputSchema.array(), BrandOrderByWithRelationInputSchema])
      .optional(),
    cursor: BrandWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default BrandAggregateArgsSchema;
