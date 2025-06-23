import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpJoinArgsSchema } from '../outputTypeSchemas/PdpJoinArgsSchema';

export const PdpUrlSelectSchema: z.ZodType<Prisma.PdpUrlSelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    url: z.boolean().optional(),
    pdpJoinId: z.boolean().optional(),
    urlType: z.boolean().optional(),
    isActive: z.boolean().optional(),
    copy: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    pdpJoin: z.union([z.boolean(), z.lazy(() => PdpJoinArgsSchema)]).optional(),
  })
  .strict();

export default PdpUrlSelectSchema;
