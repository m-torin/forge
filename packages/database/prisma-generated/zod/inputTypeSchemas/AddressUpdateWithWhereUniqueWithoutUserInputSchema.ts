import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressWhereUniqueInputSchema } from './AddressWhereUniqueInputSchema';
import { AddressUpdateWithoutUserInputSchema } from './AddressUpdateWithoutUserInputSchema';
import { AddressUncheckedUpdateWithoutUserInputSchema } from './AddressUncheckedUpdateWithoutUserInputSchema';

export const AddressUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AddressUpdateWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => AddressWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => AddressUpdateWithoutUserInputSchema),
        z.lazy(() => AddressUncheckedUpdateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default AddressUpdateWithWhereUniqueWithoutUserInputSchema;
