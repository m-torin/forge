import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutArticleInputSchema } from './MediaCreateWithoutArticleInputSchema';
import { MediaUncheckedCreateWithoutArticleInputSchema } from './MediaUncheckedCreateWithoutArticleInputSchema';
import { MediaCreateOrConnectWithoutArticleInputSchema } from './MediaCreateOrConnectWithoutArticleInputSchema';
import { MediaUpsertWithWhereUniqueWithoutArticleInputSchema } from './MediaUpsertWithWhereUniqueWithoutArticleInputSchema';
import { MediaCreateManyArticleInputEnvelopeSchema } from './MediaCreateManyArticleInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithWhereUniqueWithoutArticleInputSchema } from './MediaUpdateWithWhereUniqueWithoutArticleInputSchema';
import { MediaUpdateManyWithWhereWithoutArticleInputSchema } from './MediaUpdateManyWithWhereWithoutArticleInputSchema';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';

export const MediaUncheckedUpdateManyWithoutArticleNestedInputSchema: z.ZodType<Prisma.MediaUncheckedUpdateManyWithoutArticleNestedInput> = z.object({
  create: z.union([ z.lazy(() => MediaCreateWithoutArticleInputSchema),z.lazy(() => MediaCreateWithoutArticleInputSchema).array(),z.lazy(() => MediaUncheckedCreateWithoutArticleInputSchema),z.lazy(() => MediaUncheckedCreateWithoutArticleInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MediaCreateOrConnectWithoutArticleInputSchema),z.lazy(() => MediaCreateOrConnectWithoutArticleInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MediaUpsertWithWhereUniqueWithoutArticleInputSchema),z.lazy(() => MediaUpsertWithWhereUniqueWithoutArticleInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MediaCreateManyArticleInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MediaUpdateWithWhereUniqueWithoutArticleInputSchema),z.lazy(() => MediaUpdateWithWhereUniqueWithoutArticleInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MediaUpdateManyWithWhereWithoutArticleInputSchema),z.lazy(() => MediaUpdateManyWithWhereWithoutArticleInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MediaScalarWhereInputSchema),z.lazy(() => MediaScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MediaUncheckedUpdateManyWithoutArticleNestedInputSchema;
