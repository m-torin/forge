import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutLocationsInputSchema } from './JrFindReplaceRejectUpdateWithoutLocationsInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutLocationsInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutLocationsInputSchema';
import { JrFindReplaceRejectCreateWithoutLocationsInputSchema } from './JrFindReplaceRejectCreateWithoutLocationsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema';

export const JrFindReplaceRejectUpsertWithWhereUniqueWithoutLocationsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpsertWithWhereUniqueWithoutLocationsInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => JrFindReplaceRejectUpdateWithoutLocationsInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutLocationsInputSchema) ]),
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutLocationsInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpsertWithWhereUniqueWithoutLocationsInputSchema;
