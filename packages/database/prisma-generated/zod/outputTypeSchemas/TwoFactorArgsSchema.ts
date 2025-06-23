import { z } from 'zod';
import type { Prisma } from '../../client';
import { TwoFactorSelectSchema } from '../inputTypeSchemas/TwoFactorSelectSchema';
import { TwoFactorIncludeSchema } from '../inputTypeSchemas/TwoFactorIncludeSchema';

export const TwoFactorArgsSchema: z.ZodType<Prisma.TwoFactorDefaultArgs> = z
  .object({
    select: z.lazy(() => TwoFactorSelectSchema).optional(),
    include: z.lazy(() => TwoFactorIncludeSchema).optional(),
  })
  .strict();

export default TwoFactorArgsSchema;
