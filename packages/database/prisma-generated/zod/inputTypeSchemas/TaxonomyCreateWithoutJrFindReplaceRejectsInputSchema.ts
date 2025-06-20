import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyTypeSchema } from './TaxonomyTypeSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductCreateNestedManyWithoutTaxonomiesInputSchema } from './ProductCreateNestedManyWithoutTaxonomiesInputSchema';
import { CollectionCreateNestedManyWithoutTaxonomiesInputSchema } from './CollectionCreateNestedManyWithoutTaxonomiesInputSchema';
import { PdpJoinCreateNestedManyWithoutTaxonomiesInputSchema } from './PdpJoinCreateNestedManyWithoutTaxonomiesInputSchema';
import { LocationCreateNestedManyWithoutTaxonomiesInputSchema } from './LocationCreateNestedManyWithoutTaxonomiesInputSchema';
import { MediaCreateNestedManyWithoutTaxonomyInputSchema } from './MediaCreateNestedManyWithoutTaxonomyInputSchema';
import { UserCreateNestedOneWithoutDeletedTaxonomiesInputSchema } from './UserCreateNestedOneWithoutDeletedTaxonomiesInputSchema';

export const TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.TaxonomyCreateWithoutJrFindReplaceRejectsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  type: z.lazy(() => TaxonomyTypeSchema).optional(),
  status: z.lazy(() => ContentStatusSchema).optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  products: z.lazy(() => ProductCreateNestedManyWithoutTaxonomiesInputSchema).optional(),
  collections: z.lazy(() => CollectionCreateNestedManyWithoutTaxonomiesInputSchema).optional(),
  pdpJoins: z.lazy(() => PdpJoinCreateNestedManyWithoutTaxonomiesInputSchema).optional(),
  locations: z.lazy(() => LocationCreateNestedManyWithoutTaxonomiesInputSchema).optional(),
  media: z.lazy(() => MediaCreateNestedManyWithoutTaxonomyInputSchema).optional(),
  deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedTaxonomiesInputSchema).optional()
}).strict();

export default TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema;
