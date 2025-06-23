import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaTypeSchema } from './MediaTypeSchema';
import { NestedEnumMediaTypeFilterSchema } from './NestedEnumMediaTypeFilterSchema';

export const EnumMediaTypeFilterSchema: z.ZodType<Prisma.EnumMediaTypeFilter> = z
  .object({
    equals: z.lazy(() => MediaTypeSchema).optional(),
    in: z
      .lazy(() => MediaTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => MediaTypeSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => MediaTypeSchema), z.lazy(() => NestedEnumMediaTypeFilterSchema)])
      .optional(),
  })
  .strict();

export default EnumMediaTypeFilterSchema;
