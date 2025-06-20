import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutFandomsInputSchema } from './JrFindReplaceRejectCreateWithoutFandomsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutFandomsInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutFandomsInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';

export const JrFindReplaceRejectUncheckedCreateNestedManyWithoutFandomsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUncheckedCreateNestedManyWithoutFandomsInput> = z.object({
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutFandomsInputSchema),z.lazy(() => JrFindReplaceRejectCreateWithoutFandomsInputSchema).array(),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutFandomsInputSchema),z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutFandomsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default JrFindReplaceRejectUncheckedCreateNestedManyWithoutFandomsInputSchema;
