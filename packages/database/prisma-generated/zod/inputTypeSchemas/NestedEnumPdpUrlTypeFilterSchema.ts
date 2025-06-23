import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlTypeSchema } from './PdpUrlTypeSchema';

export const NestedEnumPdpUrlTypeFilterSchema: z.ZodType<Prisma.NestedEnumPdpUrlTypeFilter> = z
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

export default NestedEnumPdpUrlTypeFilterSchema;
