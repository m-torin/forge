import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithoutPdpJoinsInputSchema } from './TaxonomyUpdateWithoutPdpJoinsInputSchema';
import { TaxonomyUncheckedUpdateWithoutPdpJoinsInputSchema } from './TaxonomyUncheckedUpdateWithoutPdpJoinsInputSchema';
import { TaxonomyCreateWithoutPdpJoinsInputSchema } from './TaxonomyCreateWithoutPdpJoinsInputSchema';
import { TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema } from './TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema';

export const TaxonomyUpsertWithWhereUniqueWithoutPdpJoinsInputSchema: z.ZodType<Prisma.TaxonomyUpsertWithWhereUniqueWithoutPdpJoinsInput> = z.object({
  where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TaxonomyUpdateWithoutPdpJoinsInputSchema),z.lazy(() => TaxonomyUncheckedUpdateWithoutPdpJoinsInputSchema) ]),
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutPdpJoinsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutPdpJoinsInputSchema) ]),
}).strict();

export default TaxonomyUpsertWithWhereUniqueWithoutPdpJoinsInputSchema;
