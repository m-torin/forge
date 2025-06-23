import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumPdpUrlTypeFilterSchema } from './EnumPdpUrlTypeFilterSchema';
import { PdpUrlTypeSchema } from './PdpUrlTypeSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { PdpJoinScalarRelationFilterSchema } from './PdpJoinScalarRelationFilterSchema';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';

export const PdpUrlWhereInputSchema: z.ZodType<Prisma.PdpUrlWhereInput> = z
  .object({
    AND: z
      .union([z.lazy(() => PdpUrlWhereInputSchema), z.lazy(() => PdpUrlWhereInputSchema).array()])
      .optional(),
    OR: z
      .lazy(() => PdpUrlWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([z.lazy(() => PdpUrlWhereInputSchema), z.lazy(() => PdpUrlWhereInputSchema).array()])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    url: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    pdpJoinId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    urlType: z
      .union([z.lazy(() => EnumPdpUrlTypeFilterSchema), z.lazy(() => PdpUrlTypeSchema)])
      .optional(),
    isActive: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    copy: z.lazy(() => JsonFilterSchema).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    pdpJoin: z
      .union([
        z.lazy(() => PdpJoinScalarRelationFilterSchema),
        z.lazy(() => PdpJoinWhereInputSchema),
      ])
      .optional(),
  })
  .strict();

export default PdpUrlWhereInputSchema;
