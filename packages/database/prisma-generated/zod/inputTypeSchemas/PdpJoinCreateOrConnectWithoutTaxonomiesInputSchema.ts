import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinCreateWithoutTaxonomiesInputSchema } from './PdpJoinCreateWithoutTaxonomiesInputSchema';
import { PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema } from './PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema';

export const PdpJoinCreateOrConnectWithoutTaxonomiesInputSchema: z.ZodType<Prisma.PdpJoinCreateOrConnectWithoutTaxonomiesInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => PdpJoinCreateWithoutTaxonomiesInputSchema),
        z.lazy(() => PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema),
      ]),
    })
    .strict();

export default PdpJoinCreateOrConnectWithoutTaxonomiesInputSchema;
