import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinCreateWithoutUserInputSchema } from './FavoriteJoinCreateWithoutUserInputSchema';
import { FavoriteJoinUncheckedCreateWithoutUserInputSchema } from './FavoriteJoinUncheckedCreateWithoutUserInputSchema';
import { FavoriteJoinCreateOrConnectWithoutUserInputSchema } from './FavoriteJoinCreateOrConnectWithoutUserInputSchema';
import { FavoriteJoinCreateManyUserInputEnvelopeSchema } from './FavoriteJoinCreateManyUserInputEnvelopeSchema';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';

export const FavoriteJoinCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.FavoriteJoinCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => FavoriteJoinCreateWithoutUserInputSchema),z.lazy(() => FavoriteJoinCreateWithoutUserInputSchema).array(),z.lazy(() => FavoriteJoinUncheckedCreateWithoutUserInputSchema),z.lazy(() => FavoriteJoinUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteJoinCreateOrConnectWithoutUserInputSchema),z.lazy(() => FavoriteJoinCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteJoinCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FavoriteJoinWhereUniqueInputSchema),z.lazy(() => FavoriteJoinWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default FavoriteJoinCreateNestedManyWithoutUserInputSchema;
