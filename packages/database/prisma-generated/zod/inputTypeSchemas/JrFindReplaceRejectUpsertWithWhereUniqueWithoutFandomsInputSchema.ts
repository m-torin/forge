import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutFandomsInputSchema } from './JrFindReplaceRejectUpdateWithoutFandomsInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutFandomsInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutFandomsInputSchema';
import { JrFindReplaceRejectCreateWithoutFandomsInputSchema } from './JrFindReplaceRejectCreateWithoutFandomsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema';

export const JrFindReplaceRejectUpsertWithWhereUniqueWithoutFandomsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpsertWithWhereUniqueWithoutFandomsInput> =
  z
    .object({
      where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => JrFindReplaceRejectUpdateWithoutFandomsInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutFandomsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => JrFindReplaceRejectCreateWithoutFandomsInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema),
      ]),
    })
    .strict();

export default JrFindReplaceRejectUpsertWithWhereUniqueWithoutFandomsInputSchema;
