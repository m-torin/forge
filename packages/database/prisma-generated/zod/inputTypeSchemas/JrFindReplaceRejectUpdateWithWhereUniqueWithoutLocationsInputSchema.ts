import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutLocationsInputSchema } from './JrFindReplaceRejectUpdateWithoutLocationsInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutLocationsInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutLocationsInputSchema';

export const JrFindReplaceRejectUpdateWithWhereUniqueWithoutLocationsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateWithWhereUniqueWithoutLocationsInput> =
  z
    .object({
      where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => JrFindReplaceRejectUpdateWithoutLocationsInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutLocationsInputSchema),
      ]),
    })
    .strict();

export default JrFindReplaceRejectUpdateWithWhereUniqueWithoutLocationsInputSchema;
