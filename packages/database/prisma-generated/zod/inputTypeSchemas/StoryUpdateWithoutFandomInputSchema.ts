import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { SeriesUpdateOneWithoutStoriesNestedInputSchema } from './SeriesUpdateOneWithoutStoriesNestedInputSchema';
import { ProductUpdateManyWithoutStoriesNestedInputSchema } from './ProductUpdateManyWithoutStoriesNestedInputSchema';
import { JrFindReplaceRejectUpdateManyWithoutStoriesNestedInputSchema } from './JrFindReplaceRejectUpdateManyWithoutStoriesNestedInputSchema';
import { UserUpdateOneWithoutDeletedStoriesNestedInputSchema } from './UserUpdateOneWithoutDeletedStoriesNestedInputSchema';

export const StoryUpdateWithoutFandomInputSchema: z.ZodType<Prisma.StoryUpdateWithoutFandomInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      displayOrder: z
        .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
        .optional(),
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
      series: z.lazy(() => SeriesUpdateOneWithoutStoriesNestedInputSchema).optional(),
      products: z.lazy(() => ProductUpdateManyWithoutStoriesNestedInputSchema).optional(),
      jrFindReplaceRejects: z
        .lazy(() => JrFindReplaceRejectUpdateManyWithoutStoriesNestedInputSchema)
        .optional(),
      deletedBy: z.lazy(() => UserUpdateOneWithoutDeletedStoriesNestedInputSchema).optional(),
    })
    .strict();

export default StoryUpdateWithoutFandomInputSchema;
