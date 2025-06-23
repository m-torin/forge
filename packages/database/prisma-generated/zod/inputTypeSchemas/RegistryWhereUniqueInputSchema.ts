import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumRegistryTypeFilterSchema } from './EnumRegistryTypeFilterSchema';
import { RegistryTypeSchema } from './RegistryTypeSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { RegistryItemListRelationFilterSchema } from './RegistryItemListRelationFilterSchema';
import { RegistryUserJoinListRelationFilterSchema } from './RegistryUserJoinListRelationFilterSchema';
import { CartItemListRelationFilterSchema } from './CartItemListRelationFilterSchema';
import { OrderItemListRelationFilterSchema } from './OrderItemListRelationFilterSchema';

export const RegistryWhereUniqueInputSchema: z.ZodType<Prisma.RegistryWhereUniqueInput> = z
  .object({
    id: z.string().cuid(),
  })
  .and(
    z
      .object({
        id: z.string().cuid().optional(),
        AND: z
          .union([
            z.lazy(() => RegistryWhereInputSchema),
            z.lazy(() => RegistryWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => RegistryWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => RegistryWhereInputSchema),
            z.lazy(() => RegistryWhereInputSchema).array(),
          ])
          .optional(),
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
        title: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        description: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        type: z
          .union([z.lazy(() => EnumRegistryTypeFilterSchema), z.lazy(() => RegistryTypeSchema)])
          .optional(),
        isPublic: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
        eventDate: z
          .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
          .optional()
          .nullable(),
        createdByUserId: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        deletedBy: z
          .union([
            z.lazy(() => UserNullableScalarRelationFilterSchema),
            z.lazy(() => UserWhereInputSchema),
          ])
          .optional()
          .nullable(),
        createdByUser: z
          .union([
            z.lazy(() => UserNullableScalarRelationFilterSchema),
            z.lazy(() => UserWhereInputSchema),
          ])
          .optional()
          .nullable(),
        items: z.lazy(() => RegistryItemListRelationFilterSchema).optional(),
        users: z.lazy(() => RegistryUserJoinListRelationFilterSchema).optional(),
        cartItems: z.lazy(() => CartItemListRelationFilterSchema).optional(),
        orderItems: z.lazy(() => OrderItemListRelationFilterSchema).optional(),
      })
      .strict(),
  );

export default RegistryWhereUniqueInputSchema;
