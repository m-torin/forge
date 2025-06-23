import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventorySelectSchema } from '../inputTypeSchemas/InventorySelectSchema';
import { InventoryIncludeSchema } from '../inputTypeSchemas/InventoryIncludeSchema';

export const InventoryArgsSchema: z.ZodType<Prisma.InventoryDefaultArgs> = z
  .object({
    select: z.lazy(() => InventorySelectSchema).optional(),
    include: z.lazy(() => InventoryIncludeSchema).optional(),
  })
  .strict();

export default InventoryArgsSchema;
