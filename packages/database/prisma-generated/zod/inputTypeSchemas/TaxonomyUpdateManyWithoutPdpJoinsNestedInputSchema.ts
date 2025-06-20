import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutPdpJoinsInputSchema } from './TaxonomyCreateWithoutPdpJoinsInputSchema';
import { TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema } from './TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema';
import { TaxonomyCreateOrConnectWithoutPdpJoinsInputSchema } from './TaxonomyCreateOrConnectWithoutPdpJoinsInputSchema';
import { TaxonomyUpsertWithWhereUniqueWithoutPdpJoinsInputSchema } from './TaxonomyUpsertWithWhereUniqueWithoutPdpJoinsInputSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithWhereUniqueWithoutPdpJoinsInputSchema } from './TaxonomyUpdateWithWhereUniqueWithoutPdpJoinsInputSchema';
import { TaxonomyUpdateManyWithWhereWithoutPdpJoinsInputSchema } from './TaxonomyUpdateManyWithWhereWithoutPdpJoinsInputSchema';
import { TaxonomyScalarWhereInputSchema } from './TaxonomyScalarWhereInputSchema';

export const TaxonomyUpdateManyWithoutPdpJoinsNestedInputSchema: z.ZodType<Prisma.TaxonomyUpdateManyWithoutPdpJoinsNestedInput> = z.object({
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutPdpJoinsInputSchema),z.lazy(() => TaxonomyCreateWithoutPdpJoinsInputSchema).array(),z.lazy(() => TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaxonomyCreateOrConnectWithoutPdpJoinsInputSchema),z.lazy(() => TaxonomyCreateOrConnectWithoutPdpJoinsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TaxonomyUpsertWithWhereUniqueWithoutPdpJoinsInputSchema),z.lazy(() => TaxonomyUpsertWithWhereUniqueWithoutPdpJoinsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TaxonomyUpdateWithWhereUniqueWithoutPdpJoinsInputSchema),z.lazy(() => TaxonomyUpdateWithWhereUniqueWithoutPdpJoinsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TaxonomyUpdateManyWithWhereWithoutPdpJoinsInputSchema),z.lazy(() => TaxonomyUpdateManyWithWhereWithoutPdpJoinsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TaxonomyScalarWhereInputSchema),z.lazy(() => TaxonomyScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default TaxonomyUpdateManyWithoutPdpJoinsNestedInputSchema;
