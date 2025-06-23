import type { Prisma } from '../../client';

import { z } from 'zod';
import { JollyRogerWhereInputSchema } from './JollyRogerWhereInputSchema';
import { JollyRogerUpdateWithoutExtractionRulesInputSchema } from './JollyRogerUpdateWithoutExtractionRulesInputSchema';
import { JollyRogerUncheckedUpdateWithoutExtractionRulesInputSchema } from './JollyRogerUncheckedUpdateWithoutExtractionRulesInputSchema';

export const JollyRogerUpdateToOneWithWhereWithoutExtractionRulesInputSchema: z.ZodType<Prisma.JollyRogerUpdateToOneWithWhereWithoutExtractionRulesInput> =
  z
    .object({
      where: z.lazy(() => JollyRogerWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => JollyRogerUpdateWithoutExtractionRulesInputSchema),
        z.lazy(() => JollyRogerUncheckedUpdateWithoutExtractionRulesInputSchema),
      ]),
    })
    .strict();

export default JollyRogerUpdateToOneWithWhereWithoutExtractionRulesInputSchema;
