import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutProductInputSchema } from './MediaCreateWithoutProductInputSchema';
import { MediaUncheckedCreateWithoutProductInputSchema } from './MediaUncheckedCreateWithoutProductInputSchema';
import { MediaCreateOrConnectWithoutProductInputSchema } from './MediaCreateOrConnectWithoutProductInputSchema';
import { MediaUpsertWithWhereUniqueWithoutProductInputSchema } from './MediaUpsertWithWhereUniqueWithoutProductInputSchema';
import { MediaCreateManyProductInputEnvelopeSchema } from './MediaCreateManyProductInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithWhereUniqueWithoutProductInputSchema } from './MediaUpdateWithWhereUniqueWithoutProductInputSchema';
import { MediaUpdateManyWithWhereWithoutProductInputSchema } from './MediaUpdateManyWithWhereWithoutProductInputSchema';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';

export const MediaUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.MediaUpdateManyWithoutProductNestedInput> = z.object({
  create: z.union([ z.lazy(() => MediaCreateWithoutProductInputSchema),z.lazy(() => MediaCreateWithoutProductInputSchema).array(),z.lazy(() => MediaUncheckedCreateWithoutProductInputSchema),z.lazy(() => MediaUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MediaCreateOrConnectWithoutProductInputSchema),z.lazy(() => MediaCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MediaUpsertWithWhereUniqueWithoutProductInputSchema),z.lazy(() => MediaUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MediaCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MediaUpdateWithWhereUniqueWithoutProductInputSchema),z.lazy(() => MediaUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MediaUpdateManyWithWhereWithoutProductInputSchema),z.lazy(() => MediaUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MediaScalarWhereInputSchema),z.lazy(() => MediaScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MediaUpdateManyWithoutProductNestedInputSchema;
