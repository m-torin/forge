import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutManufacturerBrandsInputSchema } from './PdpJoinCreateWithoutManufacturerBrandsInputSchema';
import { PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema } from './PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema';
import { PdpJoinCreateOrConnectWithoutManufacturerBrandsInputSchema } from './PdpJoinCreateOrConnectWithoutManufacturerBrandsInputSchema';
import { PdpJoinUpsertWithWhereUniqueWithoutManufacturerBrandsInputSchema } from './PdpJoinUpsertWithWhereUniqueWithoutManufacturerBrandsInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithWhereUniqueWithoutManufacturerBrandsInputSchema } from './PdpJoinUpdateWithWhereUniqueWithoutManufacturerBrandsInputSchema';
import { PdpJoinUpdateManyWithWhereWithoutManufacturerBrandsInputSchema } from './PdpJoinUpdateManyWithWhereWithoutManufacturerBrandsInputSchema';
import { PdpJoinScalarWhereInputSchema } from './PdpJoinScalarWhereInputSchema';

export const PdpJoinUpdateManyWithoutManufacturerBrandsNestedInputSchema: z.ZodType<Prisma.PdpJoinUpdateManyWithoutManufacturerBrandsNestedInput> = z.object({
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutManufacturerBrandsInputSchema),z.lazy(() => PdpJoinCreateWithoutManufacturerBrandsInputSchema).array(),z.lazy(() => PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutManufacturerBrandsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PdpJoinCreateOrConnectWithoutManufacturerBrandsInputSchema),z.lazy(() => PdpJoinCreateOrConnectWithoutManufacturerBrandsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PdpJoinUpsertWithWhereUniqueWithoutManufacturerBrandsInputSchema),z.lazy(() => PdpJoinUpsertWithWhereUniqueWithoutManufacturerBrandsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PdpJoinUpdateWithWhereUniqueWithoutManufacturerBrandsInputSchema),z.lazy(() => PdpJoinUpdateWithWhereUniqueWithoutManufacturerBrandsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PdpJoinUpdateManyWithWhereWithoutManufacturerBrandsInputSchema),z.lazy(() => PdpJoinUpdateManyWithWhereWithoutManufacturerBrandsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PdpJoinScalarWhereInputSchema),z.lazy(() => PdpJoinScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default PdpJoinUpdateManyWithoutManufacturerBrandsNestedInputSchema;
