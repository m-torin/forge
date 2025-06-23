import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationTypeSchema } from './LocationTypeSchema';
import { LodgingTypeSchema } from './LodgingTypeSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductCreateNestedManyWithoutLocationsInputSchema } from './ProductCreateNestedManyWithoutLocationsInputSchema';
import { PdpJoinCreateNestedManyWithoutLocationsInputSchema } from './PdpJoinCreateNestedManyWithoutLocationsInputSchema';
import { TaxonomyCreateNestedManyWithoutLocationsInputSchema } from './TaxonomyCreateNestedManyWithoutLocationsInputSchema';
import { JrFindReplaceRejectCreateNestedManyWithoutLocationsInputSchema } from './JrFindReplaceRejectCreateNestedManyWithoutLocationsInputSchema';
import { UserCreateNestedOneWithoutDeletedLocationsInputSchema } from './UserCreateNestedOneWithoutDeletedLocationsInputSchema';

export const LocationCreateWithoutFandomsInputSchema: z.ZodType<Prisma.LocationCreateWithoutFandomsInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      name: z.string(),
      slug: z.string(),
      locationType: z.lazy(() => LocationTypeSchema).optional(),
      lodgingType: z
        .lazy(() => LodgingTypeSchema)
        .optional()
        .nullable(),
      isFictional: z.boolean().optional(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
      products: z.lazy(() => ProductCreateNestedManyWithoutLocationsInputSchema).optional(),
      pdpJoins: z.lazy(() => PdpJoinCreateNestedManyWithoutLocationsInputSchema).optional(),
      taxonomies: z.lazy(() => TaxonomyCreateNestedManyWithoutLocationsInputSchema).optional(),
      jrFindReplaceRejects: z
        .lazy(() => JrFindReplaceRejectCreateNestedManyWithoutLocationsInputSchema)
        .optional(),
      deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedLocationsInputSchema).optional(),
    })
    .strict();

export default LocationCreateWithoutFandomsInputSchema;
