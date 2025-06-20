import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutDeletedByInputSchema } from './MediaUpdateWithoutDeletedByInputSchema';
import { MediaUncheckedUpdateWithoutDeletedByInputSchema } from './MediaUncheckedUpdateWithoutDeletedByInputSchema';

export const MediaUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.MediaUpdateWithWhereUniqueWithoutDeletedByInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MediaUpdateWithoutDeletedByInputSchema),z.lazy(() => MediaUncheckedUpdateWithoutDeletedByInputSchema) ]),
}).strict();

export default MediaUpdateWithWhereUniqueWithoutDeletedByInputSchema;
