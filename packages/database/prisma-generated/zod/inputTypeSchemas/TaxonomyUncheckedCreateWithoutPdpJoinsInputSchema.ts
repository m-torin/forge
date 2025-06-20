import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyTypeSchema } from './TaxonomyTypeSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductUncheckedCreateNestedManyWithoutTaxonomiesInputSchema } from './ProductUncheckedCreateNestedManyWithoutTaxonomiesInputSchema';
import { CollectionUncheckedCreateNestedManyWithoutTaxonomiesInputSchema } from './CollectionUncheckedCreateNestedManyWithoutTaxonomiesInputSchema';
import { LocationUncheckedCreateNestedManyWithoutTaxonomiesInputSchema } from './LocationUncheckedCreateNestedManyWithoutTaxonomiesInputSchema';
import { MediaUncheckedCreateNestedManyWithoutTaxonomyInputSchema } from './MediaUncheckedCreateNestedManyWithoutTaxonomyInputSchema';
import { JrFindReplaceRejectUncheckedCreateNestedManyWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUncheckedCreateNestedManyWithoutTaxonomiesInputSchema';

export const TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema: z.ZodType<Prisma.TaxonomyUncheckedCreateWithoutPdpJoinsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  type: z.lazy(() => TaxonomyTypeSchema).optional(),
  status: z.lazy(() => ContentStatusSchema).optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutTaxonomiesInputSchema).optional(),
  collections: z.lazy(() => CollectionUncheckedCreateNestedManyWithoutTaxonomiesInputSchema).optional(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutTaxonomiesInputSchema).optional(),
  media: z.lazy(() => MediaUncheckedCreateNestedManyWithoutTaxonomyInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectUncheckedCreateNestedManyWithoutTaxonomiesInputSchema).optional()
}).strict();

export default TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema;
