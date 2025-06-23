import type { Prisma } from '../../client';

import { z } from 'zod';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { EnumJrChartMethodFilterSchema } from './EnumJrChartMethodFilterSchema';
import { JrChartMethodSchema } from './JrChartMethodSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { BrandNullableScalarRelationFilterSchema } from './BrandNullableScalarRelationFilterSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { JrExtractionRuleListRelationFilterSchema } from './JrExtractionRuleListRelationFilterSchema';

export const JollyRogerWhereInputSchema: z.ZodType<Prisma.JollyRogerWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => JollyRogerWhereInputSchema),
        z.lazy(() => JollyRogerWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => JollyRogerWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => JollyRogerWhereInputSchema),
        z.lazy(() => JollyRogerWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    canChart: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    chartingMethod: z
      .union([z.lazy(() => EnumJrChartMethodFilterSchema), z.lazy(() => JrChartMethodSchema)])
      .optional(),
    brandId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    sitemaps: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    gridUrls: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    pdpUrlPatterns: z.lazy(() => JsonNullableFilterSchema).optional(),
    brand: z
      .union([
        z.lazy(() => BrandNullableScalarRelationFilterSchema),
        z.lazy(() => BrandWhereInputSchema),
      ])
      .optional()
      .nullable(),
    extractionRules: z.lazy(() => JrExtractionRuleListRelationFilterSchema).optional(),
  })
  .strict();

export default JollyRogerWhereInputSchema;
