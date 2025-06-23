import { z } from 'zod';
import type { Prisma } from '../../client';
import { BrandArgsSchema } from '../outputTypeSchemas/BrandArgsSchema';
import { JrExtractionRuleFindManyArgsSchema } from '../outputTypeSchemas/JrExtractionRuleFindManyArgsSchema';
import { JollyRogerCountOutputTypeArgsSchema } from '../outputTypeSchemas/JollyRogerCountOutputTypeArgsSchema';

export const JollyRogerIncludeSchema: z.ZodType<Prisma.JollyRogerInclude> = z
  .object({
    brand: z.union([z.boolean(), z.lazy(() => BrandArgsSchema)]).optional(),
    extractionRules: z
      .union([z.boolean(), z.lazy(() => JrExtractionRuleFindManyArgsSchema)])
      .optional(),
    _count: z.union([z.boolean(), z.lazy(() => JollyRogerCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export default JollyRogerIncludeSchema;
