import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlWhereUniqueInputSchema } from './PdpUrlWhereUniqueInputSchema';
import { PdpUrlUpdateWithoutPdpJoinInputSchema } from './PdpUrlUpdateWithoutPdpJoinInputSchema';
import { PdpUrlUncheckedUpdateWithoutPdpJoinInputSchema } from './PdpUrlUncheckedUpdateWithoutPdpJoinInputSchema';

export const PdpUrlUpdateWithWhereUniqueWithoutPdpJoinInputSchema: z.ZodType<Prisma.PdpUrlUpdateWithWhereUniqueWithoutPdpJoinInput> =
  z
    .object({
      where: z.lazy(() => PdpUrlWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => PdpUrlUpdateWithoutPdpJoinInputSchema),
        z.lazy(() => PdpUrlUncheckedUpdateWithoutPdpJoinInputSchema),
      ]),
    })
    .strict();

export default PdpUrlUpdateWithWhereUniqueWithoutPdpJoinInputSchema;
