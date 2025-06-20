import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutUserInputSchema } from './MediaUpdateWithoutUserInputSchema';
import { MediaUncheckedUpdateWithoutUserInputSchema } from './MediaUncheckedUpdateWithoutUserInputSchema';
import { MediaCreateWithoutUserInputSchema } from './MediaCreateWithoutUserInputSchema';
import { MediaUncheckedCreateWithoutUserInputSchema } from './MediaUncheckedCreateWithoutUserInputSchema';

export const MediaUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.MediaUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MediaUpdateWithoutUserInputSchema),z.lazy(() => MediaUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => MediaCreateWithoutUserInputSchema),z.lazy(() => MediaUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default MediaUpsertWithWhereUniqueWithoutUserInputSchema;
