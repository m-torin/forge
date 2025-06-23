import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';
import { ArticleUpdateWithoutDeletedByInputSchema } from './ArticleUpdateWithoutDeletedByInputSchema';
import { ArticleUncheckedUpdateWithoutDeletedByInputSchema } from './ArticleUncheckedUpdateWithoutDeletedByInputSchema';

export const ArticleUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.ArticleUpdateWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => ArticleWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => ArticleUpdateWithoutDeletedByInputSchema),
        z.lazy(() => ArticleUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default ArticleUpdateWithWhereUniqueWithoutDeletedByInputSchema;
