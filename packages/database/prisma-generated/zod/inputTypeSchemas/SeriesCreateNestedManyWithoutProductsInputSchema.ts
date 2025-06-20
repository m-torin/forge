import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesCreateWithoutProductsInputSchema } from './SeriesCreateWithoutProductsInputSchema';
import { SeriesUncheckedCreateWithoutProductsInputSchema } from './SeriesUncheckedCreateWithoutProductsInputSchema';
import { SeriesCreateOrConnectWithoutProductsInputSchema } from './SeriesCreateOrConnectWithoutProductsInputSchema';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';

export const SeriesCreateNestedManyWithoutProductsInputSchema: z.ZodType<Prisma.SeriesCreateNestedManyWithoutProductsInput> = z.object({
  create: z.union([ z.lazy(() => SeriesCreateWithoutProductsInputSchema),z.lazy(() => SeriesCreateWithoutProductsInputSchema).array(),z.lazy(() => SeriesUncheckedCreateWithoutProductsInputSchema),z.lazy(() => SeriesUncheckedCreateWithoutProductsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SeriesCreateOrConnectWithoutProductsInputSchema),z.lazy(() => SeriesCreateOrConnectWithoutProductsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default SeriesCreateNestedManyWithoutProductsInputSchema;
