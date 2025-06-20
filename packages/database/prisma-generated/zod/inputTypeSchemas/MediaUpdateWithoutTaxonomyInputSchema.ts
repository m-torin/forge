import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { MediaTypeSchema } from './MediaTypeSchema';
import { EnumMediaTypeFieldUpdateOperationsInputSchema } from './EnumMediaTypeFieldUpdateOperationsInputSchema';
import { NullableIntFieldUpdateOperationsInputSchema } from './NullableIntFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneWithoutMediaNestedInputSchema } from './UserUpdateOneWithoutMediaNestedInputSchema';
import { ArticleUpdateOneWithoutMediaNestedInputSchema } from './ArticleUpdateOneWithoutMediaNestedInputSchema';
import { BrandUpdateOneWithoutMediaNestedInputSchema } from './BrandUpdateOneWithoutMediaNestedInputSchema';
import { CollectionUpdateOneWithoutMediaNestedInputSchema } from './CollectionUpdateOneWithoutMediaNestedInputSchema';
import { ProductUpdateOneWithoutMediaNestedInputSchema } from './ProductUpdateOneWithoutMediaNestedInputSchema';
import { ProductCategoryUpdateOneWithoutMediaNestedInputSchema } from './ProductCategoryUpdateOneWithoutMediaNestedInputSchema';
import { PdpJoinUpdateOneWithoutMediaNestedInputSchema } from './PdpJoinUpdateOneWithoutMediaNestedInputSchema';
import { UserUpdateOneWithoutDeletedMediaNestedInputSchema } from './UserUpdateOneWithoutDeletedMediaNestedInputSchema';
import { ReviewUpdateOneWithoutMediaNestedInputSchema } from './ReviewUpdateOneWithoutMediaNestedInputSchema';

export const MediaUpdateWithoutTaxonomyInputSchema: z.ZodType<Prisma.MediaUpdateWithoutTaxonomyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  url: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  altText: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => MediaTypeSchema),z.lazy(() => EnumMediaTypeFieldUpdateOperationsInputSchema) ]).optional(),
  width: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  height: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  size: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  mimeType: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sortOrder: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneWithoutMediaNestedInputSchema).optional(),
  article: z.lazy(() => ArticleUpdateOneWithoutMediaNestedInputSchema).optional(),
  brand: z.lazy(() => BrandUpdateOneWithoutMediaNestedInputSchema).optional(),
  collection: z.lazy(() => CollectionUpdateOneWithoutMediaNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneWithoutMediaNestedInputSchema).optional(),
  category: z.lazy(() => ProductCategoryUpdateOneWithoutMediaNestedInputSchema).optional(),
  pdpJoin: z.lazy(() => PdpJoinUpdateOneWithoutMediaNestedInputSchema).optional(),
  deletedBy: z.lazy(() => UserUpdateOneWithoutDeletedMediaNestedInputSchema).optional(),
  review: z.lazy(() => ReviewUpdateOneWithoutMediaNestedInputSchema).optional()
}).strict();

export default MediaUpdateWithoutTaxonomyInputSchema;
