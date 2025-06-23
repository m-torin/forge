import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductCategoryIncludeSchema } from '../inputTypeSchemas/ProductCategoryIncludeSchema';
import { ProductCategoryWhereInputSchema } from '../inputTypeSchemas/ProductCategoryWhereInputSchema';
import { ProductCategoryOrderByWithRelationInputSchema } from '../inputTypeSchemas/ProductCategoryOrderByWithRelationInputSchema';
import { ProductCategoryWhereUniqueInputSchema } from '../inputTypeSchemas/ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryScalarFieldEnumSchema } from '../inputTypeSchemas/ProductCategoryScalarFieldEnumSchema';
import { ProductCategoryArgsSchema } from '../outputTypeSchemas/ProductCategoryArgsSchema';
import { ProductCategoryFindManyArgsSchema } from '../outputTypeSchemas/ProductCategoryFindManyArgsSchema';
import { ProductFindManyArgsSchema } from '../outputTypeSchemas/ProductFindManyArgsSchema';
import { CollectionFindManyArgsSchema } from '../outputTypeSchemas/CollectionFindManyArgsSchema';
import { MediaFindManyArgsSchema } from '../outputTypeSchemas/MediaFindManyArgsSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { ProductCategoryCountOutputTypeArgsSchema } from '../outputTypeSchemas/ProductCategoryCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ProductCategorySelectSchema: z.ZodType<Prisma.ProductCategorySelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    slug: z.boolean().optional(),
    status: z.boolean().optional(),
    copy: z.boolean().optional(),
    parentId: z.boolean().optional(),
    displayOrder: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    deletedById: z.boolean().optional(),
    parent: z.union([z.boolean(), z.lazy(() => ProductCategoryArgsSchema)]).optional(),
    children: z.union([z.boolean(), z.lazy(() => ProductCategoryFindManyArgsSchema)]).optional(),
    products: z.union([z.boolean(), z.lazy(() => ProductFindManyArgsSchema)]).optional(),
    collections: z.union([z.boolean(), z.lazy(() => CollectionFindManyArgsSchema)]).optional(),
    media: z.union([z.boolean(), z.lazy(() => MediaFindManyArgsSchema)]).optional(),
    deletedBy: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    _count: z
      .union([z.boolean(), z.lazy(() => ProductCategoryCountOutputTypeArgsSchema)])
      .optional(),
  })
  .strict();

export const ProductCategoryFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ProductCategoryFindFirstOrThrowArgs> =
  z
    .object({
      select: ProductCategorySelectSchema.optional(),
      include: z.lazy(() => ProductCategoryIncludeSchema).optional(),
      where: ProductCategoryWhereInputSchema.optional(),
      orderBy: z
        .union([
          ProductCategoryOrderByWithRelationInputSchema.array(),
          ProductCategoryOrderByWithRelationInputSchema,
        ])
        .optional(),
      cursor: ProductCategoryWhereUniqueInputSchema.optional(),
      take: z.number().optional(),
      skip: z.number().optional(),
      distinct: z
        .union([ProductCategoryScalarFieldEnumSchema, ProductCategoryScalarFieldEnumSchema.array()])
        .optional(),
    })
    .strict();

export default ProductCategoryFindFirstOrThrowArgsSchema;
