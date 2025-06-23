import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateWithoutRegistryInputSchema } from './RegistryItemCreateWithoutRegistryInputSchema';
import { RegistryItemUncheckedCreateWithoutRegistryInputSchema } from './RegistryItemUncheckedCreateWithoutRegistryInputSchema';
import { RegistryItemCreateOrConnectWithoutRegistryInputSchema } from './RegistryItemCreateOrConnectWithoutRegistryInputSchema';
import { RegistryItemCreateManyRegistryInputEnvelopeSchema } from './RegistryItemCreateManyRegistryInputEnvelopeSchema';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';

export const RegistryItemCreateNestedManyWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryItemCreateNestedManyWithoutRegistryInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryItemCreateWithoutRegistryInputSchema),
          z.lazy(() => RegistryItemCreateWithoutRegistryInputSchema).array(),
          z.lazy(() => RegistryItemUncheckedCreateWithoutRegistryInputSchema),
          z.lazy(() => RegistryItemUncheckedCreateWithoutRegistryInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => RegistryItemCreateOrConnectWithoutRegistryInputSchema),
          z.lazy(() => RegistryItemCreateOrConnectWithoutRegistryInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => RegistryItemCreateManyRegistryInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => RegistryItemWhereUniqueInputSchema),
          z.lazy(() => RegistryItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default RegistryItemCreateNestedManyWithoutRegistryInputSchema;
