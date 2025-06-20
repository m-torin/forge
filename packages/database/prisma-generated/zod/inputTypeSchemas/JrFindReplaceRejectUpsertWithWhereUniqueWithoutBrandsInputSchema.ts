import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutBrandsInputSchema } from './JrFindReplaceRejectUpdateWithoutBrandsInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutBrandsInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutBrandsInputSchema';
import { JrFindReplaceRejectCreateWithoutBrandsInputSchema } from './JrFindReplaceRejectCreateWithoutBrandsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema';

export const JrFindReplaceRejectUpsertWithWhereUniqueWithoutBrandsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpsertWithWhereUniqueWithoutBrandsInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => JrFindReplaceRejectUpdateWithoutBrandsInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutBrandsInputSchema) ]),
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutBrandsInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpsertWithWhereUniqueWithoutBrandsInputSchema;
