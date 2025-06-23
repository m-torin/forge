import type { Prisma } from '../../client';

import { z } from 'zod';
import { ApiKeyWhereInputSchema } from './ApiKeyWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const ApiKeyWhereUniqueInputSchema: z.ZodType<Prisma.ApiKeyWhereUniqueInput> = z
  .union([
    z.object({
      id: z.string(),
      key: z.string(),
    }),
    z.object({
      id: z.string(),
    }),
    z.object({
      key: z.string(),
    }),
  ])
  .and(
    z
      .object({
        id: z.string().optional(),
        key: z.string().optional(),
        AND: z
          .union([
            z.lazy(() => ApiKeyWhereInputSchema),
            z.lazy(() => ApiKeyWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => ApiKeyWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => ApiKeyWhereInputSchema),
            z.lazy(() => ApiKeyWhereInputSchema).array(),
          ])
          .optional(),
        name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        start: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        prefix: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        keyHash: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        organizationId: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        refillInterval: z
          .union([z.lazy(() => IntNullableFilterSchema), z.number().int()])
          .optional()
          .nullable(),
        refillAmount: z
          .union([z.lazy(() => IntNullableFilterSchema), z.number().int()])
          .optional()
          .nullable(),
        lastRefillAt: z
          .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
          .optional()
          .nullable(),
        lastUsedAt: z
          .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
          .optional()
          .nullable(),
        enabled: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
        rateLimitEnabled: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
        rateLimitTimeWindow: z
          .union([z.lazy(() => IntNullableFilterSchema), z.number().int()])
          .optional()
          .nullable(),
        rateLimitMax: z
          .union([z.lazy(() => IntNullableFilterSchema), z.number().int()])
          .optional()
          .nullable(),
        requestCount: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
        remaining: z
          .union([z.lazy(() => IntNullableFilterSchema), z.number().int()])
          .optional()
          .nullable(),
        lastRequest: z
          .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
          .optional()
          .nullable(),
        expiresAt: z
          .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
          .optional()
          .nullable(),
        createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        permissions: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
        user: z
          .union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
          .optional(),
      })
      .strict(),
  );

export default ApiKeyWhereUniqueInputSchema;
