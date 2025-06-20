import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateManyParentInputSchema } from './BrandCreateManyParentInputSchema';

export const BrandCreateManyParentInputEnvelopeSchema: z.ZodType<Prisma.BrandCreateManyParentInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => BrandCreateManyParentInputSchema),z.lazy(() => BrandCreateManyParentInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default BrandCreateManyParentInputEnvelopeSchema;
