import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesCreateWithoutFandomInputSchema } from './SeriesCreateWithoutFandomInputSchema';
import { SeriesUncheckedCreateWithoutFandomInputSchema } from './SeriesUncheckedCreateWithoutFandomInputSchema';
import { SeriesCreateOrConnectWithoutFandomInputSchema } from './SeriesCreateOrConnectWithoutFandomInputSchema';
import { SeriesUpsertWithWhereUniqueWithoutFandomInputSchema } from './SeriesUpsertWithWhereUniqueWithoutFandomInputSchema';
import { SeriesCreateManyFandomInputEnvelopeSchema } from './SeriesCreateManyFandomInputEnvelopeSchema';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateWithWhereUniqueWithoutFandomInputSchema } from './SeriesUpdateWithWhereUniqueWithoutFandomInputSchema';
import { SeriesUpdateManyWithWhereWithoutFandomInputSchema } from './SeriesUpdateManyWithWhereWithoutFandomInputSchema';
import { SeriesScalarWhereInputSchema } from './SeriesScalarWhereInputSchema';

export const SeriesUpdateManyWithoutFandomNestedInputSchema: z.ZodType<Prisma.SeriesUpdateManyWithoutFandomNestedInput> = z.object({
  create: z.union([ z.lazy(() => SeriesCreateWithoutFandomInputSchema),z.lazy(() => SeriesCreateWithoutFandomInputSchema).array(),z.lazy(() => SeriesUncheckedCreateWithoutFandomInputSchema),z.lazy(() => SeriesUncheckedCreateWithoutFandomInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SeriesCreateOrConnectWithoutFandomInputSchema),z.lazy(() => SeriesCreateOrConnectWithoutFandomInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SeriesUpsertWithWhereUniqueWithoutFandomInputSchema),z.lazy(() => SeriesUpsertWithWhereUniqueWithoutFandomInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SeriesCreateManyFandomInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SeriesUpdateWithWhereUniqueWithoutFandomInputSchema),z.lazy(() => SeriesUpdateWithWhereUniqueWithoutFandomInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SeriesUpdateManyWithWhereWithoutFandomInputSchema),z.lazy(() => SeriesUpdateManyWithWhereWithoutFandomInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SeriesScalarWhereInputSchema),z.lazy(() => SeriesScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default SeriesUpdateManyWithoutFandomNestedInputSchema;
