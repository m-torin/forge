import type { Prisma } from '../../client';

import { z } from 'zod';
import { JollyRogerUpdateWithoutExtractionRulesInputSchema } from './JollyRogerUpdateWithoutExtractionRulesInputSchema';
import { JollyRogerUncheckedUpdateWithoutExtractionRulesInputSchema } from './JollyRogerUncheckedUpdateWithoutExtractionRulesInputSchema';
import { JollyRogerCreateWithoutExtractionRulesInputSchema } from './JollyRogerCreateWithoutExtractionRulesInputSchema';
import { JollyRogerUncheckedCreateWithoutExtractionRulesInputSchema } from './JollyRogerUncheckedCreateWithoutExtractionRulesInputSchema';
import { JollyRogerWhereInputSchema } from './JollyRogerWhereInputSchema';

export const JollyRogerUpsertWithoutExtractionRulesInputSchema: z.ZodType<Prisma.JollyRogerUpsertWithoutExtractionRulesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => JollyRogerUpdateWithoutExtractionRulesInputSchema),
        z.lazy(() => JollyRogerUncheckedUpdateWithoutExtractionRulesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => JollyRogerCreateWithoutExtractionRulesInputSchema),
        z.lazy(() => JollyRogerUncheckedCreateWithoutExtractionRulesInputSchema),
      ]),
      where: z.lazy(() => JollyRogerWhereInputSchema).optional(),
    })
    .strict();

export default JollyRogerUpsertWithoutExtractionRulesInputSchema;
