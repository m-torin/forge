import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';
import { MediaUpdateManyMutationInputSchema } from './MediaUpdateManyMutationInputSchema';
import { MediaUncheckedUpdateManyWithoutArticleInputSchema } from './MediaUncheckedUpdateManyWithoutArticleInputSchema';

export const MediaUpdateManyWithWhereWithoutArticleInputSchema: z.ZodType<Prisma.MediaUpdateManyWithWhereWithoutArticleInput> = z.object({
  where: z.lazy(() => MediaScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MediaUpdateManyMutationInputSchema),z.lazy(() => MediaUncheckedUpdateManyWithoutArticleInputSchema) ]),
}).strict();

export default MediaUpdateManyWithWhereWithoutArticleInputSchema;
