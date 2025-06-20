import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateWithoutLocationsInputSchema } from './FandomUpdateWithoutLocationsInputSchema';
import { FandomUncheckedUpdateWithoutLocationsInputSchema } from './FandomUncheckedUpdateWithoutLocationsInputSchema';
import { FandomCreateWithoutLocationsInputSchema } from './FandomCreateWithoutLocationsInputSchema';
import { FandomUncheckedCreateWithoutLocationsInputSchema } from './FandomUncheckedCreateWithoutLocationsInputSchema';

export const FandomUpsertWithWhereUniqueWithoutLocationsInputSchema: z.ZodType<Prisma.FandomUpsertWithWhereUniqueWithoutLocationsInput> = z.object({
  where: z.lazy(() => FandomWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FandomUpdateWithoutLocationsInputSchema),z.lazy(() => FandomUncheckedUpdateWithoutLocationsInputSchema) ]),
  create: z.union([ z.lazy(() => FandomCreateWithoutLocationsInputSchema),z.lazy(() => FandomUncheckedCreateWithoutLocationsInputSchema) ]),
}).strict();

export default FandomUpsertWithWhereUniqueWithoutLocationsInputSchema;
