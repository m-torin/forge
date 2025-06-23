import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductSelectSchema } from '../inputTypeSchemas/ProductSelectSchema';
import { ProductIncludeSchema } from '../inputTypeSchemas/ProductIncludeSchema';

export const ProductArgsSchema: z.ZodType<Prisma.ProductDefaultArgs> = z
  .object({
    select: z.lazy(() => ProductSelectSchema).optional(),
    include: z.lazy(() => ProductIncludeSchema).optional(),
  })
  .strict();

export default ProductArgsSchema;
