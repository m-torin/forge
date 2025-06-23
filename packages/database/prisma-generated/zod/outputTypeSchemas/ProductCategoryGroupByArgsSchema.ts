import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductCategoryWhereInputSchema } from '../inputTypeSchemas/ProductCategoryWhereInputSchema';
import { ProductCategoryOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ProductCategoryOrderByWithAggregationInputSchema';
import { ProductCategoryScalarFieldEnumSchema } from '../inputTypeSchemas/ProductCategoryScalarFieldEnumSchema';
import { ProductCategoryScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ProductCategoryScalarWhereWithAggregatesInputSchema';

export const ProductCategoryGroupByArgsSchema: z.ZodType<Prisma.ProductCategoryGroupByArgs> = z
  .object({
    where: ProductCategoryWhereInputSchema.optional(),
    orderBy: z
      .union([
        ProductCategoryOrderByWithAggregationInputSchema.array(),
        ProductCategoryOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: ProductCategoryScalarFieldEnumSchema.array(),
    having: ProductCategoryScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default ProductCategoryGroupByArgsSchema;
