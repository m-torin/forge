import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { TransactionTypeSchema } from './TransactionTypeSchema';
import { TransactionStatusSchema } from './TransactionStatusSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { TransactionUncheckedCreateNestedManyWithoutParentTransactionInputSchema } from './TransactionUncheckedCreateNestedManyWithoutParentTransactionInputSchema';

export const TransactionUncheckedCreateInputSchema: z.ZodType<Prisma.TransactionUncheckedCreateInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      orderId: z.string(),
      type: z.lazy(() => TransactionTypeSchema),
      status: z.lazy(() => TransactionStatusSchema).optional(),
      amount: z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      currency: z.string().optional(),
      gateway: z.string(),
      gatewayId: z.string().optional().nullable(),
      gatewayResponse: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      paymentMethod: z.string().optional().nullable(),
      last4: z.string().optional().nullable(),
      parentTransactionId: z.string().optional().nullable(),
      metadata: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      processedAt: z.coerce.date().optional().nullable(),
      failedAt: z.coerce.date().optional().nullable(),
      failureReason: z.string().optional().nullable(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      refunds: z
        .lazy(() => TransactionUncheckedCreateNestedManyWithoutParentTransactionInputSchema)
        .optional(),
    })
    .strict();

export default TransactionUncheckedCreateInputSchema;
