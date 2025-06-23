import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';

export const RegistryItemScalarWhereInputSchema: z.ZodType<Prisma.RegistryItemScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => RegistryItemScalarWhereInputSchema),
        z.lazy(() => RegistryItemScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => RegistryItemScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => RegistryItemScalarWhereInputSchema),
        z.lazy(() => RegistryItemScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
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
    quantity: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    priority: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    notes: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    purchased: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    registryId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    collectionId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
  })
  .strict();

export default RegistryItemScalarWhereInputSchema;
