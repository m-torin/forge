import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutTaxonomiesInputSchema } from './PdpJoinCreateWithoutTaxonomiesInputSchema';
import { PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema } from './PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema';
import { PdpJoinCreateOrConnectWithoutTaxonomiesInputSchema } from './PdpJoinCreateOrConnectWithoutTaxonomiesInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';

export const PdpJoinUncheckedCreateNestedManyWithoutTaxonomiesInputSchema: z.ZodType<Prisma.PdpJoinUncheckedCreateNestedManyWithoutTaxonomiesInput> = z.object({
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutTaxonomiesInputSchema),z.lazy(() => PdpJoinCreateWithoutTaxonomiesInputSchema).array(),z.lazy(() => PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PdpJoinCreateOrConnectWithoutTaxonomiesInputSchema),z.lazy(() => PdpJoinCreateOrConnectWithoutTaxonomiesInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default PdpJoinUncheckedCreateNestedManyWithoutTaxonomiesInputSchema;
