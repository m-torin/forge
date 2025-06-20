import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithoutTaxonomiesInputSchema } from './PdpJoinUpdateWithoutTaxonomiesInputSchema';
import { PdpJoinUncheckedUpdateWithoutTaxonomiesInputSchema } from './PdpJoinUncheckedUpdateWithoutTaxonomiesInputSchema';

export const PdpJoinUpdateWithWhereUniqueWithoutTaxonomiesInputSchema: z.ZodType<Prisma.PdpJoinUpdateWithWhereUniqueWithoutTaxonomiesInput> = z.object({
  where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PdpJoinUpdateWithoutTaxonomiesInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutTaxonomiesInputSchema) ]),
}).strict();

export default PdpJoinUpdateWithWhereUniqueWithoutTaxonomiesInputSchema;
