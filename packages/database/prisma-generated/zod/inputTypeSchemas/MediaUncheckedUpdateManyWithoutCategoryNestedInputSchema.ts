import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutCategoryInputSchema } from './MediaCreateWithoutCategoryInputSchema';
import { MediaUncheckedCreateWithoutCategoryInputSchema } from './MediaUncheckedCreateWithoutCategoryInputSchema';
import { MediaCreateOrConnectWithoutCategoryInputSchema } from './MediaCreateOrConnectWithoutCategoryInputSchema';
import { MediaUpsertWithWhereUniqueWithoutCategoryInputSchema } from './MediaUpsertWithWhereUniqueWithoutCategoryInputSchema';
import { MediaCreateManyCategoryInputEnvelopeSchema } from './MediaCreateManyCategoryInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithWhereUniqueWithoutCategoryInputSchema } from './MediaUpdateWithWhereUniqueWithoutCategoryInputSchema';
import { MediaUpdateManyWithWhereWithoutCategoryInputSchema } from './MediaUpdateManyWithWhereWithoutCategoryInputSchema';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';

export const MediaUncheckedUpdateManyWithoutCategoryNestedInputSchema: z.ZodType<Prisma.MediaUncheckedUpdateManyWithoutCategoryNestedInput> = z.object({
  create: z.union([ z.lazy(() => MediaCreateWithoutCategoryInputSchema),z.lazy(() => MediaCreateWithoutCategoryInputSchema).array(),z.lazy(() => MediaUncheckedCreateWithoutCategoryInputSchema),z.lazy(() => MediaUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MediaCreateOrConnectWithoutCategoryInputSchema),z.lazy(() => MediaCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MediaUpsertWithWhereUniqueWithoutCategoryInputSchema),z.lazy(() => MediaUpsertWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MediaCreateManyCategoryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MediaUpdateWithWhereUniqueWithoutCategoryInputSchema),z.lazy(() => MediaUpdateWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MediaUpdateManyWithWhereWithoutCategoryInputSchema),z.lazy(() => MediaUpdateManyWithWhereWithoutCategoryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MediaScalarWhereInputSchema),z.lazy(() => MediaScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MediaUncheckedUpdateManyWithoutCategoryNestedInputSchema;
