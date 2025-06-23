import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumContentStatusFilterSchema } from './EnumContentStatusFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';

export const ProductCategoryScalarWhereInputSchema: z.ZodType<Prisma.ProductCategoryScalarWhereInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => ProductCategoryScalarWhereInputSchema),
          z.lazy(() => ProductCategoryScalarWhereInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => ProductCategoryScalarWhereInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => ProductCategoryScalarWhereInputSchema),
          z.lazy(() => ProductCategoryScalarWhereInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      slug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      status: z
        .union([z.lazy(() => EnumContentStatusFilterSchema), z.lazy(() => ContentStatusSchema)])
        .optional(),
      copy: z.lazy(() => JsonFilterSchema).optional(),
      parentId: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      displayOrder: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
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

export default ProductCategoryScalarWhereInputSchema;
