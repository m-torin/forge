import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutMediaInputSchema } from './PdpJoinCreateWithoutMediaInputSchema';
import { PdpJoinUncheckedCreateWithoutMediaInputSchema } from './PdpJoinUncheckedCreateWithoutMediaInputSchema';
import { PdpJoinCreateOrConnectWithoutMediaInputSchema } from './PdpJoinCreateOrConnectWithoutMediaInputSchema';
import { PdpJoinUpsertWithoutMediaInputSchema } from './PdpJoinUpsertWithoutMediaInputSchema';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateToOneWithWhereWithoutMediaInputSchema } from './PdpJoinUpdateToOneWithWhereWithoutMediaInputSchema';
import { PdpJoinUpdateWithoutMediaInputSchema } from './PdpJoinUpdateWithoutMediaInputSchema';
import { PdpJoinUncheckedUpdateWithoutMediaInputSchema } from './PdpJoinUncheckedUpdateWithoutMediaInputSchema';

export const PdpJoinUpdateOneWithoutMediaNestedInputSchema: z.ZodType<Prisma.PdpJoinUpdateOneWithoutMediaNestedInput> = z.object({
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutMediaInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutMediaInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PdpJoinCreateOrConnectWithoutMediaInputSchema).optional(),
  upsert: z.lazy(() => PdpJoinUpsertWithoutMediaInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => PdpJoinWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => PdpJoinWhereInputSchema) ]).optional(),
  connect: z.lazy(() => PdpJoinWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PdpJoinUpdateToOneWithWhereWithoutMediaInputSchema),z.lazy(() => PdpJoinUpdateWithoutMediaInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutMediaInputSchema) ]).optional(),
}).strict();

export default PdpJoinUpdateOneWithoutMediaNestedInputSchema;
