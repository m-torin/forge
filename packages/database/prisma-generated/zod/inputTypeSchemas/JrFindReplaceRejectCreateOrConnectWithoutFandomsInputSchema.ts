import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectCreateWithoutFandomsInputSchema } from './JrFindReplaceRejectCreateWithoutFandomsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema';

export const JrFindReplaceRejectCreateOrConnectWithoutFandomsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateOrConnectWithoutFandomsInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutFandomsInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema) ]),
}).strict();

export default JrFindReplaceRejectCreateOrConnectWithoutFandomsInputSchema;
