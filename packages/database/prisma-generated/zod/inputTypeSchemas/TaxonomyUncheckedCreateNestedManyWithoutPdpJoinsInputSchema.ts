import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutPdpJoinsInputSchema } from './TaxonomyCreateWithoutPdpJoinsInputSchema';
import { TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema } from './TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema';
import { TaxonomyCreateOrConnectWithoutPdpJoinsInputSchema } from './TaxonomyCreateOrConnectWithoutPdpJoinsInputSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';

export const TaxonomyUncheckedCreateNestedManyWithoutPdpJoinsInputSchema: z.ZodType<Prisma.TaxonomyUncheckedCreateNestedManyWithoutPdpJoinsInput> = z.object({
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutPdpJoinsInputSchema),z.lazy(() => TaxonomyCreateWithoutPdpJoinsInputSchema).array(),z.lazy(() => TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaxonomyCreateOrConnectWithoutPdpJoinsInputSchema),z.lazy(() => TaxonomyCreateOrConnectWithoutPdpJoinsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default TaxonomyUncheckedCreateNestedManyWithoutPdpJoinsInputSchema;
