import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaCreateWithoutPdpJoinInputSchema } from './MediaCreateWithoutPdpJoinInputSchema';
import { MediaUncheckedCreateWithoutPdpJoinInputSchema } from './MediaUncheckedCreateWithoutPdpJoinInputSchema';

export const MediaCreateOrConnectWithoutPdpJoinInputSchema: z.ZodType<Prisma.MediaCreateOrConnectWithoutPdpJoinInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MediaCreateWithoutPdpJoinInputSchema),z.lazy(() => MediaUncheckedCreateWithoutPdpJoinInputSchema) ]),
}).strict();

export default MediaCreateOrConnectWithoutPdpJoinInputSchema;
