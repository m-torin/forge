import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomCreateWithoutLocationsInputSchema } from './FandomCreateWithoutLocationsInputSchema';
import { FandomUncheckedCreateWithoutLocationsInputSchema } from './FandomUncheckedCreateWithoutLocationsInputSchema';

export const FandomCreateOrConnectWithoutLocationsInputSchema: z.ZodType<Prisma.FandomCreateOrConnectWithoutLocationsInput> =
  z
    .object({
      where: z.lazy(() => FandomWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => FandomCreateWithoutLocationsInputSchema),
        z.lazy(() => FandomUncheckedCreateWithoutLocationsInputSchema),
      ]),
    })
    .strict();

export default FandomCreateOrConnectWithoutLocationsInputSchema;
