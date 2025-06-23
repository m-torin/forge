import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartArgsSchema } from '../outputTypeSchemas/CartArgsSchema';
import { ProductArgsSchema } from '../outputTypeSchemas/ProductArgsSchema';
import { RegistryArgsSchema } from '../outputTypeSchemas/RegistryArgsSchema';

export const CartItemIncludeSchema: z.ZodType<Prisma.CartItemInclude> = z
  .object({
    cart: z.union([z.boolean(), z.lazy(() => CartArgsSchema)]).optional(),
    product: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    variant: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    registry: z.union([z.boolean(), z.lazy(() => RegistryArgsSchema)]).optional(),
  })
  .strict();

export default CartItemIncludeSchema;
