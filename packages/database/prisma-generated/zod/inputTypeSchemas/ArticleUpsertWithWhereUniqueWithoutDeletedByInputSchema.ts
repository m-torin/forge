import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';
import { ArticleUpdateWithoutDeletedByInputSchema } from './ArticleUpdateWithoutDeletedByInputSchema';
import { ArticleUncheckedUpdateWithoutDeletedByInputSchema } from './ArticleUncheckedUpdateWithoutDeletedByInputSchema';
import { ArticleCreateWithoutDeletedByInputSchema } from './ArticleCreateWithoutDeletedByInputSchema';
import { ArticleUncheckedCreateWithoutDeletedByInputSchema } from './ArticleUncheckedCreateWithoutDeletedByInputSchema';

export const ArticleUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.ArticleUpsertWithWhereUniqueWithoutDeletedByInput> = z.object({
  where: z.lazy(() => ArticleWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ArticleUpdateWithoutDeletedByInputSchema),z.lazy(() => ArticleUncheckedUpdateWithoutDeletedByInputSchema) ]),
  create: z.union([ z.lazy(() => ArticleCreateWithoutDeletedByInputSchema),z.lazy(() => ArticleUncheckedCreateWithoutDeletedByInputSchema) ]),
}).strict();

export default ArticleUpsertWithWhereUniqueWithoutDeletedByInputSchema;
