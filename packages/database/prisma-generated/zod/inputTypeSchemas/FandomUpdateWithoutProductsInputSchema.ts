import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { SeriesUpdateManyWithoutFandomNestedInputSchema } from './SeriesUpdateManyWithoutFandomNestedInputSchema';
import { StoryUpdateManyWithoutFandomNestedInputSchema } from './StoryUpdateManyWithoutFandomNestedInputSchema';
import { LocationUpdateManyWithoutFandomsNestedInputSchema } from './LocationUpdateManyWithoutFandomsNestedInputSchema';
import { JrFindReplaceRejectUpdateManyWithoutFandomsNestedInputSchema } from './JrFindReplaceRejectUpdateManyWithoutFandomsNestedInputSchema';
import { UserUpdateOneWithoutDeletedFandomsNestedInputSchema } from './UserUpdateOneWithoutDeletedFandomsNestedInputSchema';

export const FandomUpdateWithoutProductsInputSchema: z.ZodType<Prisma.FandomUpdateWithoutProductsInput> =
  z
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
      series: z.lazy(() => SeriesUpdateManyWithoutFandomNestedInputSchema).optional(),
      stories: z.lazy(() => StoryUpdateManyWithoutFandomNestedInputSchema).optional(),
      locations: z.lazy(() => LocationUpdateManyWithoutFandomsNestedInputSchema).optional(),
      jrFindReplaceRejects: z
        .lazy(() => JrFindReplaceRejectUpdateManyWithoutFandomsNestedInputSchema)
        .optional(),
      deletedBy: z.lazy(() => UserUpdateOneWithoutDeletedFandomsNestedInputSchema).optional(),
    })
    .strict();

export default FandomUpdateWithoutProductsInputSchema;
