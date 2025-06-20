import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaCreateWithoutCollectionInputSchema } from './MediaCreateWithoutCollectionInputSchema';
import { MediaUncheckedCreateWithoutCollectionInputSchema } from './MediaUncheckedCreateWithoutCollectionInputSchema';

export const MediaCreateOrConnectWithoutCollectionInputSchema: z.ZodType<Prisma.MediaCreateOrConnectWithoutCollectionInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MediaCreateWithoutCollectionInputSchema),z.lazy(() => MediaUncheckedCreateWithoutCollectionInputSchema) ]),
}).strict();

export default MediaCreateOrConnectWithoutCollectionInputSchema;
