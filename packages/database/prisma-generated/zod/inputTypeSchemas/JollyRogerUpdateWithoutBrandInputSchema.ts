import type { Prisma } from '../../client';

import { z } from 'zod';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { JrChartMethodSchema } from './JrChartMethodSchema';
import { EnumJrChartMethodFieldUpdateOperationsInputSchema } from './EnumJrChartMethodFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { JrExtractionRuleUpdateManyWithoutJollyRogerNestedInputSchema } from './JrExtractionRuleUpdateManyWithoutJollyRogerNestedInputSchema';

export const JollyRogerUpdateWithoutBrandInputSchema: z.ZodType<Prisma.JollyRogerUpdateWithoutBrandInput> = z.object({
  canChart: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  chartingMethod: z.union([ z.lazy(() => JrChartMethodSchema),z.lazy(() => EnumJrChartMethodFieldUpdateOperationsInputSchema) ]).optional(),
  sitemaps: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gridUrls: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  pdpUrlPatterns: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  extractionRules: z.lazy(() => JrExtractionRuleUpdateManyWithoutJollyRogerNestedInputSchema).optional()
}).strict();

export default JollyRogerUpdateWithoutBrandInputSchema;
