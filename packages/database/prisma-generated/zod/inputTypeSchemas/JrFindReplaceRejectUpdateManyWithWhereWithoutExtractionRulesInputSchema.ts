import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';
import { JrFindReplaceRejectUpdateManyMutationInputSchema } from './JrFindReplaceRejectUpdateManyMutationInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutExtractionRulesInputSchema';

export const JrFindReplaceRejectUpdateManyWithWhereWithoutExtractionRulesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithWhereWithoutExtractionRulesInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),
  data: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyMutationInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutExtractionRulesInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpdateManyWithWhereWithoutExtractionRulesInputSchema;
