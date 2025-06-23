import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleScalarWhereInputSchema } from './ArticleScalarWhereInputSchema';
import { ArticleUpdateManyMutationInputSchema } from './ArticleUpdateManyMutationInputSchema';
import { ArticleUncheckedUpdateManyWithoutUserInputSchema } from './ArticleUncheckedUpdateManyWithoutUserInputSchema';

export const ArticleUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ArticleUpdateManyWithWhereWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => ArticleScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => ArticleUpdateManyMutationInputSchema),
        z.lazy(() => ArticleUncheckedUpdateManyWithoutUserInputSchema),
      ]),
    })
    .strict();

export default ArticleUpdateManyWithWhereWithoutUserInputSchema;
