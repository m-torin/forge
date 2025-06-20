import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';
import { ArticleCreateWithoutUserInputSchema } from './ArticleCreateWithoutUserInputSchema';
import { ArticleUncheckedCreateWithoutUserInputSchema } from './ArticleUncheckedCreateWithoutUserInputSchema';

export const ArticleCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ArticleCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ArticleWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ArticleCreateWithoutUserInputSchema),z.lazy(() => ArticleUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ArticleCreateOrConnectWithoutUserInputSchema;
