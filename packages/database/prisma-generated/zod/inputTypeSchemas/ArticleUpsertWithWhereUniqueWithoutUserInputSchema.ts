import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';
import { ArticleUpdateWithoutUserInputSchema } from './ArticleUpdateWithoutUserInputSchema';
import { ArticleUncheckedUpdateWithoutUserInputSchema } from './ArticleUncheckedUpdateWithoutUserInputSchema';
import { ArticleCreateWithoutUserInputSchema } from './ArticleCreateWithoutUserInputSchema';
import { ArticleUncheckedCreateWithoutUserInputSchema } from './ArticleUncheckedCreateWithoutUserInputSchema';

export const ArticleUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ArticleUpsertWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => ArticleWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ArticleUpdateWithoutUserInputSchema),
        z.lazy(() => ArticleUncheckedUpdateWithoutUserInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ArticleCreateWithoutUserInputSchema),
        z.lazy(() => ArticleUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default ArticleUpsertWithWhereUniqueWithoutUserInputSchema;
