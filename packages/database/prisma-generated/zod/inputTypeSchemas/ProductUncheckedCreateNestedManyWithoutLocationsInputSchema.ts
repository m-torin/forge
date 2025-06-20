import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutLocationsInputSchema } from './ProductCreateWithoutLocationsInputSchema';
import { ProductUncheckedCreateWithoutLocationsInputSchema } from './ProductUncheckedCreateWithoutLocationsInputSchema';
import { ProductCreateOrConnectWithoutLocationsInputSchema } from './ProductCreateOrConnectWithoutLocationsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductUncheckedCreateNestedManyWithoutLocationsInputSchema: z.ZodType<Prisma.ProductUncheckedCreateNestedManyWithoutLocationsInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutLocationsInputSchema),z.lazy(() => ProductCreateWithoutLocationsInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutLocationsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutLocationsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutLocationsInputSchema),z.lazy(() => ProductCreateOrConnectWithoutLocationsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ProductUncheckedCreateNestedManyWithoutLocationsInputSchema;
