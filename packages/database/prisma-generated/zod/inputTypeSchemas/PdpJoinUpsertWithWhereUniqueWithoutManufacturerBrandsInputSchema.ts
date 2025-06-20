import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithoutManufacturerBrandsInputSchema } from './PdpJoinUpdateWithoutManufacturerBrandsInputSchema';
import { PdpJoinUncheckedUpdateWithoutManufacturerBrandsInputSchema } from './PdpJoinUncheckedUpdateWithoutManufacturerBrandsInputSchema';
import { PdpJoinCreateWithoutManufacturerBrandsInputSchema } from './PdpJoinCreateWithoutManufacturerBrandsInputSchema';
import { PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema } from './PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema';

export const PdpJoinUpsertWithWhereUniqueWithoutManufacturerBrandsInputSchema: z.ZodType<Prisma.PdpJoinUpsertWithWhereUniqueWithoutManufacturerBrandsInput> = z.object({
  where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PdpJoinUpdateWithoutManufacturerBrandsInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutManufacturerBrandsInputSchema) ]),
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutManufacturerBrandsInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema) ]),
}).strict();

export default PdpJoinUpsertWithWhereUniqueWithoutManufacturerBrandsInputSchema;
