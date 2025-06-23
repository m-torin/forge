import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUpdateWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutExtractionRulesInputSchema';

export const JrFindReplaceRejectUpdateWithWhereUniqueWithoutExtractionRulesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateWithWhereUniqueWithoutExtractionRulesInput> =
  z
    .object({
      where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => JrFindReplaceRejectUpdateWithoutExtractionRulesInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutExtractionRulesInputSchema),
      ]),
    })
    .strict();

export default JrFindReplaceRejectUpdateWithWhereUniqueWithoutExtractionRulesInputSchema;
