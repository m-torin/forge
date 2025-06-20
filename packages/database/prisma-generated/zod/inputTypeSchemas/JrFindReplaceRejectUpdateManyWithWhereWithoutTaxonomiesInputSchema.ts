import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';
import { JrFindReplaceRejectUpdateManyMutationInputSchema } from './JrFindReplaceRejectUpdateManyMutationInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutTaxonomiesInputSchema';

export const JrFindReplaceRejectUpdateManyWithWhereWithoutTaxonomiesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithWhereWithoutTaxonomiesInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),
  data: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyMutationInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutTaxonomiesInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpdateManyWithWhereWithoutTaxonomiesInputSchema;
