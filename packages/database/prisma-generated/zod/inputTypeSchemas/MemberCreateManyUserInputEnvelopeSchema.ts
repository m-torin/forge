import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberCreateManyUserInputSchema } from './MemberCreateManyUserInputSchema';

export const MemberCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.MemberCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MemberCreateManyUserInputSchema),z.lazy(() => MemberCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MemberCreateManyUserInputEnvelopeSchema;
