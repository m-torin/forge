import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const PdpJoinScalarWhereInputSchema: z.ZodType<Prisma.PdpJoinScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => PdpJoinScalarWhereInputSchema),
        z.lazy(() => PdpJoinScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => PdpJoinScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => PdpJoinScalarWhereInputSchema),
        z.lazy(() => PdpJoinScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    brandId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    canonicalUrl: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    iframeUrl: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    tempMediaUrls: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    lastScanned: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    copy: z.lazy(() => JsonFilterSchema).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  })
  .strict();

export default PdpJoinScalarWhereInputSchema;
