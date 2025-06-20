import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectCreateWithoutLocationsInputSchema } from './JrFindReplaceRejectCreateWithoutLocationsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema';

export const JrFindReplaceRejectCreateOrConnectWithoutLocationsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateOrConnectWithoutLocationsInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutLocationsInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema) ]),
}).strict();

export default JrFindReplaceRejectCreateOrConnectWithoutLocationsInputSchema;
