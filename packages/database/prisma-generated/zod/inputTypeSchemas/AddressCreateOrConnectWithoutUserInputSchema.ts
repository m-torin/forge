import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressWhereUniqueInputSchema } from './AddressWhereUniqueInputSchema';
import { AddressCreateWithoutUserInputSchema } from './AddressCreateWithoutUserInputSchema';
import { AddressUncheckedCreateWithoutUserInputSchema } from './AddressUncheckedCreateWithoutUserInputSchema';

export const AddressCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.AddressCreateOrConnectWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => AddressWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => AddressCreateWithoutUserInputSchema),
        z.lazy(() => AddressUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default AddressCreateOrConnectWithoutUserInputSchema;
