import { z } from 'zod';
import { StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { IntFieldUpdateOperationsInputObjectSchema } from './IntFieldUpdateOperationsInput.schema';
import { DateTimeFieldUpdateOperationsInputObjectSchema } from './DateTimeFieldUpdateOperationsInput.schema';
import { FlowUpdateOneRequiredWithoutStatisticsNestedInputObjectSchema } from './FlowUpdateOneRequiredWithoutStatisticsNestedInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.FlowStatisticsUpdateInput> = z
  .object({
    id: z
      .union([
        z.string(),
        z.lazy(() => StringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    totalRuns: z
      .union([
        z.number().int(),
        z.lazy(() => IntFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    successfulRuns: z
      .union([
        z.number().int(),
        z.lazy(() => IntFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    failedRuns: z
      .union([
        z.number().int(),
        z.lazy(() => IntFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    lastUpdated: z
      .union([
        z.coerce.date(),
        z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    flow: z
      .lazy(() => FlowUpdateOneRequiredWithoutStatisticsNestedInputObjectSchema)
      .optional(),
  })
  .strict();

export const FlowStatisticsUpdateInputObjectSchema = Schema;
