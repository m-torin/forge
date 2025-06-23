import { z } from 'zod';
import type { Prisma } from '../../client';
import { ArticleIncludeSchema } from '../inputTypeSchemas/ArticleIncludeSchema';
import { ArticleWhereUniqueInputSchema } from '../inputTypeSchemas/ArticleWhereUniqueInputSchema';
import { ArticleCreateInputSchema } from '../inputTypeSchemas/ArticleCreateInputSchema';
import { ArticleUncheckedCreateInputSchema } from '../inputTypeSchemas/ArticleUncheckedCreateInputSchema';
import { ArticleUpdateInputSchema } from '../inputTypeSchemas/ArticleUpdateInputSchema';
import { ArticleUncheckedUpdateInputSchema } from '../inputTypeSchemas/ArticleUncheckedUpdateInputSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { MediaFindManyArgsSchema } from '../outputTypeSchemas/MediaFindManyArgsSchema';
import { ArticleCountOutputTypeArgsSchema } from '../outputTypeSchemas/ArticleCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ArticleSelectSchema: z.ZodType<Prisma.ArticleSelect> = z
  .object({
    id: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    deletedById: z.boolean().optional(),
    title: z.boolean().optional(),
    slug: z.boolean().optional(),
    content: z.boolean().optional(),
    status: z.boolean().optional(),
    userId: z.boolean().optional(),
    deletedBy: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    media: z.union([z.boolean(), z.lazy(() => MediaFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => ArticleCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const ArticleUpsertArgsSchema: z.ZodType<Prisma.ArticleUpsertArgs> = z
  .object({
    select: ArticleSelectSchema.optional(),
    include: z.lazy(() => ArticleIncludeSchema).optional(),
    where: ArticleWhereUniqueInputSchema,
    create: z.union([ArticleCreateInputSchema, ArticleUncheckedCreateInputSchema]),
    update: z.union([ArticleUpdateInputSchema, ArticleUncheckedUpdateInputSchema]),
  })
  .strict();

export default ArticleUpsertArgsSchema;
