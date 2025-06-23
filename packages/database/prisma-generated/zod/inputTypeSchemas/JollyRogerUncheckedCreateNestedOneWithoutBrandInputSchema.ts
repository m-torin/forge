import type { Prisma } from '../../client';

import { z } from 'zod';
import { JollyRogerCreateWithoutBrandInputSchema } from './JollyRogerCreateWithoutBrandInputSchema';
import { JollyRogerUncheckedCreateWithoutBrandInputSchema } from './JollyRogerUncheckedCreateWithoutBrandInputSchema';
import { JollyRogerCreateOrConnectWithoutBrandInputSchema } from './JollyRogerCreateOrConnectWithoutBrandInputSchema';
import { JollyRogerWhereUniqueInputSchema } from './JollyRogerWhereUniqueInputSchema';

export const JollyRogerUncheckedCreateNestedOneWithoutBrandInputSchema: z.ZodType<Prisma.JollyRogerUncheckedCreateNestedOneWithoutBrandInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => JollyRogerCreateWithoutBrandInputSchema),
          z.lazy(() => JollyRogerUncheckedCreateWithoutBrandInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => JollyRogerCreateOrConnectWithoutBrandInputSchema).optional(),
      connect: z.lazy(() => JollyRogerWhereUniqueInputSchema).optional(),
    })
    .strict();

export default JollyRogerUncheckedCreateNestedOneWithoutBrandInputSchema;
