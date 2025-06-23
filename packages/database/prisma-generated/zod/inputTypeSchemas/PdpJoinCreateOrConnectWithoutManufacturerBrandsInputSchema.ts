import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinCreateWithoutManufacturerBrandsInputSchema } from './PdpJoinCreateWithoutManufacturerBrandsInputSchema';
import { PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema } from './PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema';

export const PdpJoinCreateOrConnectWithoutManufacturerBrandsInputSchema: z.ZodType<Prisma.PdpJoinCreateOrConnectWithoutManufacturerBrandsInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => PdpJoinCreateWithoutManufacturerBrandsInputSchema),
        z.lazy(() => PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema),
      ]),
    })
    .strict();

export default PdpJoinCreateOrConnectWithoutManufacturerBrandsInputSchema;
