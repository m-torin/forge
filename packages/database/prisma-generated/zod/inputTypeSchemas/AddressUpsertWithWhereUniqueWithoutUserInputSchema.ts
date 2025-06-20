import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressWhereUniqueInputSchema } from './AddressWhereUniqueInputSchema';
import { AddressUpdateWithoutUserInputSchema } from './AddressUpdateWithoutUserInputSchema';
import { AddressUncheckedUpdateWithoutUserInputSchema } from './AddressUncheckedUpdateWithoutUserInputSchema';
import { AddressCreateWithoutUserInputSchema } from './AddressCreateWithoutUserInputSchema';
import { AddressUncheckedCreateWithoutUserInputSchema } from './AddressUncheckedCreateWithoutUserInputSchema';

export const AddressUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AddressUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AddressWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AddressUpdateWithoutUserInputSchema),z.lazy(() => AddressUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => AddressCreateWithoutUserInputSchema),z.lazy(() => AddressUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default AddressUpsertWithWhereUniqueWithoutUserInputSchema;
