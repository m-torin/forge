import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinCreateWithoutUserInputSchema } from './FavoriteJoinCreateWithoutUserInputSchema';
import { FavoriteJoinUncheckedCreateWithoutUserInputSchema } from './FavoriteJoinUncheckedCreateWithoutUserInputSchema';
import { FavoriteJoinCreateOrConnectWithoutUserInputSchema } from './FavoriteJoinCreateOrConnectWithoutUserInputSchema';
import { FavoriteJoinUpsertWithWhereUniqueWithoutUserInputSchema } from './FavoriteJoinUpsertWithWhereUniqueWithoutUserInputSchema';
import { FavoriteJoinCreateManyUserInputEnvelopeSchema } from './FavoriteJoinCreateManyUserInputEnvelopeSchema';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';
import { FavoriteJoinUpdateWithWhereUniqueWithoutUserInputSchema } from './FavoriteJoinUpdateWithWhereUniqueWithoutUserInputSchema';
import { FavoriteJoinUpdateManyWithWhereWithoutUserInputSchema } from './FavoriteJoinUpdateManyWithWhereWithoutUserInputSchema';
import { FavoriteJoinScalarWhereInputSchema } from './FavoriteJoinScalarWhereInputSchema';

export const FavoriteJoinUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.FavoriteJoinUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => FavoriteJoinCreateWithoutUserInputSchema),z.lazy(() => FavoriteJoinCreateWithoutUserInputSchema).array(),z.lazy(() => FavoriteJoinUncheckedCreateWithoutUserInputSchema),z.lazy(() => FavoriteJoinUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteJoinCreateOrConnectWithoutUserInputSchema),z.lazy(() => FavoriteJoinCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FavoriteJoinUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => FavoriteJoinUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteJoinCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FavoriteJoinWhereUniqueInputSchema),z.lazy(() => FavoriteJoinWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FavoriteJoinWhereUniqueInputSchema),z.lazy(() => FavoriteJoinWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FavoriteJoinWhereUniqueInputSchema),z.lazy(() => FavoriteJoinWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FavoriteJoinWhereUniqueInputSchema),z.lazy(() => FavoriteJoinWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FavoriteJoinUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => FavoriteJoinUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FavoriteJoinUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => FavoriteJoinUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FavoriteJoinScalarWhereInputSchema),z.lazy(() => FavoriteJoinScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default FavoriteJoinUncheckedUpdateManyWithoutUserNestedInputSchema;
