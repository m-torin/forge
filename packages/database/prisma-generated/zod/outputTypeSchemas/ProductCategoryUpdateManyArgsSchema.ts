import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductCategoryUpdateManyMutationInputSchema } from '../inputTypeSchemas/ProductCategoryUpdateManyMutationInputSchema';
import { ProductCategoryUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ProductCategoryUncheckedUpdateManyInputSchema';
import { ProductCategoryWhereInputSchema } from '../inputTypeSchemas/ProductCategoryWhereInputSchema';

export const ProductCategoryUpdateManyArgsSchema: z.ZodType<Prisma.ProductCategoryUpdateManyArgs> =
  z
    .object({
      data: z.union([
        ProductCategoryUpdateManyMutationInputSchema,
        ProductCategoryUncheckedUpdateManyInputSchema,
      ]),
      where: ProductCategoryWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default ProductCategoryUpdateManyArgsSchema;
