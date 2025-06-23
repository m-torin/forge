import { z } from 'zod';
import type { Prisma } from '../../client';
import { StoryIncludeSchema } from '../inputTypeSchemas/StoryIncludeSchema';
import { StoryWhereUniqueInputSchema } from '../inputTypeSchemas/StoryWhereUniqueInputSchema';
import { StoryCreateInputSchema } from '../inputTypeSchemas/StoryCreateInputSchema';
import { StoryUncheckedCreateInputSchema } from '../inputTypeSchemas/StoryUncheckedCreateInputSchema';
import { StoryUpdateInputSchema } from '../inputTypeSchemas/StoryUpdateInputSchema';
import { StoryUncheckedUpdateInputSchema } from '../inputTypeSchemas/StoryUncheckedUpdateInputSchema';
import { SeriesArgsSchema } from '../outputTypeSchemas/SeriesArgsSchema';
import { FandomArgsSchema } from '../outputTypeSchemas/FandomArgsSchema';
import { ProductFindManyArgsSchema } from '../outputTypeSchemas/ProductFindManyArgsSchema';
import { JrFindReplaceRejectFindManyArgsSchema } from '../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { StoryCountOutputTypeArgsSchema } from '../outputTypeSchemas/StoryCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const StorySelectSchema: z.ZodType<Prisma.StorySelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    slug: z.boolean().optional(),
    seriesId: z.boolean().optional(),
    fandomId: z.boolean().optional(),
    displayOrder: z.boolean().optional(),
    isFictional: z.boolean().optional(),
    copy: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    deletedById: z.boolean().optional(),
    series: z.union([z.boolean(), z.lazy(() => SeriesArgsSchema)]).optional(),
    fandom: z.union([z.boolean(), z.lazy(() => FandomArgsSchema)]).optional(),
    products: z.union([z.boolean(), z.lazy(() => ProductFindManyArgsSchema)]).optional(),
    jrFindReplaceRejects: z
      .union([z.boolean(), z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)])
      .optional(),
    deletedBy: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => StoryCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const StoryUpsertArgsSchema: z.ZodType<Prisma.StoryUpsertArgs> = z
  .object({
    select: StorySelectSchema.optional(),
    include: z.lazy(() => StoryIncludeSchema).optional(),
    where: StoryWhereUniqueInputSchema,
    create: z.union([StoryCreateInputSchema, StoryUncheckedCreateInputSchema]),
    update: z.union([StoryUpdateInputSchema, StoryUncheckedUpdateInputSchema]),
  })
  .strict();

export default StoryUpsertArgsSchema;
