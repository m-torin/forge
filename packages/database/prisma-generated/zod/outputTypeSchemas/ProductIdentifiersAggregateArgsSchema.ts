import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductIdentifiersWhereInputSchema } from '../inputTypeSchemas/ProductIdentifiersWhereInputSchema';
import { ProductIdentifiersOrderByWithRelationInputSchema } from '../inputTypeSchemas/ProductIdentifiersOrderByWithRelationInputSchema';
import { ProductIdentifiersWhereUniqueInputSchema } from '../inputTypeSchemas/ProductIdentifiersWhereUniqueInputSchema';

export const ProductIdentifiersAggregateArgsSchema: z.ZodType<Prisma.ProductIdentifiersAggregateArgs> =
  z
    .object({
      where: ProductIdentifiersWhereInputSchema.optional(),
      orderBy: z
        .union([
          ProductIdentifiersOrderByWithRelationInputSchema.array(),
          ProductIdentifiersOrderByWithRelationInputSchema,
        ])
        .optional(),
      cursor: ProductIdentifiersWhereUniqueInputSchema.optional(),
      take: z.number().optional(),
      skip: z.number().optional(),
    })
    .strict();

export default ProductIdentifiersAggregateArgsSchema;
