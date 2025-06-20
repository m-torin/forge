import type { Prisma } from '../../client';

import { z } from 'zod';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductUncheckedCreateNestedManyWithoutCategoriesInputSchema } from './ProductUncheckedCreateNestedManyWithoutCategoriesInputSchema';
import { CollectionUncheckedCreateNestedManyWithoutCategoriesInputSchema } from './CollectionUncheckedCreateNestedManyWithoutCategoriesInputSchema';
import { MediaUncheckedCreateNestedManyWithoutCategoryInputSchema } from './MediaUncheckedCreateNestedManyWithoutCategoryInputSchema';

export const ProductCategoryUncheckedCreateWithoutChildrenInputSchema: z.ZodType<Prisma.ProductCategoryUncheckedCreateWithoutChildrenInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  status: z.lazy(() => ContentStatusSchema).optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  parentId: z.string().optional().nullable(),
  displayOrder: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutCategoriesInputSchema).optional(),
  collections: z.lazy(() => CollectionUncheckedCreateNestedManyWithoutCategoriesInputSchema).optional(),
  media: z.lazy(() => MediaUncheckedCreateNestedManyWithoutCategoryInputSchema).optional()
}).strict();

export default ProductCategoryUncheckedCreateWithoutChildrenInputSchema;
