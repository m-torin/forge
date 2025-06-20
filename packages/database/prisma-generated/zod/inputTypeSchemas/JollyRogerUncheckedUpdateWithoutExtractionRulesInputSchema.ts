import type { Prisma } from '../../client';

import { z } from 'zod';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { JrChartMethodSchema } from './JrChartMethodSchema';
import { EnumJrChartMethodFieldUpdateOperationsInputSchema } from './EnumJrChartMethodFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const JollyRogerUncheckedUpdateWithoutExtractionRulesInputSchema: z.ZodType<Prisma.JollyRogerUncheckedUpdateWithoutExtractionRulesInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  canChart: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  chartingMethod: z.union([ z.lazy(() => JrChartMethodSchema),z.lazy(() => EnumJrChartMethodFieldUpdateOperationsInputSchema) ]).optional(),
  brandId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sitemaps: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gridUrls: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  pdpUrlPatterns: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export default JollyRogerUncheckedUpdateWithoutExtractionRulesInputSchema;
