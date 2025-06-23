import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { EnumPurchaseStatusWithAggregatesFilterSchema } from './EnumPurchaseStatusWithAggregatesFilterSchema';
import { PurchaseStatusSchema } from './PurchaseStatusSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { FloatNullableWithAggregatesFilterSchema } from './FloatNullableWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';

export const RegistryPurchaseJoinScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => RegistryPurchaseJoinScalarWhereWithAggregatesInputSchema),
          z.lazy(() => RegistryPurchaseJoinScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => RegistryPurchaseJoinScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => RegistryPurchaseJoinScalarWhereWithAggregatesInputSchema),
          z.lazy(() => RegistryPurchaseJoinScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      createdAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      updatedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      purchaseDate: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      quantity: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      status: z
        .union([
          z.lazy(() => EnumPurchaseStatusWithAggregatesFilterSchema),
          z.lazy(() => PurchaseStatusSchema),
        ])
        .optional(),
      transactionId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      orderNumber: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      price: z
        .union([z.lazy(() => FloatNullableWithAggregatesFilterSchema), z.number()])
        .optional()
        .nullable(),
      currency: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      trackingNumber: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      trackingUrl: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      estimatedDelivery: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      actualDelivery: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      isGift: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      giftMessage: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      giftWrapped: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      thankYouSent: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      thankYouSentAt: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      thankYouMessage: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      notes: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      purchaserId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      registryItemId: z
        .union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
        .optional(),
      notifiedOwner: z
        .union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()])
        .optional(),
      notifiedDate: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
    })
    .strict();

export default RegistryPurchaseJoinScalarWhereWithAggregatesInputSchema;
