import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutPdpJoinInputSchema } from './MediaCreateWithoutPdpJoinInputSchema';
import { MediaUncheckedCreateWithoutPdpJoinInputSchema } from './MediaUncheckedCreateWithoutPdpJoinInputSchema';
import { MediaCreateOrConnectWithoutPdpJoinInputSchema } from './MediaCreateOrConnectWithoutPdpJoinInputSchema';
import { MediaUpsertWithWhereUniqueWithoutPdpJoinInputSchema } from './MediaUpsertWithWhereUniqueWithoutPdpJoinInputSchema';
import { MediaCreateManyPdpJoinInputEnvelopeSchema } from './MediaCreateManyPdpJoinInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithWhereUniqueWithoutPdpJoinInputSchema } from './MediaUpdateWithWhereUniqueWithoutPdpJoinInputSchema';
import { MediaUpdateManyWithWhereWithoutPdpJoinInputSchema } from './MediaUpdateManyWithWhereWithoutPdpJoinInputSchema';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';

export const MediaUncheckedUpdateManyWithoutPdpJoinNestedInputSchema: z.ZodType<Prisma.MediaUncheckedUpdateManyWithoutPdpJoinNestedInput> = z.object({
  create: z.union([ z.lazy(() => MediaCreateWithoutPdpJoinInputSchema),z.lazy(() => MediaCreateWithoutPdpJoinInputSchema).array(),z.lazy(() => MediaUncheckedCreateWithoutPdpJoinInputSchema),z.lazy(() => MediaUncheckedCreateWithoutPdpJoinInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MediaCreateOrConnectWithoutPdpJoinInputSchema),z.lazy(() => MediaCreateOrConnectWithoutPdpJoinInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MediaUpsertWithWhereUniqueWithoutPdpJoinInputSchema),z.lazy(() => MediaUpsertWithWhereUniqueWithoutPdpJoinInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MediaCreateManyPdpJoinInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MediaUpdateWithWhereUniqueWithoutPdpJoinInputSchema),z.lazy(() => MediaUpdateWithWhereUniqueWithoutPdpJoinInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MediaUpdateManyWithWhereWithoutPdpJoinInputSchema),z.lazy(() => MediaUpdateManyWithWhereWithoutPdpJoinInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MediaScalarWhereInputSchema),z.lazy(() => MediaScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MediaUncheckedUpdateManyWithoutPdpJoinNestedInputSchema;
