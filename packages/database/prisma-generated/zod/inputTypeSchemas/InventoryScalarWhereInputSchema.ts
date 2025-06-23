import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const InventoryScalarWhereInputSchema: z.ZodType<Prisma.InventoryScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => InventoryScalarWhereInputSchema),
        z.lazy(() => InventoryScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => InventoryScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => InventoryScalarWhereInputSchema),
        z.lazy(() => InventoryScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    variantId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    quantity: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    reserved: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    available: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    lowStockThreshold: z
      .union([z.lazy(() => IntNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    locationId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    locationName: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    lastRestockedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  })
  .strict();

export default InventoryScalarWhereInputSchema;
