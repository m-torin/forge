import { z } from 'zod';
import type { Prisma } from '../../client';
import { FandomIncludeSchema } from '../inputTypeSchemas/FandomIncludeSchema';
import { FandomWhereInputSchema } from '../inputTypeSchemas/FandomWhereInputSchema';
import { FandomOrderByWithRelationInputSchema } from '../inputTypeSchemas/FandomOrderByWithRelationInputSchema';
import { FandomWhereUniqueInputSchema } from '../inputTypeSchemas/FandomWhereUniqueInputSchema';
import { FandomScalarFieldEnumSchema } from '../inputTypeSchemas/FandomScalarFieldEnumSchema';
import { SeriesFindManyArgsSchema } from '../outputTypeSchemas/SeriesFindManyArgsSchema';
import { StoryFindManyArgsSchema } from '../outputTypeSchemas/StoryFindManyArgsSchema';
import { ProductFindManyArgsSchema } from '../outputTypeSchemas/ProductFindManyArgsSchema';
import { LocationFindManyArgsSchema } from '../outputTypeSchemas/LocationFindManyArgsSchema';
import { JrFindReplaceRejectFindManyArgsSchema } from '../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { FandomCountOutputTypeArgsSchema } from '../outputTypeSchemas/FandomCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const FandomSelectSchema: z.ZodType<Prisma.FandomSelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    slug: z.boolean().optional(),
    isFictional: z.boolean().optional(),
    copy: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    deletedById: z.boolean().optional(),
    series: z.union([z.boolean(), z.lazy(() => SeriesFindManyArgsSchema)]).optional(),
    stories: z.union([z.boolean(), z.lazy(() => StoryFindManyArgsSchema)]).optional(),
    products: z.union([z.boolean(), z.lazy(() => ProductFindManyArgsSchema)]).optional(),
    locations: z.union([z.boolean(), z.lazy(() => LocationFindManyArgsSchema)]).optional(),
    jrFindReplaceRejects: z
      .union([z.boolean(), z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)])
      .optional(),
    deletedBy: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => FandomCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const FandomFindFirstOrThrowArgsSchema: z.ZodType<Prisma.FandomFindFirstOrThrowArgs> = z
  .object({
    select: FandomSelectSchema.optional(),
    include: z.lazy(() => FandomIncludeSchema).optional(),
    where: FandomWhereInputSchema.optional(),
    orderBy: z
      .union([FandomOrderByWithRelationInputSchema.array(), FandomOrderByWithRelationInputSchema])
      .optional(),
    cursor: FandomWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([FandomScalarFieldEnumSchema, FandomScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export default FandomFindFirstOrThrowArgsSchema;
