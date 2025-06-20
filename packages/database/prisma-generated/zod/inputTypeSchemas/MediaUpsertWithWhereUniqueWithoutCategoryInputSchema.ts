import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutCategoryInputSchema } from './MediaUpdateWithoutCategoryInputSchema';
import { MediaUncheckedUpdateWithoutCategoryInputSchema } from './MediaUncheckedUpdateWithoutCategoryInputSchema';
import { MediaCreateWithoutCategoryInputSchema } from './MediaCreateWithoutCategoryInputSchema';
import { MediaUncheckedCreateWithoutCategoryInputSchema } from './MediaUncheckedCreateWithoutCategoryInputSchema';

export const MediaUpsertWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.MediaUpsertWithWhereUniqueWithoutCategoryInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MediaUpdateWithoutCategoryInputSchema),z.lazy(() => MediaUncheckedUpdateWithoutCategoryInputSchema) ]),
  create: z.union([ z.lazy(() => MediaCreateWithoutCategoryInputSchema),z.lazy(() => MediaUncheckedCreateWithoutCategoryInputSchema) ]),
}).strict();

export default MediaUpsertWithWhereUniqueWithoutCategoryInputSchema;
