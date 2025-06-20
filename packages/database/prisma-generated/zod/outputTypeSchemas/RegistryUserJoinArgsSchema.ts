import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryUserJoinSelectSchema } from '../inputTypeSchemas/RegistryUserJoinSelectSchema';
import { RegistryUserJoinIncludeSchema } from '../inputTypeSchemas/RegistryUserJoinIncludeSchema';

export const RegistryUserJoinArgsSchema: z.ZodType<Prisma.RegistryUserJoinDefaultArgs> = z.object({
  select: z.lazy(() => RegistryUserJoinSelectSchema).optional(),
  include: z.lazy(() => RegistryUserJoinIncludeSchema).optional(),
}).strict();

export default RegistryUserJoinArgsSchema;
