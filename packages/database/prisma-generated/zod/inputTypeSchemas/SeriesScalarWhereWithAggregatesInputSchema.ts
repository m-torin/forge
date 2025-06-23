import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { JsonWithAggregatesFilterSchema } from './JsonWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';

export const SeriesScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SeriesScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => SeriesScalarWhereWithAggregatesInputSchema),
          z.lazy(() => SeriesScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => SeriesScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => SeriesScalarWhereWithAggregatesInputSchema),
          z.lazy(() => SeriesScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      slug: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      fandomId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      displayOrder: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      isFictional: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      copy: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
      createdAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      updatedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      deletedAt: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      deletedById: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
    })
    .strict();

export default SeriesScalarWhereWithAggregatesInputSchema;
