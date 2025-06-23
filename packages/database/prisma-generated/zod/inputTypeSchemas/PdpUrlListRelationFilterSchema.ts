import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlWhereInputSchema } from './PdpUrlWhereInputSchema';

export const PdpUrlListRelationFilterSchema: z.ZodType<Prisma.PdpUrlListRelationFilter> = z
  .object({
    every: z.lazy(() => PdpUrlWhereInputSchema).optional(),
    some: z.lazy(() => PdpUrlWhereInputSchema).optional(),
    none: z.lazy(() => PdpUrlWhereInputSchema).optional(),
  })
  .strict();

export default PdpUrlListRelationFilterSchema;
