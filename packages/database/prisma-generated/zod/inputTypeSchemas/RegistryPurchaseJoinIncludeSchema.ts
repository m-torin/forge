import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { RegistryItemArgsSchema } from "../outputTypeSchemas/RegistryItemArgsSchema"

export const RegistryPurchaseJoinIncludeSchema: z.ZodType<Prisma.RegistryPurchaseJoinInclude> = z.object({
  purchaser: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  registryItem: z.union([z.boolean(),z.lazy(() => RegistryItemArgsSchema)]).optional(),
}).strict()

export default RegistryPurchaseJoinIncludeSchema;
