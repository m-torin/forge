import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutProductInputSchema } from './MediaUpdateWithoutProductInputSchema';
import { MediaUncheckedUpdateWithoutProductInputSchema } from './MediaUncheckedUpdateWithoutProductInputSchema';

export const MediaUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.MediaUpdateWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MediaUpdateWithoutProductInputSchema),z.lazy(() => MediaUncheckedUpdateWithoutProductInputSchema) ]),
}).strict();

export default MediaUpdateWithWhereUniqueWithoutProductInputSchema;
