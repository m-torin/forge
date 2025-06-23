import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateWithoutCreatedByUserInputSchema } from './RegistryCreateWithoutCreatedByUserInputSchema';
import { RegistryUncheckedCreateWithoutCreatedByUserInputSchema } from './RegistryUncheckedCreateWithoutCreatedByUserInputSchema';
import { RegistryCreateOrConnectWithoutCreatedByUserInputSchema } from './RegistryCreateOrConnectWithoutCreatedByUserInputSchema';
import { RegistryCreateManyCreatedByUserInputEnvelopeSchema } from './RegistryCreateManyCreatedByUserInputEnvelopeSchema';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';

export const RegistryUncheckedCreateNestedManyWithoutCreatedByUserInputSchema: z.ZodType<Prisma.RegistryUncheckedCreateNestedManyWithoutCreatedByUserInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryCreateWithoutCreatedByUserInputSchema),
          z.lazy(() => RegistryCreateWithoutCreatedByUserInputSchema).array(),
          z.lazy(() => RegistryUncheckedCreateWithoutCreatedByUserInputSchema),
          z.lazy(() => RegistryUncheckedCreateWithoutCreatedByUserInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => RegistryCreateOrConnectWithoutCreatedByUserInputSchema),
          z.lazy(() => RegistryCreateOrConnectWithoutCreatedByUserInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => RegistryCreateManyCreatedByUserInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => RegistryWhereUniqueInputSchema),
          z.lazy(() => RegistryWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default RegistryUncheckedCreateNestedManyWithoutCreatedByUserInputSchema;
