import type { Prisma } from '../../client';

import { z } from 'zod';
import { JollyRogerWhereInputSchema } from './JollyRogerWhereInputSchema';
import { JollyRogerUpdateWithoutBrandInputSchema } from './JollyRogerUpdateWithoutBrandInputSchema';
import { JollyRogerUncheckedUpdateWithoutBrandInputSchema } from './JollyRogerUncheckedUpdateWithoutBrandInputSchema';

export const JollyRogerUpdateToOneWithWhereWithoutBrandInputSchema: z.ZodType<Prisma.JollyRogerUpdateToOneWithWhereWithoutBrandInput> =
  z
    .object({
      where: z.lazy(() => JollyRogerWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => JollyRogerUpdateWithoutBrandInputSchema),
        z.lazy(() => JollyRogerUncheckedUpdateWithoutBrandInputSchema),
      ]),
    })
    .strict();

export default JollyRogerUpdateToOneWithWhereWithoutBrandInputSchema;
