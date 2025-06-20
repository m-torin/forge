import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaCreateWithoutProductInputSchema } from './MediaCreateWithoutProductInputSchema';
import { MediaUncheckedCreateWithoutProductInputSchema } from './MediaUncheckedCreateWithoutProductInputSchema';

export const MediaCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.MediaCreateOrConnectWithoutProductInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MediaCreateWithoutProductInputSchema),z.lazy(() => MediaUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export default MediaCreateOrConnectWithoutProductInputSchema;
