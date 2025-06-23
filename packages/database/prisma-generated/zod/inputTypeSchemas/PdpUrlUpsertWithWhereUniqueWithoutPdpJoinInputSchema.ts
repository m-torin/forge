import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlWhereUniqueInputSchema } from './PdpUrlWhereUniqueInputSchema';
import { PdpUrlUpdateWithoutPdpJoinInputSchema } from './PdpUrlUpdateWithoutPdpJoinInputSchema';
import { PdpUrlUncheckedUpdateWithoutPdpJoinInputSchema } from './PdpUrlUncheckedUpdateWithoutPdpJoinInputSchema';
import { PdpUrlCreateWithoutPdpJoinInputSchema } from './PdpUrlCreateWithoutPdpJoinInputSchema';
import { PdpUrlUncheckedCreateWithoutPdpJoinInputSchema } from './PdpUrlUncheckedCreateWithoutPdpJoinInputSchema';

export const PdpUrlUpsertWithWhereUniqueWithoutPdpJoinInputSchema: z.ZodType<Prisma.PdpUrlUpsertWithWhereUniqueWithoutPdpJoinInput> =
  z
    .object({
      where: z.lazy(() => PdpUrlWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => PdpUrlUpdateWithoutPdpJoinInputSchema),
        z.lazy(() => PdpUrlUncheckedUpdateWithoutPdpJoinInputSchema),
      ]),
      create: z.union([
        z.lazy(() => PdpUrlCreateWithoutPdpJoinInputSchema),
        z.lazy(() => PdpUrlUncheckedCreateWithoutPdpJoinInputSchema),
      ]),
    })
    .strict();

export default PdpUrlUpsertWithWhereUniqueWithoutPdpJoinInputSchema;
