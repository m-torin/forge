import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutBrandInputSchema } from './MediaCreateWithoutBrandInputSchema';
import { MediaUncheckedCreateWithoutBrandInputSchema } from './MediaUncheckedCreateWithoutBrandInputSchema';
import { MediaCreateOrConnectWithoutBrandInputSchema } from './MediaCreateOrConnectWithoutBrandInputSchema';
import { MediaUpsertWithWhereUniqueWithoutBrandInputSchema } from './MediaUpsertWithWhereUniqueWithoutBrandInputSchema';
import { MediaCreateManyBrandInputEnvelopeSchema } from './MediaCreateManyBrandInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithWhereUniqueWithoutBrandInputSchema } from './MediaUpdateWithWhereUniqueWithoutBrandInputSchema';
import { MediaUpdateManyWithWhereWithoutBrandInputSchema } from './MediaUpdateManyWithWhereWithoutBrandInputSchema';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';

export const MediaUncheckedUpdateManyWithoutBrandNestedInputSchema: z.ZodType<Prisma.MediaUncheckedUpdateManyWithoutBrandNestedInput> = z.object({
  create: z.union([ z.lazy(() => MediaCreateWithoutBrandInputSchema),z.lazy(() => MediaCreateWithoutBrandInputSchema).array(),z.lazy(() => MediaUncheckedCreateWithoutBrandInputSchema),z.lazy(() => MediaUncheckedCreateWithoutBrandInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MediaCreateOrConnectWithoutBrandInputSchema),z.lazy(() => MediaCreateOrConnectWithoutBrandInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MediaUpsertWithWhereUniqueWithoutBrandInputSchema),z.lazy(() => MediaUpsertWithWhereUniqueWithoutBrandInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MediaCreateManyBrandInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MediaUpdateWithWhereUniqueWithoutBrandInputSchema),z.lazy(() => MediaUpdateWithWhereUniqueWithoutBrandInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MediaUpdateManyWithWhereWithoutBrandInputSchema),z.lazy(() => MediaUpdateManyWithWhereWithoutBrandInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MediaScalarWhereInputSchema),z.lazy(() => MediaScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MediaUncheckedUpdateManyWithoutBrandNestedInputSchema;
