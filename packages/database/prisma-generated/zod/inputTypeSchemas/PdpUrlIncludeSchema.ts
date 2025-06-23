import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpJoinArgsSchema } from '../outputTypeSchemas/PdpJoinArgsSchema';

export const PdpUrlIncludeSchema: z.ZodType<Prisma.PdpUrlInclude> = z
  .object({
    pdpJoin: z.union([z.boolean(), z.lazy(() => PdpJoinArgsSchema)]).optional(),
  })
  .strict();

export default PdpUrlIncludeSchema;
