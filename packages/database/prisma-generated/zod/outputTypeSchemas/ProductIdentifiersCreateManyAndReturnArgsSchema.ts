import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductIdentifiersCreateManyInputSchema } from '../inputTypeSchemas/ProductIdentifiersCreateManyInputSchema';

export const ProductIdentifiersCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductIdentifiersCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        ProductIdentifiersCreateManyInputSchema,
        ProductIdentifiersCreateManyInputSchema.array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default ProductIdentifiersCreateManyAndReturnArgsSchema;
