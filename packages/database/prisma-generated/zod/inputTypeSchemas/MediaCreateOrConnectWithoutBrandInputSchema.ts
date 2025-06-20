import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaCreateWithoutBrandInputSchema } from './MediaCreateWithoutBrandInputSchema';
import { MediaUncheckedCreateWithoutBrandInputSchema } from './MediaUncheckedCreateWithoutBrandInputSchema';

export const MediaCreateOrConnectWithoutBrandInputSchema: z.ZodType<Prisma.MediaCreateOrConnectWithoutBrandInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MediaCreateWithoutBrandInputSchema),z.lazy(() => MediaUncheckedCreateWithoutBrandInputSchema) ]),
}).strict();

export default MediaCreateOrConnectWithoutBrandInputSchema;
