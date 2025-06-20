import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistrySelectSchema } from '../inputTypeSchemas/RegistrySelectSchema';
import { RegistryIncludeSchema } from '../inputTypeSchemas/RegistryIncludeSchema';

export const RegistryArgsSchema: z.ZodType<Prisma.RegistryDefaultArgs> = z.object({
  select: z.lazy(() => RegistrySelectSchema).optional(),
  include: z.lazy(() => RegistryIncludeSchema).optional(),
}).strict();

export default RegistryArgsSchema;
