import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectCreateWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectCreateWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutExtractionRulesInputSchema';

export const JrFindReplaceRejectCreateOrConnectWithoutExtractionRulesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateOrConnectWithoutExtractionRulesInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutExtractionRulesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutExtractionRulesInputSchema) ]),
}).strict();

export default JrFindReplaceRejectCreateOrConnectWithoutExtractionRulesInputSchema;
