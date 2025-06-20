import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectUpsertWithWhereUniqueWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUpsertWithWhereUniqueWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithWhereUniqueWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUpdateWithWhereUniqueWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectUpdateManyWithWhereWithoutTaxonomiesInputSchema } from './JrFindReplaceRejectUpdateManyWithWhereWithoutTaxonomiesInputSchema';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';

export const JrFindReplaceRejectUpdateManyWithoutTaxonomiesNestedInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithoutTaxonomiesNestedInput> = z.object({
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema),z.lazy(() => JrFindReplaceRejectCreateWithoutTaxonomiesInputSchema).array(),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutTaxonomiesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutTaxonomiesInputSchema),z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutTaxonomiesInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutTaxonomiesInputSchema),z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutTaxonomiesInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutTaxonomiesInputSchema),z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutTaxonomiesInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutTaxonomiesInputSchema),z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutTaxonomiesInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default JrFindReplaceRejectUpdateManyWithoutTaxonomiesNestedInputSchema;
