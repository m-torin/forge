import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { SeriesUncheckedUpdateManyWithoutFandomNestedInputSchema } from './SeriesUncheckedUpdateManyWithoutFandomNestedInputSchema';
import { StoryUncheckedUpdateManyWithoutFandomNestedInputSchema } from './StoryUncheckedUpdateManyWithoutFandomNestedInputSchema';
import { ProductUncheckedUpdateManyWithoutFandomsNestedInputSchema } from './ProductUncheckedUpdateManyWithoutFandomsNestedInputSchema';
import { LocationUncheckedUpdateManyWithoutFandomsNestedInputSchema } from './LocationUncheckedUpdateManyWithoutFandomsNestedInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutFandomsNestedInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutFandomsNestedInputSchema';

export const FandomUncheckedUpdateInputSchema: z.ZodType<Prisma.FandomUncheckedUpdateInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    isFictional: z
      .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
      .optional(),
    copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]).optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedById: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    series: z.lazy(() => SeriesUncheckedUpdateManyWithoutFandomNestedInputSchema).optional(),
    stories: z.lazy(() => StoryUncheckedUpdateManyWithoutFandomNestedInputSchema).optional(),
    products: z.lazy(() => ProductUncheckedUpdateManyWithoutFandomsNestedInputSchema).optional(),
    locations: z.lazy(() => LocationUncheckedUpdateManyWithoutFandomsNestedInputSchema).optional(),
    jrFindReplaceRejects: z
      .lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutFandomsNestedInputSchema)
      .optional(),
  })
  .strict();

export default FandomUncheckedUpdateInputSchema;
