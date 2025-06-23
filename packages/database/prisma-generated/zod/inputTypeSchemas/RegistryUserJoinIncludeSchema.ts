import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { RegistryArgsSchema } from '../outputTypeSchemas/RegistryArgsSchema';

export const RegistryUserJoinIncludeSchema: z.ZodType<Prisma.RegistryUserJoinInclude> = z
  .object({
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    registry: z.union([z.boolean(), z.lazy(() => RegistryArgsSchema)]).optional(),
  })
  .strict();

export default RegistryUserJoinIncludeSchema;
