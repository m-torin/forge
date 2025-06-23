import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderArgsSchema } from '../outputTypeSchemas/OrderArgsSchema';
import { ProductArgsSchema } from '../outputTypeSchemas/ProductArgsSchema';
import { RegistryArgsSchema } from '../outputTypeSchemas/RegistryArgsSchema';

export const OrderItemIncludeSchema: z.ZodType<Prisma.OrderItemInclude> = z
  .object({
    order: z.union([z.boolean(), z.lazy(() => OrderArgsSchema)]).optional(),
    product: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    variant: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    registry: z.union([z.boolean(), z.lazy(() => RegistryArgsSchema)]).optional(),
  })
  .strict();

export default OrderItemIncludeSchema;
