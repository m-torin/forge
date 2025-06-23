import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleCreateWithoutMediaInputSchema } from './ArticleCreateWithoutMediaInputSchema';
import { ArticleUncheckedCreateWithoutMediaInputSchema } from './ArticleUncheckedCreateWithoutMediaInputSchema';
import { ArticleCreateOrConnectWithoutMediaInputSchema } from './ArticleCreateOrConnectWithoutMediaInputSchema';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';

export const ArticleCreateNestedOneWithoutMediaInputSchema: z.ZodType<Prisma.ArticleCreateNestedOneWithoutMediaInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ArticleCreateWithoutMediaInputSchema),
          z.lazy(() => ArticleUncheckedCreateWithoutMediaInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ArticleCreateOrConnectWithoutMediaInputSchema).optional(),
      connect: z.lazy(() => ArticleWhereUniqueInputSchema).optional(),
    })
    .strict();

export default ArticleCreateNestedOneWithoutMediaInputSchema;
