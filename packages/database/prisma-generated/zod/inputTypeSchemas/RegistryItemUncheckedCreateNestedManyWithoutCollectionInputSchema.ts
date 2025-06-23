import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateWithoutCollectionInputSchema } from './RegistryItemCreateWithoutCollectionInputSchema';
import { RegistryItemUncheckedCreateWithoutCollectionInputSchema } from './RegistryItemUncheckedCreateWithoutCollectionInputSchema';
import { RegistryItemCreateOrConnectWithoutCollectionInputSchema } from './RegistryItemCreateOrConnectWithoutCollectionInputSchema';
import { RegistryItemCreateManyCollectionInputEnvelopeSchema } from './RegistryItemCreateManyCollectionInputEnvelopeSchema';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';

export const RegistryItemUncheckedCreateNestedManyWithoutCollectionInputSchema: z.ZodType<Prisma.RegistryItemUncheckedCreateNestedManyWithoutCollectionInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryItemCreateWithoutCollectionInputSchema),
          z.lazy(() => RegistryItemCreateWithoutCollectionInputSchema).array(),
          z.lazy(() => RegistryItemUncheckedCreateWithoutCollectionInputSchema),
          z.lazy(() => RegistryItemUncheckedCreateWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => RegistryItemCreateOrConnectWithoutCollectionInputSchema),
          z.lazy(() => RegistryItemCreateOrConnectWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => RegistryItemCreateManyCollectionInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => RegistryItemWhereUniqueInputSchema),
          z.lazy(() => RegistryItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default RegistryItemUncheckedCreateNestedManyWithoutCollectionInputSchema;
