import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutCollectionInputSchema } from './MediaCreateWithoutCollectionInputSchema';
import { MediaUncheckedCreateWithoutCollectionInputSchema } from './MediaUncheckedCreateWithoutCollectionInputSchema';
import { MediaCreateOrConnectWithoutCollectionInputSchema } from './MediaCreateOrConnectWithoutCollectionInputSchema';
import { MediaCreateManyCollectionInputEnvelopeSchema } from './MediaCreateManyCollectionInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';

export const MediaUncheckedCreateNestedManyWithoutCollectionInputSchema: z.ZodType<Prisma.MediaUncheckedCreateNestedManyWithoutCollectionInput> = z.object({
  create: z.union([ z.lazy(() => MediaCreateWithoutCollectionInputSchema),z.lazy(() => MediaCreateWithoutCollectionInputSchema).array(),z.lazy(() => MediaUncheckedCreateWithoutCollectionInputSchema),z.lazy(() => MediaUncheckedCreateWithoutCollectionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MediaCreateOrConnectWithoutCollectionInputSchema),z.lazy(() => MediaCreateOrConnectWithoutCollectionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MediaCreateManyCollectionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MediaUncheckedCreateNestedManyWithoutCollectionInputSchema;
