import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartScalarWhereInputSchema } from './CartScalarWhereInputSchema';
import { CartUpdateManyMutationInputSchema } from './CartUpdateManyMutationInputSchema';
import { CartUncheckedUpdateManyWithoutUserInputSchema } from './CartUncheckedUpdateManyWithoutUserInputSchema';

export const CartUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.CartUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => CartScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CartUpdateManyMutationInputSchema),z.lazy(() => CartUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default CartUpdateManyWithWhereWithoutUserInputSchema;
