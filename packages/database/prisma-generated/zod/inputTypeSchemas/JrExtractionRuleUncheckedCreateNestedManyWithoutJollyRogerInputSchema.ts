import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleCreateWithoutJollyRogerInputSchema } from './JrExtractionRuleCreateWithoutJollyRogerInputSchema';
import { JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema } from './JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema';
import { JrExtractionRuleCreateOrConnectWithoutJollyRogerInputSchema } from './JrExtractionRuleCreateOrConnectWithoutJollyRogerInputSchema';
import { JrExtractionRuleCreateManyJollyRogerInputEnvelopeSchema } from './JrExtractionRuleCreateManyJollyRogerInputEnvelopeSchema';
import { JrExtractionRuleWhereUniqueInputSchema } from './JrExtractionRuleWhereUniqueInputSchema';

export const JrExtractionRuleUncheckedCreateNestedManyWithoutJollyRogerInputSchema: z.ZodType<Prisma.JrExtractionRuleUncheckedCreateNestedManyWithoutJollyRogerInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => JrExtractionRuleCreateWithoutJollyRogerInputSchema),
          z.lazy(() => JrExtractionRuleCreateWithoutJollyRogerInputSchema).array(),
          z.lazy(() => JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema),
          z.lazy(() => JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => JrExtractionRuleCreateOrConnectWithoutJollyRogerInputSchema),
          z.lazy(() => JrExtractionRuleCreateOrConnectWithoutJollyRogerInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => JrExtractionRuleCreateManyJollyRogerInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),
          z.lazy(() => JrExtractionRuleWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default JrExtractionRuleUncheckedCreateNestedManyWithoutJollyRogerInputSchema;
