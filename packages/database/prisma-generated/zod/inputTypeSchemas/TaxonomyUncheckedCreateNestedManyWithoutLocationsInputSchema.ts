import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutLocationsInputSchema } from './TaxonomyCreateWithoutLocationsInputSchema';
import { TaxonomyUncheckedCreateWithoutLocationsInputSchema } from './TaxonomyUncheckedCreateWithoutLocationsInputSchema';
import { TaxonomyCreateOrConnectWithoutLocationsInputSchema } from './TaxonomyCreateOrConnectWithoutLocationsInputSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';

export const TaxonomyUncheckedCreateNestedManyWithoutLocationsInputSchema: z.ZodType<Prisma.TaxonomyUncheckedCreateNestedManyWithoutLocationsInput> = z.object({
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutLocationsInputSchema),z.lazy(() => TaxonomyCreateWithoutLocationsInputSchema).array(),z.lazy(() => TaxonomyUncheckedCreateWithoutLocationsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutLocationsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaxonomyCreateOrConnectWithoutLocationsInputSchema),z.lazy(() => TaxonomyCreateOrConnectWithoutLocationsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default TaxonomyUncheckedCreateNestedManyWithoutLocationsInputSchema;
