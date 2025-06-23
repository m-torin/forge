import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlTypeSchema } from './PdpUrlTypeSchema';
import { NestedEnumPdpUrlTypeFilterSchema } from './NestedEnumPdpUrlTypeFilterSchema';

export const EnumPdpUrlTypeFilterSchema: z.ZodType<Prisma.EnumPdpUrlTypeFilter> = z
  .object({
    equals: z.lazy(() => PdpUrlTypeSchema).optional(),
    in: z
      .lazy(() => PdpUrlTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => PdpUrlTypeSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => PdpUrlTypeSchema), z.lazy(() => NestedEnumPdpUrlTypeFilterSchema)])
      .optional(),
  })
  .strict();

export default EnumPdpUrlTypeFilterSchema;
