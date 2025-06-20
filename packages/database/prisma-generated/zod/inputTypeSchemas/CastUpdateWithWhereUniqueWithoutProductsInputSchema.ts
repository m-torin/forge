import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';
import { CastUpdateWithoutProductsInputSchema } from './CastUpdateWithoutProductsInputSchema';
import { CastUncheckedUpdateWithoutProductsInputSchema } from './CastUncheckedUpdateWithoutProductsInputSchema';

export const CastUpdateWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.CastUpdateWithWhereUniqueWithoutProductsInput> = z.object({
  where: z.lazy(() => CastWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CastUpdateWithoutProductsInputSchema),z.lazy(() => CastUncheckedUpdateWithoutProductsInputSchema) ]),
}).strict();

export default CastUpdateWithWhereUniqueWithoutProductsInputSchema;
