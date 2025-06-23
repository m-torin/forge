import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductIdentifiersWhereInputSchema } from '../inputTypeSchemas/ProductIdentifiersWhereInputSchema';

export const ProductIdentifiersDeleteManyArgsSchema: z.ZodType<Prisma.ProductIdentifiersDeleteManyArgs> =
  z
    .object({
      where: ProductIdentifiersWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default ProductIdentifiersDeleteManyArgsSchema;
