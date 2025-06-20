import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandTypeSchema } from './BrandTypeSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { BrandUncheckedCreateNestedManyWithoutParentInputSchema } from './BrandUncheckedCreateNestedManyWithoutParentInputSchema';
import { PdpJoinUncheckedCreateNestedManyWithoutBrandInputSchema } from './PdpJoinUncheckedCreateNestedManyWithoutBrandInputSchema';
import { CollectionUncheckedCreateNestedManyWithoutBrandsInputSchema } from './CollectionUncheckedCreateNestedManyWithoutBrandsInputSchema';
import { JrFindReplaceRejectUncheckedCreateNestedManyWithoutBrandsInputSchema } from './JrFindReplaceRejectUncheckedCreateNestedManyWithoutBrandsInputSchema';
import { JollyRogerUncheckedCreateNestedOneWithoutBrandInputSchema } from './JollyRogerUncheckedCreateNestedOneWithoutBrandInputSchema';
import { ProductIdentifiersUncheckedCreateNestedManyWithoutBrandInputSchema } from './ProductIdentifiersUncheckedCreateNestedManyWithoutBrandInputSchema';
import { PdpJoinUncheckedCreateNestedManyWithoutManufacturerBrandsInputSchema } from './PdpJoinUncheckedCreateNestedManyWithoutManufacturerBrandsInputSchema';

export const BrandUncheckedCreateWithoutMediaInputSchema: z.ZodType<Prisma.BrandUncheckedCreateWithoutMediaInput> = z.object({
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
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectUncheckedCreateNestedManyWithoutBrandsInputSchema).optional(),
  jollyRoger: z.lazy(() => JollyRogerUncheckedCreateNestedOneWithoutBrandInputSchema).optional(),
  identifiers: z.lazy(() => ProductIdentifiersUncheckedCreateNestedManyWithoutBrandInputSchema).optional(),
  manufacturedProducts: z.lazy(() => PdpJoinUncheckedCreateNestedManyWithoutManufacturerBrandsInputSchema).optional()
}).strict();

export default BrandUncheckedCreateWithoutMediaInputSchema;
