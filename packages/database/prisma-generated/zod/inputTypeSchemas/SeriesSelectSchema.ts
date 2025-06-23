import { z } from 'zod';
import type { Prisma } from '../../client';
import { FandomArgsSchema } from '../outputTypeSchemas/FandomArgsSchema';
import { StoryFindManyArgsSchema } from '../outputTypeSchemas/StoryFindManyArgsSchema';
import { ProductFindManyArgsSchema } from '../outputTypeSchemas/ProductFindManyArgsSchema';
import { JrFindReplaceRejectFindManyArgsSchema } from '../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { SeriesCountOutputTypeArgsSchema } from '../outputTypeSchemas/SeriesCountOutputTypeArgsSchema';

export const SeriesSelectSchema: z.ZodType<Prisma.SeriesSelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    slug: z.boolean().optional(),
    fandomId: z.boolean().optional(),
    displayOrder: z.boolean().optional(),
    isFictional: z.boolean().optional(),
    copy: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    deletedById: z.boolean().optional(),
    fandom: z.union([z.boolean(), z.lazy(() => FandomArgsSchema)]).optional(),
    stories: z.union([z.boolean(), z.lazy(() => StoryFindManyArgsSchema)]).optional(),
    products: z.union([z.boolean(), z.lazy(() => ProductFindManyArgsSchema)]).optional(),
    jrFindReplaceRejects: z
      .union([z.boolean(), z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)])
      .optional(),
    deletedBy: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => SeriesCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export default SeriesSelectSchema;
