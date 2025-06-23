import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithoutManufacturerBrandsInputSchema } from './PdpJoinUpdateWithoutManufacturerBrandsInputSchema';
import { PdpJoinUncheckedUpdateWithoutManufacturerBrandsInputSchema } from './PdpJoinUncheckedUpdateWithoutManufacturerBrandsInputSchema';

export const PdpJoinUpdateWithWhereUniqueWithoutManufacturerBrandsInputSchema: z.ZodType<Prisma.PdpJoinUpdateWithWhereUniqueWithoutManufacturerBrandsInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => PdpJoinUpdateWithoutManufacturerBrandsInputSchema),
        z.lazy(() => PdpJoinUncheckedUpdateWithoutManufacturerBrandsInputSchema),
      ]),
    })
    .strict();

export default PdpJoinUpdateWithWhereUniqueWithoutManufacturerBrandsInputSchema;
