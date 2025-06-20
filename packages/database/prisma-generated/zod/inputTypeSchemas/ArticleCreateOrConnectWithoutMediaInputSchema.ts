import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';
import { ArticleCreateWithoutMediaInputSchema } from './ArticleCreateWithoutMediaInputSchema';
import { ArticleUncheckedCreateWithoutMediaInputSchema } from './ArticleUncheckedCreateWithoutMediaInputSchema';

export const ArticleCreateOrConnectWithoutMediaInputSchema: z.ZodType<Prisma.ArticleCreateOrConnectWithoutMediaInput> = z.object({
  where: z.lazy(() => ArticleWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ArticleCreateWithoutMediaInputSchema),z.lazy(() => ArticleUncheckedCreateWithoutMediaInputSchema) ]),
}).strict();

export default ArticleCreateOrConnectWithoutMediaInputSchema;
