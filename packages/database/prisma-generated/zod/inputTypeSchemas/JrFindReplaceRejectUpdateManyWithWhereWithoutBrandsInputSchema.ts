import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';
import { JrFindReplaceRejectUpdateManyMutationInputSchema } from './JrFindReplaceRejectUpdateManyMutationInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutBrandsInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutBrandsInputSchema';

export const JrFindReplaceRejectUpdateManyWithWhereWithoutBrandsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithWhereWithoutBrandsInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),
  data: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyMutationInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutBrandsInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpdateManyWithWhereWithoutBrandsInputSchema;
