import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { EnumContentStatusWithAggregatesFilterSchema } from './EnumContentStatusWithAggregatesFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonWithAggregatesFilterSchema } from './JsonWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';

export const ProductCategoryScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ProductCategoryScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => ProductCategoryScalarWhereWithAggregatesInputSchema),
          z.lazy(() => ProductCategoryScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => ProductCategoryScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => ProductCategoryScalarWhereWithAggregatesInputSchema),
          z.lazy(() => ProductCategoryScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      slug: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      status: z
        .union([
          z.lazy(() => EnumContentStatusWithAggregatesFilterSchema),
          z.lazy(() => ContentStatusSchema),
        ])
        .optional(),
      copy: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
      parentId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      displayOrder: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
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

export default ProductCategoryScalarWhereWithAggregatesInputSchema;
