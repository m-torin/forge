import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';

export const StoryScalarWhereInputSchema: z.ZodType<Prisma.StoryScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => StoryScalarWhereInputSchema),
        z.lazy(() => StoryScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => StoryScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => StoryScalarWhereInputSchema),
        z.lazy(() => StoryScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    slug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    seriesId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
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

export default StoryScalarWhereInputSchema;
