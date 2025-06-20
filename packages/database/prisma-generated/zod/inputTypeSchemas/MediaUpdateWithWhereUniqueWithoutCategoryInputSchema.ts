import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutCategoryInputSchema } from './MediaUpdateWithoutCategoryInputSchema';
import { MediaUncheckedUpdateWithoutCategoryInputSchema } from './MediaUncheckedUpdateWithoutCategoryInputSchema';

export const MediaUpdateWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.MediaUpdateWithWhereUniqueWithoutCategoryInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MediaUpdateWithoutCategoryInputSchema),z.lazy(() => MediaUncheckedUpdateWithoutCategoryInputSchema) ]),
}).strict();

export default MediaUpdateWithWhereUniqueWithoutCategoryInputSchema;
