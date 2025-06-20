import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleScalarWhereInputSchema } from './ArticleScalarWhereInputSchema';
import { ArticleUpdateManyMutationInputSchema } from './ArticleUpdateManyMutationInputSchema';
import { ArticleUncheckedUpdateManyWithoutDeletedByInputSchema } from './ArticleUncheckedUpdateManyWithoutDeletedByInputSchema';

export const ArticleUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.ArticleUpdateManyWithWhereWithoutDeletedByInput> = z.object({
  where: z.lazy(() => ArticleScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ArticleUpdateManyMutationInputSchema),z.lazy(() => ArticleUncheckedUpdateManyWithoutDeletedByInputSchema) ]),
}).strict();

export default ArticleUpdateManyWithWhereWithoutDeletedByInputSchema;
