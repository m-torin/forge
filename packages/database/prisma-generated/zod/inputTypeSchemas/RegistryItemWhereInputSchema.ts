import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { RegistryScalarRelationFilterSchema } from './RegistryScalarRelationFilterSchema';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';
import { ProductNullableScalarRelationFilterSchema } from './ProductNullableScalarRelationFilterSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { CollectionNullableScalarRelationFilterSchema } from './CollectionNullableScalarRelationFilterSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { RegistryPurchaseJoinListRelationFilterSchema } from './RegistryPurchaseJoinListRelationFilterSchema';

export const RegistryItemWhereInputSchema: z.ZodType<Prisma.RegistryItemWhereInput> = z.object({
  AND: z.union([ z.lazy(() => RegistryItemWhereInputSchema),z.lazy(() => RegistryItemWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RegistryItemWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RegistryItemWhereInputSchema),z.lazy(() => RegistryItemWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  deletedById: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  priority: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  purchased: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  registryId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  collectionId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  deletedBy: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  registry: z.union([ z.lazy(() => RegistryScalarRelationFilterSchema),z.lazy(() => RegistryWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductNullableScalarRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional().nullable(),
  collection: z.union([ z.lazy(() => CollectionNullableScalarRelationFilterSchema),z.lazy(() => CollectionWhereInputSchema) ]).optional().nullable(),
  purchases: z.lazy(() => RegistryPurchaseJoinListRelationFilterSchema).optional()
}).strict();

export default RegistryItemWhereInputSchema;
