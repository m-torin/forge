import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaCreateWithoutCategoryInputSchema } from './MediaCreateWithoutCategoryInputSchema';
import { MediaUncheckedCreateWithoutCategoryInputSchema } from './MediaUncheckedCreateWithoutCategoryInputSchema';

export const MediaCreateOrConnectWithoutCategoryInputSchema: z.ZodType<Prisma.MediaCreateOrConnectWithoutCategoryInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MediaCreateWithoutCategoryInputSchema),z.lazy(() => MediaUncheckedCreateWithoutCategoryInputSchema) ]),
}).strict();

export default MediaCreateOrConnectWithoutCategoryInputSchema;
