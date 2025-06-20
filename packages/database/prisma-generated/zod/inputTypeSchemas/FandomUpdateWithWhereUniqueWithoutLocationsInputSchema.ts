import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateWithoutLocationsInputSchema } from './FandomUpdateWithoutLocationsInputSchema';
import { FandomUncheckedUpdateWithoutLocationsInputSchema } from './FandomUncheckedUpdateWithoutLocationsInputSchema';

export const FandomUpdateWithWhereUniqueWithoutLocationsInputSchema: z.ZodType<Prisma.FandomUpdateWithWhereUniqueWithoutLocationsInput> = z.object({
  where: z.lazy(() => FandomWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FandomUpdateWithoutLocationsInputSchema),z.lazy(() => FandomUncheckedUpdateWithoutLocationsInputSchema) ]),
}).strict();

export default FandomUpdateWithWhereUniqueWithoutLocationsInputSchema;
