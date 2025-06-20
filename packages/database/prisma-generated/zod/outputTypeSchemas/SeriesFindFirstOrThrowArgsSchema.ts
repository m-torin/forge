import { z } from 'zod';
import type { Prisma } from '../../client';
import { SeriesIncludeSchema } from '../inputTypeSchemas/SeriesIncludeSchema'
import { SeriesWhereInputSchema } from '../inputTypeSchemas/SeriesWhereInputSchema'
import { SeriesOrderByWithRelationInputSchema } from '../inputTypeSchemas/SeriesOrderByWithRelationInputSchema'
import { SeriesWhereUniqueInputSchema } from '../inputTypeSchemas/SeriesWhereUniqueInputSchema'
import { SeriesScalarFieldEnumSchema } from '../inputTypeSchemas/SeriesScalarFieldEnumSchema'
import { FandomArgsSchema } from "../outputTypeSchemas/FandomArgsSchema"
import { StoryFindManyArgsSchema } from "../outputTypeSchemas/StoryFindManyArgsSchema"
import { ProductFindManyArgsSchema } from "../outputTypeSchemas/ProductFindManyArgsSchema"
import { JrFindReplaceRejectFindManyArgsSchema } from "../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { SeriesCountOutputTypeArgsSchema } from "../outputTypeSchemas/SeriesCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const SeriesSelectSchema: z.ZodType<Prisma.SeriesSelect> = z.object({
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
  fandom: z.union([z.boolean(),z.lazy(() => FandomArgsSchema)]).optional(),
  stories: z.union([z.boolean(),z.lazy(() => StoryFindManyArgsSchema)]).optional(),
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  jrFindReplaceRejects: z.union([z.boolean(),z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)]).optional(),
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => SeriesCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const SeriesFindFirstOrThrowArgsSchema: z.ZodType<Prisma.SeriesFindFirstOrThrowArgs> = z.object({
  select: SeriesSelectSchema.optional(),
  include: z.lazy(() => SeriesIncludeSchema).optional(),
  where: SeriesWhereInputSchema.optional(),
  orderBy: z.union([ SeriesOrderByWithRelationInputSchema.array(),SeriesOrderByWithRelationInputSchema ]).optional(),
  cursor: SeriesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SeriesScalarFieldEnumSchema,SeriesScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default SeriesFindFirstOrThrowArgsSchema;
