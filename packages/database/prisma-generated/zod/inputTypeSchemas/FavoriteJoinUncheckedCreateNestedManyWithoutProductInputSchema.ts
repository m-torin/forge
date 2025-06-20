import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinCreateWithoutProductInputSchema } from './FavoriteJoinCreateWithoutProductInputSchema';
import { FavoriteJoinUncheckedCreateWithoutProductInputSchema } from './FavoriteJoinUncheckedCreateWithoutProductInputSchema';
import { FavoriteJoinCreateOrConnectWithoutProductInputSchema } from './FavoriteJoinCreateOrConnectWithoutProductInputSchema';
import { FavoriteJoinCreateManyProductInputEnvelopeSchema } from './FavoriteJoinCreateManyProductInputEnvelopeSchema';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';

export const FavoriteJoinUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.FavoriteJoinUncheckedCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => FavoriteJoinCreateWithoutProductInputSchema),z.lazy(() => FavoriteJoinCreateWithoutProductInputSchema).array(),z.lazy(() => FavoriteJoinUncheckedCreateWithoutProductInputSchema),z.lazy(() => FavoriteJoinUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteJoinCreateOrConnectWithoutProductInputSchema),z.lazy(() => FavoriteJoinCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteJoinCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FavoriteJoinWhereUniqueInputSchema),z.lazy(() => FavoriteJoinWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default FavoriteJoinUncheckedCreateNestedManyWithoutProductInputSchema;
