import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutManufacturerBrandsInputSchema } from './PdpJoinCreateWithoutManufacturerBrandsInputSchema';
import { PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema } from './PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema';
import { PdpJoinCreateOrConnectWithoutManufacturerBrandsInputSchema } from './PdpJoinCreateOrConnectWithoutManufacturerBrandsInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';

export const PdpJoinUncheckedCreateNestedManyWithoutManufacturerBrandsInputSchema: z.ZodType<Prisma.PdpJoinUncheckedCreateNestedManyWithoutManufacturerBrandsInput> = z.object({
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutManufacturerBrandsInputSchema),z.lazy(() => PdpJoinCreateWithoutManufacturerBrandsInputSchema).array(),z.lazy(() => PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PdpJoinCreateOrConnectWithoutManufacturerBrandsInputSchema),z.lazy(() => PdpJoinCreateOrConnectWithoutManufacturerBrandsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default PdpJoinUncheckedCreateNestedManyWithoutManufacturerBrandsInputSchema;
