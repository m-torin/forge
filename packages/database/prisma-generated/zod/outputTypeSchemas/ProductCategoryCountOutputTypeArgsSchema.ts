import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductCategoryCountOutputTypeSelectSchema } from './ProductCategoryCountOutputTypeSelectSchema';

export const ProductCategoryCountOutputTypeArgsSchema: z.ZodType<Prisma.ProductCategoryCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ProductCategoryCountOutputTypeSelectSchema).nullish(),
}).strict();

export default ProductCategoryCountOutputTypeSelectSchema;
