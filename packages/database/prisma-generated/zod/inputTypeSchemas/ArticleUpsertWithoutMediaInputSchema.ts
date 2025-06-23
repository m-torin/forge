import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleUpdateWithoutMediaInputSchema } from './ArticleUpdateWithoutMediaInputSchema';
import { ArticleUncheckedUpdateWithoutMediaInputSchema } from './ArticleUncheckedUpdateWithoutMediaInputSchema';
import { ArticleCreateWithoutMediaInputSchema } from './ArticleCreateWithoutMediaInputSchema';
import { ArticleUncheckedCreateWithoutMediaInputSchema } from './ArticleUncheckedCreateWithoutMediaInputSchema';
import { ArticleWhereInputSchema } from './ArticleWhereInputSchema';

export const ArticleUpsertWithoutMediaInputSchema: z.ZodType<Prisma.ArticleUpsertWithoutMediaInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => ArticleUpdateWithoutMediaInputSchema),
        z.lazy(() => ArticleUncheckedUpdateWithoutMediaInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ArticleCreateWithoutMediaInputSchema),
        z.lazy(() => ArticleUncheckedCreateWithoutMediaInputSchema),
      ]),
      where: z.lazy(() => ArticleWhereInputSchema).optional(),
    })
    .strict();

export default ArticleUpsertWithoutMediaInputSchema;
