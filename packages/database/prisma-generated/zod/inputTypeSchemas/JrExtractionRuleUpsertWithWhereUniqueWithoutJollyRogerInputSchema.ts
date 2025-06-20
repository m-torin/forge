import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleWhereUniqueInputSchema } from './JrExtractionRuleWhereUniqueInputSchema';
import { JrExtractionRuleUpdateWithoutJollyRogerInputSchema } from './JrExtractionRuleUpdateWithoutJollyRogerInputSchema';
import { JrExtractionRuleUncheckedUpdateWithoutJollyRogerInputSchema } from './JrExtractionRuleUncheckedUpdateWithoutJollyRogerInputSchema';
import { JrExtractionRuleCreateWithoutJollyRogerInputSchema } from './JrExtractionRuleCreateWithoutJollyRogerInputSchema';
import { JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema } from './JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema';

export const JrExtractionRuleUpsertWithWhereUniqueWithoutJollyRogerInputSchema: z.ZodType<Prisma.JrExtractionRuleUpsertWithWhereUniqueWithoutJollyRogerInput> = z.object({
  where: z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => JrExtractionRuleUpdateWithoutJollyRogerInputSchema),z.lazy(() => JrExtractionRuleUncheckedUpdateWithoutJollyRogerInputSchema) ]),
  create: z.union([ z.lazy(() => JrExtractionRuleCreateWithoutJollyRogerInputSchema),z.lazy(() => JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema) ]),
}).strict();

export default JrExtractionRuleUpsertWithWhereUniqueWithoutJollyRogerInputSchema;
