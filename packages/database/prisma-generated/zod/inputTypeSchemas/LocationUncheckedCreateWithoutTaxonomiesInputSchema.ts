import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationTypeSchema } from './LocationTypeSchema';
import { LodgingTypeSchema } from './LodgingTypeSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductUncheckedCreateNestedManyWithoutLocationsInputSchema } from './ProductUncheckedCreateNestedManyWithoutLocationsInputSchema';
import { FandomUncheckedCreateNestedManyWithoutLocationsInputSchema } from './FandomUncheckedCreateNestedManyWithoutLocationsInputSchema';
import { PdpJoinUncheckedCreateNestedManyWithoutLocationsInputSchema } from './PdpJoinUncheckedCreateNestedManyWithoutLocationsInputSchema';
import { JrFindReplaceRejectUncheckedCreateNestedManyWithoutLocationsInputSchema } from './JrFindReplaceRejectUncheckedCreateNestedManyWithoutLocationsInputSchema';

export const LocationUncheckedCreateWithoutTaxonomiesInputSchema: z.ZodType<Prisma.LocationUncheckedCreateWithoutTaxonomiesInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  locationType: z.lazy(() => LocationTypeSchema).optional(),
  lodgingType: z.lazy(() => LodgingTypeSchema).optional().nullable(),
  isFictional: z.boolean().optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutLocationsInputSchema).optional(),
  fandoms: z.lazy(() => FandomUncheckedCreateNestedManyWithoutLocationsInputSchema).optional(),
  pdpJoins: z.lazy(() => PdpJoinUncheckedCreateNestedManyWithoutLocationsInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectUncheckedCreateNestedManyWithoutLocationsInputSchema).optional()
}).strict();

export default LocationUncheckedCreateWithoutTaxonomiesInputSchema;
