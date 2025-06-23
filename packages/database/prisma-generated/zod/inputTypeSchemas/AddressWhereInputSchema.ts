import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { EnumAddressTypeFilterSchema } from './EnumAddressTypeFilterSchema';
import { AddressTypeSchema } from './AddressTypeSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { OrderListRelationFilterSchema } from './OrderListRelationFilterSchema';

export const AddressWhereInputSchema: z.ZodType<Prisma.AddressWhereInput> = z
  .object({
    AND: z
      .union([z.lazy(() => AddressWhereInputSchema), z.lazy(() => AddressWhereInputSchema).array()])
      .optional(),
    OR: z
      .lazy(() => AddressWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([z.lazy(() => AddressWhereInputSchema), z.lazy(() => AddressWhereInputSchema).array()])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    userId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    type: z
      .union([z.lazy(() => EnumAddressTypeFilterSchema), z.lazy(() => AddressTypeSchema)])
      .optional(),
    isDefault: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    firstName: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    lastName: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    company: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    phone: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    street1: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    street2: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    city: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    state: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    postalCode: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    country: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    isValidated: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    validatedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    user: z
      .union([
        z.lazy(() => UserNullableScalarRelationFilterSchema),
        z.lazy(() => UserWhereInputSchema),
      ])
      .optional()
      .nullable(),
    orderShippingAddresses: z.lazy(() => OrderListRelationFilterSchema).optional(),
    orderBillingAddresses: z.lazy(() => OrderListRelationFilterSchema).optional(),
  })
  .strict();

export default AddressWhereInputSchema;
