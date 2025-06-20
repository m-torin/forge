import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutBrandsInputSchema } from './JrFindReplaceRejectCreateWithoutBrandsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutBrandsInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutBrandsInputSchema';
import { JrFindReplaceRejectUpsertWithWhereUniqueWithoutBrandsInputSchema } from './JrFindReplaceRejectUpsertWithWhereUniqueWithoutBrandsInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithWhereUniqueWithoutBrandsInputSchema } from './JrFindReplaceRejectUpdateWithWhereUniqueWithoutBrandsInputSchema';
import { JrFindReplaceRejectUpdateManyWithWhereWithoutBrandsInputSchema } from './JrFindReplaceRejectUpdateManyWithWhereWithoutBrandsInputSchema';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';

export const JrFindReplaceRejectUpdateManyWithoutBrandsNestedInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithoutBrandsNestedInput> = z.object({
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutBrandsInputSchema),z.lazy(() => JrFindReplaceRejectCreateWithoutBrandsInputSchema).array(),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutBrandsInputSchema),z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutBrandsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutBrandsInputSchema),z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutBrandsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutBrandsInputSchema),z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutBrandsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutBrandsInputSchema),z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutBrandsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default JrFindReplaceRejectUpdateManyWithoutBrandsNestedInputSchema;
