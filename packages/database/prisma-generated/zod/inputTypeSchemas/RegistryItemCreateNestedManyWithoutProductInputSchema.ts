import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateWithoutProductInputSchema } from './RegistryItemCreateWithoutProductInputSchema';
import { RegistryItemUncheckedCreateWithoutProductInputSchema } from './RegistryItemUncheckedCreateWithoutProductInputSchema';
import { RegistryItemCreateOrConnectWithoutProductInputSchema } from './RegistryItemCreateOrConnectWithoutProductInputSchema';
import { RegistryItemCreateManyProductInputEnvelopeSchema } from './RegistryItemCreateManyProductInputEnvelopeSchema';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';

export const RegistryItemCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.RegistryItemCreateNestedManyWithoutProductInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryItemCreateWithoutProductInputSchema),
          z.lazy(() => RegistryItemCreateWithoutProductInputSchema).array(),
          z.lazy(() => RegistryItemUncheckedCreateWithoutProductInputSchema),
          z.lazy(() => RegistryItemUncheckedCreateWithoutProductInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => RegistryItemCreateOrConnectWithoutProductInputSchema),
          z.lazy(() => RegistryItemCreateOrConnectWithoutProductInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => RegistryItemCreateManyProductInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => RegistryItemWhereUniqueInputSchema),
          z.lazy(() => RegistryItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default RegistryItemCreateNestedManyWithoutProductInputSchema;
