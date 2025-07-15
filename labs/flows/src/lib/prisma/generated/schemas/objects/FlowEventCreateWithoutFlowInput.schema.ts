import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { StartedBySchema } from '../enums/StartedBy.schema';
import { FlowRunCreateNestedOneWithoutFlowEventsInputObjectSchema } from './FlowRunCreateNestedOneWithoutFlowEventsInput.schema';

import type { Prisma } from '@prisma/client';

const literalSchema = z.union([z.string(), z.number(), z.boolean()]);
const jsonSchema = z.lazy(() =>
  z.union([
    literalSchema,
    z.array(jsonSchema.nullable()),
    z.record(z.string(), jsonSchema.nullable()),
  ]),
);

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.coerce.date().optional(),
    nodeId: z.string(),
    payload: z.union([NullableJsonNullValueInputSchema, jsonSchema]).optional(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    startedBy: StartedBySchema,
    flowRun: z.lazy(
      () => FlowRunCreateNestedOneWithoutFlowEventsInputObjectSchema,
    ),
  })
  .strict();

export const FlowEventCreateWithoutFlowInputObjectSchema = Schema;
