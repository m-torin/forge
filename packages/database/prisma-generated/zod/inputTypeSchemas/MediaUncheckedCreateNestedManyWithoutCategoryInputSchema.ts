import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutCategoryInputSchema } from './MediaCreateWithoutCategoryInputSchema';
import { MediaUncheckedCreateWithoutCategoryInputSchema } from './MediaUncheckedCreateWithoutCategoryInputSchema';
import { MediaCreateOrConnectWithoutCategoryInputSchema } from './MediaCreateOrConnectWithoutCategoryInputSchema';
import { MediaCreateManyCategoryInputEnvelopeSchema } from './MediaCreateManyCategoryInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';

export const MediaUncheckedCreateNestedManyWithoutCategoryInputSchema: z.ZodType<Prisma.MediaUncheckedCreateNestedManyWithoutCategoryInput> = z.object({
  create: z.union([ z.lazy(() => MediaCreateWithoutCategoryInputSchema),z.lazy(() => MediaCreateWithoutCategoryInputSchema).array(),z.lazy(() => MediaUncheckedCreateWithoutCategoryInputSchema),z.lazy(() => MediaUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MediaCreateOrConnectWithoutCategoryInputSchema),z.lazy(() => MediaCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MediaCreateManyCategoryInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MediaUncheckedCreateNestedManyWithoutCategoryInputSchema;
