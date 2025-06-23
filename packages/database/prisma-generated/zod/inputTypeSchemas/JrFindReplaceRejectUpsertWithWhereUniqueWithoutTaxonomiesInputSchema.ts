import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUpdateWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema';

export const JrFindReplaceRejectUpsertWithWhereUniqueWithoutTaxonomiesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpsertWithWhereUniqueWithoutTaxonomiesInput> =
  z
    .object({
      where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => JrFindReplaceRejectUpdateWithoutTaxonomiesInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutTaxonomiesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema),
      ]),
    })
    .strict();

export default JrFindReplaceRejectUpsertWithWhereUniqueWithoutTaxonomiesInputSchema;
