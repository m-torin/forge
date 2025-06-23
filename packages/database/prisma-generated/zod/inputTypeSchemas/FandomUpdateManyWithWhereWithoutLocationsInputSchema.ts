import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomScalarWhereInputSchema } from './FandomScalarWhereInputSchema';
import { FandomUpdateManyMutationInputSchema } from './FandomUpdateManyMutationInputSchema';
import { FandomUncheckedUpdateManyWithoutLocationsInputSchema } from './FandomUncheckedUpdateManyWithoutLocationsInputSchema';

export const FandomUpdateManyWithWhereWithoutLocationsInputSchema: z.ZodType<Prisma.FandomUpdateManyWithWhereWithoutLocationsInput> =
  z
    .object({
      where: z.lazy(() => FandomScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => FandomUpdateManyMutationInputSchema),
        z.lazy(() => FandomUncheckedUpdateManyWithoutLocationsInputSchema),
      ]),
    })
    .strict();

export default FandomUpdateManyWithWhereWithoutLocationsInputSchema;
