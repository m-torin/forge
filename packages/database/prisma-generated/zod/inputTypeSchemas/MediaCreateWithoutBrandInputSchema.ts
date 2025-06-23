import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaTypeSchema } from './MediaTypeSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { UserCreateNestedOneWithoutMediaInputSchema } from './UserCreateNestedOneWithoutMediaInputSchema';
import { ArticleCreateNestedOneWithoutMediaInputSchema } from './ArticleCreateNestedOneWithoutMediaInputSchema';
import { CollectionCreateNestedOneWithoutMediaInputSchema } from './CollectionCreateNestedOneWithoutMediaInputSchema';
import { ProductCreateNestedOneWithoutMediaInputSchema } from './ProductCreateNestedOneWithoutMediaInputSchema';
import { TaxonomyCreateNestedOneWithoutMediaInputSchema } from './TaxonomyCreateNestedOneWithoutMediaInputSchema';
import { ProductCategoryCreateNestedOneWithoutMediaInputSchema } from './ProductCategoryCreateNestedOneWithoutMediaInputSchema';
import { PdpJoinCreateNestedOneWithoutMediaInputSchema } from './PdpJoinCreateNestedOneWithoutMediaInputSchema';
import { UserCreateNestedOneWithoutDeletedMediaInputSchema } from './UserCreateNestedOneWithoutDeletedMediaInputSchema';
import { ReviewCreateNestedOneWithoutMediaInputSchema } from './ReviewCreateNestedOneWithoutMediaInputSchema';

export const MediaCreateWithoutBrandInputSchema: z.ZodType<Prisma.MediaCreateWithoutBrandInput> = z
  .object({
    id: z.string().cuid().optional(),
    url: z.string(),
    altText: z.string().optional().nullable(),
    type: z.lazy(() => MediaTypeSchema).optional(),
    width: z.number().int().optional().nullable(),
    height: z.number().int().optional().nullable(),
    size: z.number().int().optional().nullable(),
    mimeType: z.string().optional().nullable(),
    sortOrder: z.number().int().optional(),
    copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    user: z.lazy(() => UserCreateNestedOneWithoutMediaInputSchema).optional(),
    article: z.lazy(() => ArticleCreateNestedOneWithoutMediaInputSchema).optional(),
    collection: z.lazy(() => CollectionCreateNestedOneWithoutMediaInputSchema).optional(),
    product: z.lazy(() => ProductCreateNestedOneWithoutMediaInputSchema).optional(),
    taxonomy: z.lazy(() => TaxonomyCreateNestedOneWithoutMediaInputSchema).optional(),
    category: z.lazy(() => ProductCategoryCreateNestedOneWithoutMediaInputSchema).optional(),
    pdpJoin: z.lazy(() => PdpJoinCreateNestedOneWithoutMediaInputSchema).optional(),
    deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedMediaInputSchema).optional(),
    review: z.lazy(() => ReviewCreateNestedOneWithoutMediaInputSchema).optional(),
  })
  .strict();

export default MediaCreateWithoutBrandInputSchema;
