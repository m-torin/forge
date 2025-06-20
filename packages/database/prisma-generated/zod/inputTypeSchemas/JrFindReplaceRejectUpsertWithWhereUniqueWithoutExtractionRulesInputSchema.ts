import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUpdateWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectCreateWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectCreateWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutExtractionRulesInputSchema';

export const JrFindReplaceRejectUpsertWithWhereUniqueWithoutExtractionRulesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpsertWithWhereUniqueWithoutExtractionRulesInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => JrFindReplaceRejectUpdateWithoutExtractionRulesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutExtractionRulesInputSchema) ]),
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutExtractionRulesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutExtractionRulesInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpsertWithWhereUniqueWithoutExtractionRulesInputSchema;
