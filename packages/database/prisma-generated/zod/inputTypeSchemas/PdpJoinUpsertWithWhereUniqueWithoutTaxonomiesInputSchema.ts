import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithoutTaxonomiesInputSchema } from './PdpJoinUpdateWithoutTaxonomiesInputSchema';
import { PdpJoinUncheckedUpdateWithoutTaxonomiesInputSchema } from './PdpJoinUncheckedUpdateWithoutTaxonomiesInputSchema';
import { PdpJoinCreateWithoutTaxonomiesInputSchema } from './PdpJoinCreateWithoutTaxonomiesInputSchema';
import { PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema } from './PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema';

export const PdpJoinUpsertWithWhereUniqueWithoutTaxonomiesInputSchema: z.ZodType<Prisma.PdpJoinUpsertWithWhereUniqueWithoutTaxonomiesInput> = z.object({
  where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PdpJoinUpdateWithoutTaxonomiesInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutTaxonomiesInputSchema) ]),
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutTaxonomiesInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema) ]),
}).strict();

export default PdpJoinUpsertWithWhereUniqueWithoutTaxonomiesInputSchema;
