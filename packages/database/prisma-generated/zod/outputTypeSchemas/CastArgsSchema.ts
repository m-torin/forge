import { z } from 'zod';
import type { Prisma } from '../../client';
import { CastSelectSchema } from '../inputTypeSchemas/CastSelectSchema';
import { CastIncludeSchema } from '../inputTypeSchemas/CastIncludeSchema';

export const CastArgsSchema: z.ZodType<Prisma.CastDefaultArgs> = z.object({
  select: z.lazy(() => CastSelectSchema).optional(),
  include: z.lazy(() => CastIncludeSchema).optional(),
}).strict();

export default CastArgsSchema;
