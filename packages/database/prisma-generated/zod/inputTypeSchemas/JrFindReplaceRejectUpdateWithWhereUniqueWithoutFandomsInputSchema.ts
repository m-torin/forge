import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutFandomsInputSchema } from './JrFindReplaceRejectUpdateWithoutFandomsInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutFandomsInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutFandomsInputSchema';

export const JrFindReplaceRejectUpdateWithWhereUniqueWithoutFandomsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateWithWhereUniqueWithoutFandomsInput> =
  z
    .object({
      where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => JrFindReplaceRejectUpdateWithoutFandomsInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutFandomsInputSchema),
      ]),
    })
    .strict();

export default JrFindReplaceRejectUpdateWithWhereUniqueWithoutFandomsInputSchema;
