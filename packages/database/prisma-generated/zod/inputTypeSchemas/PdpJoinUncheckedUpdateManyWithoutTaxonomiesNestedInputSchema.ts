import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutTaxonomiesInputSchema } from './PdpJoinCreateWithoutTaxonomiesInputSchema';
import { PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema } from './PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema';
import { PdpJoinCreateOrConnectWithoutTaxonomiesInputSchema } from './PdpJoinCreateOrConnectWithoutTaxonomiesInputSchema';
import { PdpJoinUpsertWithWhereUniqueWithoutTaxonomiesInputSchema } from './PdpJoinUpsertWithWhereUniqueWithoutTaxonomiesInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithWhereUniqueWithoutTaxonomiesInputSchema } from './PdpJoinUpdateWithWhereUniqueWithoutTaxonomiesInputSchema';
import { PdpJoinUpdateManyWithWhereWithoutTaxonomiesInputSchema } from './PdpJoinUpdateManyWithWhereWithoutTaxonomiesInputSchema';
import { PdpJoinScalarWhereInputSchema } from './PdpJoinScalarWhereInputSchema';

export const PdpJoinUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema: z.ZodType<Prisma.PdpJoinUncheckedUpdateManyWithoutTaxonomiesNestedInput> = z.object({
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutTaxonomiesInputSchema),z.lazy(() => PdpJoinCreateWithoutTaxonomiesInputSchema).array(),z.lazy(() => PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutTaxonomiesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PdpJoinCreateOrConnectWithoutTaxonomiesInputSchema),z.lazy(() => PdpJoinCreateOrConnectWithoutTaxonomiesInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PdpJoinUpsertWithWhereUniqueWithoutTaxonomiesInputSchema),z.lazy(() => PdpJoinUpsertWithWhereUniqueWithoutTaxonomiesInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PdpJoinUpdateWithWhereUniqueWithoutTaxonomiesInputSchema),z.lazy(() => PdpJoinUpdateWithWhereUniqueWithoutTaxonomiesInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PdpJoinUpdateManyWithWhereWithoutTaxonomiesInputSchema),z.lazy(() => PdpJoinUpdateManyWithWhereWithoutTaxonomiesInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PdpJoinScalarWhereInputSchema),z.lazy(() => PdpJoinScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default PdpJoinUncheckedUpdateManyWithoutTaxonomiesNestedInputSchema;
