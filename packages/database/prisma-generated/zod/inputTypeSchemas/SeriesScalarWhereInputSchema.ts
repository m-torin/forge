import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const SeriesScalarWhereInputSchema: z.ZodType<Prisma.SeriesScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => SeriesScalarWhereInputSchema),
        z.lazy(() => SeriesScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => SeriesScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => SeriesScalarWhereInputSchema),
        z.lazy(() => SeriesScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    slug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    fandomId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    displayOrder: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    isFictional: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    copy: z.lazy(() => JsonFilterSchema).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    deletedById: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
  })
  .strict();

export default SeriesScalarWhereInputSchema;
