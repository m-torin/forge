import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleWhereInputSchema } from './ArticleWhereInputSchema';
import { ArticleUpdateWithoutMediaInputSchema } from './ArticleUpdateWithoutMediaInputSchema';
import { ArticleUncheckedUpdateWithoutMediaInputSchema } from './ArticleUncheckedUpdateWithoutMediaInputSchema';

export const ArticleUpdateToOneWithWhereWithoutMediaInputSchema: z.ZodType<Prisma.ArticleUpdateToOneWithWhereWithoutMediaInput> = z.object({
  where: z.lazy(() => ArticleWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ArticleUpdateWithoutMediaInputSchema),z.lazy(() => ArticleUncheckedUpdateWithoutMediaInputSchema) ]),
}).strict();

export default ArticleUpdateToOneWithWhereWithoutMediaInputSchema;
