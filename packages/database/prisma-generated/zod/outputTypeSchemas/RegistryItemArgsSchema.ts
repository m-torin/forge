import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryItemSelectSchema } from '../inputTypeSchemas/RegistryItemSelectSchema';
import { RegistryItemIncludeSchema } from '../inputTypeSchemas/RegistryItemIncludeSchema';

export const RegistryItemArgsSchema: z.ZodType<Prisma.RegistryItemDefaultArgs> = z
  .object({
    select: z.lazy(() => RegistryItemSelectSchema).optional(),
    include: z.lazy(() => RegistryItemIncludeSchema).optional(),
  })
  .strict();

export default RegistryItemArgsSchema;
