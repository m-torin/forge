import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinScalarWhereInputSchema } from './PdpJoinScalarWhereInputSchema';
import { PdpJoinUpdateManyMutationInputSchema } from './PdpJoinUpdateManyMutationInputSchema';
import { PdpJoinUncheckedUpdateManyWithoutManufacturerBrandsInputSchema } from './PdpJoinUncheckedUpdateManyWithoutManufacturerBrandsInputSchema';

export const PdpJoinUpdateManyWithWhereWithoutManufacturerBrandsInputSchema: z.ZodType<Prisma.PdpJoinUpdateManyWithWhereWithoutManufacturerBrandsInput> = z.object({
  where: z.lazy(() => PdpJoinScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PdpJoinUpdateManyMutationInputSchema),z.lazy(() => PdpJoinUncheckedUpdateManyWithoutManufacturerBrandsInputSchema) ]),
}).strict();

export default PdpJoinUpdateManyWithWhereWithoutManufacturerBrandsInputSchema;
