import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleJollyRogerIdFieldNameCompoundUniqueInputSchema } from './JrExtractionRuleJollyRogerIdFieldNameCompoundUniqueInputSchema';
import { JrExtractionRuleWhereInputSchema } from './JrExtractionRuleWhereInputSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { EnumJrChartRuleForFilterSchema } from './EnumJrChartRuleForFilterSchema';
import { JrChartRuleForSchema } from './JrChartRuleForSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { FloatNullableFilterSchema } from './FloatNullableFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { JollyRogerScalarRelationFilterSchema } from './JollyRogerScalarRelationFilterSchema';
import { JollyRogerWhereInputSchema } from './JollyRogerWhereInputSchema';
import { JrFindReplaceRejectListRelationFilterSchema } from './JrFindReplaceRejectListRelationFilterSchema';

export const JrExtractionRuleWhereUniqueInputSchema: z.ZodType<Prisma.JrExtractionRuleWhereUniqueInput> =
  z
    .union([
      z.object({
        id: z.number().int(),
        jollyRogerId_fieldName: z.lazy(
          () => JrExtractionRuleJollyRogerIdFieldNameCompoundUniqueInputSchema,
        ),
      }),
      z.object({
        id: z.number().int(),
      }),
      z.object({
        jollyRogerId_fieldName: z.lazy(
          () => JrExtractionRuleJollyRogerIdFieldNameCompoundUniqueInputSchema,
        ),
      }),
    ])
    .and(
      z
        .object({
          id: z.number().int().optional(),
          jollyRogerId_fieldName: z
            .lazy(() => JrExtractionRuleJollyRogerIdFieldNameCompoundUniqueInputSchema)
            .optional(),
          AND: z
            .union([
              z.lazy(() => JrExtractionRuleWhereInputSchema),
              z.lazy(() => JrExtractionRuleWhereInputSchema).array(),
            ])
            .optional(),
          OR: z
            .lazy(() => JrExtractionRuleWhereInputSchema)
            .array()
            .optional(),
          NOT: z
            .union([
              z.lazy(() => JrExtractionRuleWhereInputSchema),
              z.lazy(() => JrExtractionRuleWhereInputSchema).array(),
            ])
            .optional(),
          jollyRogerId: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
          fieldName: z
            .union([
              z.lazy(() => EnumJrChartRuleForFilterSchema),
              z.lazy(() => JrChartRuleForSchema),
            ])
            .optional(),
          isActive: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
          selectors: z.lazy(() => JsonFilterSchema).optional(),
          mustContain: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          cannotContain: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          lastSuccessfulSelector: z.lazy(() => JsonNullableFilterSchema).optional(),
          successRate: z
            .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
            .optional()
            .nullable(),
          lastTestedAt: z
            .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
            .optional()
            .nullable(),
          notes: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          jollyRoger: z
            .union([
              z.lazy(() => JollyRogerScalarRelationFilterSchema),
              z.lazy(() => JollyRogerWhereInputSchema),
            ])
            .optional(),
          findReplaceRules: z.lazy(() => JrFindReplaceRejectListRelationFilterSchema).optional(),
        })
        .strict(),
    );

export default JrExtractionRuleWhereUniqueInputSchema;
