import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinScalarWhereInputSchema } from './PdpJoinScalarWhereInputSchema';
import { PdpJoinUpdateManyMutationInputSchema } from './PdpJoinUpdateManyMutationInputSchema';
import { PdpJoinUncheckedUpdateManyWithoutTaxonomiesInputSchema } from './PdpJoinUncheckedUpdateManyWithoutTaxonomiesInputSchema';

export const PdpJoinUpdateManyWithWhereWithoutTaxonomiesInputSchema: z.ZodType<Prisma.PdpJoinUpdateManyWithWhereWithoutTaxonomiesInput> = z.object({
  where: z.lazy(() => PdpJoinScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PdpJoinUpdateManyMutationInputSchema),z.lazy(() => PdpJoinUncheckedUpdateManyWithoutTaxonomiesInputSchema) ]),
}).strict();

export default PdpJoinUpdateManyWithWhereWithoutTaxonomiesInputSchema;
