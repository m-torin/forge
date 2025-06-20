import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema';

export const JrFindReplaceRejectCreateOrConnectWithoutTaxonomiesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateOrConnectWithoutTaxonomiesInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema) ]),
}).strict();

export default JrFindReplaceRejectCreateOrConnectWithoutTaxonomiesInputSchema;
