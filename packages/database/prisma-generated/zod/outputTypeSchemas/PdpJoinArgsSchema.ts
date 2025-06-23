import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpJoinSelectSchema } from '../inputTypeSchemas/PdpJoinSelectSchema';
import { PdpJoinIncludeSchema } from '../inputTypeSchemas/PdpJoinIncludeSchema';

export const PdpJoinArgsSchema: z.ZodType<Prisma.PdpJoinDefaultArgs> = z
  .object({
    select: z.lazy(() => PdpJoinSelectSchema).optional(),
    include: z.lazy(() => PdpJoinIncludeSchema).optional(),
  })
  .strict();

export default PdpJoinArgsSchema;
