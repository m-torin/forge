import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductUpdateManyMutationInputSchema } from '../inputTypeSchemas/ProductUpdateManyMutationInputSchema';
import { ProductUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ProductUncheckedUpdateManyInputSchema';
import { ProductWhereInputSchema } from '../inputTypeSchemas/ProductWhereInputSchema';

export const ProductUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([ProductUpdateManyMutationInputSchema, ProductUncheckedUpdateManyInputSchema]),
      where: ProductWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default ProductUpdateManyAndReturnArgsSchema;
