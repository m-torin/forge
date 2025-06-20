import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { EnumContentStatusFieldUpdateOperationsInputSchema } from './EnumContentStatusFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { ProductCategoryUpdateOneWithoutChildrenNestedInputSchema } from './ProductCategoryUpdateOneWithoutChildrenNestedInputSchema';
import { ProductCategoryUpdateManyWithoutParentNestedInputSchema } from './ProductCategoryUpdateManyWithoutParentNestedInputSchema';
import { ProductUpdateManyWithoutCategoriesNestedInputSchema } from './ProductUpdateManyWithoutCategoriesNestedInputSchema';
import { CollectionUpdateManyWithoutCategoriesNestedInputSchema } from './CollectionUpdateManyWithoutCategoriesNestedInputSchema';
import { MediaUpdateManyWithoutCategoryNestedInputSchema } from './MediaUpdateManyWithoutCategoryNestedInputSchema';

export const ProductCategoryUpdateWithoutDeletedByInputSchema: z.ZodType<Prisma.ProductCategoryUpdateWithoutDeletedByInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ContentStatusSchema),z.lazy(() => EnumContentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  displayOrder: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  parent: z.lazy(() => ProductCategoryUpdateOneWithoutChildrenNestedInputSchema).optional(),
  children: z.lazy(() => ProductCategoryUpdateManyWithoutParentNestedInputSchema).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutCategoriesNestedInputSchema).optional(),
  collections: z.lazy(() => CollectionUpdateManyWithoutCategoriesNestedInputSchema).optional(),
  media: z.lazy(() => MediaUpdateManyWithoutCategoryNestedInputSchema).optional()
}).strict();

export default ProductCategoryUpdateWithoutDeletedByInputSchema;
