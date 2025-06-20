import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';
import { JrFindReplaceRejectUpdateManyMutationInputSchema } from './JrFindReplaceRejectUpdateManyMutationInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutLocationsInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutLocationsInputSchema';

export const JrFindReplaceRejectUpdateManyWithWhereWithoutLocationsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithWhereWithoutLocationsInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),
  data: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyMutationInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutLocationsInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpdateManyWithWhereWithoutLocationsInputSchema;
