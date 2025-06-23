import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleCreateWithoutMediaInputSchema } from './ArticleCreateWithoutMediaInputSchema';
import { ArticleUncheckedCreateWithoutMediaInputSchema } from './ArticleUncheckedCreateWithoutMediaInputSchema';
import { ArticleCreateOrConnectWithoutMediaInputSchema } from './ArticleCreateOrConnectWithoutMediaInputSchema';
import { ArticleUpsertWithoutMediaInputSchema } from './ArticleUpsertWithoutMediaInputSchema';
import { ArticleWhereInputSchema } from './ArticleWhereInputSchema';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';
import { ArticleUpdateToOneWithWhereWithoutMediaInputSchema } from './ArticleUpdateToOneWithWhereWithoutMediaInputSchema';
import { ArticleUpdateWithoutMediaInputSchema } from './ArticleUpdateWithoutMediaInputSchema';
import { ArticleUncheckedUpdateWithoutMediaInputSchema } from './ArticleUncheckedUpdateWithoutMediaInputSchema';

export const ArticleUpdateOneWithoutMediaNestedInputSchema: z.ZodType<Prisma.ArticleUpdateOneWithoutMediaNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ArticleCreateWithoutMediaInputSchema),
          z.lazy(() => ArticleUncheckedCreateWithoutMediaInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ArticleCreateOrConnectWithoutMediaInputSchema).optional(),
      upsert: z.lazy(() => ArticleUpsertWithoutMediaInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => ArticleWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => ArticleWhereInputSchema)]).optional(),
      connect: z.lazy(() => ArticleWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => ArticleUpdateToOneWithWhereWithoutMediaInputSchema),
          z.lazy(() => ArticleUpdateWithoutMediaInputSchema),
          z.lazy(() => ArticleUncheckedUpdateWithoutMediaInputSchema),
        ])
        .optional(),
    })
    .strict();

export default ArticleUpdateOneWithoutMediaNestedInputSchema;
