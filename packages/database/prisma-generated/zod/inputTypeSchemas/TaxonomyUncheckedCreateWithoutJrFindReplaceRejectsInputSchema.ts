import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyTypeSchema } from './TaxonomyTypeSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductUncheckedCreateNestedManyWithoutTaxonomiesInputSchema } from './ProductUncheckedCreateNestedManyWithoutTaxonomiesInputSchema';
import { CollectionUncheckedCreateNestedManyWithoutTaxonomiesInputSchema } from './CollectionUncheckedCreateNestedManyWithoutTaxonomiesInputSchema';
import { PdpJoinUncheckedCreateNestedManyWithoutTaxonomiesInputSchema } from './PdpJoinUncheckedCreateNestedManyWithoutTaxonomiesInputSchema';
import { LocationUncheckedCreateNestedManyWithoutTaxonomiesInputSchema } from './LocationUncheckedCreateNestedManyWithoutTaxonomiesInputSchema';
import { MediaUncheckedCreateNestedManyWithoutTaxonomyInputSchema } from './MediaUncheckedCreateNestedManyWithoutTaxonomyInputSchema';

export const TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInput> = z.object({
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
  pdpJoins: z.lazy(() => PdpJoinUncheckedCreateNestedManyWithoutTaxonomiesInputSchema).optional(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutTaxonomiesInputSchema).optional(),
  media: z.lazy(() => MediaUncheckedCreateNestedManyWithoutTaxonomyInputSchema).optional()
}).strict();

export default TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema;
