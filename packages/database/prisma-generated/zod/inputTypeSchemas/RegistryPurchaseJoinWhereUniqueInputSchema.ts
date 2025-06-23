import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinWhereInputSchema } from './RegistryPurchaseJoinWhereInputSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { EnumPurchaseStatusFilterSchema } from './EnumPurchaseStatusFilterSchema';
import { PurchaseStatusSchema } from './PurchaseStatusSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { FloatNullableFilterSchema } from './FloatNullableFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { RegistryItemScalarRelationFilterSchema } from './RegistryItemScalarRelationFilterSchema';
import { RegistryItemWhereInputSchema } from './RegistryItemWhereInputSchema';

export const RegistryPurchaseJoinWhereUniqueInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinWhereUniqueInput> =
  z
    .object({
      id: z.string().cuid(),
    })
    .and(
      z
        .object({
          id: z.string().cuid().optional(),
          AND: z
            .union([
              z.lazy(() => RegistryPurchaseJoinWhereInputSchema),
              z.lazy(() => RegistryPurchaseJoinWhereInputSchema).array(),
            ])
            .optional(),
          OR: z
            .lazy(() => RegistryPurchaseJoinWhereInputSchema)
            .array()
            .optional(),
          NOT: z
            .union([
              z.lazy(() => RegistryPurchaseJoinWhereInputSchema),
              z.lazy(() => RegistryPurchaseJoinWhereInputSchema).array(),
            ])
            .optional(),
          createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
          updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
          purchaseDate: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
          quantity: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
          status: z
            .union([
              z.lazy(() => EnumPurchaseStatusFilterSchema),
              z.lazy(() => PurchaseStatusSchema),
            ])
            .optional(),
          transactionId: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          orderNumber: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          price: z
            .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
            .optional()
            .nullable(),
          currency: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          trackingNumber: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          trackingUrl: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          estimatedDelivery: z
            .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
            .optional()
            .nullable(),
          actualDelivery: z
            .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
            .optional()
            .nullable(),
          isGift: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
          giftMessage: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          giftWrapped: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
          thankYouSent: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
          thankYouSentAt: z
            .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
            .optional()
            .nullable(),
          thankYouMessage: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          notes: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          purchaserId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
          registryItemId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
          notifiedOwner: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
          notifiedDate: z
            .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
            .optional()
            .nullable(),
          purchaser: z
            .union([
              z.lazy(() => UserScalarRelationFilterSchema),
              z.lazy(() => UserWhereInputSchema),
            ])
            .optional(),
          registryItem: z
            .union([
              z.lazy(() => RegistryItemScalarRelationFilterSchema),
              z.lazy(() => RegistryItemWhereInputSchema),
            ])
            .optional(),
        })
        .strict(),
    );

export default RegistryPurchaseJoinWhereUniqueInputSchema;
