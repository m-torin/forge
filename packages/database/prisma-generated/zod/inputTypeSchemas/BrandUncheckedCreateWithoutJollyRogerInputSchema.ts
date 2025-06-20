import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandTypeSchema } from './BrandTypeSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { BrandUncheckedCreateNestedManyWithoutParentInputSchema } from './BrandUncheckedCreateNestedManyWithoutParentInputSchema';
import { PdpJoinUncheckedCreateNestedManyWithoutBrandInputSchema } from './PdpJoinUncheckedCreateNestedManyWithoutBrandInputSchema';
import { CollectionUncheckedCreateNestedManyWithoutBrandsInputSchema } from './CollectionUncheckedCreateNestedManyWithoutBrandsInputSchema';
import { MediaUncheckedCreateNestedManyWithoutBrandInputSchema } from './MediaUncheckedCreateNestedManyWithoutBrandInputSchema';
import { JrFindReplaceRejectUncheckedCreateNestedManyWithoutBrandsInputSchema } from './JrFindReplaceRejectUncheckedCreateNestedManyWithoutBrandsInputSchema';
import { ProductIdentifiersUncheckedCreateNestedManyWithoutBrandInputSchema } from './ProductIdentifiersUncheckedCreateNestedManyWithoutBrandInputSchema';
import { PdpJoinUncheckedCreateNestedManyWithoutManufacturerBrandsInputSchema } from './PdpJoinUncheckedCreateNestedManyWithoutManufacturerBrandsInputSchema';

export const BrandUncheckedCreateWithoutJollyRogerInputSchema: z.ZodType<Prisma.BrandUncheckedCreateWithoutJollyRogerInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  type: z.lazy(() => BrandTypeSchema).optional(),
  status: z.lazy(() => ContentStatusSchema).optional(),
  baseUrl: z.string().optional().nullable(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  parentId: z.string().optional().nullable(),
  displayOrder: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  children: z.lazy(() => BrandUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
  products: z.lazy(() => PdpJoinUncheckedCreateNestedManyWithoutBrandInputSchema).optional(),
  collections: z.lazy(() => CollectionUncheckedCreateNestedManyWithoutBrandsInputSchema).optional(),
  media: z.lazy(() => MediaUncheckedCreateNestedManyWithoutBrandInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectUncheckedCreateNestedManyWithoutBrandsInputSchema).optional(),
  identifiers: z.lazy(() => ProductIdentifiersUncheckedCreateNestedManyWithoutBrandInputSchema).optional(),
  manufacturedProducts: z.lazy(() => PdpJoinUncheckedCreateNestedManyWithoutManufacturerBrandsInputSchema).optional()
}).strict();

export default BrandUncheckedCreateWithoutJollyRogerInputSchema;
