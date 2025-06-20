import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';
import { MediaUpdateManyMutationInputSchema } from './MediaUpdateManyMutationInputSchema';
import { MediaUncheckedUpdateManyWithoutPdpJoinInputSchema } from './MediaUncheckedUpdateManyWithoutPdpJoinInputSchema';

export const MediaUpdateManyWithWhereWithoutPdpJoinInputSchema: z.ZodType<Prisma.MediaUpdateManyWithWhereWithoutPdpJoinInput> = z.object({
  where: z.lazy(() => MediaScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MediaUpdateManyMutationInputSchema),z.lazy(() => MediaUncheckedUpdateManyWithoutPdpJoinInputSchema) ]),
}).strict();

export default MediaUpdateManyWithWhereWithoutPdpJoinInputSchema;
