import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereInputSchema } from './ProductIdentifiersWhereInputSchema';

export const ProductIdentifiersListRelationFilterSchema: z.ZodType<Prisma.ProductIdentifiersListRelationFilter> =
  z
    .object({
      every: z.lazy(() => ProductIdentifiersWhereInputSchema).optional(),
      some: z.lazy(() => ProductIdentifiersWhereInputSchema).optional(),
      none: z.lazy(() => ProductIdentifiersWhereInputSchema).optional(),
    })
    .strict();

export default ProductIdentifiersListRelationFilterSchema;
