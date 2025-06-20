import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutDeletedByInputSchema } from './MediaUpdateWithoutDeletedByInputSchema';
import { MediaUncheckedUpdateWithoutDeletedByInputSchema } from './MediaUncheckedUpdateWithoutDeletedByInputSchema';
import { MediaCreateWithoutDeletedByInputSchema } from './MediaCreateWithoutDeletedByInputSchema';
import { MediaUncheckedCreateWithoutDeletedByInputSchema } from './MediaUncheckedCreateWithoutDeletedByInputSchema';

export const MediaUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.MediaUpsertWithWhereUniqueWithoutDeletedByInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MediaUpdateWithoutDeletedByInputSchema),z.lazy(() => MediaUncheckedUpdateWithoutDeletedByInputSchema) ]),
  create: z.union([ z.lazy(() => MediaCreateWithoutDeletedByInputSchema),z.lazy(() => MediaUncheckedCreateWithoutDeletedByInputSchema) ]),
}).strict();

export default MediaUpsertWithWhereUniqueWithoutDeletedByInputSchema;
