import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryCountOutputTypeSelectSchema } from './RegistryCountOutputTypeSelectSchema';

export const RegistryCountOutputTypeArgsSchema: z.ZodType<Prisma.RegistryCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => RegistryCountOutputTypeSelectSchema).nullish(),
}).strict();

export default RegistryCountOutputTypeSelectSchema;
