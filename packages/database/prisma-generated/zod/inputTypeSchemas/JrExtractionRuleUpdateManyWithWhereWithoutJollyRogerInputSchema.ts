import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleScalarWhereInputSchema } from './JrExtractionRuleScalarWhereInputSchema';
import { JrExtractionRuleUpdateManyMutationInputSchema } from './JrExtractionRuleUpdateManyMutationInputSchema';
import { JrExtractionRuleUncheckedUpdateManyWithoutJollyRogerInputSchema } from './JrExtractionRuleUncheckedUpdateManyWithoutJollyRogerInputSchema';

export const JrExtractionRuleUpdateManyWithWhereWithoutJollyRogerInputSchema: z.ZodType<Prisma.JrExtractionRuleUpdateManyWithWhereWithoutJollyRogerInput> =
  z
    .object({
      where: z.lazy(() => JrExtractionRuleScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => JrExtractionRuleUpdateManyMutationInputSchema),
        z.lazy(() => JrExtractionRuleUncheckedUpdateManyWithoutJollyRogerInputSchema),
      ]),
    })
    .strict();

export default JrExtractionRuleUpdateManyWithWhereWithoutJollyRogerInputSchema;
