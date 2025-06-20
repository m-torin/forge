import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';
import { MediaUpdateManyMutationInputSchema } from './MediaUpdateManyMutationInputSchema';
import { MediaUncheckedUpdateManyWithoutCollectionInputSchema } from './MediaUncheckedUpdateManyWithoutCollectionInputSchema';

export const MediaUpdateManyWithWhereWithoutCollectionInputSchema: z.ZodType<Prisma.MediaUpdateManyWithWhereWithoutCollectionInput> = z.object({
  where: z.lazy(() => MediaScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MediaUpdateManyMutationInputSchema),z.lazy(() => MediaUncheckedUpdateManyWithoutCollectionInputSchema) ]),
}).strict();

export default MediaUpdateManyWithWhereWithoutCollectionInputSchema;
