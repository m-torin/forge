import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressTypeSchema } from './AddressTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumAddressTypeFilterSchema } from './NestedEnumAddressTypeFilterSchema';

export const NestedEnumAddressTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumAddressTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => AddressTypeSchema).optional(),
  in: z.lazy(() => AddressTypeSchema).array().optional(),
  notIn: z.lazy(() => AddressTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => AddressTypeSchema),z.lazy(() => NestedEnumAddressTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAddressTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAddressTypeFilterSchema).optional()
}).strict();

export default NestedEnumAddressTypeWithAggregatesFilterSchema;
