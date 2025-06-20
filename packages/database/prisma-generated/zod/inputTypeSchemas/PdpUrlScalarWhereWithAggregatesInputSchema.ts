import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { EnumPdpUrlTypeWithAggregatesFilterSchema } from './EnumPdpUrlTypeWithAggregatesFilterSchema';
import { PdpUrlTypeSchema } from './PdpUrlTypeSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { JsonWithAggregatesFilterSchema } from './JsonWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const PdpUrlScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PdpUrlScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => PdpUrlScalarWhereWithAggregatesInputSchema),z.lazy(() => PdpUrlScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PdpUrlScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PdpUrlScalarWhereWithAggregatesInputSchema),z.lazy(() => PdpUrlScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  pdpJoinId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  urlType: z.union([ z.lazy(() => EnumPdpUrlTypeWithAggregatesFilterSchema),z.lazy(() => PdpUrlTypeSchema) ]).optional(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  copy: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default PdpUrlScalarWhereWithAggregatesInputSchema;
