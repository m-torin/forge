import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';

export const JrFindReplaceRejectCreateNestedManyWithoutTaxonomiesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateNestedManyWithoutTaxonomiesInput> = z.object({
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema),z.lazy(() => JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema).array(),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutTaxonomiesInputSchema),z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutTaxonomiesInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default JrFindReplaceRejectCreateNestedManyWithoutTaxonomiesInputSchema;
