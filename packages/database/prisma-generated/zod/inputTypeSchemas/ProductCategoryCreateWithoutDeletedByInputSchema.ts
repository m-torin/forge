import type { Prisma } from '../../client';

import { z } from 'zod';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductCategoryCreateNestedOneWithoutChildrenInputSchema } from './ProductCategoryCreateNestedOneWithoutChildrenInputSchema';
import { ProductCategoryCreateNestedManyWithoutParentInputSchema } from './ProductCategoryCreateNestedManyWithoutParentInputSchema';
import { ProductCreateNestedManyWithoutCategoriesInputSchema } from './ProductCreateNestedManyWithoutCategoriesInputSchema';
import { CollectionCreateNestedManyWithoutCategoriesInputSchema } from './CollectionCreateNestedManyWithoutCategoriesInputSchema';
import { MediaCreateNestedManyWithoutCategoryInputSchema } from './MediaCreateNestedManyWithoutCategoryInputSchema';

export const ProductCategoryCreateWithoutDeletedByInputSchema: z.ZodType<Prisma.ProductCategoryCreateWithoutDeletedByInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  status: z.lazy(() => ContentStatusSchema).optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  displayOrder: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  parent: z.lazy(() => ProductCategoryCreateNestedOneWithoutChildrenInputSchema).optional(),
  children: z.lazy(() => ProductCategoryCreateNestedManyWithoutParentInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutCategoriesInputSchema).optional(),
  collections: z.lazy(() => CollectionCreateNestedManyWithoutCategoriesInputSchema).optional(),
  media: z.lazy(() => MediaCreateNestedManyWithoutCategoryInputSchema).optional()
}).strict();

export default ProductCategoryCreateWithoutDeletedByInputSchema;
