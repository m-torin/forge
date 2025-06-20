import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { TaxonomyTypeSchema } from './TaxonomyTypeSchema';
import { EnumTaxonomyTypeFieldUpdateOperationsInputSchema } from './EnumTaxonomyTypeFieldUpdateOperationsInputSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { EnumContentStatusFieldUpdateOperationsInputSchema } from './EnumContentStatusFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { ProductUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema } from './ProductUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema';
import { CollectionUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema } from './CollectionUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema';
import { PdpJoinUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema } from './PdpJoinUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema';
import { MediaUncheckedUpdateManyWithoutTaxonomyNestedInputSchema } from './MediaUncheckedUpdateManyWithoutTaxonomyNestedInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema';

export const TaxonomyUncheckedUpdateWithoutLocationsInputSchema: z.ZodType<Prisma.TaxonomyUncheckedUpdateWithoutLocationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => TaxonomyTypeSchema),z.lazy(() => EnumTaxonomyTypeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ContentStatusSchema),z.lazy(() => EnumContentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  deletedById: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema).optional(),
  collections: z.lazy(() => CollectionUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema).optional(),
  pdpJoins: z.lazy(() => PdpJoinUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema).optional(),
  media: z.lazy(() => MediaUncheckedUpdateManyWithoutTaxonomyNestedInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema).optional()
}).strict();

export default TaxonomyUncheckedUpdateWithoutLocationsInputSchema;
