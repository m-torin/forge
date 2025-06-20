import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationTypeSchema } from './LocationTypeSchema';
import { NestedEnumLocationTypeFilterSchema } from './NestedEnumLocationTypeFilterSchema';

export const EnumLocationTypeFilterSchema: z.ZodType<Prisma.EnumLocationTypeFilter> = z.object({
  equals: z.lazy(() => LocationTypeSchema).optional(),
  in: z.lazy(() => LocationTypeSchema).array().optional(),
  notIn: z.lazy(() => LocationTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => LocationTypeSchema),z.lazy(() => NestedEnumLocationTypeFilterSchema) ]).optional(),
}).strict();

export default EnumLocationTypeFilterSchema;
