import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutTaxonomyInputSchema } from './MediaCreateWithoutTaxonomyInputSchema';
import { MediaUncheckedCreateWithoutTaxonomyInputSchema } from './MediaUncheckedCreateWithoutTaxonomyInputSchema';
import { MediaCreateOrConnectWithoutTaxonomyInputSchema } from './MediaCreateOrConnectWithoutTaxonomyInputSchema';
import { MediaUpsertWithWhereUniqueWithoutTaxonomyInputSchema } from './MediaUpsertWithWhereUniqueWithoutTaxonomyInputSchema';
import { MediaCreateManyTaxonomyInputEnvelopeSchema } from './MediaCreateManyTaxonomyInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithWhereUniqueWithoutTaxonomyInputSchema } from './MediaUpdateWithWhereUniqueWithoutTaxonomyInputSchema';
import { MediaUpdateManyWithWhereWithoutTaxonomyInputSchema } from './MediaUpdateManyWithWhereWithoutTaxonomyInputSchema';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';

export const MediaUpdateManyWithoutTaxonomyNestedInputSchema: z.ZodType<Prisma.MediaUpdateManyWithoutTaxonomyNestedInput> = z.object({
  create: z.union([ z.lazy(() => MediaCreateWithoutTaxonomyInputSchema),z.lazy(() => MediaCreateWithoutTaxonomyInputSchema).array(),z.lazy(() => MediaUncheckedCreateWithoutTaxonomyInputSchema),z.lazy(() => MediaUncheckedCreateWithoutTaxonomyInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MediaCreateOrConnectWithoutTaxonomyInputSchema),z.lazy(() => MediaCreateOrConnectWithoutTaxonomyInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MediaUpsertWithWhereUniqueWithoutTaxonomyInputSchema),z.lazy(() => MediaUpsertWithWhereUniqueWithoutTaxonomyInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MediaCreateManyTaxonomyInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MediaUpdateWithWhereUniqueWithoutTaxonomyInputSchema),z.lazy(() => MediaUpdateWithWhereUniqueWithoutTaxonomyInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MediaUpdateManyWithWhereWithoutTaxonomyInputSchema),z.lazy(() => MediaUpdateManyWithWhereWithoutTaxonomyInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MediaScalarWhereInputSchema),z.lazy(() => MediaScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MediaUpdateManyWithoutTaxonomyNestedInputSchema;
