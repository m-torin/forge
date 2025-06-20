import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandTypeSchema } from './BrandTypeSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { BrandCreateNestedOneWithoutChildrenInputSchema } from './BrandCreateNestedOneWithoutChildrenInputSchema';
import { BrandCreateNestedManyWithoutParentInputSchema } from './BrandCreateNestedManyWithoutParentInputSchema';
import { CollectionCreateNestedManyWithoutBrandsInputSchema } from './CollectionCreateNestedManyWithoutBrandsInputSchema';
import { MediaCreateNestedManyWithoutBrandInputSchema } from './MediaCreateNestedManyWithoutBrandInputSchema';
import { JrFindReplaceRejectCreateNestedManyWithoutBrandsInputSchema } from './JrFindReplaceRejectCreateNestedManyWithoutBrandsInputSchema';
import { JollyRogerCreateNestedOneWithoutBrandInputSchema } from './JollyRogerCreateNestedOneWithoutBrandInputSchema';
import { ProductIdentifiersCreateNestedManyWithoutBrandInputSchema } from './ProductIdentifiersCreateNestedManyWithoutBrandInputSchema';
import { PdpJoinCreateNestedManyWithoutManufacturerBrandsInputSchema } from './PdpJoinCreateNestedManyWithoutManufacturerBrandsInputSchema';
import { UserCreateNestedOneWithoutDeletedBrandsInputSchema } from './UserCreateNestedOneWithoutDeletedBrandsInputSchema';

export const BrandCreateWithoutProductsInputSchema: z.ZodType<Prisma.BrandCreateWithoutProductsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  type: z.lazy(() => BrandTypeSchema).optional(),
  status: z.lazy(() => ContentStatusSchema).optional(),
  baseUrl: z.string().optional().nullable(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  displayOrder: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  parent: z.lazy(() => BrandCreateNestedOneWithoutChildrenInputSchema).optional(),
  children: z.lazy(() => BrandCreateNestedManyWithoutParentInputSchema).optional(),
  collections: z.lazy(() => CollectionCreateNestedManyWithoutBrandsInputSchema).optional(),
  media: z.lazy(() => MediaCreateNestedManyWithoutBrandInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectCreateNestedManyWithoutBrandsInputSchema).optional(),
  jollyRoger: z.lazy(() => JollyRogerCreateNestedOneWithoutBrandInputSchema).optional(),
  identifiers: z.lazy(() => ProductIdentifiersCreateNestedManyWithoutBrandInputSchema).optional(),
  manufacturedProducts: z.lazy(() => PdpJoinCreateNestedManyWithoutManufacturerBrandsInputSchema).optional(),
  deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedBrandsInputSchema).optional()
}).strict();

export default BrandCreateWithoutProductsInputSchema;
