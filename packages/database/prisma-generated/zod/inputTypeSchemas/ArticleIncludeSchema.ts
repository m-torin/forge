import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { MediaFindManyArgsSchema } from '../outputTypeSchemas/MediaFindManyArgsSchema';
import { ArticleCountOutputTypeArgsSchema } from '../outputTypeSchemas/ArticleCountOutputTypeArgsSchema';

export const ArticleIncludeSchema: z.ZodType<Prisma.ArticleInclude> = z
  .object({
    deletedBy: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    media: z.union([z.boolean(), z.lazy(() => MediaFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => ArticleCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export default ArticleIncludeSchema;
