import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrChartMethodSchema } from './JrChartMethodSchema';
import { NestedEnumJrChartMethodFilterSchema } from './NestedEnumJrChartMethodFilterSchema';

export const EnumJrChartMethodFilterSchema: z.ZodType<Prisma.EnumJrChartMethodFilter> = z
  .object({
    equals: z.lazy(() => JrChartMethodSchema).optional(),
    in: z
      .lazy(() => JrChartMethodSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => JrChartMethodSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => JrChartMethodSchema), z.lazy(() => NestedEnumJrChartMethodFilterSchema)])
      .optional(),
  })
  .strict();

export default EnumJrChartMethodFilterSchema;
