import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyCreateWithoutPdpJoinsInputSchema } from './TaxonomyCreateWithoutPdpJoinsInputSchema';
import { TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema } from './TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema';

export const TaxonomyCreateOrConnectWithoutPdpJoinsInputSchema: z.ZodType<Prisma.TaxonomyCreateOrConnectWithoutPdpJoinsInput> = z.object({
  where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutPdpJoinsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema) ]),
}).strict();

export default TaxonomyCreateOrConnectWithoutPdpJoinsInputSchema;
