import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';
import { ArticleUpdateWithoutUserInputSchema } from './ArticleUpdateWithoutUserInputSchema';
import { ArticleUncheckedUpdateWithoutUserInputSchema } from './ArticleUncheckedUpdateWithoutUserInputSchema';

export const ArticleUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ArticleUpdateWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => ArticleWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => ArticleUpdateWithoutUserInputSchema),
        z.lazy(() => ArticleUncheckedUpdateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default ArticleUpdateWithWhereUniqueWithoutUserInputSchema;
