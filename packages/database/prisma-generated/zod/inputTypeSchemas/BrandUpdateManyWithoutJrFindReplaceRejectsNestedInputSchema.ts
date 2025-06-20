import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutJrFindReplaceRejectsInputSchema } from './BrandCreateWithoutJrFindReplaceRejectsInputSchema';
import { BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { BrandCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './BrandCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { BrandUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './BrandUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './BrandUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { BrandUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema } from './BrandUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema';
import { BrandScalarWhereInputSchema } from './BrandScalarWhereInputSchema';

export const BrandUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema: z.ZodType<Prisma.BrandUpdateManyWithoutJrFindReplaceRejectsNestedInput> = z.object({
  create: z.union([ z.lazy(() => BrandCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => BrandCreateWithoutJrFindReplaceRejectsInputSchema).array(),z.lazy(() => BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BrandCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => BrandCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BrandUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => BrandUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => BrandWhereUniqueInputSchema),z.lazy(() => BrandWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BrandWhereUniqueInputSchema),z.lazy(() => BrandWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BrandWhereUniqueInputSchema),z.lazy(() => BrandWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BrandWhereUniqueInputSchema),z.lazy(() => BrandWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BrandUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => BrandUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BrandUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => BrandUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BrandScalarWhereInputSchema),z.lazy(() => BrandScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default BrandUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema;
