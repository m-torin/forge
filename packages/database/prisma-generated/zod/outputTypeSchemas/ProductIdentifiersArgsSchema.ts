import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductIdentifiersSelectSchema } from '../inputTypeSchemas/ProductIdentifiersSelectSchema';
import { ProductIdentifiersIncludeSchema } from '../inputTypeSchemas/ProductIdentifiersIncludeSchema';

export const ProductIdentifiersArgsSchema: z.ZodType<Prisma.ProductIdentifiersDefaultArgs> = z.object({
  select: z.lazy(() => ProductIdentifiersSelectSchema).optional(),
  include: z.lazy(() => ProductIdentifiersIncludeSchema).optional(),
}).strict();

export default ProductIdentifiersArgsSchema;
