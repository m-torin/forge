import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { EnumRegistryTypeFilterSchema } from './EnumRegistryTypeFilterSchema';
import { RegistryTypeSchema } from './RegistryTypeSchema';
import { BoolFilterSchema } from './BoolFilterSchema';

export const RegistryScalarWhereInputSchema: z.ZodType<Prisma.RegistryScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => RegistryScalarWhereInputSchema),z.lazy(() => RegistryScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RegistryScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RegistryScalarWhereInputSchema),z.lazy(() => RegistryScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  deletedById: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => EnumRegistryTypeFilterSchema),z.lazy(() => RegistryTypeSchema) ]).optional(),
  isPublic: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  eventDate: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  createdByUserId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default RegistryScalarWhereInputSchema;
