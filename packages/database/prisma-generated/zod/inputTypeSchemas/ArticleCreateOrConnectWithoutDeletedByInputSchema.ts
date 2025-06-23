import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';
import { ArticleCreateWithoutDeletedByInputSchema } from './ArticleCreateWithoutDeletedByInputSchema';
import { ArticleUncheckedCreateWithoutDeletedByInputSchema } from './ArticleUncheckedCreateWithoutDeletedByInputSchema';

export const ArticleCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.ArticleCreateOrConnectWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => ArticleWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ArticleCreateWithoutDeletedByInputSchema),
        z.lazy(() => ArticleUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default ArticleCreateOrConnectWithoutDeletedByInputSchema;
