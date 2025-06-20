import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressTypeSchema } from './AddressTypeSchema';

export const NestedEnumAddressTypeFilterSchema: z.ZodType<Prisma.NestedEnumAddressTypeFilter> = z.object({
  equals: z.lazy(() => AddressTypeSchema).optional(),
  in: z.lazy(() => AddressTypeSchema).array().optional(),
  notIn: z.lazy(() => AddressTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => AddressTypeSchema),z.lazy(() => NestedEnumAddressTypeFilterSchema) ]).optional(),
}).strict();

export default NestedEnumAddressTypeFilterSchema;
