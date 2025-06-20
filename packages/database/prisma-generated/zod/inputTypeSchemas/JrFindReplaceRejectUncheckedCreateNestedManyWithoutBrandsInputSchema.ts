import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutBrandsInputSchema } from './JrFindReplaceRejectCreateWithoutBrandsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutBrandsInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutBrandsInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';

export const JrFindReplaceRejectUncheckedCreateNestedManyWithoutBrandsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUncheckedCreateNestedManyWithoutBrandsInput> = z.object({
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutBrandsInputSchema),z.lazy(() => JrFindReplaceRejectCreateWithoutBrandsInputSchema).array(),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutBrandsInputSchema),z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutBrandsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default JrFindReplaceRejectUncheckedCreateNestedManyWithoutBrandsInputSchema;
