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

export const TaxonomyUncheckedUpdateManyWithoutLocationsInputSchema: z.ZodType<Prisma.TaxonomyUncheckedUpdateManyWithoutLocationsInput> = z.object({
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
}).strict();

export default TaxonomyUncheckedUpdateManyWithoutLocationsInputSchema;
