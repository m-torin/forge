import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinCreateWithoutCollectionInputSchema } from './FavoriteJoinCreateWithoutCollectionInputSchema';
import { FavoriteJoinUncheckedCreateWithoutCollectionInputSchema } from './FavoriteJoinUncheckedCreateWithoutCollectionInputSchema';
import { FavoriteJoinCreateOrConnectWithoutCollectionInputSchema } from './FavoriteJoinCreateOrConnectWithoutCollectionInputSchema';
import { FavoriteJoinCreateManyCollectionInputEnvelopeSchema } from './FavoriteJoinCreateManyCollectionInputEnvelopeSchema';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';

export const FavoriteJoinUncheckedCreateNestedManyWithoutCollectionInputSchema: z.ZodType<Prisma.FavoriteJoinUncheckedCreateNestedManyWithoutCollectionInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => FavoriteJoinCreateWithoutCollectionInputSchema),
          z.lazy(() => FavoriteJoinCreateWithoutCollectionInputSchema).array(),
          z.lazy(() => FavoriteJoinUncheckedCreateWithoutCollectionInputSchema),
          z.lazy(() => FavoriteJoinUncheckedCreateWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => FavoriteJoinCreateOrConnectWithoutCollectionInputSchema),
          z.lazy(() => FavoriteJoinCreateOrConnectWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => FavoriteJoinCreateManyCollectionInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
          z.lazy(() => FavoriteJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default FavoriteJoinUncheckedCreateNestedManyWithoutCollectionInputSchema;
