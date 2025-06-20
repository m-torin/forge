import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryItemCountOutputTypeSelectSchema } from './RegistryItemCountOutputTypeSelectSchema';

export const RegistryItemCountOutputTypeArgsSchema: z.ZodType<Prisma.RegistryItemCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => RegistryItemCountOutputTypeSelectSchema).nullish(),
}).strict();

export default RegistryItemCountOutputTypeSelectSchema;
