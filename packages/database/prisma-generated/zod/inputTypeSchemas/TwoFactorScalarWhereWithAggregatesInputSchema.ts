import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const TwoFactorScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TwoFactorScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => TwoFactorScalarWhereWithAggregatesInputSchema),
          z.lazy(() => TwoFactorScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => TwoFactorScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => TwoFactorScalarWhereWithAggregatesInputSchema),
          z.lazy(() => TwoFactorScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      userId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      secret: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      secretHash: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      enabled: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      verified: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      createdAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      updatedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
    })
    .strict();

export default TwoFactorScalarWhereWithAggregatesInputSchema;
