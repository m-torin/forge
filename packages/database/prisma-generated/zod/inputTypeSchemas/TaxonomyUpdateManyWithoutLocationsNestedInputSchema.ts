import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutLocationsInputSchema } from './TaxonomyCreateWithoutLocationsInputSchema';
import { TaxonomyUncheckedCreateWithoutLocationsInputSchema } from './TaxonomyUncheckedCreateWithoutLocationsInputSchema';
import { TaxonomyCreateOrConnectWithoutLocationsInputSchema } from './TaxonomyCreateOrConnectWithoutLocationsInputSchema';
import { TaxonomyUpsertWithWhereUniqueWithoutLocationsInputSchema } from './TaxonomyUpsertWithWhereUniqueWithoutLocationsInputSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithWhereUniqueWithoutLocationsInputSchema } from './TaxonomyUpdateWithWhereUniqueWithoutLocationsInputSchema';
import { TaxonomyUpdateManyWithWhereWithoutLocationsInputSchema } from './TaxonomyUpdateManyWithWhereWithoutLocationsInputSchema';
import { TaxonomyScalarWhereInputSchema } from './TaxonomyScalarWhereInputSchema';

export const TaxonomyUpdateManyWithoutLocationsNestedInputSchema: z.ZodType<Prisma.TaxonomyUpdateManyWithoutLocationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutLocationsInputSchema),z.lazy(() => TaxonomyCreateWithoutLocationsInputSchema).array(),z.lazy(() => TaxonomyUncheckedCreateWithoutLocationsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutLocationsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaxonomyCreateOrConnectWithoutLocationsInputSchema),z.lazy(() => TaxonomyCreateOrConnectWithoutLocationsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TaxonomyUpsertWithWhereUniqueWithoutLocationsInputSchema),z.lazy(() => TaxonomyUpsertWithWhereUniqueWithoutLocationsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TaxonomyUpdateWithWhereUniqueWithoutLocationsInputSchema),z.lazy(() => TaxonomyUpdateWithWhereUniqueWithoutLocationsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TaxonomyUpdateManyWithWhereWithoutLocationsInputSchema),z.lazy(() => TaxonomyUpdateManyWithWhereWithoutLocationsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TaxonomyScalarWhereInputSchema),z.lazy(() => TaxonomyScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default TaxonomyUpdateManyWithoutLocationsNestedInputSchema;
