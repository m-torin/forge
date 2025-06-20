import { z } from 'zod';
import type { Prisma } from '../../client';
import { MemberSelectSchema } from '../inputTypeSchemas/MemberSelectSchema';
import { MemberIncludeSchema } from '../inputTypeSchemas/MemberIncludeSchema';

export const MemberArgsSchema: z.ZodType<Prisma.MemberDefaultArgs> = z.object({
  select: z.lazy(() => MemberSelectSchema).optional(),
  include: z.lazy(() => MemberIncludeSchema).optional(),
}).strict();

export default MemberArgsSchema;
