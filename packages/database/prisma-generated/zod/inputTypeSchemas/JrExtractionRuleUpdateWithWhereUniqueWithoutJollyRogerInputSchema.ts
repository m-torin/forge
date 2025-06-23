import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleWhereUniqueInputSchema } from './JrExtractionRuleWhereUniqueInputSchema';
import { JrExtractionRuleUpdateWithoutJollyRogerInputSchema } from './JrExtractionRuleUpdateWithoutJollyRogerInputSchema';
import { JrExtractionRuleUncheckedUpdateWithoutJollyRogerInputSchema } from './JrExtractionRuleUncheckedUpdateWithoutJollyRogerInputSchema';

export const JrExtractionRuleUpdateWithWhereUniqueWithoutJollyRogerInputSchema: z.ZodType<Prisma.JrExtractionRuleUpdateWithWhereUniqueWithoutJollyRogerInput> =
  z
    .object({
      where: z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => JrExtractionRuleUpdateWithoutJollyRogerInputSchema),
        z.lazy(() => JrExtractionRuleUncheckedUpdateWithoutJollyRogerInputSchema),
      ]),
    })
    .strict();

export default JrExtractionRuleUpdateWithWhereUniqueWithoutJollyRogerInputSchema;
