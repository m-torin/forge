import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutBrandsInputSchema } from './JrFindReplaceRejectUpdateWithoutBrandsInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutBrandsInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutBrandsInputSchema';

export const JrFindReplaceRejectUpdateWithWhereUniqueWithoutBrandsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateWithWhereUniqueWithoutBrandsInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => JrFindReplaceRejectUpdateWithoutBrandsInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutBrandsInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpdateWithWhereUniqueWithoutBrandsInputSchema;
