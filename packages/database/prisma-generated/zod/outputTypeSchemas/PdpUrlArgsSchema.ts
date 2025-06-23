import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpUrlSelectSchema } from '../inputTypeSchemas/PdpUrlSelectSchema';
import { PdpUrlIncludeSchema } from '../inputTypeSchemas/PdpUrlIncludeSchema';

export const PdpUrlArgsSchema: z.ZodType<Prisma.PdpUrlDefaultArgs> = z
  .object({
    select: z.lazy(() => PdpUrlSelectSchema).optional(),
    include: z.lazy(() => PdpUrlIncludeSchema).optional(),
  })
  .strict();

export default PdpUrlArgsSchema;
