import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateWithoutProductsInputSchema } from './FandomUpdateWithoutProductsInputSchema';
import { FandomUncheckedUpdateWithoutProductsInputSchema } from './FandomUncheckedUpdateWithoutProductsInputSchema';

export const FandomUpdateWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.FandomUpdateWithWhereUniqueWithoutProductsInput> = z.object({
  where: z.lazy(() => FandomWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FandomUpdateWithoutProductsInputSchema),z.lazy(() => FandomUncheckedUpdateWithoutProductsInputSchema) ]),
}).strict();

export default FandomUpdateWithWhereUniqueWithoutProductsInputSchema;
