import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesCreateWithoutProductsInputSchema } from './SeriesCreateWithoutProductsInputSchema';
import { SeriesUncheckedCreateWithoutProductsInputSchema } from './SeriesUncheckedCreateWithoutProductsInputSchema';
import { SeriesCreateOrConnectWithoutProductsInputSchema } from './SeriesCreateOrConnectWithoutProductsInputSchema';
import { SeriesUpsertWithWhereUniqueWithoutProductsInputSchema } from './SeriesUpsertWithWhereUniqueWithoutProductsInputSchema';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateWithWhereUniqueWithoutProductsInputSchema } from './SeriesUpdateWithWhereUniqueWithoutProductsInputSchema';
import { SeriesUpdateManyWithWhereWithoutProductsInputSchema } from './SeriesUpdateManyWithWhereWithoutProductsInputSchema';
import { SeriesScalarWhereInputSchema } from './SeriesScalarWhereInputSchema';

export const SeriesUpdateManyWithoutProductsNestedInputSchema: z.ZodType<Prisma.SeriesUpdateManyWithoutProductsNestedInput> = z.object({
  create: z.union([ z.lazy(() => SeriesCreateWithoutProductsInputSchema),z.lazy(() => SeriesCreateWithoutProductsInputSchema).array(),z.lazy(() => SeriesUncheckedCreateWithoutProductsInputSchema),z.lazy(() => SeriesUncheckedCreateWithoutProductsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SeriesCreateOrConnectWithoutProductsInputSchema),z.lazy(() => SeriesCreateOrConnectWithoutProductsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SeriesUpsertWithWhereUniqueWithoutProductsInputSchema),z.lazy(() => SeriesUpsertWithWhereUniqueWithoutProductsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SeriesUpdateWithWhereUniqueWithoutProductsInputSchema),z.lazy(() => SeriesUpdateWithWhereUniqueWithoutProductsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SeriesUpdateManyWithWhereWithoutProductsInputSchema),z.lazy(() => SeriesUpdateManyWithWhereWithoutProductsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SeriesScalarWhereInputSchema),z.lazy(() => SeriesScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default SeriesUpdateManyWithoutProductsNestedInputSchema;
