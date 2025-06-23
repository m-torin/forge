import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryProductIdVariantIdLocationIdCompoundUniqueInputSchema } from './InventoryProductIdVariantIdLocationIdCompoundUniqueInputSchema';
import { InventoryWhereInputSchema } from './InventoryWhereInputSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { ProductNullableScalarRelationFilterSchema } from './ProductNullableScalarRelationFilterSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { InventoryTransactionListRelationFilterSchema } from './InventoryTransactionListRelationFilterSchema';

export const InventoryWhereUniqueInputSchema: z.ZodType<Prisma.InventoryWhereUniqueInput> = z
  .union([
    z.object({
      id: z.string().cuid(),
      productId_variantId_locationId: z.lazy(
        () => InventoryProductIdVariantIdLocationIdCompoundUniqueInputSchema,
      ),
    }),
    z.object({
      id: z.string().cuid(),
    }),
    z.object({
      productId_variantId_locationId: z.lazy(
        () => InventoryProductIdVariantIdLocationIdCompoundUniqueInputSchema,
      ),
    }),
  ])
  .and(
    z
      .object({
        id: z.string().cuid().optional(),
        productId_variantId_locationId: z
          .lazy(() => InventoryProductIdVariantIdLocationIdCompoundUniqueInputSchema)
          .optional(),
        AND: z
          .union([
            z.lazy(() => InventoryWhereInputSchema),
            z.lazy(() => InventoryWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => InventoryWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => InventoryWhereInputSchema),
            z.lazy(() => InventoryWhereInputSchema).array(),
          ])
          .optional(),
        productId: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        variantId: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        quantity: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
        reserved: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
        available: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
        lowStockThreshold: z
          .union([z.lazy(() => IntNullableFilterSchema), z.number().int()])
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
        product: z
          .union([
            z.lazy(() => ProductNullableScalarRelationFilterSchema),
            z.lazy(() => ProductWhereInputSchema),
          ])
          .optional()
          .nullable(),
        variant: z
          .union([
            z.lazy(() => ProductNullableScalarRelationFilterSchema),
            z.lazy(() => ProductWhereInputSchema),
          ])
          .optional()
          .nullable(),
        transactions: z.lazy(() => InventoryTransactionListRelationFilterSchema).optional(),
      })
      .strict(),
  );

export default InventoryWhereUniqueInputSchema;
