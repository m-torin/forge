import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutTaxonomyInputSchema } from './MediaCreateWithoutTaxonomyInputSchema';
import { MediaUncheckedCreateWithoutTaxonomyInputSchema } from './MediaUncheckedCreateWithoutTaxonomyInputSchema';
import { MediaCreateOrConnectWithoutTaxonomyInputSchema } from './MediaCreateOrConnectWithoutTaxonomyInputSchema';
import { MediaCreateManyTaxonomyInputEnvelopeSchema } from './MediaCreateManyTaxonomyInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';

export const MediaCreateNestedManyWithoutTaxonomyInputSchema: z.ZodType<Prisma.MediaCreateNestedManyWithoutTaxonomyInput> = z.object({
  create: z.union([ z.lazy(() => MediaCreateWithoutTaxonomyInputSchema),z.lazy(() => MediaCreateWithoutTaxonomyInputSchema).array(),z.lazy(() => MediaUncheckedCreateWithoutTaxonomyInputSchema),z.lazy(() => MediaUncheckedCreateWithoutTaxonomyInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MediaCreateOrConnectWithoutTaxonomyInputSchema),z.lazy(() => MediaCreateOrConnectWithoutTaxonomyInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MediaCreateManyTaxonomyInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MediaCreateNestedManyWithoutTaxonomyInputSchema;
