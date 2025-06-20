import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleWhereUniqueInputSchema } from './JrExtractionRuleWhereUniqueInputSchema';
import { JrExtractionRuleCreateWithoutJollyRogerInputSchema } from './JrExtractionRuleCreateWithoutJollyRogerInputSchema';
import { JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema } from './JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema';

export const JrExtractionRuleCreateOrConnectWithoutJollyRogerInputSchema: z.ZodType<Prisma.JrExtractionRuleCreateOrConnectWithoutJollyRogerInput> = z.object({
  where: z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => JrExtractionRuleCreateWithoutJollyRogerInputSchema),z.lazy(() => JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema) ]),
}).strict();

export default JrExtractionRuleCreateOrConnectWithoutJollyRogerInputSchema;
