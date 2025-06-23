import { z } from 'zod';
import type { Prisma } from '../../client';
import { PasskeySelectSchema } from '../inputTypeSchemas/PasskeySelectSchema';
import { PasskeyIncludeSchema } from '../inputTypeSchemas/PasskeyIncludeSchema';

export const PasskeyArgsSchema: z.ZodType<Prisma.PasskeyDefaultArgs> = z
  .object({
    select: z.lazy(() => PasskeySelectSchema).optional(),
    include: z.lazy(() => PasskeyIncludeSchema).optional(),
  })
  .strict();

export default PasskeyArgsSchema;
