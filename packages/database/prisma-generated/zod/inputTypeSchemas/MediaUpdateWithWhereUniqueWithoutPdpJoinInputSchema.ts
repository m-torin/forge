import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutPdpJoinInputSchema } from './MediaUpdateWithoutPdpJoinInputSchema';
import { MediaUncheckedUpdateWithoutPdpJoinInputSchema } from './MediaUncheckedUpdateWithoutPdpJoinInputSchema';

export const MediaUpdateWithWhereUniqueWithoutPdpJoinInputSchema: z.ZodType<Prisma.MediaUpdateWithWhereUniqueWithoutPdpJoinInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MediaUpdateWithoutPdpJoinInputSchema),z.lazy(() => MediaUncheckedUpdateWithoutPdpJoinInputSchema) ]),
}).strict();

export default MediaUpdateWithWhereUniqueWithoutPdpJoinInputSchema;
