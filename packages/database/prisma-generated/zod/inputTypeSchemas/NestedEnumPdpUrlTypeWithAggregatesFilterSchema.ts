import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlTypeSchema } from './PdpUrlTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumPdpUrlTypeFilterSchema } from './NestedEnumPdpUrlTypeFilterSchema';

export const NestedEnumPdpUrlTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumPdpUrlTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => PdpUrlTypeSchema).optional(),
  in: z.lazy(() => PdpUrlTypeSchema).array().optional(),
  notIn: z.lazy(() => PdpUrlTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => PdpUrlTypeSchema),z.lazy(() => NestedEnumPdpUrlTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPdpUrlTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPdpUrlTypeFilterSchema).optional()
}).strict();

export default NestedEnumPdpUrlTypeWithAggregatesFilterSchema;
