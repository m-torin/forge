import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleCreateManyJollyRogerInputSchema } from './JrExtractionRuleCreateManyJollyRogerInputSchema';

export const JrExtractionRuleCreateManyJollyRogerInputEnvelopeSchema: z.ZodType<Prisma.JrExtractionRuleCreateManyJollyRogerInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => JrExtractionRuleCreateManyJollyRogerInputSchema),z.lazy(() => JrExtractionRuleCreateManyJollyRogerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default JrExtractionRuleCreateManyJollyRogerInputEnvelopeSchema;
