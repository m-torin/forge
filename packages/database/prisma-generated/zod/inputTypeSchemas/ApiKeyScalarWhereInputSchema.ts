import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';

export const ApiKeyScalarWhereInputSchema: z.ZodType<Prisma.ApiKeyScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ApiKeyScalarWhereInputSchema),z.lazy(() => ApiKeyScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ApiKeyScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ApiKeyScalarWhereInputSchema),z.lazy(() => ApiKeyScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  start: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  prefix: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  key: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  keyHash: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  refillInterval: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  refillAmount: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  lastRefillAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  lastUsedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  enabled: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  rateLimitEnabled: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  rateLimitTimeWindow: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  rateLimitMax: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  requestCount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  remaining: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  lastRequest: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  expiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  permissions: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional()
}).strict();

export default ApiKeyScalarWhereInputSchema;
