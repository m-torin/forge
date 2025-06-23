import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUpdateWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutTaxonomiesInputSchema';

export const JrFindReplaceRejectUpdateWithWhereUniqueWithoutTaxonomiesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateWithWhereUniqueWithoutTaxonomiesInput> =
  z
    .object({
      where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => JrFindReplaceRejectUpdateWithoutTaxonomiesInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutTaxonomiesInputSchema),
      ]),
    })
    .strict();

export default JrFindReplaceRejectUpdateWithWhereUniqueWithoutTaxonomiesInputSchema;
