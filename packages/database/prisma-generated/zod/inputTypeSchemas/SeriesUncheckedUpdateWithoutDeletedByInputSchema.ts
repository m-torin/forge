import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { StoryUncheckedUpdateManyWithoutSeriesNestedInputSchema } from './StoryUncheckedUpdateManyWithoutSeriesNestedInputSchema';
import { ProductUncheckedUpdateManyWithoutSeriesNestedInputSchema } from './ProductUncheckedUpdateManyWithoutSeriesNestedInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutSeriesNestedInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutSeriesNestedInputSchema';

export const SeriesUncheckedUpdateWithoutDeletedByInputSchema: z.ZodType<Prisma.SeriesUncheckedUpdateWithoutDeletedByInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fandomId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  displayOrder: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isFictional: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  stories: z.lazy(() => StoryUncheckedUpdateManyWithoutSeriesNestedInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutSeriesNestedInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutSeriesNestedInputSchema).optional()
}).strict();

export default SeriesUncheckedUpdateWithoutDeletedByInputSchema;
