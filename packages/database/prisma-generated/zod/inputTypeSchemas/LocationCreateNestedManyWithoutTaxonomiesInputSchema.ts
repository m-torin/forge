import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateWithoutTaxonomiesInputSchema } from './LocationCreateWithoutTaxonomiesInputSchema';
import { LocationUncheckedCreateWithoutTaxonomiesInputSchema } from './LocationUncheckedCreateWithoutTaxonomiesInputSchema';
import { LocationCreateOrConnectWithoutTaxonomiesInputSchema } from './LocationCreateOrConnectWithoutTaxonomiesInputSchema';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';

export const LocationCreateNestedManyWithoutTaxonomiesInputSchema: z.ZodType<Prisma.LocationCreateNestedManyWithoutTaxonomiesInput> = z.object({
  create: z.union([ z.lazy(() => LocationCreateWithoutTaxonomiesInputSchema),z.lazy(() => LocationCreateWithoutTaxonomiesInputSchema).array(),z.lazy(() => LocationUncheckedCreateWithoutTaxonomiesInputSchema),z.lazy(() => LocationUncheckedCreateWithoutTaxonomiesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => LocationCreateOrConnectWithoutTaxonomiesInputSchema),z.lazy(() => LocationCreateOrConnectWithoutTaxonomiesInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema),z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default LocationCreateNestedManyWithoutTaxonomiesInputSchema;
