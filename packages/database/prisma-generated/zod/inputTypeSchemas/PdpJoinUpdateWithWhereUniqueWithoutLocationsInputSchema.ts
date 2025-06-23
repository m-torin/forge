import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithoutLocationsInputSchema } from './PdpJoinUpdateWithoutLocationsInputSchema';
import { PdpJoinUncheckedUpdateWithoutLocationsInputSchema } from './PdpJoinUncheckedUpdateWithoutLocationsInputSchema';

export const PdpJoinUpdateWithWhereUniqueWithoutLocationsInputSchema: z.ZodType<Prisma.PdpJoinUpdateWithWhereUniqueWithoutLocationsInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => PdpJoinUpdateWithoutLocationsInputSchema),
        z.lazy(() => PdpJoinUncheckedUpdateWithoutLocationsInputSchema),
      ]),
    })
    .strict();

export default PdpJoinUpdateWithWhereUniqueWithoutLocationsInputSchema;
