import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';

export const PasskeyIncludeSchema: z.ZodType<Prisma.PasskeyInclude> = z
  .object({
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
  })
  .strict();

export default PasskeyIncludeSchema;
