import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';
import { JrFindReplaceRejectUpdateManyMutationInputSchema } from './JrFindReplaceRejectUpdateManyMutationInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutFandomsInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutFandomsInputSchema';

export const JrFindReplaceRejectUpdateManyWithWhereWithoutFandomsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithWhereWithoutFandomsInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),
  data: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyMutationInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutFandomsInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpdateManyWithWhereWithoutFandomsInputSchema;
