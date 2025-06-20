import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaCreateWithoutUserInputSchema } from './MediaCreateWithoutUserInputSchema';
import { MediaUncheckedCreateWithoutUserInputSchema } from './MediaUncheckedCreateWithoutUserInputSchema';

export const MediaCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.MediaCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MediaCreateWithoutUserInputSchema),z.lazy(() => MediaUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default MediaCreateOrConnectWithoutUserInputSchema;
