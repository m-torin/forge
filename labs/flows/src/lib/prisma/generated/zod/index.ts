import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<any> = z.any();

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<any> = z.any();

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const EdgeScalarFieldEnumSchema = z.enum(['id','sourceNodeId','targetNodeId','flowId','rfId','label','isActive','type','normalizedKey','metadata','createdAt','updatedAt','deleted']);

export const RelationLoadStrategySchema = z.enum(['query','join']);

export const FlowScalarFieldEnumSchema = z.enum(['createdAt','id','instanceId','isEnabled','method','name','metadata','updatedAt','viewport','deleted']);

export const FlowEventScalarFieldEnumSchema = z.enum(['createdAt','flowRunId','flowId','id','nodeId','payload','metadata','startedBy']);

export const FlowRunScalarFieldEnumSchema = z.enum(['flowId','id','isScheduled','payload','metadata','runStatus','scheduledJobId','startedBy','timeEnded','timeStarted']);

export const InfrastructureScalarFieldEnumSchema = z.enum(['arn','canControl','createdAt','data','id','name','type','metadata','updatedAt','deleted']);

export const InstanceScalarFieldEnumSchema = z.enum(['createdAt','description','id','image','logo','name','metadata','updatedAt','userId']);

export const NodeScalarFieldEnumSchema = z.enum(['arn','createdAt','flowId','id','infrastructureId','name','position','metadata','rfId','type','updatedAt','deleted']);

export const ScheduledJobScalarFieldEnumSchema = z.enum(['createdAt','createdBy','endpoint','frequency','id','name','deleted']);

export const SecretScalarFieldEnumSchema = z.enum(['name','category','createdAt','flowId','id','nodeId','secret','shouldEncrypt','metadata','updatedAt','deleted']);

export const TagScalarFieldEnumSchema = z.enum(['id','name','createdAt','updatedAt','deleted','metadata','flowId','nodeId','tagGroupId','instanceId']);

export const TagGroupScalarFieldEnumSchema = z.enum(['id','name','color','deleted','createdAt','updatedAt','metadata','instanceId']);

export const TestCaseScalarFieldEnumSchema = z.enum(['color','createdAt','flowId','id','name','metadata','updatedAt','deleted']);

export const AccountScalarFieldEnumSchema = z.enum(['access_token','expires_at','id','id_token','oauth_token','oauth_token_secret','provider','providerAccountId','refresh_token','refresh_token_expires_in','scope','session_state','token_type','type','userId']);

export const SessionScalarFieldEnumSchema = z.enum(['createdAt','expires','id','sessionToken','userId']);

export const UserScalarFieldEnumSchema = z.enum(['id','createdAt','email','emailVerified','image','name','updatedAt']);

export const VerificationTokenScalarFieldEnumSchema = z.enum(['createdAt','expires','identifier','token']);

export const AuditLogScalarFieldEnumSchema = z.enum(['id','entityType','entityId','flowId','changeType','before','after','userId','timestamp']);

export const FlowStatisticsScalarFieldEnumSchema = z.enum(['id','flowId','totalRuns','successfulRuns','failedRuns','lastUpdated']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullableJsonNullValueInputSchema = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.JsonNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const NullsOrderSchema = z.enum(['first','last']);

export const EdgeTypeSchema = z.enum(['custom','default']);

export type EdgeTypeType = `${z.infer<typeof EdgeTypeSchema>}`

export const FlowMethodSchema = z.enum(['graphOnly','observable','sequential']);

export type FlowMethodType = `${z.infer<typeof FlowMethodSchema>}`

export const InfraTypeSchema = z.enum(['database','graphOnly','other']);

export type InfraTypeType = `${z.infer<typeof InfraTypeSchema>}`

export const MantineColorSchema = z.enum(['blue','cyan','grape','green','indigo','lime','orange','pink','red','teal','violet','yellow']);

export type MantineColorType = `${z.infer<typeof MantineColorSchema>}`

export const NodeTypeSchema = z.enum(['anthropicGptNode','awsEventBridgeEvent','awsLambdaNode','awsS3Node','awsSnsNode','awsSqsNode','cronNode','default','githubEventReceiverSource','ifElseThenNode','javascriptEditorLogic','javascriptEditorNode','openaiGptNode','pythonEditorNode','webhook','webhookDestination','webhookSource']);

export type NodeTypeType = `${z.infer<typeof NodeTypeSchema>}`

export const RunStatusSchema = z.enum(['failed','inProgress','paused','successful']);

export type RunStatusType = `${z.infer<typeof RunStatusSchema>}`

export const SecretCategorySchema = z.enum(['flow','global','node']);

export type SecretCategoryType = `${z.infer<typeof SecretCategorySchema>}`

export const StartedBySchema = z.enum(['manual','scheduled']);

export type StartedByType = `${z.infer<typeof StartedBySchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// EDGE SCHEMA
/////////////////////////////////////////

export const EdgeSchema = z.object({
  type: EdgeTypeSchema,
  id: z.string().cuid(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  flowId: z.string(),
  rfId: z.string().nullable(),
  label: z.string().nullable(),
  isActive: z.boolean(),
  normalizedKey: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deleted: z.boolean(),
})

export type Edge = z.infer<typeof EdgeSchema>

// EDGE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const EdgeOptionalDefaultsSchema = EdgeSchema.merge(z.object({
  type: EdgeTypeSchema.optional(),
  id: z.string().cuid().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
}))

export type EdgeOptionalDefaults = z.infer<typeof EdgeOptionalDefaultsSchema>

// EDGE RELATION SCHEMA
//------------------------------------------------------

export type EdgeRelations = {
  flow: FlowWithRelations;
  sourceNode: NodeWithRelations;
  targetNode: NodeWithRelations;
};

export type EdgeWithRelations = Omit<z.infer<typeof EdgeSchema>, "metadata"> & {
  metadata?: JsonValueType | null;
} & EdgeRelations

export const EdgeWithRelationsSchema: z.ZodType<EdgeWithRelations> = EdgeSchema.merge(z.object({
  flow: z.lazy(() => FlowWithRelationsSchema),
  sourceNode: z.lazy(() => NodeWithRelationsSchema),
  targetNode: z.lazy(() => NodeWithRelationsSchema),
}))

// EDGE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type EdgeOptionalDefaultsRelations = {
  flow: FlowOptionalDefaultsWithRelations;
  sourceNode: NodeOptionalDefaultsWithRelations;
  targetNode: NodeOptionalDefaultsWithRelations;
};

export type EdgeOptionalDefaultsWithRelations = Omit<z.infer<typeof EdgeOptionalDefaultsSchema>, "metadata"> & {
  metadata?: JsonValueType | null;
} & EdgeOptionalDefaultsRelations

export const EdgeOptionalDefaultsWithRelationsSchema: z.ZodType<EdgeOptionalDefaultsWithRelations> = EdgeOptionalDefaultsSchema.merge(z.object({
  flow: z.lazy(() => FlowOptionalDefaultsWithRelationsSchema),
  sourceNode: z.lazy(() => NodeOptionalDefaultsWithRelationsSchema),
  targetNode: z.lazy(() => NodeOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// FLOW SCHEMA
/////////////////////////////////////////

export const FlowSchema = z.object({
  method: FlowMethodSchema,
  createdAt: z.coerce.date(),
  id: z.string().cuid(),
  instanceId: z.string(),
  isEnabled: z.boolean(),
  name: z.string(),
  metadata: JsonValueSchema.nullable(),
  updatedAt: z.coerce.date(),
  viewport: JsonValueSchema.nullable(),
  deleted: z.boolean(),
})

export type Flow = z.infer<typeof FlowSchema>

// FLOW OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const FlowOptionalDefaultsSchema = FlowSchema.merge(z.object({
  method: FlowMethodSchema.optional(),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
}))

export type FlowOptionalDefaults = z.infer<typeof FlowOptionalDefaultsSchema>

// FLOW RELATION SCHEMA
//------------------------------------------------------

export type FlowRelations = {
  edges: EdgeWithRelations[];
  flowRuns: FlowRunWithRelations[];
  flowEvents: FlowEventWithRelations[];
  instance: InstanceWithRelations;
  nodes: NodeWithRelations[];
  secrets: SecretWithRelations[];
  tags: TagWithRelations[];
  testCases: TestCaseWithRelations[];
  auditLogs: AuditLogWithRelations[];
  statistics?: FlowStatisticsWithRelations | null;
};

export type FlowWithRelations = Omit<z.infer<typeof FlowSchema>, "metadata" | "viewport"> & {
  metadata?: JsonValueType | null;
  viewport?: JsonValueType | null;
} & FlowRelations

export const FlowWithRelationsSchema: z.ZodType<FlowWithRelations> = FlowSchema.merge(z.object({
  edges: z.lazy(() => EdgeWithRelationsSchema).array(),
  flowRuns: z.lazy(() => FlowRunWithRelationsSchema).array(),
  flowEvents: z.lazy(() => FlowEventWithRelationsSchema).array(),
  instance: z.lazy(() => InstanceWithRelationsSchema),
  nodes: z.lazy(() => NodeWithRelationsSchema).array(),
  secrets: z.lazy(() => SecretWithRelationsSchema).array(),
  tags: z.lazy(() => TagWithRelationsSchema).array(),
  testCases: z.lazy(() => TestCaseWithRelationsSchema).array(),
  auditLogs: z.lazy(() => AuditLogWithRelationsSchema).array(),
  statistics: z.lazy(() => FlowStatisticsWithRelationsSchema).nullable(),
}))

// FLOW OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type FlowOptionalDefaultsRelations = {
  edges: EdgeOptionalDefaultsWithRelations[];
  flowRuns: FlowRunOptionalDefaultsWithRelations[];
  flowEvents: FlowEventOptionalDefaultsWithRelations[];
  instance: InstanceOptionalDefaultsWithRelations;
  nodes: NodeOptionalDefaultsWithRelations[];
  secrets: SecretOptionalDefaultsWithRelations[];
  tags: TagOptionalDefaultsWithRelations[];
  testCases: TestCaseOptionalDefaultsWithRelations[];
  auditLogs: AuditLogOptionalDefaultsWithRelations[];
  statistics?: FlowStatisticsOptionalDefaultsWithRelations | null;
};

export type FlowOptionalDefaultsWithRelations = Omit<z.infer<typeof FlowOptionalDefaultsSchema>, "metadata" | "viewport"> & {
  metadata?: JsonValueType | null;
  viewport?: JsonValueType | null;
} & FlowOptionalDefaultsRelations

export const FlowOptionalDefaultsWithRelationsSchema: z.ZodType<FlowOptionalDefaultsWithRelations> = FlowOptionalDefaultsSchema.merge(z.object({
  edges: z.lazy(() => EdgeOptionalDefaultsWithRelationsSchema).array(),
  flowRuns: z.lazy(() => FlowRunOptionalDefaultsWithRelationsSchema).array(),
  flowEvents: z.lazy(() => FlowEventOptionalDefaultsWithRelationsSchema).array(),
  instance: z.lazy(() => InstanceOptionalDefaultsWithRelationsSchema),
  nodes: z.lazy(() => NodeOptionalDefaultsWithRelationsSchema).array(),
  secrets: z.lazy(() => SecretOptionalDefaultsWithRelationsSchema).array(),
  tags: z.lazy(() => TagOptionalDefaultsWithRelationsSchema).array(),
  testCases: z.lazy(() => TestCaseOptionalDefaultsWithRelationsSchema).array(),
  auditLogs: z.lazy(() => AuditLogOptionalDefaultsWithRelationsSchema).array(),
  statistics: z.lazy(() => FlowStatisticsOptionalDefaultsWithRelationsSchema).nullable(),
}))

/////////////////////////////////////////
// FLOW EVENT SCHEMA
/////////////////////////////////////////

export const FlowEventSchema = z.object({
  startedBy: StartedBySchema,
  createdAt: z.coerce.date(),
  flowRunId: z.number().int(),
  flowId: z.string(),
  id: z.number().int(),
  nodeId: z.string(),
  payload: JsonValueSchema.nullable(),
  metadata: JsonValueSchema.nullable(),
})

export type FlowEvent = z.infer<typeof FlowEventSchema>

// FLOW EVENT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const FlowEventOptionalDefaultsSchema = FlowEventSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  id: z.number().int().optional(),
}))

export type FlowEventOptionalDefaults = z.infer<typeof FlowEventOptionalDefaultsSchema>

// FLOW EVENT RELATION SCHEMA
//------------------------------------------------------

export type FlowEventRelations = {
  flowRun: FlowRunWithRelations;
  flow: FlowWithRelations;
};

export type FlowEventWithRelations = Omit<z.infer<typeof FlowEventSchema>, "payload" | "metadata"> & {
  payload?: JsonValueType | null;
  metadata?: JsonValueType | null;
} & FlowEventRelations

export const FlowEventWithRelationsSchema: z.ZodType<FlowEventWithRelations> = FlowEventSchema.merge(z.object({
  flowRun: z.lazy(() => FlowRunWithRelationsSchema),
  flow: z.lazy(() => FlowWithRelationsSchema),
}))

// FLOW EVENT OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type FlowEventOptionalDefaultsRelations = {
  flowRun: FlowRunOptionalDefaultsWithRelations;
  flow: FlowOptionalDefaultsWithRelations;
};

export type FlowEventOptionalDefaultsWithRelations = Omit<z.infer<typeof FlowEventOptionalDefaultsSchema>, "payload" | "metadata"> & {
  payload?: JsonValueType | null;
  metadata?: JsonValueType | null;
} & FlowEventOptionalDefaultsRelations

export const FlowEventOptionalDefaultsWithRelationsSchema: z.ZodType<FlowEventOptionalDefaultsWithRelations> = FlowEventOptionalDefaultsSchema.merge(z.object({
  flowRun: z.lazy(() => FlowRunOptionalDefaultsWithRelationsSchema),
  flow: z.lazy(() => FlowOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// FLOW RUN SCHEMA
/////////////////////////////////////////

export const FlowRunSchema = z.object({
  runStatus: RunStatusSchema,
  startedBy: StartedBySchema,
  flowId: z.string(),
  id: z.number().int(),
  isScheduled: z.boolean().nullable(),
  payload: JsonValueSchema.nullable(),
  metadata: JsonValueSchema.nullable(),
  scheduledJobId: z.number().int().nullable(),
  timeEnded: z.coerce.date().nullable(),
  timeStarted: z.coerce.date(),
})

export type FlowRun = z.infer<typeof FlowRunSchema>

// FLOW RUN OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const FlowRunOptionalDefaultsSchema = FlowRunSchema.merge(z.object({
  id: z.number().int().optional(),
  timeStarted: z.coerce.date().optional(),
}))

export type FlowRunOptionalDefaults = z.infer<typeof FlowRunOptionalDefaultsSchema>

// FLOW RUN RELATION SCHEMA
//------------------------------------------------------

export type FlowRunRelations = {
  flow: FlowWithRelations;
  flowEvents: FlowEventWithRelations[];
  scheduledJob?: ScheduledJobWithRelations | null;
};

export type FlowRunWithRelations = Omit<z.infer<typeof FlowRunSchema>, "payload" | "metadata"> & {
  payload?: JsonValueType | null;
  metadata?: JsonValueType | null;
} & FlowRunRelations

export const FlowRunWithRelationsSchema: z.ZodType<FlowRunWithRelations> = FlowRunSchema.merge(z.object({
  flow: z.lazy(() => FlowWithRelationsSchema),
  flowEvents: z.lazy(() => FlowEventWithRelationsSchema).array(),
  scheduledJob: z.lazy(() => ScheduledJobWithRelationsSchema).nullable(),
}))

// FLOW RUN OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type FlowRunOptionalDefaultsRelations = {
  flow: FlowOptionalDefaultsWithRelations;
  flowEvents: FlowEventOptionalDefaultsWithRelations[];
  scheduledJob?: ScheduledJobOptionalDefaultsWithRelations | null;
};

export type FlowRunOptionalDefaultsWithRelations = Omit<z.infer<typeof FlowRunOptionalDefaultsSchema>, "payload" | "metadata"> & {
  payload?: JsonValueType | null;
  metadata?: JsonValueType | null;
} & FlowRunOptionalDefaultsRelations

export const FlowRunOptionalDefaultsWithRelationsSchema: z.ZodType<FlowRunOptionalDefaultsWithRelations> = FlowRunOptionalDefaultsSchema.merge(z.object({
  flow: z.lazy(() => FlowOptionalDefaultsWithRelationsSchema),
  flowEvents: z.lazy(() => FlowEventOptionalDefaultsWithRelationsSchema).array(),
  scheduledJob: z.lazy(() => ScheduledJobOptionalDefaultsWithRelationsSchema).nullable(),
}))

/////////////////////////////////////////
// INFRASTRUCTURE SCHEMA
/////////////////////////////////////////

export const InfrastructureSchema = z.object({
  type: InfraTypeSchema,
  arn: z.string().nullable(),
  canControl: z.boolean(),
  createdAt: z.coerce.date(),
  data: JsonValueSchema.nullable(),
  id: z.string().cuid(),
  name: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  updatedAt: z.coerce.date(),
  deleted: z.boolean(),
})

export type Infrastructure = z.infer<typeof InfrastructureSchema>

// INFRASTRUCTURE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const InfrastructureOptionalDefaultsSchema = InfrastructureSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
}))

export type InfrastructureOptionalDefaults = z.infer<typeof InfrastructureOptionalDefaultsSchema>

// INFRASTRUCTURE RELATION SCHEMA
//------------------------------------------------------

export type InfrastructureRelations = {
  nodes: NodeWithRelations[];
};

export type InfrastructureWithRelations = Omit<z.infer<typeof InfrastructureSchema>, "data" | "metadata"> & {
  data?: JsonValueType | null;
  metadata?: JsonValueType | null;
} & InfrastructureRelations

export const InfrastructureWithRelationsSchema: z.ZodType<InfrastructureWithRelations> = InfrastructureSchema.merge(z.object({
  nodes: z.lazy(() => NodeWithRelationsSchema).array(),
}))

// INFRASTRUCTURE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type InfrastructureOptionalDefaultsRelations = {
  nodes: NodeOptionalDefaultsWithRelations[];
};

export type InfrastructureOptionalDefaultsWithRelations = Omit<z.infer<typeof InfrastructureOptionalDefaultsSchema>, "data" | "metadata"> & {
  data?: JsonValueType | null;
  metadata?: JsonValueType | null;
} & InfrastructureOptionalDefaultsRelations

export const InfrastructureOptionalDefaultsWithRelationsSchema: z.ZodType<InfrastructureOptionalDefaultsWithRelations> = InfrastructureOptionalDefaultsSchema.merge(z.object({
  nodes: z.lazy(() => NodeOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// INSTANCE SCHEMA
/////////////////////////////////////////

export const InstanceSchema = z.object({
  createdAt: z.coerce.date(),
  description: z.string().nullable(),
  id: z.string().cuid(),
  image: z.string().nullable(),
  logo: z.string().nullable(),
  name: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  updatedAt: z.coerce.date(),
  userId: z.string().nullable(),
})

export type Instance = z.infer<typeof InstanceSchema>

// INSTANCE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const InstanceOptionalDefaultsSchema = InstanceSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type InstanceOptionalDefaults = z.infer<typeof InstanceOptionalDefaultsSchema>

// INSTANCE RELATION SCHEMA
//------------------------------------------------------

export type InstanceRelations = {
  flows: FlowWithRelations[];
  tags: TagWithRelations[];
  tagGroups: TagGroupWithRelations[];
  user?: UserWithRelations | null;
};

export type InstanceWithRelations = Omit<z.infer<typeof InstanceSchema>, "metadata"> & {
  metadata?: JsonValueType | null;
} & InstanceRelations

export const InstanceWithRelationsSchema: z.ZodType<InstanceWithRelations> = InstanceSchema.merge(z.object({
  flows: z.lazy(() => FlowWithRelationsSchema).array(),
  tags: z.lazy(() => TagWithRelationsSchema).array(),
  tagGroups: z.lazy(() => TagGroupWithRelationsSchema).array(),
  user: z.lazy(() => UserWithRelationsSchema).nullable(),
}))

// INSTANCE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type InstanceOptionalDefaultsRelations = {
  flows: FlowOptionalDefaultsWithRelations[];
  tags: TagOptionalDefaultsWithRelations[];
  tagGroups: TagGroupOptionalDefaultsWithRelations[];
  user?: UserOptionalDefaultsWithRelations | null;
};

export type InstanceOptionalDefaultsWithRelations = Omit<z.infer<typeof InstanceOptionalDefaultsSchema>, "metadata"> & {
  metadata?: JsonValueType | null;
} & InstanceOptionalDefaultsRelations

export const InstanceOptionalDefaultsWithRelationsSchema: z.ZodType<InstanceOptionalDefaultsWithRelations> = InstanceOptionalDefaultsSchema.merge(z.object({
  flows: z.lazy(() => FlowOptionalDefaultsWithRelationsSchema).array(),
  tags: z.lazy(() => TagOptionalDefaultsWithRelationsSchema).array(),
  tagGroups: z.lazy(() => TagGroupOptionalDefaultsWithRelationsSchema).array(),
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema).nullable(),
}))

/////////////////////////////////////////
// NODE SCHEMA
/////////////////////////////////////////

export const NodeSchema = z.object({
  type: NodeTypeSchema,
  arn: z.string().nullable(),
  createdAt: z.coerce.date(),
  flowId: z.string(),
  id: z.string().cuid(),
  infrastructureId: z.string().nullable(),
  name: z.string().nullable(),
  position: JsonValueSchema.nullable(),
  metadata: JsonValueSchema.nullable(),
  rfId: z.string(),
  updatedAt: z.coerce.date(),
  deleted: z.boolean(),
})

export type Node = z.infer<typeof NodeSchema>

// NODE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const NodeOptionalDefaultsSchema = NodeSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
}))

export type NodeOptionalDefaults = z.infer<typeof NodeOptionalDefaultsSchema>

// NODE RELATION SCHEMA
//------------------------------------------------------

export type NodeRelations = {
  flow: FlowWithRelations;
  infrastructure?: InfrastructureWithRelations | null;
  secrets: SecretWithRelations[];
  sourceEdges: EdgeWithRelations[];
  targetEdges: EdgeWithRelations[];
  Tag: TagWithRelations[];
};

export type NodeWithRelations = Omit<z.infer<typeof NodeSchema>, "position" | "metadata"> & {
  position?: JsonValueType | null;
  metadata?: JsonValueType | null;
} & NodeRelations

export const NodeWithRelationsSchema: z.ZodType<NodeWithRelations> = NodeSchema.merge(z.object({
  flow: z.lazy(() => FlowWithRelationsSchema),
  infrastructure: z.lazy(() => InfrastructureWithRelationsSchema).nullable(),
  secrets: z.lazy(() => SecretWithRelationsSchema).array(),
  sourceEdges: z.lazy(() => EdgeWithRelationsSchema).array(),
  targetEdges: z.lazy(() => EdgeWithRelationsSchema).array(),
  Tag: z.lazy(() => TagWithRelationsSchema).array(),
}))

// NODE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type NodeOptionalDefaultsRelations = {
  flow: FlowOptionalDefaultsWithRelations;
  infrastructure?: InfrastructureOptionalDefaultsWithRelations | null;
  secrets: SecretOptionalDefaultsWithRelations[];
  sourceEdges: EdgeOptionalDefaultsWithRelations[];
  targetEdges: EdgeOptionalDefaultsWithRelations[];
  Tag: TagOptionalDefaultsWithRelations[];
};

export type NodeOptionalDefaultsWithRelations = Omit<z.infer<typeof NodeOptionalDefaultsSchema>, "position" | "metadata"> & {
  position?: JsonValueType | null;
  metadata?: JsonValueType | null;
} & NodeOptionalDefaultsRelations

export const NodeOptionalDefaultsWithRelationsSchema: z.ZodType<NodeOptionalDefaultsWithRelations> = NodeOptionalDefaultsSchema.merge(z.object({
  flow: z.lazy(() => FlowOptionalDefaultsWithRelationsSchema),
  infrastructure: z.lazy(() => InfrastructureOptionalDefaultsWithRelationsSchema).nullable(),
  secrets: z.lazy(() => SecretOptionalDefaultsWithRelationsSchema).array(),
  sourceEdges: z.lazy(() => EdgeOptionalDefaultsWithRelationsSchema).array(),
  targetEdges: z.lazy(() => EdgeOptionalDefaultsWithRelationsSchema).array(),
  Tag: z.lazy(() => TagOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// SCHEDULED JOB SCHEMA
/////////////////////////////////////////

export const ScheduledJobSchema = z.object({
  createdAt: z.coerce.date(),
  createdBy: z.string(),
  endpoint: z.string(),
  frequency: z.string(),
  id: z.number().int(),
  name: z.string(),
  deleted: z.boolean(),
})

export type ScheduledJob = z.infer<typeof ScheduledJobSchema>

// SCHEDULED JOB OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ScheduledJobOptionalDefaultsSchema = ScheduledJobSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  id: z.number().int().optional(),
  deleted: z.boolean().optional(),
}))

export type ScheduledJobOptionalDefaults = z.infer<typeof ScheduledJobOptionalDefaultsSchema>

// SCHEDULED JOB RELATION SCHEMA
//------------------------------------------------------

export type ScheduledJobRelations = {
  flowRuns: FlowRunWithRelations[];
};

export type ScheduledJobWithRelations = z.infer<typeof ScheduledJobSchema> & ScheduledJobRelations

export const ScheduledJobWithRelationsSchema: z.ZodType<ScheduledJobWithRelations> = ScheduledJobSchema.merge(z.object({
  flowRuns: z.lazy(() => FlowRunWithRelationsSchema).array(),
}))

// SCHEDULED JOB OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type ScheduledJobOptionalDefaultsRelations = {
  flowRuns: FlowRunOptionalDefaultsWithRelations[];
};

export type ScheduledJobOptionalDefaultsWithRelations = z.infer<typeof ScheduledJobOptionalDefaultsSchema> & ScheduledJobOptionalDefaultsRelations

export const ScheduledJobOptionalDefaultsWithRelationsSchema: z.ZodType<ScheduledJobOptionalDefaultsWithRelations> = ScheduledJobOptionalDefaultsSchema.merge(z.object({
  flowRuns: z.lazy(() => FlowRunOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// SECRET SCHEMA
/////////////////////////////////////////

export const SecretSchema = z.object({
  category: SecretCategorySchema,
  name: z.string(),
  createdAt: z.coerce.date(),
  flowId: z.string().nullable(),
  id: z.number().int(),
  nodeId: z.string().nullable(),
  secret: z.string(),
  shouldEncrypt: z.boolean(),
  metadata: JsonValueSchema.nullable(),
  updatedAt: z.coerce.date(),
  deleted: z.boolean(),
})

export type Secret = z.infer<typeof SecretSchema>

// SECRET OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const SecretOptionalDefaultsSchema = SecretSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  id: z.number().int().optional(),
  shouldEncrypt: z.boolean().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
}))

export type SecretOptionalDefaults = z.infer<typeof SecretOptionalDefaultsSchema>

// SECRET RELATION SCHEMA
//------------------------------------------------------

export type SecretRelations = {
  flow?: FlowWithRelations | null;
  node?: NodeWithRelations | null;
};

export type SecretWithRelations = Omit<z.infer<typeof SecretSchema>, "metadata"> & {
  metadata?: JsonValueType | null;
} & SecretRelations

export const SecretWithRelationsSchema: z.ZodType<SecretWithRelations> = SecretSchema.merge(z.object({
  flow: z.lazy(() => FlowWithRelationsSchema).nullable(),
  node: z.lazy(() => NodeWithRelationsSchema).nullable(),
}))

// SECRET OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type SecretOptionalDefaultsRelations = {
  flow?: FlowOptionalDefaultsWithRelations | null;
  node?: NodeOptionalDefaultsWithRelations | null;
};

export type SecretOptionalDefaultsWithRelations = Omit<z.infer<typeof SecretOptionalDefaultsSchema>, "metadata"> & {
  metadata?: JsonValueType | null;
} & SecretOptionalDefaultsRelations

export const SecretOptionalDefaultsWithRelationsSchema: z.ZodType<SecretOptionalDefaultsWithRelations> = SecretOptionalDefaultsSchema.merge(z.object({
  flow: z.lazy(() => FlowOptionalDefaultsWithRelationsSchema).nullable(),
  node: z.lazy(() => NodeOptionalDefaultsWithRelationsSchema).nullable(),
}))

/////////////////////////////////////////
// TAG SCHEMA
/////////////////////////////////////////

export const TagSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deleted: z.boolean(),
  metadata: JsonValueSchema.nullable(),
  flowId: z.string().nullable(),
  nodeId: z.string().nullable(),
  tagGroupId: z.string().nullable(),
  instanceId: z.string(),
})

export type Tag = z.infer<typeof TagSchema>

// TAG OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TagOptionalDefaultsSchema = TagSchema.merge(z.object({
  id: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
}))

export type TagOptionalDefaults = z.infer<typeof TagOptionalDefaultsSchema>

// TAG RELATION SCHEMA
//------------------------------------------------------

export type TagRelations = {
  flow?: FlowWithRelations | null;
  node?: NodeWithRelations | null;
  tagGroup?: TagGroupWithRelations | null;
  instance: InstanceWithRelations;
};

export type TagWithRelations = Omit<z.infer<typeof TagSchema>, "metadata"> & {
  metadata?: JsonValueType | null;
} & TagRelations

export const TagWithRelationsSchema: z.ZodType<TagWithRelations> = TagSchema.merge(z.object({
  flow: z.lazy(() => FlowWithRelationsSchema).nullable(),
  node: z.lazy(() => NodeWithRelationsSchema).nullable(),
  tagGroup: z.lazy(() => TagGroupWithRelationsSchema).nullable(),
  instance: z.lazy(() => InstanceWithRelationsSchema),
}))

// TAG OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type TagOptionalDefaultsRelations = {
  flow?: FlowOptionalDefaultsWithRelations | null;
  node?: NodeOptionalDefaultsWithRelations | null;
  tagGroup?: TagGroupOptionalDefaultsWithRelations | null;
  instance: InstanceOptionalDefaultsWithRelations;
};

export type TagOptionalDefaultsWithRelations = Omit<z.infer<typeof TagOptionalDefaultsSchema>, "metadata"> & {
  metadata?: JsonValueType | null;
} & TagOptionalDefaultsRelations

export const TagOptionalDefaultsWithRelationsSchema: z.ZodType<TagOptionalDefaultsWithRelations> = TagOptionalDefaultsSchema.merge(z.object({
  flow: z.lazy(() => FlowOptionalDefaultsWithRelationsSchema).nullable(),
  node: z.lazy(() => NodeOptionalDefaultsWithRelationsSchema).nullable(),
  tagGroup: z.lazy(() => TagGroupOptionalDefaultsWithRelationsSchema).nullable(),
  instance: z.lazy(() => InstanceOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// TAG GROUP SCHEMA
/////////////////////////////////////////

export const TagGroupSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  color: z.string(),
  deleted: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  metadata: JsonValueSchema.nullable(),
  instanceId: z.string(),
})

export type TagGroup = z.infer<typeof TagGroupSchema>

// TAG GROUP OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TagGroupOptionalDefaultsSchema = TagGroupSchema.merge(z.object({
  id: z.string().cuid().optional(),
  deleted: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type TagGroupOptionalDefaults = z.infer<typeof TagGroupOptionalDefaultsSchema>

// TAG GROUP RELATION SCHEMA
//------------------------------------------------------

export type TagGroupRelations = {
  tags: TagWithRelations[];
  instance: InstanceWithRelations;
};

export type TagGroupWithRelations = Omit<z.infer<typeof TagGroupSchema>, "metadata"> & {
  metadata?: JsonValueType | null;
} & TagGroupRelations

export const TagGroupWithRelationsSchema: z.ZodType<TagGroupWithRelations> = TagGroupSchema.merge(z.object({
  tags: z.lazy(() => TagWithRelationsSchema).array(),
  instance: z.lazy(() => InstanceWithRelationsSchema),
}))

// TAG GROUP OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type TagGroupOptionalDefaultsRelations = {
  tags: TagOptionalDefaultsWithRelations[];
  instance: InstanceOptionalDefaultsWithRelations;
};

export type TagGroupOptionalDefaultsWithRelations = Omit<z.infer<typeof TagGroupOptionalDefaultsSchema>, "metadata"> & {
  metadata?: JsonValueType | null;
} & TagGroupOptionalDefaultsRelations

export const TagGroupOptionalDefaultsWithRelationsSchema: z.ZodType<TagGroupOptionalDefaultsWithRelations> = TagGroupOptionalDefaultsSchema.merge(z.object({
  tags: z.lazy(() => TagOptionalDefaultsWithRelationsSchema).array(),
  instance: z.lazy(() => InstanceOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// TEST CASE SCHEMA
/////////////////////////////////////////

export const TestCaseSchema = z.object({
  color: MantineColorSchema,
  createdAt: z.coerce.date(),
  flowId: z.string(),
  id: z.string().cuid(),
  name: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  updatedAt: z.coerce.date(),
  deleted: z.boolean(),
})

export type TestCase = z.infer<typeof TestCaseSchema>

// TEST CASE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TestCaseOptionalDefaultsSchema = TestCaseSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
}))

export type TestCaseOptionalDefaults = z.infer<typeof TestCaseOptionalDefaultsSchema>

// TEST CASE RELATION SCHEMA
//------------------------------------------------------

export type TestCaseRelations = {
  flow: FlowWithRelations;
};

export type TestCaseWithRelations = Omit<z.infer<typeof TestCaseSchema>, "metadata"> & {
  metadata?: JsonValueType | null;
} & TestCaseRelations

export const TestCaseWithRelationsSchema: z.ZodType<TestCaseWithRelations> = TestCaseSchema.merge(z.object({
  flow: z.lazy(() => FlowWithRelationsSchema),
}))

// TEST CASE OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type TestCaseOptionalDefaultsRelations = {
  flow: FlowOptionalDefaultsWithRelations;
};

export type TestCaseOptionalDefaultsWithRelations = Omit<z.infer<typeof TestCaseOptionalDefaultsSchema>, "metadata"> & {
  metadata?: JsonValueType | null;
} & TestCaseOptionalDefaultsRelations

export const TestCaseOptionalDefaultsWithRelationsSchema: z.ZodType<TestCaseOptionalDefaultsWithRelations> = TestCaseOptionalDefaultsSchema.merge(z.object({
  flow: z.lazy(() => FlowOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
  access_token: z.string().nullable(),
  expires_at: z.number().int().nullable(),
  id: z.string().cuid(),
  id_token: z.string().nullable(),
  oauth_token: z.string().nullable(),
  oauth_token_secret: z.string().nullable(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().nullable(),
  refresh_token_expires_in: z.number().int().nullable(),
  scope: z.string().nullable(),
  session_state: z.string().nullable(),
  token_type: z.string().nullable(),
  type: z.string(),
  userId: z.string(),
})

export type Account = z.infer<typeof AccountSchema>

// ACCOUNT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const AccountOptionalDefaultsSchema = AccountSchema.merge(z.object({
  id: z.string().cuid().optional(),
}))

export type AccountOptionalDefaults = z.infer<typeof AccountOptionalDefaultsSchema>

// ACCOUNT RELATION SCHEMA
//------------------------------------------------------

export type AccountRelations = {
  user: UserWithRelations;
};

export type AccountWithRelations = z.infer<typeof AccountSchema> & AccountRelations

export const AccountWithRelationsSchema: z.ZodType<AccountWithRelations> = AccountSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
}))

// ACCOUNT OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type AccountOptionalDefaultsRelations = {
  user: UserOptionalDefaultsWithRelations;
};

export type AccountOptionalDefaultsWithRelations = z.infer<typeof AccountOptionalDefaultsSchema> & AccountOptionalDefaultsRelations

export const AccountOptionalDefaultsWithRelationsSchema: z.ZodType<AccountOptionalDefaultsWithRelations> = AccountOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  createdAt: z.coerce.date(),
  expires: z.coerce.date(),
  id: z.string().cuid(),
  sessionToken: z.string(),
  userId: z.string(),
})

export type Session = z.infer<typeof SessionSchema>

// SESSION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const SessionOptionalDefaultsSchema = SessionSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
}))

export type SessionOptionalDefaults = z.infer<typeof SessionOptionalDefaultsSchema>

// SESSION RELATION SCHEMA
//------------------------------------------------------

export type SessionRelations = {
  user: UserWithRelations;
};

export type SessionWithRelations = z.infer<typeof SessionSchema> & SessionRelations

export const SessionWithRelationsSchema: z.ZodType<SessionWithRelations> = SessionSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
}))

// SESSION OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type SessionOptionalDefaultsRelations = {
  user: UserOptionalDefaultsWithRelations;
};

export type SessionOptionalDefaultsWithRelations = z.infer<typeof SessionOptionalDefaultsSchema> & SessionOptionalDefaultsRelations

export const SessionOptionalDefaultsWithRelationsSchema: z.ZodType<SessionOptionalDefaultsWithRelations> = SessionOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  email: z.string().nullable(),
  emailVerified: z.coerce.date().nullable(),
  image: z.string().nullable(),
  name: z.string().nullable(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

// USER OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserOptionalDefaultsSchema = UserSchema.merge(z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type UserOptionalDefaults = z.infer<typeof UserOptionalDefaultsSchema>

// USER RELATION SCHEMA
//------------------------------------------------------

export type UserRelations = {
  accounts: AccountWithRelations[];
  instances: InstanceWithRelations[];
  sessions: SessionWithRelations[];
  auditLogs: AuditLogWithRelations[];
};

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(z.object({
  accounts: z.lazy(() => AccountWithRelationsSchema).array(),
  instances: z.lazy(() => InstanceWithRelationsSchema).array(),
  sessions: z.lazy(() => SessionWithRelationsSchema).array(),
  auditLogs: z.lazy(() => AuditLogWithRelationsSchema).array(),
}))

// USER OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserOptionalDefaultsRelations = {
  accounts: AccountOptionalDefaultsWithRelations[];
  instances: InstanceOptionalDefaultsWithRelations[];
  sessions: SessionOptionalDefaultsWithRelations[];
  auditLogs: AuditLogOptionalDefaultsWithRelations[];
};

export type UserOptionalDefaultsWithRelations = z.infer<typeof UserOptionalDefaultsSchema> & UserOptionalDefaultsRelations

export const UserOptionalDefaultsWithRelationsSchema: z.ZodType<UserOptionalDefaultsWithRelations> = UserOptionalDefaultsSchema.merge(z.object({
  accounts: z.lazy(() => AccountOptionalDefaultsWithRelationsSchema).array(),
  instances: z.lazy(() => InstanceOptionalDefaultsWithRelationsSchema).array(),
  sessions: z.lazy(() => SessionOptionalDefaultsWithRelationsSchema).array(),
  auditLogs: z.lazy(() => AuditLogOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// VERIFICATION TOKEN SCHEMA
/////////////////////////////////////////

export const VerificationTokenSchema = z.object({
  createdAt: z.coerce.date(),
  expires: z.coerce.date(),
  identifier: z.string(),
  token: z.string(),
})

export type VerificationToken = z.infer<typeof VerificationTokenSchema>

// VERIFICATION TOKEN OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const VerificationTokenOptionalDefaultsSchema = VerificationTokenSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
}))

export type VerificationTokenOptionalDefaults = z.infer<typeof VerificationTokenOptionalDefaultsSchema>

/////////////////////////////////////////
// AUDIT LOG SCHEMA
/////////////////////////////////////////

export const AuditLogSchema = z.object({
  id: z.string().cuid(),
  entityType: z.string(),
  entityId: z.string(),
  flowId: z.string(),
  changeType: z.string(),
  before: JsonValueSchema.nullable(),
  after: JsonValueSchema.nullable(),
  userId: z.string(),
  timestamp: z.coerce.date(),
})

export type AuditLog = z.infer<typeof AuditLogSchema>

// AUDIT LOG OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const AuditLogOptionalDefaultsSchema = AuditLogSchema.merge(z.object({
  id: z.string().cuid().optional(),
  timestamp: z.coerce.date().optional(),
}))

export type AuditLogOptionalDefaults = z.infer<typeof AuditLogOptionalDefaultsSchema>

// AUDIT LOG RELATION SCHEMA
//------------------------------------------------------

export type AuditLogRelations = {
  user: UserWithRelations;
  flow: FlowWithRelations;
};

export type AuditLogWithRelations = Omit<z.infer<typeof AuditLogSchema>, "before" | "after"> & {
  before?: JsonValueType | null;
  after?: JsonValueType | null;
} & AuditLogRelations

export const AuditLogWithRelationsSchema: z.ZodType<AuditLogWithRelations> = AuditLogSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
  flow: z.lazy(() => FlowWithRelationsSchema),
}))

// AUDIT LOG OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type AuditLogOptionalDefaultsRelations = {
  user: UserOptionalDefaultsWithRelations;
  flow: FlowOptionalDefaultsWithRelations;
};

export type AuditLogOptionalDefaultsWithRelations = Omit<z.infer<typeof AuditLogOptionalDefaultsSchema>, "before" | "after"> & {
  before?: JsonValueType | null;
  after?: JsonValueType | null;
} & AuditLogOptionalDefaultsRelations

export const AuditLogOptionalDefaultsWithRelationsSchema: z.ZodType<AuditLogOptionalDefaultsWithRelations> = AuditLogOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
  flow: z.lazy(() => FlowOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// FLOW STATISTICS SCHEMA
/////////////////////////////////////////

export const FlowStatisticsSchema = z.object({
  id: z.string().cuid(),
  flowId: z.string(),
  totalRuns: z.number().int(),
  successfulRuns: z.number().int(),
  failedRuns: z.number().int(),
  lastUpdated: z.coerce.date(),
})

export type FlowStatistics = z.infer<typeof FlowStatisticsSchema>

// FLOW STATISTICS OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const FlowStatisticsOptionalDefaultsSchema = FlowStatisticsSchema.merge(z.object({
  id: z.string().cuid().optional(),
  totalRuns: z.number().int().optional(),
  successfulRuns: z.number().int().optional(),
  failedRuns: z.number().int().optional(),
  lastUpdated: z.coerce.date().optional(),
}))

export type FlowStatisticsOptionalDefaults = z.infer<typeof FlowStatisticsOptionalDefaultsSchema>

// FLOW STATISTICS RELATION SCHEMA
//------------------------------------------------------

export type FlowStatisticsRelations = {
  flow: FlowWithRelations;
};

export type FlowStatisticsWithRelations = z.infer<typeof FlowStatisticsSchema> & FlowStatisticsRelations

export const FlowStatisticsWithRelationsSchema: z.ZodType<FlowStatisticsWithRelations> = FlowStatisticsSchema.merge(z.object({
  flow: z.lazy(() => FlowWithRelationsSchema),
}))

// FLOW STATISTICS OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type FlowStatisticsOptionalDefaultsRelations = {
  flow: FlowOptionalDefaultsWithRelations;
};

export type FlowStatisticsOptionalDefaultsWithRelations = z.infer<typeof FlowStatisticsOptionalDefaultsSchema> & FlowStatisticsOptionalDefaultsRelations

export const FlowStatisticsOptionalDefaultsWithRelationsSchema: z.ZodType<FlowStatisticsOptionalDefaultsWithRelations> = FlowStatisticsOptionalDefaultsSchema.merge(z.object({
  flow: z.lazy(() => FlowOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// EDGE
//------------------------------------------------------

export const EdgeIncludeSchema: z.ZodType<Prisma.EdgeInclude> = z.object({
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
  sourceNode: z.union([z.boolean(),z.lazy(() => NodeArgsSchema)]).optional(),
  targetNode: z.union([z.boolean(),z.lazy(() => NodeArgsSchema)]).optional(),
}).strict()

export const EdgeArgsSchema: z.ZodType<Prisma.EdgeDefaultArgs> = z.object({
  select: z.lazy(() => EdgeSelectSchema).optional(),
  include: z.lazy(() => EdgeIncludeSchema).optional(),
}).strict();

export const EdgeSelectSchema: z.ZodType<Prisma.EdgeSelect> = z.object({
  id: z.boolean().optional(),
  sourceNodeId: z.boolean().optional(),
  targetNodeId: z.boolean().optional(),
  flowId: z.boolean().optional(),
  rfId: z.boolean().optional(),
  label: z.boolean().optional(),
  isActive: z.boolean().optional(),
  type: z.boolean().optional(),
  normalizedKey: z.boolean().optional(),
  metadata: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deleted: z.boolean().optional(),
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
  sourceNode: z.union([z.boolean(),z.lazy(() => NodeArgsSchema)]).optional(),
  targetNode: z.union([z.boolean(),z.lazy(() => NodeArgsSchema)]).optional(),
}).strict()

// FLOW
//------------------------------------------------------

export const FlowIncludeSchema: z.ZodType<Prisma.FlowInclude> = z.object({
  edges: z.union([z.boolean(),z.lazy(() => EdgeFindManyArgsSchema)]).optional(),
  flowRuns: z.union([z.boolean(),z.lazy(() => FlowRunFindManyArgsSchema)]).optional(),
  flowEvents: z.union([z.boolean(),z.lazy(() => FlowEventFindManyArgsSchema)]).optional(),
  instance: z.union([z.boolean(),z.lazy(() => InstanceArgsSchema)]).optional(),
  nodes: z.union([z.boolean(),z.lazy(() => NodeFindManyArgsSchema)]).optional(),
  secrets: z.union([z.boolean(),z.lazy(() => SecretFindManyArgsSchema)]).optional(),
  tags: z.union([z.boolean(),z.lazy(() => TagFindManyArgsSchema)]).optional(),
  testCases: z.union([z.boolean(),z.lazy(() => TestCaseFindManyArgsSchema)]).optional(),
  auditLogs: z.union([z.boolean(),z.lazy(() => AuditLogFindManyArgsSchema)]).optional(),
  statistics: z.union([z.boolean(),z.lazy(() => FlowStatisticsArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => FlowCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const FlowArgsSchema: z.ZodType<Prisma.FlowDefaultArgs> = z.object({
  select: z.lazy(() => FlowSelectSchema).optional(),
  include: z.lazy(() => FlowIncludeSchema).optional(),
}).strict();

export const FlowCountOutputTypeArgsSchema: z.ZodType<Prisma.FlowCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => FlowCountOutputTypeSelectSchema).nullish(),
}).strict();

export const FlowCountOutputTypeSelectSchema: z.ZodType<Prisma.FlowCountOutputTypeSelect> = z.object({
  edges: z.boolean().optional(),
  flowRuns: z.boolean().optional(),
  flowEvents: z.boolean().optional(),
  nodes: z.boolean().optional(),
  secrets: z.boolean().optional(),
  tags: z.boolean().optional(),
  testCases: z.boolean().optional(),
  auditLogs: z.boolean().optional(),
}).strict();

export const FlowSelectSchema: z.ZodType<Prisma.FlowSelect> = z.object({
  createdAt: z.boolean().optional(),
  id: z.boolean().optional(),
  instanceId: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
  method: z.boolean().optional(),
  name: z.boolean().optional(),
  metadata: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  viewport: z.boolean().optional(),
  deleted: z.boolean().optional(),
  edges: z.union([z.boolean(),z.lazy(() => EdgeFindManyArgsSchema)]).optional(),
  flowRuns: z.union([z.boolean(),z.lazy(() => FlowRunFindManyArgsSchema)]).optional(),
  flowEvents: z.union([z.boolean(),z.lazy(() => FlowEventFindManyArgsSchema)]).optional(),
  instance: z.union([z.boolean(),z.lazy(() => InstanceArgsSchema)]).optional(),
  nodes: z.union([z.boolean(),z.lazy(() => NodeFindManyArgsSchema)]).optional(),
  secrets: z.union([z.boolean(),z.lazy(() => SecretFindManyArgsSchema)]).optional(),
  tags: z.union([z.boolean(),z.lazy(() => TagFindManyArgsSchema)]).optional(),
  testCases: z.union([z.boolean(),z.lazy(() => TestCaseFindManyArgsSchema)]).optional(),
  auditLogs: z.union([z.boolean(),z.lazy(() => AuditLogFindManyArgsSchema)]).optional(),
  statistics: z.union([z.boolean(),z.lazy(() => FlowStatisticsArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => FlowCountOutputTypeArgsSchema)]).optional(),
}).strict()

// FLOW EVENT
//------------------------------------------------------

export const FlowEventIncludeSchema: z.ZodType<Prisma.FlowEventInclude> = z.object({
  flowRun: z.union([z.boolean(),z.lazy(() => FlowRunArgsSchema)]).optional(),
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
}).strict()

export const FlowEventArgsSchema: z.ZodType<Prisma.FlowEventDefaultArgs> = z.object({
  select: z.lazy(() => FlowEventSelectSchema).optional(),
  include: z.lazy(() => FlowEventIncludeSchema).optional(),
}).strict();

export const FlowEventSelectSchema: z.ZodType<Prisma.FlowEventSelect> = z.object({
  createdAt: z.boolean().optional(),
  flowRunId: z.boolean().optional(),
  flowId: z.boolean().optional(),
  id: z.boolean().optional(),
  nodeId: z.boolean().optional(),
  payload: z.boolean().optional(),
  metadata: z.boolean().optional(),
  startedBy: z.boolean().optional(),
  flowRun: z.union([z.boolean(),z.lazy(() => FlowRunArgsSchema)]).optional(),
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
}).strict()

// FLOW RUN
//------------------------------------------------------

export const FlowRunIncludeSchema: z.ZodType<Prisma.FlowRunInclude> = z.object({
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
  flowEvents: z.union([z.boolean(),z.lazy(() => FlowEventFindManyArgsSchema)]).optional(),
  scheduledJob: z.union([z.boolean(),z.lazy(() => ScheduledJobArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => FlowRunCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const FlowRunArgsSchema: z.ZodType<Prisma.FlowRunDefaultArgs> = z.object({
  select: z.lazy(() => FlowRunSelectSchema).optional(),
  include: z.lazy(() => FlowRunIncludeSchema).optional(),
}).strict();

export const FlowRunCountOutputTypeArgsSchema: z.ZodType<Prisma.FlowRunCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => FlowRunCountOutputTypeSelectSchema).nullish(),
}).strict();

export const FlowRunCountOutputTypeSelectSchema: z.ZodType<Prisma.FlowRunCountOutputTypeSelect> = z.object({
  flowEvents: z.boolean().optional(),
}).strict();

export const FlowRunSelectSchema: z.ZodType<Prisma.FlowRunSelect> = z.object({
  flowId: z.boolean().optional(),
  id: z.boolean().optional(),
  isScheduled: z.boolean().optional(),
  payload: z.boolean().optional(),
  metadata: z.boolean().optional(),
  runStatus: z.boolean().optional(),
  scheduledJobId: z.boolean().optional(),
  startedBy: z.boolean().optional(),
  timeEnded: z.boolean().optional(),
  timeStarted: z.boolean().optional(),
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
  flowEvents: z.union([z.boolean(),z.lazy(() => FlowEventFindManyArgsSchema)]).optional(),
  scheduledJob: z.union([z.boolean(),z.lazy(() => ScheduledJobArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => FlowRunCountOutputTypeArgsSchema)]).optional(),
}).strict()

// INFRASTRUCTURE
//------------------------------------------------------

export const InfrastructureIncludeSchema: z.ZodType<Prisma.InfrastructureInclude> = z.object({
  nodes: z.union([z.boolean(),z.lazy(() => NodeFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => InfrastructureCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const InfrastructureArgsSchema: z.ZodType<Prisma.InfrastructureDefaultArgs> = z.object({
  select: z.lazy(() => InfrastructureSelectSchema).optional(),
  include: z.lazy(() => InfrastructureIncludeSchema).optional(),
}).strict();

export const InfrastructureCountOutputTypeArgsSchema: z.ZodType<Prisma.InfrastructureCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => InfrastructureCountOutputTypeSelectSchema).nullish(),
}).strict();

export const InfrastructureCountOutputTypeSelectSchema: z.ZodType<Prisma.InfrastructureCountOutputTypeSelect> = z.object({
  nodes: z.boolean().optional(),
}).strict();

export const InfrastructureSelectSchema: z.ZodType<Prisma.InfrastructureSelect> = z.object({
  arn: z.boolean().optional(),
  canControl: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  data: z.boolean().optional(),
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  type: z.boolean().optional(),
  metadata: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deleted: z.boolean().optional(),
  nodes: z.union([z.boolean(),z.lazy(() => NodeFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => InfrastructureCountOutputTypeArgsSchema)]).optional(),
}).strict()

// INSTANCE
//------------------------------------------------------

export const InstanceIncludeSchema: z.ZodType<Prisma.InstanceInclude> = z.object({
  flows: z.union([z.boolean(),z.lazy(() => FlowFindManyArgsSchema)]).optional(),
  tags: z.union([z.boolean(),z.lazy(() => TagFindManyArgsSchema)]).optional(),
  tagGroups: z.union([z.boolean(),z.lazy(() => TagGroupFindManyArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => InstanceCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const InstanceArgsSchema: z.ZodType<Prisma.InstanceDefaultArgs> = z.object({
  select: z.lazy(() => InstanceSelectSchema).optional(),
  include: z.lazy(() => InstanceIncludeSchema).optional(),
}).strict();

export const InstanceCountOutputTypeArgsSchema: z.ZodType<Prisma.InstanceCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => InstanceCountOutputTypeSelectSchema).nullish(),
}).strict();

export const InstanceCountOutputTypeSelectSchema: z.ZodType<Prisma.InstanceCountOutputTypeSelect> = z.object({
  flows: z.boolean().optional(),
  tags: z.boolean().optional(),
  tagGroups: z.boolean().optional(),
}).strict();

export const InstanceSelectSchema: z.ZodType<Prisma.InstanceSelect> = z.object({
  createdAt: z.boolean().optional(),
  description: z.boolean().optional(),
  id: z.boolean().optional(),
  image: z.boolean().optional(),
  logo: z.boolean().optional(),
  name: z.boolean().optional(),
  metadata: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  userId: z.boolean().optional(),
  flows: z.union([z.boolean(),z.lazy(() => FlowFindManyArgsSchema)]).optional(),
  tags: z.union([z.boolean(),z.lazy(() => TagFindManyArgsSchema)]).optional(),
  tagGroups: z.union([z.boolean(),z.lazy(() => TagGroupFindManyArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => InstanceCountOutputTypeArgsSchema)]).optional(),
}).strict()

// NODE
//------------------------------------------------------

export const NodeIncludeSchema: z.ZodType<Prisma.NodeInclude> = z.object({
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
  infrastructure: z.union([z.boolean(),z.lazy(() => InfrastructureArgsSchema)]).optional(),
  secrets: z.union([z.boolean(),z.lazy(() => SecretFindManyArgsSchema)]).optional(),
  sourceEdges: z.union([z.boolean(),z.lazy(() => EdgeFindManyArgsSchema)]).optional(),
  targetEdges: z.union([z.boolean(),z.lazy(() => EdgeFindManyArgsSchema)]).optional(),
  Tag: z.union([z.boolean(),z.lazy(() => TagFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => NodeCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const NodeArgsSchema: z.ZodType<Prisma.NodeDefaultArgs> = z.object({
  select: z.lazy(() => NodeSelectSchema).optional(),
  include: z.lazy(() => NodeIncludeSchema).optional(),
}).strict();

export const NodeCountOutputTypeArgsSchema: z.ZodType<Prisma.NodeCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => NodeCountOutputTypeSelectSchema).nullish(),
}).strict();

export const NodeCountOutputTypeSelectSchema: z.ZodType<Prisma.NodeCountOutputTypeSelect> = z.object({
  secrets: z.boolean().optional(),
  sourceEdges: z.boolean().optional(),
  targetEdges: z.boolean().optional(),
  Tag: z.boolean().optional(),
}).strict();

export const NodeSelectSchema: z.ZodType<Prisma.NodeSelect> = z.object({
  arn: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  flowId: z.boolean().optional(),
  id: z.boolean().optional(),
  infrastructureId: z.boolean().optional(),
  name: z.boolean().optional(),
  position: z.boolean().optional(),
  metadata: z.boolean().optional(),
  rfId: z.boolean().optional(),
  type: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deleted: z.boolean().optional(),
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
  infrastructure: z.union([z.boolean(),z.lazy(() => InfrastructureArgsSchema)]).optional(),
  secrets: z.union([z.boolean(),z.lazy(() => SecretFindManyArgsSchema)]).optional(),
  sourceEdges: z.union([z.boolean(),z.lazy(() => EdgeFindManyArgsSchema)]).optional(),
  targetEdges: z.union([z.boolean(),z.lazy(() => EdgeFindManyArgsSchema)]).optional(),
  Tag: z.union([z.boolean(),z.lazy(() => TagFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => NodeCountOutputTypeArgsSchema)]).optional(),
}).strict()

// SCHEDULED JOB
//------------------------------------------------------

export const ScheduledJobIncludeSchema: z.ZodType<Prisma.ScheduledJobInclude> = z.object({
  flowRuns: z.union([z.boolean(),z.lazy(() => FlowRunFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ScheduledJobCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ScheduledJobArgsSchema: z.ZodType<Prisma.ScheduledJobDefaultArgs> = z.object({
  select: z.lazy(() => ScheduledJobSelectSchema).optional(),
  include: z.lazy(() => ScheduledJobIncludeSchema).optional(),
}).strict();

export const ScheduledJobCountOutputTypeArgsSchema: z.ZodType<Prisma.ScheduledJobCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ScheduledJobCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ScheduledJobCountOutputTypeSelectSchema: z.ZodType<Prisma.ScheduledJobCountOutputTypeSelect> = z.object({
  flowRuns: z.boolean().optional(),
}).strict();

export const ScheduledJobSelectSchema: z.ZodType<Prisma.ScheduledJobSelect> = z.object({
  createdAt: z.boolean().optional(),
  createdBy: z.boolean().optional(),
  endpoint: z.boolean().optional(),
  frequency: z.boolean().optional(),
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  deleted: z.boolean().optional(),
  flowRuns: z.union([z.boolean(),z.lazy(() => FlowRunFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ScheduledJobCountOutputTypeArgsSchema)]).optional(),
}).strict()

// SECRET
//------------------------------------------------------

export const SecretIncludeSchema: z.ZodType<Prisma.SecretInclude> = z.object({
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
  node: z.union([z.boolean(),z.lazy(() => NodeArgsSchema)]).optional(),
}).strict()

export const SecretArgsSchema: z.ZodType<Prisma.SecretDefaultArgs> = z.object({
  select: z.lazy(() => SecretSelectSchema).optional(),
  include: z.lazy(() => SecretIncludeSchema).optional(),
}).strict();

export const SecretSelectSchema: z.ZodType<Prisma.SecretSelect> = z.object({
  name: z.boolean().optional(),
  category: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  flowId: z.boolean().optional(),
  id: z.boolean().optional(),
  nodeId: z.boolean().optional(),
  secret: z.boolean().optional(),
  shouldEncrypt: z.boolean().optional(),
  metadata: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deleted: z.boolean().optional(),
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
  node: z.union([z.boolean(),z.lazy(() => NodeArgsSchema)]).optional(),
}).strict()

// TAG
//------------------------------------------------------

export const TagIncludeSchema: z.ZodType<Prisma.TagInclude> = z.object({
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
  node: z.union([z.boolean(),z.lazy(() => NodeArgsSchema)]).optional(),
  tagGroup: z.union([z.boolean(),z.lazy(() => TagGroupArgsSchema)]).optional(),
  instance: z.union([z.boolean(),z.lazy(() => InstanceArgsSchema)]).optional(),
}).strict()

export const TagArgsSchema: z.ZodType<Prisma.TagDefaultArgs> = z.object({
  select: z.lazy(() => TagSelectSchema).optional(),
  include: z.lazy(() => TagIncludeSchema).optional(),
}).strict();

export const TagSelectSchema: z.ZodType<Prisma.TagSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deleted: z.boolean().optional(),
  metadata: z.boolean().optional(),
  flowId: z.boolean().optional(),
  nodeId: z.boolean().optional(),
  tagGroupId: z.boolean().optional(),
  instanceId: z.boolean().optional(),
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
  node: z.union([z.boolean(),z.lazy(() => NodeArgsSchema)]).optional(),
  tagGroup: z.union([z.boolean(),z.lazy(() => TagGroupArgsSchema)]).optional(),
  instance: z.union([z.boolean(),z.lazy(() => InstanceArgsSchema)]).optional(),
}).strict()

// TAG GROUP
//------------------------------------------------------

export const TagGroupIncludeSchema: z.ZodType<Prisma.TagGroupInclude> = z.object({
  tags: z.union([z.boolean(),z.lazy(() => TagFindManyArgsSchema)]).optional(),
  instance: z.union([z.boolean(),z.lazy(() => InstanceArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TagGroupCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const TagGroupArgsSchema: z.ZodType<Prisma.TagGroupDefaultArgs> = z.object({
  select: z.lazy(() => TagGroupSelectSchema).optional(),
  include: z.lazy(() => TagGroupIncludeSchema).optional(),
}).strict();

export const TagGroupCountOutputTypeArgsSchema: z.ZodType<Prisma.TagGroupCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => TagGroupCountOutputTypeSelectSchema).nullish(),
}).strict();

export const TagGroupCountOutputTypeSelectSchema: z.ZodType<Prisma.TagGroupCountOutputTypeSelect> = z.object({
  tags: z.boolean().optional(),
}).strict();

export const TagGroupSelectSchema: z.ZodType<Prisma.TagGroupSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  color: z.boolean().optional(),
  deleted: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  metadata: z.boolean().optional(),
  instanceId: z.boolean().optional(),
  tags: z.union([z.boolean(),z.lazy(() => TagFindManyArgsSchema)]).optional(),
  instance: z.union([z.boolean(),z.lazy(() => InstanceArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TagGroupCountOutputTypeArgsSchema)]).optional(),
}).strict()

// TEST CASE
//------------------------------------------------------

export const TestCaseIncludeSchema: z.ZodType<Prisma.TestCaseInclude> = z.object({
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
}).strict()

export const TestCaseArgsSchema: z.ZodType<Prisma.TestCaseDefaultArgs> = z.object({
  select: z.lazy(() => TestCaseSelectSchema).optional(),
  include: z.lazy(() => TestCaseIncludeSchema).optional(),
}).strict();

export const TestCaseSelectSchema: z.ZodType<Prisma.TestCaseSelect> = z.object({
  color: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  flowId: z.boolean().optional(),
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  metadata: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deleted: z.boolean().optional(),
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
}).strict()

// ACCOUNT
//------------------------------------------------------

export const AccountIncludeSchema: z.ZodType<Prisma.AccountInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const AccountArgsSchema: z.ZodType<Prisma.AccountDefaultArgs> = z.object({
  select: z.lazy(() => AccountSelectSchema).optional(),
  include: z.lazy(() => AccountIncludeSchema).optional(),
}).strict();

export const AccountSelectSchema: z.ZodType<Prisma.AccountSelect> = z.object({
  access_token: z.boolean().optional(),
  expires_at: z.boolean().optional(),
  id: z.boolean().optional(),
  id_token: z.boolean().optional(),
  oauth_token: z.boolean().optional(),
  oauth_token_secret: z.boolean().optional(),
  provider: z.boolean().optional(),
  providerAccountId: z.boolean().optional(),
  refresh_token: z.boolean().optional(),
  refresh_token_expires_in: z.boolean().optional(),
  scope: z.boolean().optional(),
  session_state: z.boolean().optional(),
  token_type: z.boolean().optional(),
  type: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// SESSION
//------------------------------------------------------

export const SessionIncludeSchema: z.ZodType<Prisma.SessionInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const SessionArgsSchema: z.ZodType<Prisma.SessionDefaultArgs> = z.object({
  select: z.lazy(() => SessionSelectSchema).optional(),
  include: z.lazy(() => SessionIncludeSchema).optional(),
}).strict();

export const SessionSelectSchema: z.ZodType<Prisma.SessionSelect> = z.object({
  createdAt: z.boolean().optional(),
  expires: z.boolean().optional(),
  id: z.boolean().optional(),
  sessionToken: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  accounts: z.union([z.boolean(),z.lazy(() => AccountFindManyArgsSchema)]).optional(),
  instances: z.union([z.boolean(),z.lazy(() => InstanceFindManyArgsSchema)]).optional(),
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  auditLogs: z.union([z.boolean(),z.lazy(() => AuditLogFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  accounts: z.boolean().optional(),
  instances: z.boolean().optional(),
  sessions: z.boolean().optional(),
  auditLogs: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  email: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  image: z.boolean().optional(),
  name: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  accounts: z.union([z.boolean(),z.lazy(() => AccountFindManyArgsSchema)]).optional(),
  instances: z.union([z.boolean(),z.lazy(() => InstanceFindManyArgsSchema)]).optional(),
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  auditLogs: z.union([z.boolean(),z.lazy(() => AuditLogFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// VERIFICATION TOKEN
//------------------------------------------------------

export const VerificationTokenSelectSchema: z.ZodType<Prisma.VerificationTokenSelect> = z.object({
  createdAt: z.boolean().optional(),
  expires: z.boolean().optional(),
  identifier: z.boolean().optional(),
  token: z.boolean().optional(),
}).strict()

// AUDIT LOG
//------------------------------------------------------

export const AuditLogIncludeSchema: z.ZodType<Prisma.AuditLogInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
}).strict()

export const AuditLogArgsSchema: z.ZodType<Prisma.AuditLogDefaultArgs> = z.object({
  select: z.lazy(() => AuditLogSelectSchema).optional(),
  include: z.lazy(() => AuditLogIncludeSchema).optional(),
}).strict();

export const AuditLogSelectSchema: z.ZodType<Prisma.AuditLogSelect> = z.object({
  id: z.boolean().optional(),
  entityType: z.boolean().optional(),
  entityId: z.boolean().optional(),
  flowId: z.boolean().optional(),
  changeType: z.boolean().optional(),
  before: z.boolean().optional(),
  after: z.boolean().optional(),
  userId: z.boolean().optional(),
  timestamp: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
}).strict()

// FLOW STATISTICS
//------------------------------------------------------

export const FlowStatisticsIncludeSchema: z.ZodType<Prisma.FlowStatisticsInclude> = z.object({
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
}).strict()

export const FlowStatisticsArgsSchema: z.ZodType<Prisma.FlowStatisticsDefaultArgs> = z.object({
  select: z.lazy(() => FlowStatisticsSelectSchema).optional(),
  include: z.lazy(() => FlowStatisticsIncludeSchema).optional(),
}).strict();

export const FlowStatisticsSelectSchema: z.ZodType<Prisma.FlowStatisticsSelect> = z.object({
  id: z.boolean().optional(),
  flowId: z.boolean().optional(),
  totalRuns: z.boolean().optional(),
  successfulRuns: z.boolean().optional(),
  failedRuns: z.boolean().optional(),
  lastUpdated: z.boolean().optional(),
  flow: z.union([z.boolean(),z.lazy(() => FlowArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const EdgeWhereInputSchema: z.ZodType<Prisma.EdgeWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EdgeWhereInputSchema),z.lazy(() => EdgeWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EdgeWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EdgeWhereInputSchema),z.lazy(() => EdgeWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sourceNodeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  targetNodeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  rfId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  label: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  type: z.union([ z.lazy(() => EnumEdgeTypeFilterSchema),z.lazy(() => EdgeTypeSchema) ]).optional(),
  normalizedKey: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
  sourceNode: z.union([ z.lazy(() => NodeScalarRelationFilterSchema),z.lazy(() => NodeWhereInputSchema) ]).optional(),
  targetNode: z.union([ z.lazy(() => NodeScalarRelationFilterSchema),z.lazy(() => NodeWhereInputSchema) ]).optional(),
}).strict();

export const EdgeOrderByWithRelationInputSchema: z.ZodType<Prisma.EdgeOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sourceNodeId: z.lazy(() => SortOrderSchema).optional(),
  targetNodeId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  rfId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  label: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  normalizedKey: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  flow: z.lazy(() => FlowOrderByWithRelationInputSchema).optional(),
  sourceNode: z.lazy(() => NodeOrderByWithRelationInputSchema).optional(),
  targetNode: z.lazy(() => NodeOrderByWithRelationInputSchema).optional()
}).strict();

export const EdgeWhereUniqueInputSchema: z.ZodType<Prisma.EdgeWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    sourceNodeId_targetNodeId: z.lazy(() => EdgeSourceNodeIdTargetNodeIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    sourceNodeId_targetNodeId: z.lazy(() => EdgeSourceNodeIdTargetNodeIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  sourceNodeId_targetNodeId: z.lazy(() => EdgeSourceNodeIdTargetNodeIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => EdgeWhereInputSchema),z.lazy(() => EdgeWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EdgeWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EdgeWhereInputSchema),z.lazy(() => EdgeWhereInputSchema).array() ]).optional(),
  sourceNodeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  targetNodeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  rfId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  label: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  type: z.union([ z.lazy(() => EnumEdgeTypeFilterSchema),z.lazy(() => EdgeTypeSchema) ]).optional(),
  normalizedKey: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
  sourceNode: z.union([ z.lazy(() => NodeScalarRelationFilterSchema),z.lazy(() => NodeWhereInputSchema) ]).optional(),
  targetNode: z.union([ z.lazy(() => NodeScalarRelationFilterSchema),z.lazy(() => NodeWhereInputSchema) ]).optional(),
}).strict());

export const EdgeOrderByWithAggregationInputSchema: z.ZodType<Prisma.EdgeOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sourceNodeId: z.lazy(() => SortOrderSchema).optional(),
  targetNodeId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  rfId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  label: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  normalizedKey: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EdgeCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EdgeMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EdgeMinOrderByAggregateInputSchema).optional()
}).strict();

export const EdgeScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.EdgeScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => EdgeScalarWhereWithAggregatesInputSchema),z.lazy(() => EdgeScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => EdgeScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EdgeScalarWhereWithAggregatesInputSchema),z.lazy(() => EdgeScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  sourceNodeId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  targetNodeId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  flowId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  rfId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  label: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  type: z.union([ z.lazy(() => EnumEdgeTypeWithAggregatesFilterSchema),z.lazy(() => EdgeTypeSchema) ]).optional(),
  normalizedKey: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
}).strict();

export const FlowWhereInputSchema: z.ZodType<Prisma.FlowWhereInput> = z.object({
  AND: z.union([ z.lazy(() => FlowWhereInputSchema),z.lazy(() => FlowWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowWhereInputSchema),z.lazy(() => FlowWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isEnabled: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  method: z.union([ z.lazy(() => EnumFlowMethodFilterSchema),z.lazy(() => FlowMethodSchema) ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  viewport: z.lazy(() => JsonNullableFilterSchema).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  edges: z.lazy(() => EdgeListRelationFilterSchema).optional(),
  flowRuns: z.lazy(() => FlowRunListRelationFilterSchema).optional(),
  flowEvents: z.lazy(() => FlowEventListRelationFilterSchema).optional(),
  instance: z.union([ z.lazy(() => InstanceScalarRelationFilterSchema),z.lazy(() => InstanceWhereInputSchema) ]).optional(),
  nodes: z.lazy(() => NodeListRelationFilterSchema).optional(),
  secrets: z.lazy(() => SecretListRelationFilterSchema).optional(),
  tags: z.lazy(() => TagListRelationFilterSchema).optional(),
  testCases: z.lazy(() => TestCaseListRelationFilterSchema).optional(),
  auditLogs: z.lazy(() => AuditLogListRelationFilterSchema).optional(),
  statistics: z.union([ z.lazy(() => FlowStatisticsNullableScalarRelationFilterSchema),z.lazy(() => FlowStatisticsWhereInputSchema) ]).optional().nullable(),
}).strict();

export const FlowOrderByWithRelationInputSchema: z.ZodType<Prisma.FlowOrderByWithRelationInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  isEnabled: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  viewport: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  edges: z.lazy(() => EdgeOrderByRelationAggregateInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunOrderByRelationAggregateInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventOrderByRelationAggregateInputSchema).optional(),
  instance: z.lazy(() => InstanceOrderByWithRelationInputSchema).optional(),
  nodes: z.lazy(() => NodeOrderByRelationAggregateInputSchema).optional(),
  secrets: z.lazy(() => SecretOrderByRelationAggregateInputSchema).optional(),
  tags: z.lazy(() => TagOrderByRelationAggregateInputSchema).optional(),
  testCases: z.lazy(() => TestCaseOrderByRelationAggregateInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogOrderByRelationAggregateInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsOrderByWithRelationInputSchema).optional()
}).strict();

export const FlowWhereUniqueInputSchema: z.ZodType<Prisma.FlowWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    id_instanceId: z.lazy(() => FlowIdInstanceIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    id_instanceId: z.lazy(() => FlowIdInstanceIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  id_instanceId: z.lazy(() => FlowIdInstanceIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => FlowWhereInputSchema),z.lazy(() => FlowWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowWhereInputSchema),z.lazy(() => FlowWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isEnabled: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  method: z.union([ z.lazy(() => EnumFlowMethodFilterSchema),z.lazy(() => FlowMethodSchema) ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  viewport: z.lazy(() => JsonNullableFilterSchema).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  edges: z.lazy(() => EdgeListRelationFilterSchema).optional(),
  flowRuns: z.lazy(() => FlowRunListRelationFilterSchema).optional(),
  flowEvents: z.lazy(() => FlowEventListRelationFilterSchema).optional(),
  instance: z.union([ z.lazy(() => InstanceScalarRelationFilterSchema),z.lazy(() => InstanceWhereInputSchema) ]).optional(),
  nodes: z.lazy(() => NodeListRelationFilterSchema).optional(),
  secrets: z.lazy(() => SecretListRelationFilterSchema).optional(),
  tags: z.lazy(() => TagListRelationFilterSchema).optional(),
  testCases: z.lazy(() => TestCaseListRelationFilterSchema).optional(),
  auditLogs: z.lazy(() => AuditLogListRelationFilterSchema).optional(),
  statistics: z.union([ z.lazy(() => FlowStatisticsNullableScalarRelationFilterSchema),z.lazy(() => FlowStatisticsWhereInputSchema) ]).optional().nullable(),
}).strict());

export const FlowOrderByWithAggregationInputSchema: z.ZodType<Prisma.FlowOrderByWithAggregationInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  isEnabled: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  viewport: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => FlowCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => FlowMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => FlowMinOrderByAggregateInputSchema).optional()
}).strict();

export const FlowScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.FlowScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => FlowScalarWhereWithAggregatesInputSchema),z.lazy(() => FlowScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowScalarWhereWithAggregatesInputSchema),z.lazy(() => FlowScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  instanceId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  isEnabled: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  method: z.union([ z.lazy(() => EnumFlowMethodWithAggregatesFilterSchema),z.lazy(() => FlowMethodSchema) ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  viewport: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  deleted: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
}).strict();

export const FlowEventWhereInputSchema: z.ZodType<Prisma.FlowEventWhereInput> = z.object({
  AND: z.union([ z.lazy(() => FlowEventWhereInputSchema),z.lazy(() => FlowEventWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowEventWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowEventWhereInputSchema),z.lazy(() => FlowEventWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flowRunId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  nodeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  payload: z.lazy(() => JsonNullableFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  startedBy: z.union([ z.lazy(() => EnumStartedByFilterSchema),z.lazy(() => StartedBySchema) ]).optional(),
  flowRun: z.union([ z.lazy(() => FlowRunScalarRelationFilterSchema),z.lazy(() => FlowRunWhereInputSchema) ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
}).strict();

export const FlowEventOrderByWithRelationInputSchema: z.ZodType<Prisma.FlowEventOrderByWithRelationInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowRunId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.lazy(() => SortOrderSchema).optional(),
  payload: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  startedBy: z.lazy(() => SortOrderSchema).optional(),
  flowRun: z.lazy(() => FlowRunOrderByWithRelationInputSchema).optional(),
  flow: z.lazy(() => FlowOrderByWithRelationInputSchema).optional()
}).strict();

export const FlowEventWhereUniqueInputSchema: z.ZodType<Prisma.FlowEventWhereUniqueInput> = z.object({
  id: z.number().int()
})
.and(z.object({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => FlowEventWhereInputSchema),z.lazy(() => FlowEventWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowEventWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowEventWhereInputSchema),z.lazy(() => FlowEventWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flowRunId: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  nodeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  payload: z.lazy(() => JsonNullableFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  startedBy: z.union([ z.lazy(() => EnumStartedByFilterSchema),z.lazy(() => StartedBySchema) ]).optional(),
  flowRun: z.union([ z.lazy(() => FlowRunScalarRelationFilterSchema),z.lazy(() => FlowRunWhereInputSchema) ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
}).strict());

export const FlowEventOrderByWithAggregationInputSchema: z.ZodType<Prisma.FlowEventOrderByWithAggregationInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowRunId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.lazy(() => SortOrderSchema).optional(),
  payload: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  startedBy: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => FlowEventCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => FlowEventAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => FlowEventMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => FlowEventMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => FlowEventSumOrderByAggregateInputSchema).optional()
}).strict();

export const FlowEventScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.FlowEventScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => FlowEventScalarWhereWithAggregatesInputSchema),z.lazy(() => FlowEventScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowEventScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowEventScalarWhereWithAggregatesInputSchema),z.lazy(() => FlowEventScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  flowRunId: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  flowId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  nodeId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  payload: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  startedBy: z.union([ z.lazy(() => EnumStartedByWithAggregatesFilterSchema),z.lazy(() => StartedBySchema) ]).optional(),
}).strict();

export const FlowRunWhereInputSchema: z.ZodType<Prisma.FlowRunWhereInput> = z.object({
  AND: z.union([ z.lazy(() => FlowRunWhereInputSchema),z.lazy(() => FlowRunWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowRunWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowRunWhereInputSchema),z.lazy(() => FlowRunWhereInputSchema).array() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  isScheduled: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  payload: z.lazy(() => JsonNullableFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  runStatus: z.union([ z.lazy(() => EnumRunStatusFilterSchema),z.lazy(() => RunStatusSchema) ]).optional(),
  scheduledJobId: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  startedBy: z.union([ z.lazy(() => EnumStartedByFilterSchema),z.lazy(() => StartedBySchema) ]).optional(),
  timeEnded: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  timeStarted: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
  flowEvents: z.lazy(() => FlowEventListRelationFilterSchema).optional(),
  scheduledJob: z.union([ z.lazy(() => ScheduledJobNullableScalarRelationFilterSchema),z.lazy(() => ScheduledJobWhereInputSchema) ]).optional().nullable(),
}).strict();

export const FlowRunOrderByWithRelationInputSchema: z.ZodType<Prisma.FlowRunOrderByWithRelationInput> = z.object({
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  isScheduled: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  payload: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  runStatus: z.lazy(() => SortOrderSchema).optional(),
  scheduledJobId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  startedBy: z.lazy(() => SortOrderSchema).optional(),
  timeEnded: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  timeStarted: z.lazy(() => SortOrderSchema).optional(),
  flow: z.lazy(() => FlowOrderByWithRelationInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventOrderByRelationAggregateInputSchema).optional(),
  scheduledJob: z.lazy(() => ScheduledJobOrderByWithRelationInputSchema).optional()
}).strict();

export const FlowRunWhereUniqueInputSchema: z.ZodType<Prisma.FlowRunWhereUniqueInput> = z.object({
  id: z.number().int()
})
.and(z.object({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => FlowRunWhereInputSchema),z.lazy(() => FlowRunWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowRunWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowRunWhereInputSchema),z.lazy(() => FlowRunWhereInputSchema).array() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isScheduled: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  payload: z.lazy(() => JsonNullableFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  runStatus: z.union([ z.lazy(() => EnumRunStatusFilterSchema),z.lazy(() => RunStatusSchema) ]).optional(),
  scheduledJobId: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  startedBy: z.union([ z.lazy(() => EnumStartedByFilterSchema),z.lazy(() => StartedBySchema) ]).optional(),
  timeEnded: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  timeStarted: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
  flowEvents: z.lazy(() => FlowEventListRelationFilterSchema).optional(),
  scheduledJob: z.union([ z.lazy(() => ScheduledJobNullableScalarRelationFilterSchema),z.lazy(() => ScheduledJobWhereInputSchema) ]).optional().nullable(),
}).strict());

export const FlowRunOrderByWithAggregationInputSchema: z.ZodType<Prisma.FlowRunOrderByWithAggregationInput> = z.object({
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  isScheduled: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  payload: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  runStatus: z.lazy(() => SortOrderSchema).optional(),
  scheduledJobId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  startedBy: z.lazy(() => SortOrderSchema).optional(),
  timeEnded: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  timeStarted: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => FlowRunCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => FlowRunAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => FlowRunMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => FlowRunMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => FlowRunSumOrderByAggregateInputSchema).optional()
}).strict();

export const FlowRunScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.FlowRunScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => FlowRunScalarWhereWithAggregatesInputSchema),z.lazy(() => FlowRunScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowRunScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowRunScalarWhereWithAggregatesInputSchema),z.lazy(() => FlowRunScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  flowId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  isScheduled: z.union([ z.lazy(() => BoolNullableWithAggregatesFilterSchema),z.boolean() ]).optional().nullable(),
  payload: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  runStatus: z.union([ z.lazy(() => EnumRunStatusWithAggregatesFilterSchema),z.lazy(() => RunStatusSchema) ]).optional(),
  scheduledJobId: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  startedBy: z.union([ z.lazy(() => EnumStartedByWithAggregatesFilterSchema),z.lazy(() => StartedBySchema) ]).optional(),
  timeEnded: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  timeStarted: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const InfrastructureWhereInputSchema: z.ZodType<Prisma.InfrastructureWhereInput> = z.object({
  AND: z.union([ z.lazy(() => InfrastructureWhereInputSchema),z.lazy(() => InfrastructureWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => InfrastructureWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InfrastructureWhereInputSchema),z.lazy(() => InfrastructureWhereInputSchema).array() ]).optional(),
  arn: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  canControl: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  data: z.lazy(() => JsonNullableFilterSchema).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => EnumInfraTypeFilterSchema),z.lazy(() => InfraTypeSchema) ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  nodes: z.lazy(() => NodeListRelationFilterSchema).optional()
}).strict();

export const InfrastructureOrderByWithRelationInputSchema: z.ZodType<Prisma.InfrastructureOrderByWithRelationInput> = z.object({
  arn: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  canControl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  data: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  nodes: z.lazy(() => NodeOrderByRelationAggregateInputSchema).optional()
}).strict();

export const InfrastructureWhereUniqueInputSchema: z.ZodType<Prisma.InfrastructureWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => InfrastructureWhereInputSchema),z.lazy(() => InfrastructureWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => InfrastructureWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InfrastructureWhereInputSchema),z.lazy(() => InfrastructureWhereInputSchema).array() ]).optional(),
  arn: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  canControl: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  data: z.lazy(() => JsonNullableFilterSchema).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => EnumInfraTypeFilterSchema),z.lazy(() => InfraTypeSchema) ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  nodes: z.lazy(() => NodeListRelationFilterSchema).optional()
}).strict());

export const InfrastructureOrderByWithAggregationInputSchema: z.ZodType<Prisma.InfrastructureOrderByWithAggregationInput> = z.object({
  arn: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  canControl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  data: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => InfrastructureCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => InfrastructureMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => InfrastructureMinOrderByAggregateInputSchema).optional()
}).strict();

export const InfrastructureScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.InfrastructureScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => InfrastructureScalarWhereWithAggregatesInputSchema),z.lazy(() => InfrastructureScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => InfrastructureScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InfrastructureScalarWhereWithAggregatesInputSchema),z.lazy(() => InfrastructureScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  arn: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  canControl: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  data: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => EnumInfraTypeWithAggregatesFilterSchema),z.lazy(() => InfraTypeSchema) ]).optional(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
}).strict();

export const InstanceWhereInputSchema: z.ZodType<Prisma.InstanceWhereInput> = z.object({
  AND: z.union([ z.lazy(() => InstanceWhereInputSchema),z.lazy(() => InstanceWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => InstanceWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InstanceWhereInputSchema),z.lazy(() => InstanceWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  logo: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  flows: z.lazy(() => FlowListRelationFilterSchema).optional(),
  tags: z.lazy(() => TagListRelationFilterSchema).optional(),
  tagGroups: z.lazy(() => TagGroupListRelationFilterSchema).optional(),
  user: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict();

export const InstanceOrderByWithRelationInputSchema: z.ZodType<Prisma.InstanceOrderByWithRelationInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  logo: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  flows: z.lazy(() => FlowOrderByRelationAggregateInputSchema).optional(),
  tags: z.lazy(() => TagOrderByRelationAggregateInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupOrderByRelationAggregateInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const InstanceWhereUniqueInputSchema: z.ZodType<Prisma.InstanceWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => InstanceWhereInputSchema),z.lazy(() => InstanceWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => InstanceWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InstanceWhereInputSchema),z.lazy(() => InstanceWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  logo: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  flows: z.lazy(() => FlowListRelationFilterSchema).optional(),
  tags: z.lazy(() => TagListRelationFilterSchema).optional(),
  tagGroups: z.lazy(() => TagGroupListRelationFilterSchema).optional(),
  user: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict());

export const InstanceOrderByWithAggregationInputSchema: z.ZodType<Prisma.InstanceOrderByWithAggregationInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  logo: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => InstanceCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => InstanceMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => InstanceMinOrderByAggregateInputSchema).optional()
}).strict();

export const InstanceScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.InstanceScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => InstanceScalarWhereWithAggregatesInputSchema),z.lazy(() => InstanceScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => InstanceScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InstanceScalarWhereWithAggregatesInputSchema),z.lazy(() => InstanceScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  image: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  logo: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const NodeWhereInputSchema: z.ZodType<Prisma.NodeWhereInput> = z.object({
  AND: z.union([ z.lazy(() => NodeWhereInputSchema),z.lazy(() => NodeWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => NodeWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => NodeWhereInputSchema),z.lazy(() => NodeWhereInputSchema).array() ]).optional(),
  arn: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  infrastructureId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  position: z.lazy(() => JsonNullableFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  rfId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumNodeTypeFilterSchema),z.lazy(() => NodeTypeSchema) ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
  infrastructure: z.union([ z.lazy(() => InfrastructureNullableScalarRelationFilterSchema),z.lazy(() => InfrastructureWhereInputSchema) ]).optional().nullable(),
  secrets: z.lazy(() => SecretListRelationFilterSchema).optional(),
  sourceEdges: z.lazy(() => EdgeListRelationFilterSchema).optional(),
  targetEdges: z.lazy(() => EdgeListRelationFilterSchema).optional(),
  Tag: z.lazy(() => TagListRelationFilterSchema).optional()
}).strict();

export const NodeOrderByWithRelationInputSchema: z.ZodType<Prisma.NodeOrderByWithRelationInput> = z.object({
  arn: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  infrastructureId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  position: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  rfId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  flow: z.lazy(() => FlowOrderByWithRelationInputSchema).optional(),
  infrastructure: z.lazy(() => InfrastructureOrderByWithRelationInputSchema).optional(),
  secrets: z.lazy(() => SecretOrderByRelationAggregateInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeOrderByRelationAggregateInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeOrderByRelationAggregateInputSchema).optional(),
  Tag: z.lazy(() => TagOrderByRelationAggregateInputSchema).optional()
}).strict();

export const NodeWhereUniqueInputSchema: z.ZodType<Prisma.NodeWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    flowId_rfId: z.lazy(() => NodeFlowIdRfIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    flowId_rfId: z.lazy(() => NodeFlowIdRfIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  flowId_rfId: z.lazy(() => NodeFlowIdRfIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => NodeWhereInputSchema),z.lazy(() => NodeWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => NodeWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => NodeWhereInputSchema),z.lazy(() => NodeWhereInputSchema).array() ]).optional(),
  arn: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  infrastructureId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  position: z.lazy(() => JsonNullableFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  rfId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumNodeTypeFilterSchema),z.lazy(() => NodeTypeSchema) ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
  infrastructure: z.union([ z.lazy(() => InfrastructureNullableScalarRelationFilterSchema),z.lazy(() => InfrastructureWhereInputSchema) ]).optional().nullable(),
  secrets: z.lazy(() => SecretListRelationFilterSchema).optional(),
  sourceEdges: z.lazy(() => EdgeListRelationFilterSchema).optional(),
  targetEdges: z.lazy(() => EdgeListRelationFilterSchema).optional(),
  Tag: z.lazy(() => TagListRelationFilterSchema).optional()
}).strict());

export const NodeOrderByWithAggregationInputSchema: z.ZodType<Prisma.NodeOrderByWithAggregationInput> = z.object({
  arn: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  infrastructureId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  position: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  rfId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => NodeCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => NodeMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => NodeMinOrderByAggregateInputSchema).optional()
}).strict();

export const NodeScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.NodeScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => NodeScalarWhereWithAggregatesInputSchema),z.lazy(() => NodeScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => NodeScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => NodeScalarWhereWithAggregatesInputSchema),z.lazy(() => NodeScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  arn: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  flowId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  infrastructureId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  position: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  rfId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumNodeTypeWithAggregatesFilterSchema),z.lazy(() => NodeTypeSchema) ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
}).strict();

export const ScheduledJobWhereInputSchema: z.ZodType<Prisma.ScheduledJobWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ScheduledJobWhereInputSchema),z.lazy(() => ScheduledJobWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ScheduledJobWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ScheduledJobWhereInputSchema),z.lazy(() => ScheduledJobWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  createdBy: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  endpoint: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  frequency: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  flowRuns: z.lazy(() => FlowRunListRelationFilterSchema).optional()
}).strict();

export const ScheduledJobOrderByWithRelationInputSchema: z.ZodType<Prisma.ScheduledJobOrderByWithRelationInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.lazy(() => SortOrderSchema).optional(),
  endpoint: z.lazy(() => SortOrderSchema).optional(),
  frequency: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  flowRuns: z.lazy(() => FlowRunOrderByRelationAggregateInputSchema).optional()
}).strict();

export const ScheduledJobWhereUniqueInputSchema: z.ZodType<Prisma.ScheduledJobWhereUniqueInput> = z.object({
  id: z.number().int()
})
.and(z.object({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => ScheduledJobWhereInputSchema),z.lazy(() => ScheduledJobWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ScheduledJobWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ScheduledJobWhereInputSchema),z.lazy(() => ScheduledJobWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  createdBy: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  endpoint: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  frequency: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  flowRuns: z.lazy(() => FlowRunListRelationFilterSchema).optional()
}).strict());

export const ScheduledJobOrderByWithAggregationInputSchema: z.ZodType<Prisma.ScheduledJobOrderByWithAggregationInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.lazy(() => SortOrderSchema).optional(),
  endpoint: z.lazy(() => SortOrderSchema).optional(),
  frequency: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ScheduledJobCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ScheduledJobAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ScheduledJobMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ScheduledJobMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ScheduledJobSumOrderByAggregateInputSchema).optional()
}).strict();

export const ScheduledJobScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ScheduledJobScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ScheduledJobScalarWhereWithAggregatesInputSchema),z.lazy(() => ScheduledJobScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ScheduledJobScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ScheduledJobScalarWhereWithAggregatesInputSchema),z.lazy(() => ScheduledJobScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  createdBy: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  endpoint: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  frequency: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
}).strict();

export const SecretWhereInputSchema: z.ZodType<Prisma.SecretWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SecretWhereInputSchema),z.lazy(() => SecretWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SecretWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SecretWhereInputSchema),z.lazy(() => SecretWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  category: z.union([ z.lazy(() => EnumSecretCategoryFilterSchema),z.lazy(() => SecretCategorySchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flowId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  nodeId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  secret: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  shouldEncrypt: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  flow: z.union([ z.lazy(() => FlowNullableScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional().nullable(),
  node: z.union([ z.lazy(() => NodeNullableScalarRelationFilterSchema),z.lazy(() => NodeWhereInputSchema) ]).optional().nullable(),
}).strict();

export const SecretOrderByWithRelationInputSchema: z.ZodType<Prisma.SecretOrderByWithRelationInput> = z.object({
  name: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  secret: z.lazy(() => SortOrderSchema).optional(),
  shouldEncrypt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  flow: z.lazy(() => FlowOrderByWithRelationInputSchema).optional(),
  node: z.lazy(() => NodeOrderByWithRelationInputSchema).optional()
}).strict();

export const SecretWhereUniqueInputSchema: z.ZodType<Prisma.SecretWhereUniqueInput> = z.object({
  id: z.number().int()
})
.and(z.object({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => SecretWhereInputSchema),z.lazy(() => SecretWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SecretWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SecretWhereInputSchema),z.lazy(() => SecretWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  category: z.union([ z.lazy(() => EnumSecretCategoryFilterSchema),z.lazy(() => SecretCategorySchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flowId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  nodeId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  secret: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  shouldEncrypt: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  flow: z.union([ z.lazy(() => FlowNullableScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional().nullable(),
  node: z.union([ z.lazy(() => NodeNullableScalarRelationFilterSchema),z.lazy(() => NodeWhereInputSchema) ]).optional().nullable(),
}).strict());

export const SecretOrderByWithAggregationInputSchema: z.ZodType<Prisma.SecretOrderByWithAggregationInput> = z.object({
  name: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  secret: z.lazy(() => SortOrderSchema).optional(),
  shouldEncrypt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => SecretCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => SecretAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SecretMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SecretMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => SecretSumOrderByAggregateInputSchema).optional()
}).strict();

export const SecretScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SecretScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => SecretScalarWhereWithAggregatesInputSchema),z.lazy(() => SecretScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => SecretScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SecretScalarWhereWithAggregatesInputSchema),z.lazy(() => SecretScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  category: z.union([ z.lazy(() => EnumSecretCategoryWithAggregatesFilterSchema),z.lazy(() => SecretCategorySchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  flowId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  nodeId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  secret: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  shouldEncrypt: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
}).strict();

export const TagWhereInputSchema: z.ZodType<Prisma.TagWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TagWhereInputSchema),z.lazy(() => TagWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagWhereInputSchema),z.lazy(() => TagWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  flowId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  nodeId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tagGroupId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  flow: z.union([ z.lazy(() => FlowNullableScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional().nullable(),
  node: z.union([ z.lazy(() => NodeNullableScalarRelationFilterSchema),z.lazy(() => NodeWhereInputSchema) ]).optional().nullable(),
  tagGroup: z.union([ z.lazy(() => TagGroupNullableScalarRelationFilterSchema),z.lazy(() => TagGroupWhereInputSchema) ]).optional().nullable(),
  instance: z.union([ z.lazy(() => InstanceScalarRelationFilterSchema),z.lazy(() => InstanceWhereInputSchema) ]).optional(),
}).strict();

export const TagOrderByWithRelationInputSchema: z.ZodType<Prisma.TagOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  flowId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  nodeId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  tagGroupId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  flow: z.lazy(() => FlowOrderByWithRelationInputSchema).optional(),
  node: z.lazy(() => NodeOrderByWithRelationInputSchema).optional(),
  tagGroup: z.lazy(() => TagGroupOrderByWithRelationInputSchema).optional(),
  instance: z.lazy(() => InstanceOrderByWithRelationInputSchema).optional()
}).strict();

export const TagWhereUniqueInputSchema: z.ZodType<Prisma.TagWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    id_instanceId: z.lazy(() => TagIdInstanceIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    id_instanceId: z.lazy(() => TagIdInstanceIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  id_instanceId: z.lazy(() => TagIdInstanceIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => TagWhereInputSchema),z.lazy(() => TagWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagWhereInputSchema),z.lazy(() => TagWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  flowId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  nodeId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tagGroupId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  flow: z.union([ z.lazy(() => FlowNullableScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional().nullable(),
  node: z.union([ z.lazy(() => NodeNullableScalarRelationFilterSchema),z.lazy(() => NodeWhereInputSchema) ]).optional().nullable(),
  tagGroup: z.union([ z.lazy(() => TagGroupNullableScalarRelationFilterSchema),z.lazy(() => TagGroupWhereInputSchema) ]).optional().nullable(),
  instance: z.union([ z.lazy(() => InstanceScalarRelationFilterSchema),z.lazy(() => InstanceWhereInputSchema) ]).optional(),
}).strict());

export const TagOrderByWithAggregationInputSchema: z.ZodType<Prisma.TagOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  flowId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  nodeId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  tagGroupId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TagCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => TagAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TagMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TagMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => TagSumOrderByAggregateInputSchema).optional()
}).strict();

export const TagScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TagScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TagScalarWhereWithAggregatesInputSchema),z.lazy(() => TagScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagScalarWhereWithAggregatesInputSchema),z.lazy(() => TagScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  flowId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  nodeId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  tagGroupId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  instanceId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const TagGroupWhereInputSchema: z.ZodType<Prisma.TagGroupWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TagGroupWhereInputSchema),z.lazy(() => TagGroupWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagGroupWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagGroupWhereInputSchema),z.lazy(() => TagGroupWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  tags: z.lazy(() => TagListRelationFilterSchema).optional(),
  instance: z.union([ z.lazy(() => InstanceScalarRelationFilterSchema),z.lazy(() => InstanceWhereInputSchema) ]).optional(),
}).strict();

export const TagGroupOrderByWithRelationInputSchema: z.ZodType<Prisma.TagGroupOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  tags: z.lazy(() => TagOrderByRelationAggregateInputSchema).optional(),
  instance: z.lazy(() => InstanceOrderByWithRelationInputSchema).optional()
}).strict();

export const TagGroupWhereUniqueInputSchema: z.ZodType<Prisma.TagGroupWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    id_instanceId: z.lazy(() => TagGroupIdInstanceIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    id_instanceId: z.lazy(() => TagGroupIdInstanceIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  id_instanceId: z.lazy(() => TagGroupIdInstanceIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => TagGroupWhereInputSchema),z.lazy(() => TagGroupWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagGroupWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagGroupWhereInputSchema),z.lazy(() => TagGroupWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  tags: z.lazy(() => TagListRelationFilterSchema).optional(),
  instance: z.union([ z.lazy(() => InstanceScalarRelationFilterSchema),z.lazy(() => InstanceWhereInputSchema) ]).optional(),
}).strict());

export const TagGroupOrderByWithAggregationInputSchema: z.ZodType<Prisma.TagGroupOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TagGroupCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TagGroupMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TagGroupMinOrderByAggregateInputSchema).optional()
}).strict();

export const TagGroupScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TagGroupScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TagGroupScalarWhereWithAggregatesInputSchema),z.lazy(() => TagGroupScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagGroupScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagGroupScalarWhereWithAggregatesInputSchema),z.lazy(() => TagGroupScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  instanceId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const TestCaseWhereInputSchema: z.ZodType<Prisma.TestCaseWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TestCaseWhereInputSchema),z.lazy(() => TestCaseWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TestCaseWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TestCaseWhereInputSchema),z.lazy(() => TestCaseWhereInputSchema).array() ]).optional(),
  color: z.union([ z.lazy(() => EnumMantineColorFilterSchema),z.lazy(() => MantineColorSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
}).strict();

export const TestCaseOrderByWithRelationInputSchema: z.ZodType<Prisma.TestCaseOrderByWithRelationInput> = z.object({
  color: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  flow: z.lazy(() => FlowOrderByWithRelationInputSchema).optional()
}).strict();

export const TestCaseWhereUniqueInputSchema: z.ZodType<Prisma.TestCaseWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => TestCaseWhereInputSchema),z.lazy(() => TestCaseWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TestCaseWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TestCaseWhereInputSchema),z.lazy(() => TestCaseWhereInputSchema).array() ]).optional(),
  color: z.union([ z.lazy(() => EnumMantineColorFilterSchema),z.lazy(() => MantineColorSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
}).strict());

export const TestCaseOrderByWithAggregationInputSchema: z.ZodType<Prisma.TestCaseOrderByWithAggregationInput> = z.object({
  color: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TestCaseCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TestCaseMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TestCaseMinOrderByAggregateInputSchema).optional()
}).strict();

export const TestCaseScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TestCaseScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TestCaseScalarWhereWithAggregatesInputSchema),z.lazy(() => TestCaseScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TestCaseScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TestCaseScalarWhereWithAggregatesInputSchema),z.lazy(() => TestCaseScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  color: z.union([ z.lazy(() => EnumMantineColorWithAggregatesFilterSchema),z.lazy(() => MantineColorSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  flowId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
}).strict();

export const AccountWhereInputSchema: z.ZodType<Prisma.AccountWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  access_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  expires_at: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  id_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  oauth_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  oauth_token_secret: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  provider: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  providerAccountId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  refresh_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  scope: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  session_state: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  token_type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const AccountOrderByWithRelationInputSchema: z.ZodType<Prisma.AccountOrderByWithRelationInput> = z.object({
  access_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  expires_at: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  id_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  oauth_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  oauth_token_secret: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  providerAccountId: z.lazy(() => SortOrderSchema).optional(),
  refresh_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  refresh_token_expires_in: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  session_state: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  token_type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const AccountWhereUniqueInputSchema: z.ZodType<Prisma.AccountWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    provider_providerAccountId: z.lazy(() => AccountProviderProviderAccountIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    provider_providerAccountId: z.lazy(() => AccountProviderProviderAccountIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  provider_providerAccountId: z.lazy(() => AccountProviderProviderAccountIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  access_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  expires_at: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  id_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  oauth_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  oauth_token_secret: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  provider: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  providerAccountId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  refresh_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  scope: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  session_state: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  token_type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const AccountOrderByWithAggregationInputSchema: z.ZodType<Prisma.AccountOrderByWithAggregationInput> = z.object({
  access_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  expires_at: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  id_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  oauth_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  oauth_token_secret: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  providerAccountId: z.lazy(() => SortOrderSchema).optional(),
  refresh_token: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  refresh_token_expires_in: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  session_state: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  token_type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AccountCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => AccountAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AccountMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AccountMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => AccountSumOrderByAggregateInputSchema).optional()
}).strict();

export const AccountScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AccountScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => AccountScalarWhereWithAggregatesInputSchema),z.lazy(() => AccountScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountScalarWhereWithAggregatesInputSchema),z.lazy(() => AccountScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  access_token: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  expires_at: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  id_token: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  oauth_token: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  oauth_token_secret: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  provider: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  providerAccountId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  refresh_token: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  scope: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  session_state: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  token_type: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const SessionWhereInputSchema: z.ZodType<Prisma.SessionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sessionToken: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const SessionOrderByWithRelationInputSchema: z.ZodType<Prisma.SessionOrderByWithRelationInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionToken: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const SessionWhereUniqueInputSchema: z.ZodType<Prisma.SessionWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    sessionToken: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    sessionToken: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  sessionToken: z.string().optional(),
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const SessionOrderByWithAggregationInputSchema: z.ZodType<Prisma.SessionOrderByWithAggregationInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionToken: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => SessionCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SessionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SessionMinOrderByAggregateInputSchema).optional()
}).strict();

export const SessionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SessionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  sessionToken: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  email: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  emailVerified: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  accounts: z.lazy(() => AccountListRelationFilterSchema).optional(),
  instances: z.lazy(() => InstanceListRelationFilterSchema).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  auditLogs: z.lazy(() => AuditLogListRelationFilterSchema).optional()
}).strict();

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  emailVerified: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  accounts: z.lazy(() => AccountOrderByRelationAggregateInputSchema).optional(),
  instances: z.lazy(() => InstanceOrderByRelationAggregateInputSchema).optional(),
  sessions: z.lazy(() => SessionOrderByRelationAggregateInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogOrderByRelationAggregateInputSchema).optional()
}).strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    email: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    email: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  email: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  emailVerified: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  accounts: z.lazy(() => AccountListRelationFilterSchema).optional(),
  instances: z.lazy(() => InstanceListRelationFilterSchema).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  auditLogs: z.lazy(() => AuditLogListRelationFilterSchema).optional()
}).strict());

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  emailVerified: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional()
}).strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  email: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  emailVerified: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  image: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const VerificationTokenWhereInputSchema: z.ZodType<Prisma.VerificationTokenWhereInput> = z.object({
  AND: z.union([ z.lazy(() => VerificationTokenWhereInputSchema),z.lazy(() => VerificationTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VerificationTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VerificationTokenWhereInputSchema),z.lazy(() => VerificationTokenWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  identifier: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const VerificationTokenOrderByWithRelationInputSchema: z.ZodType<Prisma.VerificationTokenOrderByWithRelationInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const VerificationTokenWhereUniqueInputSchema: z.ZodType<Prisma.VerificationTokenWhereUniqueInput> = z.union([
  z.object({
    token: z.string(),
    identifier_token: z.lazy(() => VerificationTokenIdentifierTokenCompoundUniqueInputSchema)
  }),
  z.object({
    token: z.string(),
  }),
  z.object({
    identifier_token: z.lazy(() => VerificationTokenIdentifierTokenCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  token: z.string().optional(),
  identifier_token: z.lazy(() => VerificationTokenIdentifierTokenCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => VerificationTokenWhereInputSchema),z.lazy(() => VerificationTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VerificationTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VerificationTokenWhereInputSchema),z.lazy(() => VerificationTokenWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  identifier: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict());

export const VerificationTokenOrderByWithAggregationInputSchema: z.ZodType<Prisma.VerificationTokenOrderByWithAggregationInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => VerificationTokenCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => VerificationTokenMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => VerificationTokenMinOrderByAggregateInputSchema).optional()
}).strict();

export const VerificationTokenScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.VerificationTokenScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => VerificationTokenScalarWhereWithAggregatesInputSchema),z.lazy(() => VerificationTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => VerificationTokenScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VerificationTokenScalarWhereWithAggregatesInputSchema),z.lazy(() => VerificationTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  identifier: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const AuditLogWhereInputSchema: z.ZodType<Prisma.AuditLogWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AuditLogWhereInputSchema),z.lazy(() => AuditLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AuditLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AuditLogWhereInputSchema),z.lazy(() => AuditLogWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  entityType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  entityId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  changeType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  before: z.lazy(() => JsonNullableFilterSchema).optional(),
  after: z.lazy(() => JsonNullableFilterSchema).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
}).strict();

export const AuditLogOrderByWithRelationInputSchema: z.ZodType<Prisma.AuditLogOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  entityType: z.lazy(() => SortOrderSchema).optional(),
  entityId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  changeType: z.lazy(() => SortOrderSchema).optional(),
  before: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  after: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  flow: z.lazy(() => FlowOrderByWithRelationInputSchema).optional()
}).strict();

export const AuditLogWhereUniqueInputSchema: z.ZodType<Prisma.AuditLogWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => AuditLogWhereInputSchema),z.lazy(() => AuditLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AuditLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AuditLogWhereInputSchema),z.lazy(() => AuditLogWhereInputSchema).array() ]).optional(),
  entityType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  entityId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  changeType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  before: z.lazy(() => JsonNullableFilterSchema).optional(),
  after: z.lazy(() => JsonNullableFilterSchema).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
}).strict());

export const AuditLogOrderByWithAggregationInputSchema: z.ZodType<Prisma.AuditLogOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  entityType: z.lazy(() => SortOrderSchema).optional(),
  entityId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  changeType: z.lazy(() => SortOrderSchema).optional(),
  before: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  after: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AuditLogCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AuditLogMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AuditLogMinOrderByAggregateInputSchema).optional()
}).strict();

export const AuditLogScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AuditLogScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => AuditLogScalarWhereWithAggregatesInputSchema),z.lazy(() => AuditLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AuditLogScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AuditLogScalarWhereWithAggregatesInputSchema),z.lazy(() => AuditLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  entityType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  entityId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  flowId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  changeType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  before: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  after: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const FlowStatisticsWhereInputSchema: z.ZodType<Prisma.FlowStatisticsWhereInput> = z.object({
  AND: z.union([ z.lazy(() => FlowStatisticsWhereInputSchema),z.lazy(() => FlowStatisticsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowStatisticsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowStatisticsWhereInputSchema),z.lazy(() => FlowStatisticsWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  totalRuns: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  successfulRuns: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  failedRuns: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  lastUpdated: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
}).strict();

export const FlowStatisticsOrderByWithRelationInputSchema: z.ZodType<Prisma.FlowStatisticsOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  totalRuns: z.lazy(() => SortOrderSchema).optional(),
  successfulRuns: z.lazy(() => SortOrderSchema).optional(),
  failedRuns: z.lazy(() => SortOrderSchema).optional(),
  lastUpdated: z.lazy(() => SortOrderSchema).optional(),
  flow: z.lazy(() => FlowOrderByWithRelationInputSchema).optional()
}).strict();

export const FlowStatisticsWhereUniqueInputSchema: z.ZodType<Prisma.FlowStatisticsWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    flowId: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    flowId: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  flowId: z.string().optional(),
  AND: z.union([ z.lazy(() => FlowStatisticsWhereInputSchema),z.lazy(() => FlowStatisticsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowStatisticsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowStatisticsWhereInputSchema),z.lazy(() => FlowStatisticsWhereInputSchema).array() ]).optional(),
  totalRuns: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  successfulRuns: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  failedRuns: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  lastUpdated: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flow: z.union([ z.lazy(() => FlowScalarRelationFilterSchema),z.lazy(() => FlowWhereInputSchema) ]).optional(),
}).strict());

export const FlowStatisticsOrderByWithAggregationInputSchema: z.ZodType<Prisma.FlowStatisticsOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  totalRuns: z.lazy(() => SortOrderSchema).optional(),
  successfulRuns: z.lazy(() => SortOrderSchema).optional(),
  failedRuns: z.lazy(() => SortOrderSchema).optional(),
  lastUpdated: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => FlowStatisticsCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => FlowStatisticsAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => FlowStatisticsMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => FlowStatisticsMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => FlowStatisticsSumOrderByAggregateInputSchema).optional()
}).strict();

export const FlowStatisticsScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.FlowStatisticsScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => FlowStatisticsScalarWhereWithAggregatesInputSchema),z.lazy(() => FlowStatisticsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowStatisticsScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowStatisticsScalarWhereWithAggregatesInputSchema),z.lazy(() => FlowStatisticsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  flowId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  totalRuns: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  successfulRuns: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  failedRuns: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  lastUpdated: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const EdgeCreateInputSchema: z.ZodType<Prisma.EdgeCreateInput> = z.object({
  id: z.string().cuid().optional(),
  rfId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  type: z.lazy(() => EdgeTypeSchema).optional(),
  normalizedKey: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutEdgesInputSchema),
  sourceNode: z.lazy(() => NodeCreateNestedOneWithoutSourceEdgesInputSchema),
  targetNode: z.lazy(() => NodeCreateNestedOneWithoutTargetEdgesInputSchema)
}).strict();

export const EdgeUncheckedCreateInputSchema: z.ZodType<Prisma.EdgeUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  flowId: z.string(),
  rfId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  type: z.lazy(() => EdgeTypeSchema).optional(),
  normalizedKey: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const EdgeUpdateInputSchema: z.ZodType<Prisma.EdgeUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutEdgesNestedInputSchema).optional(),
  sourceNode: z.lazy(() => NodeUpdateOneRequiredWithoutSourceEdgesNestedInputSchema).optional(),
  targetNode: z.lazy(() => NodeUpdateOneRequiredWithoutTargetEdgesNestedInputSchema).optional()
}).strict();

export const EdgeUncheckedUpdateInputSchema: z.ZodType<Prisma.EdgeUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sourceNodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetNodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EdgeCreateManyInputSchema: z.ZodType<Prisma.EdgeCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  flowId: z.string(),
  rfId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  type: z.lazy(() => EdgeTypeSchema).optional(),
  normalizedKey: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const EdgeUpdateManyMutationInputSchema: z.ZodType<Prisma.EdgeUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EdgeUncheckedUpdateManyInputSchema: z.ZodType<Prisma.EdgeUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sourceNodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetNodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowCreateInputSchema: z.ZodType<Prisma.FlowCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutFlowsInputSchema),
  nodes: z.lazy(() => NodeCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowUncheckedCreateInputSchema: z.ZodType<Prisma.FlowUncheckedCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowUpdateInputSchema: z.ZodType<Prisma.FlowUpdateInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutFlowsNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowUncheckedUpdateInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowCreateManyInputSchema: z.ZodType<Prisma.FlowCreateManyInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional()
}).strict();

export const FlowUpdateManyMutationInputSchema: z.ZodType<Prisma.FlowUpdateManyMutationInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowUncheckedUpdateManyInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateManyInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowEventCreateInputSchema: z.ZodType<Prisma.FlowEventCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
  nodeId: z.string(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.lazy(() => StartedBySchema),
  flowRun: z.lazy(() => FlowRunCreateNestedOneWithoutFlowEventsInputSchema),
  flow: z.lazy(() => FlowCreateNestedOneWithoutFlowEventsInputSchema)
}).strict();

export const FlowEventUncheckedCreateInputSchema: z.ZodType<Prisma.FlowEventUncheckedCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
  flowRunId: z.number().int(),
  flowId: z.string(),
  id: z.number().int().optional(),
  nodeId: z.string(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.lazy(() => StartedBySchema)
}).strict();

export const FlowEventUpdateInputSchema: z.ZodType<Prisma.FlowEventUpdateInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  flowRun: z.lazy(() => FlowRunUpdateOneRequiredWithoutFlowEventsNestedInputSchema).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutFlowEventsNestedInputSchema).optional()
}).strict();

export const FlowEventUncheckedUpdateInputSchema: z.ZodType<Prisma.FlowEventUncheckedUpdateInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowRunId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowEventCreateManyInputSchema: z.ZodType<Prisma.FlowEventCreateManyInput> = z.object({
  createdAt: z.coerce.date().optional(),
  flowRunId: z.number().int(),
  flowId: z.string(),
  id: z.number().int().optional(),
  nodeId: z.string(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.lazy(() => StartedBySchema)
}).strict();

export const FlowEventUpdateManyMutationInputSchema: z.ZodType<Prisma.FlowEventUpdateManyMutationInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowEventUncheckedUpdateManyInputSchema: z.ZodType<Prisma.FlowEventUncheckedUpdateManyInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowRunId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowRunCreateInputSchema: z.ZodType<Prisma.FlowRunCreateInput> = z.object({
  isScheduled: z.boolean().optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.lazy(() => RunStatusSchema),
  startedBy: z.lazy(() => StartedBySchema),
  timeEnded: z.coerce.date().optional().nullable(),
  timeStarted: z.coerce.date().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutFlowRunsInputSchema),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowRunInputSchema).optional(),
  scheduledJob: z.lazy(() => ScheduledJobCreateNestedOneWithoutFlowRunsInputSchema).optional()
}).strict();

export const FlowRunUncheckedCreateInputSchema: z.ZodType<Prisma.FlowRunUncheckedCreateInput> = z.object({
  flowId: z.string(),
  id: z.number().int().optional(),
  isScheduled: z.boolean().optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.lazy(() => RunStatusSchema),
  scheduledJobId: z.number().int().optional().nullable(),
  startedBy: z.lazy(() => StartedBySchema),
  timeEnded: z.coerce.date().optional().nullable(),
  timeStarted: z.coerce.date().optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowRunInputSchema).optional()
}).strict();

export const FlowRunUpdateInputSchema: z.ZodType<Prisma.FlowRunUpdateInput> = z.object({
  isScheduled: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => EnumRunStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  timeEnded: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeStarted: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutFlowRunsNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowRunNestedInputSchema).optional(),
  scheduledJob: z.lazy(() => ScheduledJobUpdateOneWithoutFlowRunsNestedInputSchema).optional()
}).strict();

export const FlowRunUncheckedUpdateInputSchema: z.ZodType<Prisma.FlowRunUncheckedUpdateInput> = z.object({
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isScheduled: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => EnumRunStatusFieldUpdateOperationsInputSchema) ]).optional(),
  scheduledJobId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  timeEnded: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeStarted: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowRunNestedInputSchema).optional()
}).strict();

export const FlowRunCreateManyInputSchema: z.ZodType<Prisma.FlowRunCreateManyInput> = z.object({
  flowId: z.string(),
  id: z.number().int().optional(),
  isScheduled: z.boolean().optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.lazy(() => RunStatusSchema),
  scheduledJobId: z.number().int().optional().nullable(),
  startedBy: z.lazy(() => StartedBySchema),
  timeEnded: z.coerce.date().optional().nullable(),
  timeStarted: z.coerce.date().optional()
}).strict();

export const FlowRunUpdateManyMutationInputSchema: z.ZodType<Prisma.FlowRunUpdateManyMutationInput> = z.object({
  isScheduled: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => EnumRunStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  timeEnded: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeStarted: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowRunUncheckedUpdateManyInputSchema: z.ZodType<Prisma.FlowRunUncheckedUpdateManyInput> = z.object({
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isScheduled: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => EnumRunStatusFieldUpdateOperationsInputSchema) ]).optional(),
  scheduledJobId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  timeEnded: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeStarted: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InfrastructureCreateInputSchema: z.ZodType<Prisma.InfrastructureCreateInput> = z.object({
  arn: z.string().optional().nullable(),
  canControl: z.boolean(),
  createdAt: z.coerce.date().optional(),
  data: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  type: z.lazy(() => InfraTypeSchema),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  nodes: z.lazy(() => NodeCreateNestedManyWithoutInfrastructureInputSchema).optional()
}).strict();

export const InfrastructureUncheckedCreateInputSchema: z.ZodType<Prisma.InfrastructureUncheckedCreateInput> = z.object({
  arn: z.string().optional().nullable(),
  canControl: z.boolean(),
  createdAt: z.coerce.date().optional(),
  data: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  type: z.lazy(() => InfraTypeSchema),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  nodes: z.lazy(() => NodeUncheckedCreateNestedManyWithoutInfrastructureInputSchema).optional()
}).strict();

export const InfrastructureUpdateInputSchema: z.ZodType<Prisma.InfrastructureUpdateInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  canControl: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  data: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => InfraTypeSchema),z.lazy(() => EnumInfraTypeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  nodes: z.lazy(() => NodeUpdateManyWithoutInfrastructureNestedInputSchema).optional()
}).strict();

export const InfrastructureUncheckedUpdateInputSchema: z.ZodType<Prisma.InfrastructureUncheckedUpdateInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  canControl: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  data: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => InfraTypeSchema),z.lazy(() => EnumInfraTypeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  nodes: z.lazy(() => NodeUncheckedUpdateManyWithoutInfrastructureNestedInputSchema).optional()
}).strict();

export const InfrastructureCreateManyInputSchema: z.ZodType<Prisma.InfrastructureCreateManyInput> = z.object({
  arn: z.string().optional().nullable(),
  canControl: z.boolean(),
  createdAt: z.coerce.date().optional(),
  data: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  type: z.lazy(() => InfraTypeSchema),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const InfrastructureUpdateManyMutationInputSchema: z.ZodType<Prisma.InfrastructureUpdateManyMutationInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  canControl: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  data: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => InfraTypeSchema),z.lazy(() => EnumInfraTypeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InfrastructureUncheckedUpdateManyInputSchema: z.ZodType<Prisma.InfrastructureUncheckedUpdateManyInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  canControl: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  data: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => InfraTypeSchema),z.lazy(() => EnumInfraTypeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InstanceCreateInputSchema: z.ZodType<Prisma.InstanceCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  id: z.string().cuid().optional(),
  image: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  flows: z.lazy(() => FlowCreateNestedManyWithoutInstanceInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutInstanceInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupCreateNestedManyWithoutInstanceInputSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutInstancesInputSchema).optional()
}).strict();

export const InstanceUncheckedCreateInputSchema: z.ZodType<Prisma.InstanceUncheckedCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  id: z.string().cuid().optional(),
  image: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable(),
  flows: z.lazy(() => FlowUncheckedCreateNestedManyWithoutInstanceInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutInstanceInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupUncheckedCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict();

export const InstanceUpdateInputSchema: z.ZodType<Prisma.InstanceUpdateInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flows: z.lazy(() => FlowUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupUpdateManyWithoutInstanceNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneWithoutInstancesNestedInputSchema).optional()
}).strict();

export const InstanceUncheckedUpdateInputSchema: z.ZodType<Prisma.InstanceUncheckedUpdateInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  flows: z.lazy(() => FlowUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict();

export const InstanceCreateManyInputSchema: z.ZodType<Prisma.InstanceCreateManyInput> = z.object({
  createdAt: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  id: z.string().cuid().optional(),
  image: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable()
}).strict();

export const InstanceUpdateManyMutationInputSchema: z.ZodType<Prisma.InstanceUpdateManyMutationInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InstanceUncheckedUpdateManyInputSchema: z.ZodType<Prisma.InstanceUncheckedUpdateManyInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const NodeCreateInputSchema: z.ZodType<Prisma.NodeCreateInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutNodesInputSchema),
  infrastructure: z.lazy(() => InfrastructureCreateNestedOneWithoutNodesInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutNodeInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeCreateNestedManyWithoutSourceNodeInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeCreateNestedManyWithoutTargetNodeInputSchema).optional(),
  Tag: z.lazy(() => TagCreateNestedManyWithoutNodeInputSchema).optional()
}).strict();

export const NodeUncheckedCreateInputSchema: z.ZodType<Prisma.NodeUncheckedCreateInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  flowId: z.string(),
  id: z.string().cuid().optional(),
  infrastructureId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutNodeInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutSourceNodeInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutTargetNodeInputSchema).optional(),
  Tag: z.lazy(() => TagUncheckedCreateNestedManyWithoutNodeInputSchema).optional()
}).strict();

export const NodeUpdateInputSchema: z.ZodType<Prisma.NodeUpdateInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutNodesNestedInputSchema).optional(),
  infrastructure: z.lazy(() => InfrastructureUpdateOneWithoutNodesNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutNodeNestedInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUpdateManyWithoutSourceNodeNestedInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUpdateManyWithoutTargetNodeNestedInputSchema).optional(),
  Tag: z.lazy(() => TagUpdateManyWithoutNodeNestedInputSchema).optional()
}).strict();

export const NodeUncheckedUpdateInputSchema: z.ZodType<Prisma.NodeUncheckedUpdateInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  infrastructureId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutNodeNestedInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUncheckedUpdateManyWithoutSourceNodeNestedInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUncheckedUpdateManyWithoutTargetNodeNestedInputSchema).optional(),
  Tag: z.lazy(() => TagUncheckedUpdateManyWithoutNodeNestedInputSchema).optional()
}).strict();

export const NodeCreateManyInputSchema: z.ZodType<Prisma.NodeCreateManyInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  flowId: z.string(),
  id: z.string().cuid().optional(),
  infrastructureId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const NodeUpdateManyMutationInputSchema: z.ZodType<Prisma.NodeUpdateManyMutationInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const NodeUncheckedUpdateManyInputSchema: z.ZodType<Prisma.NodeUncheckedUpdateManyInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  infrastructureId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ScheduledJobCreateInputSchema: z.ZodType<Prisma.ScheduledJobCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
  createdBy: z.string(),
  endpoint: z.string(),
  frequency: z.string(),
  name: z.string(),
  deleted: z.boolean().optional(),
  flowRuns: z.lazy(() => FlowRunCreateNestedManyWithoutScheduledJobInputSchema).optional()
}).strict();

export const ScheduledJobUncheckedCreateInputSchema: z.ZodType<Prisma.ScheduledJobUncheckedCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
  createdBy: z.string(),
  endpoint: z.string(),
  frequency: z.string(),
  id: z.number().int().optional(),
  name: z.string(),
  deleted: z.boolean().optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedCreateNestedManyWithoutScheduledJobInputSchema).optional()
}).strict();

export const ScheduledJobUpdateInputSchema: z.ZodType<Prisma.ScheduledJobUpdateInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdBy: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  frequency: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flowRuns: z.lazy(() => FlowRunUpdateManyWithoutScheduledJobNestedInputSchema).optional()
}).strict();

export const ScheduledJobUncheckedUpdateInputSchema: z.ZodType<Prisma.ScheduledJobUncheckedUpdateInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdBy: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  frequency: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedUpdateManyWithoutScheduledJobNestedInputSchema).optional()
}).strict();

export const ScheduledJobCreateManyInputSchema: z.ZodType<Prisma.ScheduledJobCreateManyInput> = z.object({
  createdAt: z.coerce.date().optional(),
  createdBy: z.string(),
  endpoint: z.string(),
  frequency: z.string(),
  id: z.number().int().optional(),
  name: z.string(),
  deleted: z.boolean().optional()
}).strict();

export const ScheduledJobUpdateManyMutationInputSchema: z.ZodType<Prisma.ScheduledJobUpdateManyMutationInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdBy: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  frequency: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ScheduledJobUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ScheduledJobUncheckedUpdateManyInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdBy: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  frequency: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SecretCreateInputSchema: z.ZodType<Prisma.SecretCreateInput> = z.object({
  name: z.string(),
  category: z.lazy(() => SecretCategorySchema),
  createdAt: z.coerce.date().optional(),
  secret: z.string(),
  shouldEncrypt: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutSecretsInputSchema).optional(),
  node: z.lazy(() => NodeCreateNestedOneWithoutSecretsInputSchema).optional()
}).strict();

export const SecretUncheckedCreateInputSchema: z.ZodType<Prisma.SecretUncheckedCreateInput> = z.object({
  name: z.string(),
  category: z.lazy(() => SecretCategorySchema),
  createdAt: z.coerce.date().optional(),
  flowId: z.string().optional().nullable(),
  id: z.number().int().optional(),
  nodeId: z.string().optional().nullable(),
  secret: z.string(),
  shouldEncrypt: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const SecretUpdateInputSchema: z.ZodType<Prisma.SecretUpdateInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => EnumSecretCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  secret: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shouldEncrypt: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneWithoutSecretsNestedInputSchema).optional(),
  node: z.lazy(() => NodeUpdateOneWithoutSecretsNestedInputSchema).optional()
}).strict();

export const SecretUncheckedUpdateInputSchema: z.ZodType<Prisma.SecretUncheckedUpdateInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => EnumSecretCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  secret: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shouldEncrypt: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SecretCreateManyInputSchema: z.ZodType<Prisma.SecretCreateManyInput> = z.object({
  name: z.string(),
  category: z.lazy(() => SecretCategorySchema),
  createdAt: z.coerce.date().optional(),
  flowId: z.string().optional().nullable(),
  id: z.number().int().optional(),
  nodeId: z.string().optional().nullable(),
  secret: z.string(),
  shouldEncrypt: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const SecretUpdateManyMutationInputSchema: z.ZodType<Prisma.SecretUpdateManyMutationInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => EnumSecretCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  secret: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shouldEncrypt: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SecretUncheckedUpdateManyInputSchema: z.ZodType<Prisma.SecretUncheckedUpdateManyInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => EnumSecretCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  secret: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shouldEncrypt: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagCreateInputSchema: z.ZodType<Prisma.TagCreateInput> = z.object({
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutTagsInputSchema).optional(),
  node: z.lazy(() => NodeCreateNestedOneWithoutTagInputSchema).optional(),
  tagGroup: z.lazy(() => TagGroupCreateNestedOneWithoutTagsInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutTagsInputSchema)
}).strict();

export const TagUncheckedCreateInputSchema: z.ZodType<Prisma.TagUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.string().optional().nullable(),
  nodeId: z.string().optional().nullable(),
  tagGroupId: z.string().optional().nullable(),
  instanceId: z.string()
}).strict();

export const TagUpdateInputSchema: z.ZodType<Prisma.TagUpdateInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flow: z.lazy(() => FlowUpdateOneWithoutTagsNestedInputSchema).optional(),
  node: z.lazy(() => NodeUpdateOneWithoutTagNestedInputSchema).optional(),
  tagGroup: z.lazy(() => TagGroupUpdateOneWithoutTagsNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutTagsNestedInputSchema).optional()
}).strict();

export const TagUncheckedUpdateInputSchema: z.ZodType<Prisma.TagUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nodeId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tagGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagCreateManyInputSchema: z.ZodType<Prisma.TagCreateManyInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.string().optional().nullable(),
  nodeId: z.string().optional().nullable(),
  tagGroupId: z.string().optional().nullable(),
  instanceId: z.string()
}).strict();

export const TagUpdateManyMutationInputSchema: z.ZodType<Prisma.TagUpdateManyMutationInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const TagUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TagUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nodeId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tagGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagGroupCreateInputSchema: z.ZodType<Prisma.TagGroupCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  color: z.string(),
  deleted: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutTagGroupInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutTagGroupsInputSchema)
}).strict();

export const TagGroupUncheckedCreateInputSchema: z.ZodType<Prisma.TagGroupUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  color: z.string(),
  deleted: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  instanceId: z.string(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutTagGroupInputSchema).optional()
}).strict();

export const TagGroupUpdateInputSchema: z.ZodType<Prisma.TagGroupUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutTagGroupNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutTagGroupsNestedInputSchema).optional()
}).strict();

export const TagGroupUncheckedUpdateInputSchema: z.ZodType<Prisma.TagGroupUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutTagGroupNestedInputSchema).optional()
}).strict();

export const TagGroupCreateManyInputSchema: z.ZodType<Prisma.TagGroupCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  color: z.string(),
  deleted: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  instanceId: z.string()
}).strict();

export const TagGroupUpdateManyMutationInputSchema: z.ZodType<Prisma.TagGroupUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const TagGroupUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TagGroupUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TestCaseCreateInputSchema: z.ZodType<Prisma.TestCaseCreateInput> = z.object({
  color: z.lazy(() => MantineColorSchema),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutTestCasesInputSchema)
}).strict();

export const TestCaseUncheckedCreateInputSchema: z.ZodType<Prisma.TestCaseUncheckedCreateInput> = z.object({
  color: z.lazy(() => MantineColorSchema),
  createdAt: z.coerce.date().optional(),
  flowId: z.string(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const TestCaseUpdateInputSchema: z.ZodType<Prisma.TestCaseUpdateInput> = z.object({
  color: z.union([ z.lazy(() => MantineColorSchema),z.lazy(() => EnumMantineColorFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutTestCasesNestedInputSchema).optional()
}).strict();

export const TestCaseUncheckedUpdateInputSchema: z.ZodType<Prisma.TestCaseUncheckedUpdateInput> = z.object({
  color: z.union([ z.lazy(() => MantineColorSchema),z.lazy(() => EnumMantineColorFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TestCaseCreateManyInputSchema: z.ZodType<Prisma.TestCaseCreateManyInput> = z.object({
  color: z.lazy(() => MantineColorSchema),
  createdAt: z.coerce.date().optional(),
  flowId: z.string(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const TestCaseUpdateManyMutationInputSchema: z.ZodType<Prisma.TestCaseUpdateManyMutationInput> = z.object({
  color: z.union([ z.lazy(() => MantineColorSchema),z.lazy(() => EnumMantineColorFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TestCaseUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TestCaseUncheckedUpdateManyInput> = z.object({
  color: z.union([ z.lazy(() => MantineColorSchema),z.lazy(() => EnumMantineColorFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountCreateInputSchema: z.ZodType<Prisma.AccountCreateInput> = z.object({
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  id: z.string().cuid().optional(),
  id_token: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  refresh_token_expires_in: z.number().int().optional().nullable(),
  scope: z.string().optional().nullable(),
  session_state: z.string().optional().nullable(),
  token_type: z.string().optional().nullable(),
  type: z.string(),
  user: z.lazy(() => UserCreateNestedOneWithoutAccountsInputSchema)
}).strict();

export const AccountUncheckedCreateInputSchema: z.ZodType<Prisma.AccountUncheckedCreateInput> = z.object({
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  id: z.string().cuid().optional(),
  id_token: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  refresh_token_expires_in: z.number().int().optional().nullable(),
  scope: z.string().optional().nullable(),
  session_state: z.string().optional().nullable(),
  token_type: z.string().optional().nullable(),
  type: z.string(),
  userId: z.string()
}).strict();

export const AccountUpdateInputSchema: z.ZodType<Prisma.AccountUpdateInput> = z.object({
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutAccountsNestedInputSchema).optional()
}).strict();

export const AccountUncheckedUpdateInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateInput> = z.object({
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountCreateManyInputSchema: z.ZodType<Prisma.AccountCreateManyInput> = z.object({
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  id: z.string().cuid().optional(),
  id_token: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  refresh_token_expires_in: z.number().int().optional().nullable(),
  scope: z.string().optional().nullable(),
  session_state: z.string().optional().nullable(),
  token_type: z.string().optional().nullable(),
  type: z.string(),
  userId: z.string()
}).strict();

export const AccountUpdateManyMutationInputSchema: z.ZodType<Prisma.AccountUpdateManyMutationInput> = z.object({
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateManyInput> = z.object({
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionCreateInputSchema: z.ZodType<Prisma.SessionCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
  expires: z.coerce.date(),
  id: z.string().cuid().optional(),
  sessionToken: z.string(),
  user: z.lazy(() => UserCreateNestedOneWithoutSessionsInputSchema)
}).strict();

export const SessionUncheckedCreateInputSchema: z.ZodType<Prisma.SessionUncheckedCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
  expires: z.coerce.date(),
  id: z.string().cuid().optional(),
  sessionToken: z.string(),
  userId: z.string()
}).strict();

export const SessionUpdateInputSchema: z.ZodType<Prisma.SessionUpdateInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutSessionsNestedInputSchema).optional()
}).strict();

export const SessionUncheckedUpdateInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionCreateManyInputSchema: z.ZodType<Prisma.SessionCreateManyInput> = z.object({
  createdAt: z.coerce.date().optional(),
  expires: z.coerce.date(),
  id: z.string().cuid().optional(),
  sessionToken: z.string(),
  userId: z.string()
}).strict();

export const SessionUpdateManyMutationInputSchema: z.ZodType<Prisma.SessionUpdateManyMutationInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  instances: z.lazy(() => InstanceCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  instances: z.lazy(() => InstanceUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  instances: z.lazy(() => InstanceUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  instances: z.lazy(() => InstanceUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VerificationTokenCreateInputSchema: z.ZodType<Prisma.VerificationTokenCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
  expires: z.coerce.date(),
  identifier: z.string(),
  token: z.string()
}).strict();

export const VerificationTokenUncheckedCreateInputSchema: z.ZodType<Prisma.VerificationTokenUncheckedCreateInput> = z.object({
  createdAt: z.coerce.date().optional(),
  expires: z.coerce.date(),
  identifier: z.string(),
  token: z.string()
}).strict();

export const VerificationTokenUpdateInputSchema: z.ZodType<Prisma.VerificationTokenUpdateInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VerificationTokenUncheckedUpdateInputSchema: z.ZodType<Prisma.VerificationTokenUncheckedUpdateInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VerificationTokenCreateManyInputSchema: z.ZodType<Prisma.VerificationTokenCreateManyInput> = z.object({
  createdAt: z.coerce.date().optional(),
  expires: z.coerce.date(),
  identifier: z.string(),
  token: z.string()
}).strict();

export const VerificationTokenUpdateManyMutationInputSchema: z.ZodType<Prisma.VerificationTokenUpdateManyMutationInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VerificationTokenUncheckedUpdateManyInputSchema: z.ZodType<Prisma.VerificationTokenUncheckedUpdateManyInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AuditLogCreateInputSchema: z.ZodType<Prisma.AuditLogCreateInput> = z.object({
  id: z.string().cuid().optional(),
  entityType: z.string(),
  entityId: z.string(),
  changeType: z.string(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  timestamp: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutAuditLogsInputSchema),
  flow: z.lazy(() => FlowCreateNestedOneWithoutAuditLogsInputSchema)
}).strict();

export const AuditLogUncheckedCreateInputSchema: z.ZodType<Prisma.AuditLogUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  entityType: z.string(),
  entityId: z.string(),
  flowId: z.string(),
  changeType: z.string(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  userId: z.string(),
  timestamp: z.coerce.date().optional()
}).strict();

export const AuditLogUpdateInputSchema: z.ZodType<Prisma.AuditLogUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changeType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutAuditLogsNestedInputSchema).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutAuditLogsNestedInputSchema).optional()
}).strict();

export const AuditLogUncheckedUpdateInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changeType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AuditLogCreateManyInputSchema: z.ZodType<Prisma.AuditLogCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  entityType: z.string(),
  entityId: z.string(),
  flowId: z.string(),
  changeType: z.string(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  userId: z.string(),
  timestamp: z.coerce.date().optional()
}).strict();

export const AuditLogUpdateManyMutationInputSchema: z.ZodType<Prisma.AuditLogUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changeType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AuditLogUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changeType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowStatisticsCreateInputSchema: z.ZodType<Prisma.FlowStatisticsCreateInput> = z.object({
  id: z.string().cuid().optional(),
  totalRuns: z.number().int().optional(),
  successfulRuns: z.number().int().optional(),
  failedRuns: z.number().int().optional(),
  lastUpdated: z.coerce.date().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutStatisticsInputSchema)
}).strict();

export const FlowStatisticsUncheckedCreateInputSchema: z.ZodType<Prisma.FlowStatisticsUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  flowId: z.string(),
  totalRuns: z.number().int().optional(),
  successfulRuns: z.number().int().optional(),
  failedRuns: z.number().int().optional(),
  lastUpdated: z.coerce.date().optional()
}).strict();

export const FlowStatisticsUpdateInputSchema: z.ZodType<Prisma.FlowStatisticsUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  totalRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  successfulRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  failedRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastUpdated: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutStatisticsNestedInputSchema).optional()
}).strict();

export const FlowStatisticsUncheckedUpdateInputSchema: z.ZodType<Prisma.FlowStatisticsUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  totalRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  successfulRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  failedRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastUpdated: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowStatisticsCreateManyInputSchema: z.ZodType<Prisma.FlowStatisticsCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  flowId: z.string(),
  totalRuns: z.number().int().optional(),
  successfulRuns: z.number().int().optional(),
  failedRuns: z.number().int().optional(),
  lastUpdated: z.coerce.date().optional()
}).strict();

export const FlowStatisticsUpdateManyMutationInputSchema: z.ZodType<Prisma.FlowStatisticsUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  totalRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  successfulRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  failedRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastUpdated: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowStatisticsUncheckedUpdateManyInputSchema: z.ZodType<Prisma.FlowStatisticsUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  totalRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  successfulRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  failedRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastUpdated: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const EnumEdgeTypeFilterSchema: z.ZodType<Prisma.EnumEdgeTypeFilter> = z.object({
  equals: z.lazy(() => EdgeTypeSchema).optional(),
  in: z.lazy(() => EdgeTypeSchema).array().optional(),
  notIn: z.lazy(() => EdgeTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => NestedEnumEdgeTypeFilterSchema) ]).optional(),
}).strict();

export const JsonNullableFilterSchema: z.ZodType<Prisma.JsonNullableFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional()
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const FlowScalarRelationFilterSchema: z.ZodType<Prisma.FlowScalarRelationFilter> = z.object({
  is: z.lazy(() => FlowWhereInputSchema).optional(),
  isNot: z.lazy(() => FlowWhereInputSchema).optional()
}).strict();

export const NodeScalarRelationFilterSchema: z.ZodType<Prisma.NodeScalarRelationFilter> = z.object({
  is: z.lazy(() => NodeWhereInputSchema).optional(),
  isNot: z.lazy(() => NodeWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const EdgeSourceNodeIdTargetNodeIdCompoundUniqueInputSchema: z.ZodType<Prisma.EdgeSourceNodeIdTargetNodeIdCompoundUniqueInput> = z.object({
  sourceNodeId: z.string(),
  targetNodeId: z.string()
}).strict();

export const EdgeCountOrderByAggregateInputSchema: z.ZodType<Prisma.EdgeCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sourceNodeId: z.lazy(() => SortOrderSchema).optional(),
  targetNodeId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  rfId: z.lazy(() => SortOrderSchema).optional(),
  label: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  normalizedKey: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EdgeMaxOrderByAggregateInputSchema: z.ZodType<Prisma.EdgeMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sourceNodeId: z.lazy(() => SortOrderSchema).optional(),
  targetNodeId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  rfId: z.lazy(() => SortOrderSchema).optional(),
  label: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  normalizedKey: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EdgeMinOrderByAggregateInputSchema: z.ZodType<Prisma.EdgeMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sourceNodeId: z.lazy(() => SortOrderSchema).optional(),
  targetNodeId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  rfId: z.lazy(() => SortOrderSchema).optional(),
  label: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  normalizedKey: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const EnumEdgeTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumEdgeTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => EdgeTypeSchema).optional(),
  in: z.lazy(() => EdgeTypeSchema).array().optional(),
  notIn: z.lazy(() => EdgeTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => NestedEnumEdgeTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumEdgeTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumEdgeTypeFilterSchema).optional()
}).strict();

export const JsonNullableWithAggregatesFilterSchema: z.ZodType<Prisma.JsonNullableWithAggregatesFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedJsonNullableFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const EnumFlowMethodFilterSchema: z.ZodType<Prisma.EnumFlowMethodFilter> = z.object({
  equals: z.lazy(() => FlowMethodSchema).optional(),
  in: z.lazy(() => FlowMethodSchema).array().optional(),
  notIn: z.lazy(() => FlowMethodSchema).array().optional(),
  not: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => NestedEnumFlowMethodFilterSchema) ]).optional(),
}).strict();

export const EdgeListRelationFilterSchema: z.ZodType<Prisma.EdgeListRelationFilter> = z.object({
  every: z.lazy(() => EdgeWhereInputSchema).optional(),
  some: z.lazy(() => EdgeWhereInputSchema).optional(),
  none: z.lazy(() => EdgeWhereInputSchema).optional()
}).strict();

export const FlowRunListRelationFilterSchema: z.ZodType<Prisma.FlowRunListRelationFilter> = z.object({
  every: z.lazy(() => FlowRunWhereInputSchema).optional(),
  some: z.lazy(() => FlowRunWhereInputSchema).optional(),
  none: z.lazy(() => FlowRunWhereInputSchema).optional()
}).strict();

export const FlowEventListRelationFilterSchema: z.ZodType<Prisma.FlowEventListRelationFilter> = z.object({
  every: z.lazy(() => FlowEventWhereInputSchema).optional(),
  some: z.lazy(() => FlowEventWhereInputSchema).optional(),
  none: z.lazy(() => FlowEventWhereInputSchema).optional()
}).strict();

export const InstanceScalarRelationFilterSchema: z.ZodType<Prisma.InstanceScalarRelationFilter> = z.object({
  is: z.lazy(() => InstanceWhereInputSchema).optional(),
  isNot: z.lazy(() => InstanceWhereInputSchema).optional()
}).strict();

export const NodeListRelationFilterSchema: z.ZodType<Prisma.NodeListRelationFilter> = z.object({
  every: z.lazy(() => NodeWhereInputSchema).optional(),
  some: z.lazy(() => NodeWhereInputSchema).optional(),
  none: z.lazy(() => NodeWhereInputSchema).optional()
}).strict();

export const SecretListRelationFilterSchema: z.ZodType<Prisma.SecretListRelationFilter> = z.object({
  every: z.lazy(() => SecretWhereInputSchema).optional(),
  some: z.lazy(() => SecretWhereInputSchema).optional(),
  none: z.lazy(() => SecretWhereInputSchema).optional()
}).strict();

export const TagListRelationFilterSchema: z.ZodType<Prisma.TagListRelationFilter> = z.object({
  every: z.lazy(() => TagWhereInputSchema).optional(),
  some: z.lazy(() => TagWhereInputSchema).optional(),
  none: z.lazy(() => TagWhereInputSchema).optional()
}).strict();

export const TestCaseListRelationFilterSchema: z.ZodType<Prisma.TestCaseListRelationFilter> = z.object({
  every: z.lazy(() => TestCaseWhereInputSchema).optional(),
  some: z.lazy(() => TestCaseWhereInputSchema).optional(),
  none: z.lazy(() => TestCaseWhereInputSchema).optional()
}).strict();

export const AuditLogListRelationFilterSchema: z.ZodType<Prisma.AuditLogListRelationFilter> = z.object({
  every: z.lazy(() => AuditLogWhereInputSchema).optional(),
  some: z.lazy(() => AuditLogWhereInputSchema).optional(),
  none: z.lazy(() => AuditLogWhereInputSchema).optional()
}).strict();

export const FlowStatisticsNullableScalarRelationFilterSchema: z.ZodType<Prisma.FlowStatisticsNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => FlowStatisticsWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => FlowStatisticsWhereInputSchema).optional().nullable()
}).strict();

export const EdgeOrderByRelationAggregateInputSchema: z.ZodType<Prisma.EdgeOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowRunOrderByRelationAggregateInputSchema: z.ZodType<Prisma.FlowRunOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowEventOrderByRelationAggregateInputSchema: z.ZodType<Prisma.FlowEventOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const NodeOrderByRelationAggregateInputSchema: z.ZodType<Prisma.NodeOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SecretOrderByRelationAggregateInputSchema: z.ZodType<Prisma.SecretOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagOrderByRelationAggregateInputSchema: z.ZodType<Prisma.TagOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TestCaseOrderByRelationAggregateInputSchema: z.ZodType<Prisma.TestCaseOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AuditLogOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AuditLogOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowIdInstanceIdCompoundUniqueInputSchema: z.ZodType<Prisma.FlowIdInstanceIdCompoundUniqueInput> = z.object({
  id: z.string(),
  instanceId: z.string()
}).strict();

export const FlowCountOrderByAggregateInputSchema: z.ZodType<Prisma.FlowCountOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  isEnabled: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  viewport: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowMaxOrderByAggregateInputSchema: z.ZodType<Prisma.FlowMaxOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  isEnabled: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowMinOrderByAggregateInputSchema: z.ZodType<Prisma.FlowMinOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional(),
  isEnabled: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumFlowMethodWithAggregatesFilterSchema: z.ZodType<Prisma.EnumFlowMethodWithAggregatesFilter> = z.object({
  equals: z.lazy(() => FlowMethodSchema).optional(),
  in: z.lazy(() => FlowMethodSchema).array().optional(),
  notIn: z.lazy(() => FlowMethodSchema).array().optional(),
  not: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => NestedEnumFlowMethodWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumFlowMethodFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumFlowMethodFilterSchema).optional()
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const EnumStartedByFilterSchema: z.ZodType<Prisma.EnumStartedByFilter> = z.object({
  equals: z.lazy(() => StartedBySchema).optional(),
  in: z.lazy(() => StartedBySchema).array().optional(),
  notIn: z.lazy(() => StartedBySchema).array().optional(),
  not: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => NestedEnumStartedByFilterSchema) ]).optional(),
}).strict();

export const FlowRunScalarRelationFilterSchema: z.ZodType<Prisma.FlowRunScalarRelationFilter> = z.object({
  is: z.lazy(() => FlowRunWhereInputSchema).optional(),
  isNot: z.lazy(() => FlowRunWhereInputSchema).optional()
}).strict();

export const FlowEventCountOrderByAggregateInputSchema: z.ZodType<Prisma.FlowEventCountOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowRunId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.lazy(() => SortOrderSchema).optional(),
  payload: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  startedBy: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowEventAvgOrderByAggregateInputSchema: z.ZodType<Prisma.FlowEventAvgOrderByAggregateInput> = z.object({
  flowRunId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowEventMaxOrderByAggregateInputSchema: z.ZodType<Prisma.FlowEventMaxOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowRunId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.lazy(() => SortOrderSchema).optional(),
  startedBy: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowEventMinOrderByAggregateInputSchema: z.ZodType<Prisma.FlowEventMinOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowRunId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.lazy(() => SortOrderSchema).optional(),
  startedBy: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowEventSumOrderByAggregateInputSchema: z.ZodType<Prisma.FlowEventSumOrderByAggregateInput> = z.object({
  flowRunId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const EnumStartedByWithAggregatesFilterSchema: z.ZodType<Prisma.EnumStartedByWithAggregatesFilter> = z.object({
  equals: z.lazy(() => StartedBySchema).optional(),
  in: z.lazy(() => StartedBySchema).array().optional(),
  notIn: z.lazy(() => StartedBySchema).array().optional(),
  not: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => NestedEnumStartedByWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumStartedByFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumStartedByFilterSchema).optional()
}).strict();

export const BoolNullableFilterSchema: z.ZodType<Prisma.BoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const EnumRunStatusFilterSchema: z.ZodType<Prisma.EnumRunStatusFilter> = z.object({
  equals: z.lazy(() => RunStatusSchema).optional(),
  in: z.lazy(() => RunStatusSchema).array().optional(),
  notIn: z.lazy(() => RunStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => NestedEnumRunStatusFilterSchema) ]).optional(),
}).strict();

export const IntNullableFilterSchema: z.ZodType<Prisma.IntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const ScheduledJobNullableScalarRelationFilterSchema: z.ZodType<Prisma.ScheduledJobNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => ScheduledJobWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ScheduledJobWhereInputSchema).optional().nullable()
}).strict();

export const FlowRunCountOrderByAggregateInputSchema: z.ZodType<Prisma.FlowRunCountOrderByAggregateInput> = z.object({
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  isScheduled: z.lazy(() => SortOrderSchema).optional(),
  payload: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  runStatus: z.lazy(() => SortOrderSchema).optional(),
  scheduledJobId: z.lazy(() => SortOrderSchema).optional(),
  startedBy: z.lazy(() => SortOrderSchema).optional(),
  timeEnded: z.lazy(() => SortOrderSchema).optional(),
  timeStarted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowRunAvgOrderByAggregateInputSchema: z.ZodType<Prisma.FlowRunAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  scheduledJobId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowRunMaxOrderByAggregateInputSchema: z.ZodType<Prisma.FlowRunMaxOrderByAggregateInput> = z.object({
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  isScheduled: z.lazy(() => SortOrderSchema).optional(),
  runStatus: z.lazy(() => SortOrderSchema).optional(),
  scheduledJobId: z.lazy(() => SortOrderSchema).optional(),
  startedBy: z.lazy(() => SortOrderSchema).optional(),
  timeEnded: z.lazy(() => SortOrderSchema).optional(),
  timeStarted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowRunMinOrderByAggregateInputSchema: z.ZodType<Prisma.FlowRunMinOrderByAggregateInput> = z.object({
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  isScheduled: z.lazy(() => SortOrderSchema).optional(),
  runStatus: z.lazy(() => SortOrderSchema).optional(),
  scheduledJobId: z.lazy(() => SortOrderSchema).optional(),
  startedBy: z.lazy(() => SortOrderSchema).optional(),
  timeEnded: z.lazy(() => SortOrderSchema).optional(),
  timeStarted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowRunSumOrderByAggregateInputSchema: z.ZodType<Prisma.FlowRunSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  scheduledJobId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.BoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional()
}).strict();

export const EnumRunStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRunStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RunStatusSchema).optional(),
  in: z.lazy(() => RunStatusSchema).array().optional(),
  notIn: z.lazy(() => RunStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => NestedEnumRunStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRunStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRunStatusFilterSchema).optional()
}).strict();

export const IntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict();

export const EnumInfraTypeFilterSchema: z.ZodType<Prisma.EnumInfraTypeFilter> = z.object({
  equals: z.lazy(() => InfraTypeSchema).optional(),
  in: z.lazy(() => InfraTypeSchema).array().optional(),
  notIn: z.lazy(() => InfraTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => InfraTypeSchema),z.lazy(() => NestedEnumInfraTypeFilterSchema) ]).optional(),
}).strict();

export const InfrastructureCountOrderByAggregateInputSchema: z.ZodType<Prisma.InfrastructureCountOrderByAggregateInput> = z.object({
  arn: z.lazy(() => SortOrderSchema).optional(),
  canControl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  data: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const InfrastructureMaxOrderByAggregateInputSchema: z.ZodType<Prisma.InfrastructureMaxOrderByAggregateInput> = z.object({
  arn: z.lazy(() => SortOrderSchema).optional(),
  canControl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const InfrastructureMinOrderByAggregateInputSchema: z.ZodType<Prisma.InfrastructureMinOrderByAggregateInput> = z.object({
  arn: z.lazy(() => SortOrderSchema).optional(),
  canControl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumInfraTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumInfraTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => InfraTypeSchema).optional(),
  in: z.lazy(() => InfraTypeSchema).array().optional(),
  notIn: z.lazy(() => InfraTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => InfraTypeSchema),z.lazy(() => NestedEnumInfraTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumInfraTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumInfraTypeFilterSchema).optional()
}).strict();

export const FlowListRelationFilterSchema: z.ZodType<Prisma.FlowListRelationFilter> = z.object({
  every: z.lazy(() => FlowWhereInputSchema).optional(),
  some: z.lazy(() => FlowWhereInputSchema).optional(),
  none: z.lazy(() => FlowWhereInputSchema).optional()
}).strict();

export const TagGroupListRelationFilterSchema: z.ZodType<Prisma.TagGroupListRelationFilter> = z.object({
  every: z.lazy(() => TagGroupWhereInputSchema).optional(),
  some: z.lazy(() => TagGroupWhereInputSchema).optional(),
  none: z.lazy(() => TagGroupWhereInputSchema).optional()
}).strict();

export const UserNullableScalarRelationFilterSchema: z.ZodType<Prisma.UserNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserWhereInputSchema).optional().nullable()
}).strict();

export const FlowOrderByRelationAggregateInputSchema: z.ZodType<Prisma.FlowOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagGroupOrderByRelationAggregateInputSchema: z.ZodType<Prisma.TagGroupOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const InstanceCountOrderByAggregateInputSchema: z.ZodType<Prisma.InstanceCountOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  logo: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const InstanceMaxOrderByAggregateInputSchema: z.ZodType<Prisma.InstanceMaxOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  logo: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const InstanceMinOrderByAggregateInputSchema: z.ZodType<Prisma.InstanceMinOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  logo: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumNodeTypeFilterSchema: z.ZodType<Prisma.EnumNodeTypeFilter> = z.object({
  equals: z.lazy(() => NodeTypeSchema).optional(),
  in: z.lazy(() => NodeTypeSchema).array().optional(),
  notIn: z.lazy(() => NodeTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => NestedEnumNodeTypeFilterSchema) ]).optional(),
}).strict();

export const InfrastructureNullableScalarRelationFilterSchema: z.ZodType<Prisma.InfrastructureNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => InfrastructureWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => InfrastructureWhereInputSchema).optional().nullable()
}).strict();

export const NodeFlowIdRfIdCompoundUniqueInputSchema: z.ZodType<Prisma.NodeFlowIdRfIdCompoundUniqueInput> = z.object({
  flowId: z.string(),
  rfId: z.string()
}).strict();

export const NodeCountOrderByAggregateInputSchema: z.ZodType<Prisma.NodeCountOrderByAggregateInput> = z.object({
  arn: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  infrastructureId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  position: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  rfId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const NodeMaxOrderByAggregateInputSchema: z.ZodType<Prisma.NodeMaxOrderByAggregateInput> = z.object({
  arn: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  infrastructureId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  rfId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const NodeMinOrderByAggregateInputSchema: z.ZodType<Prisma.NodeMinOrderByAggregateInput> = z.object({
  arn: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  infrastructureId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  rfId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumNodeTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumNodeTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => NodeTypeSchema).optional(),
  in: z.lazy(() => NodeTypeSchema).array().optional(),
  notIn: z.lazy(() => NodeTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => NestedEnumNodeTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumNodeTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumNodeTypeFilterSchema).optional()
}).strict();

export const ScheduledJobCountOrderByAggregateInputSchema: z.ZodType<Prisma.ScheduledJobCountOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.lazy(() => SortOrderSchema).optional(),
  endpoint: z.lazy(() => SortOrderSchema).optional(),
  frequency: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ScheduledJobAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ScheduledJobAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ScheduledJobMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ScheduledJobMaxOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.lazy(() => SortOrderSchema).optional(),
  endpoint: z.lazy(() => SortOrderSchema).optional(),
  frequency: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ScheduledJobMinOrderByAggregateInputSchema: z.ZodType<Prisma.ScheduledJobMinOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.lazy(() => SortOrderSchema).optional(),
  endpoint: z.lazy(() => SortOrderSchema).optional(),
  frequency: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ScheduledJobSumOrderByAggregateInputSchema: z.ZodType<Prisma.ScheduledJobSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumSecretCategoryFilterSchema: z.ZodType<Prisma.EnumSecretCategoryFilter> = z.object({
  equals: z.lazy(() => SecretCategorySchema).optional(),
  in: z.lazy(() => SecretCategorySchema).array().optional(),
  notIn: z.lazy(() => SecretCategorySchema).array().optional(),
  not: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => NestedEnumSecretCategoryFilterSchema) ]).optional(),
}).strict();

export const FlowNullableScalarRelationFilterSchema: z.ZodType<Prisma.FlowNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => FlowWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => FlowWhereInputSchema).optional().nullable()
}).strict();

export const NodeNullableScalarRelationFilterSchema: z.ZodType<Prisma.NodeNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => NodeWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => NodeWhereInputSchema).optional().nullable()
}).strict();

export const SecretCountOrderByAggregateInputSchema: z.ZodType<Prisma.SecretCountOrderByAggregateInput> = z.object({
  name: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.lazy(() => SortOrderSchema).optional(),
  secret: z.lazy(() => SortOrderSchema).optional(),
  shouldEncrypt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SecretAvgOrderByAggregateInputSchema: z.ZodType<Prisma.SecretAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SecretMaxOrderByAggregateInputSchema: z.ZodType<Prisma.SecretMaxOrderByAggregateInput> = z.object({
  name: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.lazy(() => SortOrderSchema).optional(),
  secret: z.lazy(() => SortOrderSchema).optional(),
  shouldEncrypt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SecretMinOrderByAggregateInputSchema: z.ZodType<Prisma.SecretMinOrderByAggregateInput> = z.object({
  name: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.lazy(() => SortOrderSchema).optional(),
  secret: z.lazy(() => SortOrderSchema).optional(),
  shouldEncrypt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SecretSumOrderByAggregateInputSchema: z.ZodType<Prisma.SecretSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumSecretCategoryWithAggregatesFilterSchema: z.ZodType<Prisma.EnumSecretCategoryWithAggregatesFilter> = z.object({
  equals: z.lazy(() => SecretCategorySchema).optional(),
  in: z.lazy(() => SecretCategorySchema).array().optional(),
  notIn: z.lazy(() => SecretCategorySchema).array().optional(),
  not: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => NestedEnumSecretCategoryWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumSecretCategoryFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumSecretCategoryFilterSchema).optional()
}).strict();

export const TagGroupNullableScalarRelationFilterSchema: z.ZodType<Prisma.TagGroupNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => TagGroupWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => TagGroupWhereInputSchema).optional().nullable()
}).strict();

export const TagIdInstanceIdCompoundUniqueInputSchema: z.ZodType<Prisma.TagIdInstanceIdCompoundUniqueInput> = z.object({
  id: z.number(),
  instanceId: z.string()
}).strict();

export const TagCountOrderByAggregateInputSchema: z.ZodType<Prisma.TagCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.lazy(() => SortOrderSchema).optional(),
  tagGroupId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TagAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TagMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.lazy(() => SortOrderSchema).optional(),
  tagGroupId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagMinOrderByAggregateInputSchema: z.ZodType<Prisma.TagMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  nodeId: z.lazy(() => SortOrderSchema).optional(),
  tagGroupId: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagSumOrderByAggregateInputSchema: z.ZodType<Prisma.TagSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagGroupIdInstanceIdCompoundUniqueInputSchema: z.ZodType<Prisma.TagGroupIdInstanceIdCompoundUniqueInput> = z.object({
  id: z.string(),
  instanceId: z.string()
}).strict();

export const TagGroupCountOrderByAggregateInputSchema: z.ZodType<Prisma.TagGroupCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagGroupMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TagGroupMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TagGroupMinOrderByAggregateInputSchema: z.ZodType<Prisma.TagGroupMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  instanceId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumMantineColorFilterSchema: z.ZodType<Prisma.EnumMantineColorFilter> = z.object({
  equals: z.lazy(() => MantineColorSchema).optional(),
  in: z.lazy(() => MantineColorSchema).array().optional(),
  notIn: z.lazy(() => MantineColorSchema).array().optional(),
  not: z.union([ z.lazy(() => MantineColorSchema),z.lazy(() => NestedEnumMantineColorFilterSchema) ]).optional(),
}).strict();

export const TestCaseCountOrderByAggregateInputSchema: z.ZodType<Prisma.TestCaseCountOrderByAggregateInput> = z.object({
  color: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TestCaseMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TestCaseMaxOrderByAggregateInput> = z.object({
  color: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TestCaseMinOrderByAggregateInputSchema: z.ZodType<Prisma.TestCaseMinOrderByAggregateInput> = z.object({
  color: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deleted: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumMantineColorWithAggregatesFilterSchema: z.ZodType<Prisma.EnumMantineColorWithAggregatesFilter> = z.object({
  equals: z.lazy(() => MantineColorSchema).optional(),
  in: z.lazy(() => MantineColorSchema).array().optional(),
  notIn: z.lazy(() => MantineColorSchema).array().optional(),
  not: z.union([ z.lazy(() => MantineColorSchema),z.lazy(() => NestedEnumMantineColorWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumMantineColorFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumMantineColorFilterSchema).optional()
}).strict();

export const UserScalarRelationFilterSchema: z.ZodType<Prisma.UserScalarRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const AccountProviderProviderAccountIdCompoundUniqueInputSchema: z.ZodType<Prisma.AccountProviderProviderAccountIdCompoundUniqueInput> = z.object({
  provider: z.string(),
  providerAccountId: z.string()
}).strict();

export const AccountCountOrderByAggregateInputSchema: z.ZodType<Prisma.AccountCountOrderByAggregateInput> = z.object({
  access_token: z.lazy(() => SortOrderSchema).optional(),
  expires_at: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  id_token: z.lazy(() => SortOrderSchema).optional(),
  oauth_token: z.lazy(() => SortOrderSchema).optional(),
  oauth_token_secret: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  providerAccountId: z.lazy(() => SortOrderSchema).optional(),
  refresh_token: z.lazy(() => SortOrderSchema).optional(),
  refresh_token_expires_in: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  session_state: z.lazy(() => SortOrderSchema).optional(),
  token_type: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountAvgOrderByAggregateInputSchema: z.ZodType<Prisma.AccountAvgOrderByAggregateInput> = z.object({
  expires_at: z.lazy(() => SortOrderSchema).optional(),
  refresh_token_expires_in: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AccountMaxOrderByAggregateInput> = z.object({
  access_token: z.lazy(() => SortOrderSchema).optional(),
  expires_at: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  id_token: z.lazy(() => SortOrderSchema).optional(),
  oauth_token: z.lazy(() => SortOrderSchema).optional(),
  oauth_token_secret: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  providerAccountId: z.lazy(() => SortOrderSchema).optional(),
  refresh_token: z.lazy(() => SortOrderSchema).optional(),
  refresh_token_expires_in: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  session_state: z.lazy(() => SortOrderSchema).optional(),
  token_type: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountMinOrderByAggregateInputSchema: z.ZodType<Prisma.AccountMinOrderByAggregateInput> = z.object({
  access_token: z.lazy(() => SortOrderSchema).optional(),
  expires_at: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  id_token: z.lazy(() => SortOrderSchema).optional(),
  oauth_token: z.lazy(() => SortOrderSchema).optional(),
  oauth_token_secret: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  providerAccountId: z.lazy(() => SortOrderSchema).optional(),
  refresh_token: z.lazy(() => SortOrderSchema).optional(),
  refresh_token_expires_in: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  session_state: z.lazy(() => SortOrderSchema).optional(),
  token_type: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountSumOrderByAggregateInputSchema: z.ZodType<Prisma.AccountSumOrderByAggregateInput> = z.object({
  expires_at: z.lazy(() => SortOrderSchema).optional(),
  refresh_token_expires_in: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionCountOrderByAggregateInputSchema: z.ZodType<Prisma.SessionCountOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionToken: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMaxOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionToken: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionMinOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMinOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionToken: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountListRelationFilterSchema: z.ZodType<Prisma.AccountListRelationFilter> = z.object({
  every: z.lazy(() => AccountWhereInputSchema).optional(),
  some: z.lazy(() => AccountWhereInputSchema).optional(),
  none: z.lazy(() => AccountWhereInputSchema).optional()
}).strict();

export const InstanceListRelationFilterSchema: z.ZodType<Prisma.InstanceListRelationFilter> = z.object({
  every: z.lazy(() => InstanceWhereInputSchema).optional(),
  some: z.lazy(() => InstanceWhereInputSchema).optional(),
  none: z.lazy(() => InstanceWhereInputSchema).optional()
}).strict();

export const SessionListRelationFilterSchema: z.ZodType<Prisma.SessionListRelationFilter> = z.object({
  every: z.lazy(() => SessionWhereInputSchema).optional(),
  some: z.lazy(() => SessionWhereInputSchema).optional(),
  none: z.lazy(() => SessionWhereInputSchema).optional()
}).strict();

export const AccountOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AccountOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const InstanceOrderByRelationAggregateInputSchema: z.ZodType<Prisma.InstanceOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.SessionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const VerificationTokenIdentifierTokenCompoundUniqueInputSchema: z.ZodType<Prisma.VerificationTokenIdentifierTokenCompoundUniqueInput> = z.object({
  identifier: z.string(),
  token: z.string()
}).strict();

export const VerificationTokenCountOrderByAggregateInputSchema: z.ZodType<Prisma.VerificationTokenCountOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const VerificationTokenMaxOrderByAggregateInputSchema: z.ZodType<Prisma.VerificationTokenMaxOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const VerificationTokenMinOrderByAggregateInputSchema: z.ZodType<Prisma.VerificationTokenMinOrderByAggregateInput> = z.object({
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  expires: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AuditLogCountOrderByAggregateInputSchema: z.ZodType<Prisma.AuditLogCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  entityType: z.lazy(() => SortOrderSchema).optional(),
  entityId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  changeType: z.lazy(() => SortOrderSchema).optional(),
  before: z.lazy(() => SortOrderSchema).optional(),
  after: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AuditLogMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AuditLogMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  entityType: z.lazy(() => SortOrderSchema).optional(),
  entityId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  changeType: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AuditLogMinOrderByAggregateInputSchema: z.ZodType<Prisma.AuditLogMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  entityType: z.lazy(() => SortOrderSchema).optional(),
  entityId: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  changeType: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowStatisticsCountOrderByAggregateInputSchema: z.ZodType<Prisma.FlowStatisticsCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  totalRuns: z.lazy(() => SortOrderSchema).optional(),
  successfulRuns: z.lazy(() => SortOrderSchema).optional(),
  failedRuns: z.lazy(() => SortOrderSchema).optional(),
  lastUpdated: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowStatisticsAvgOrderByAggregateInputSchema: z.ZodType<Prisma.FlowStatisticsAvgOrderByAggregateInput> = z.object({
  totalRuns: z.lazy(() => SortOrderSchema).optional(),
  successfulRuns: z.lazy(() => SortOrderSchema).optional(),
  failedRuns: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowStatisticsMaxOrderByAggregateInputSchema: z.ZodType<Prisma.FlowStatisticsMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  totalRuns: z.lazy(() => SortOrderSchema).optional(),
  successfulRuns: z.lazy(() => SortOrderSchema).optional(),
  failedRuns: z.lazy(() => SortOrderSchema).optional(),
  lastUpdated: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowStatisticsMinOrderByAggregateInputSchema: z.ZodType<Prisma.FlowStatisticsMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  flowId: z.lazy(() => SortOrderSchema).optional(),
  totalRuns: z.lazy(() => SortOrderSchema).optional(),
  successfulRuns: z.lazy(() => SortOrderSchema).optional(),
  failedRuns: z.lazy(() => SortOrderSchema).optional(),
  lastUpdated: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowStatisticsSumOrderByAggregateInputSchema: z.ZodType<Prisma.FlowStatisticsSumOrderByAggregateInput> = z.object({
  totalRuns: z.lazy(() => SortOrderSchema).optional(),
  successfulRuns: z.lazy(() => SortOrderSchema).optional(),
  failedRuns: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FlowCreateNestedOneWithoutEdgesInputSchema: z.ZodType<Prisma.FlowCreateNestedOneWithoutEdgesInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutEdgesInputSchema),z.lazy(() => FlowUncheckedCreateWithoutEdgesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutEdgesInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional()
}).strict();

export const NodeCreateNestedOneWithoutSourceEdgesInputSchema: z.ZodType<Prisma.NodeCreateNestedOneWithoutSourceEdgesInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutSourceEdgesInputSchema),z.lazy(() => NodeUncheckedCreateWithoutSourceEdgesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => NodeCreateOrConnectWithoutSourceEdgesInputSchema).optional(),
  connect: z.lazy(() => NodeWhereUniqueInputSchema).optional()
}).strict();

export const NodeCreateNestedOneWithoutTargetEdgesInputSchema: z.ZodType<Prisma.NodeCreateNestedOneWithoutTargetEdgesInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutTargetEdgesInputSchema),z.lazy(() => NodeUncheckedCreateWithoutTargetEdgesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => NodeCreateOrConnectWithoutTargetEdgesInputSchema).optional(),
  connect: z.lazy(() => NodeWhereUniqueInputSchema).optional()
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const EnumEdgeTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumEdgeTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => EdgeTypeSchema).optional()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const FlowUpdateOneRequiredWithoutEdgesNestedInputSchema: z.ZodType<Prisma.FlowUpdateOneRequiredWithoutEdgesNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutEdgesInputSchema),z.lazy(() => FlowUncheckedCreateWithoutEdgesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutEdgesInputSchema).optional(),
  upsert: z.lazy(() => FlowUpsertWithoutEdgesInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FlowUpdateToOneWithWhereWithoutEdgesInputSchema),z.lazy(() => FlowUpdateWithoutEdgesInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutEdgesInputSchema) ]).optional(),
}).strict();

export const NodeUpdateOneRequiredWithoutSourceEdgesNestedInputSchema: z.ZodType<Prisma.NodeUpdateOneRequiredWithoutSourceEdgesNestedInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutSourceEdgesInputSchema),z.lazy(() => NodeUncheckedCreateWithoutSourceEdgesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => NodeCreateOrConnectWithoutSourceEdgesInputSchema).optional(),
  upsert: z.lazy(() => NodeUpsertWithoutSourceEdgesInputSchema).optional(),
  connect: z.lazy(() => NodeWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => NodeUpdateToOneWithWhereWithoutSourceEdgesInputSchema),z.lazy(() => NodeUpdateWithoutSourceEdgesInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutSourceEdgesInputSchema) ]).optional(),
}).strict();

export const NodeUpdateOneRequiredWithoutTargetEdgesNestedInputSchema: z.ZodType<Prisma.NodeUpdateOneRequiredWithoutTargetEdgesNestedInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutTargetEdgesInputSchema),z.lazy(() => NodeUncheckedCreateWithoutTargetEdgesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => NodeCreateOrConnectWithoutTargetEdgesInputSchema).optional(),
  upsert: z.lazy(() => NodeUpsertWithoutTargetEdgesInputSchema).optional(),
  connect: z.lazy(() => NodeWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => NodeUpdateToOneWithWhereWithoutTargetEdgesInputSchema),z.lazy(() => NodeUpdateWithoutTargetEdgesInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutTargetEdgesInputSchema) ]).optional(),
}).strict();

export const EdgeCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.EdgeCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => EdgeCreateWithoutFlowInputSchema),z.lazy(() => EdgeCreateWithoutFlowInputSchema).array(),z.lazy(() => EdgeUncheckedCreateWithoutFlowInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EdgeCreateOrConnectWithoutFlowInputSchema),z.lazy(() => EdgeCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EdgeCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FlowRunCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.FlowRunCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => FlowRunCreateWithoutFlowInputSchema),z.lazy(() => FlowRunCreateWithoutFlowInputSchema).array(),z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowRunCreateOrConnectWithoutFlowInputSchema),z.lazy(() => FlowRunCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowRunCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FlowEventCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.FlowEventCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => FlowEventCreateWithoutFlowInputSchema),z.lazy(() => FlowEventCreateWithoutFlowInputSchema).array(),z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputSchema),z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowEventCreateOrConnectWithoutFlowInputSchema),z.lazy(() => FlowEventCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowEventCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const InstanceCreateNestedOneWithoutFlowsInputSchema: z.ZodType<Prisma.InstanceCreateNestedOneWithoutFlowsInput> = z.object({
  create: z.union([ z.lazy(() => InstanceCreateWithoutFlowsInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutFlowsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => InstanceCreateOrConnectWithoutFlowsInputSchema).optional(),
  connect: z.lazy(() => InstanceWhereUniqueInputSchema).optional()
}).strict();

export const NodeCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.NodeCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutFlowInputSchema),z.lazy(() => NodeCreateWithoutFlowInputSchema).array(),z.lazy(() => NodeUncheckedCreateWithoutFlowInputSchema),z.lazy(() => NodeUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => NodeCreateOrConnectWithoutFlowInputSchema),z.lazy(() => NodeCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => NodeCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SecretCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.SecretCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => SecretCreateWithoutFlowInputSchema),z.lazy(() => SecretCreateWithoutFlowInputSchema).array(),z.lazy(() => SecretUncheckedCreateWithoutFlowInputSchema),z.lazy(() => SecretUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SecretCreateOrConnectWithoutFlowInputSchema),z.lazy(() => SecretCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SecretCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TagCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.TagCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutFlowInputSchema),z.lazy(() => TagCreateWithoutFlowInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutFlowInputSchema),z.lazy(() => TagUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutFlowInputSchema),z.lazy(() => TagCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TestCaseCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.TestCaseCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => TestCaseCreateWithoutFlowInputSchema),z.lazy(() => TestCaseCreateWithoutFlowInputSchema).array(),z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputSchema),z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TestCaseCreateOrConnectWithoutFlowInputSchema),z.lazy(() => TestCaseCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TestCaseCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TestCaseWhereUniqueInputSchema),z.lazy(() => TestCaseWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AuditLogCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.AuditLogCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => AuditLogCreateWithoutFlowInputSchema),z.lazy(() => AuditLogCreateWithoutFlowInputSchema).array(),z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputSchema),z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AuditLogCreateOrConnectWithoutFlowInputSchema),z.lazy(() => AuditLogCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AuditLogCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FlowStatisticsCreateNestedOneWithoutFlowInputSchema: z.ZodType<Prisma.FlowStatisticsCreateNestedOneWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => FlowStatisticsCreateWithoutFlowInputSchema),z.lazy(() => FlowStatisticsUncheckedCreateWithoutFlowInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowStatisticsCreateOrConnectWithoutFlowInputSchema).optional(),
  connect: z.lazy(() => FlowStatisticsWhereUniqueInputSchema).optional()
}).strict();

export const EdgeUncheckedCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.EdgeUncheckedCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => EdgeCreateWithoutFlowInputSchema),z.lazy(() => EdgeCreateWithoutFlowInputSchema).array(),z.lazy(() => EdgeUncheckedCreateWithoutFlowInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EdgeCreateOrConnectWithoutFlowInputSchema),z.lazy(() => EdgeCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EdgeCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FlowRunUncheckedCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.FlowRunUncheckedCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => FlowRunCreateWithoutFlowInputSchema),z.lazy(() => FlowRunCreateWithoutFlowInputSchema).array(),z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowRunCreateOrConnectWithoutFlowInputSchema),z.lazy(() => FlowRunCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowRunCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FlowEventUncheckedCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.FlowEventUncheckedCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => FlowEventCreateWithoutFlowInputSchema),z.lazy(() => FlowEventCreateWithoutFlowInputSchema).array(),z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputSchema),z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowEventCreateOrConnectWithoutFlowInputSchema),z.lazy(() => FlowEventCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowEventCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NodeUncheckedCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.NodeUncheckedCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutFlowInputSchema),z.lazy(() => NodeCreateWithoutFlowInputSchema).array(),z.lazy(() => NodeUncheckedCreateWithoutFlowInputSchema),z.lazy(() => NodeUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => NodeCreateOrConnectWithoutFlowInputSchema),z.lazy(() => NodeCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => NodeCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SecretUncheckedCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.SecretUncheckedCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => SecretCreateWithoutFlowInputSchema),z.lazy(() => SecretCreateWithoutFlowInputSchema).array(),z.lazy(() => SecretUncheckedCreateWithoutFlowInputSchema),z.lazy(() => SecretUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SecretCreateOrConnectWithoutFlowInputSchema),z.lazy(() => SecretCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SecretCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TagUncheckedCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.TagUncheckedCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutFlowInputSchema),z.lazy(() => TagCreateWithoutFlowInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutFlowInputSchema),z.lazy(() => TagUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutFlowInputSchema),z.lazy(() => TagCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TestCaseUncheckedCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.TestCaseUncheckedCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => TestCaseCreateWithoutFlowInputSchema),z.lazy(() => TestCaseCreateWithoutFlowInputSchema).array(),z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputSchema),z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TestCaseCreateOrConnectWithoutFlowInputSchema),z.lazy(() => TestCaseCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TestCaseCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TestCaseWhereUniqueInputSchema),z.lazy(() => TestCaseWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AuditLogUncheckedCreateNestedManyWithoutFlowInputSchema: z.ZodType<Prisma.AuditLogUncheckedCreateNestedManyWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => AuditLogCreateWithoutFlowInputSchema),z.lazy(() => AuditLogCreateWithoutFlowInputSchema).array(),z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputSchema),z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AuditLogCreateOrConnectWithoutFlowInputSchema),z.lazy(() => AuditLogCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AuditLogCreateManyFlowInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputSchema: z.ZodType<Prisma.FlowStatisticsUncheckedCreateNestedOneWithoutFlowInput> = z.object({
  create: z.union([ z.lazy(() => FlowStatisticsCreateWithoutFlowInputSchema),z.lazy(() => FlowStatisticsUncheckedCreateWithoutFlowInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowStatisticsCreateOrConnectWithoutFlowInputSchema).optional(),
  connect: z.lazy(() => FlowStatisticsWhereUniqueInputSchema).optional()
}).strict();

export const EnumFlowMethodFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumFlowMethodFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => FlowMethodSchema).optional()
}).strict();

export const EdgeUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.EdgeUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => EdgeCreateWithoutFlowInputSchema),z.lazy(() => EdgeCreateWithoutFlowInputSchema).array(),z.lazy(() => EdgeUncheckedCreateWithoutFlowInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EdgeCreateOrConnectWithoutFlowInputSchema),z.lazy(() => EdgeCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EdgeUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => EdgeUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EdgeCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EdgeUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => EdgeUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EdgeUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => EdgeUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EdgeScalarWhereInputSchema),z.lazy(() => EdgeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FlowRunUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.FlowRunUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowRunCreateWithoutFlowInputSchema),z.lazy(() => FlowRunCreateWithoutFlowInputSchema).array(),z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowRunCreateOrConnectWithoutFlowInputSchema),z.lazy(() => FlowRunCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FlowRunUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => FlowRunUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowRunCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FlowRunUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => FlowRunUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FlowRunUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => FlowRunUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FlowRunScalarWhereInputSchema),z.lazy(() => FlowRunScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FlowEventUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.FlowEventUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowEventCreateWithoutFlowInputSchema),z.lazy(() => FlowEventCreateWithoutFlowInputSchema).array(),z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputSchema),z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowEventCreateOrConnectWithoutFlowInputSchema),z.lazy(() => FlowEventCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FlowEventUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => FlowEventUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowEventCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FlowEventUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => FlowEventUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FlowEventUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => FlowEventUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FlowEventScalarWhereInputSchema),z.lazy(() => FlowEventScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const InstanceUpdateOneRequiredWithoutFlowsNestedInputSchema: z.ZodType<Prisma.InstanceUpdateOneRequiredWithoutFlowsNestedInput> = z.object({
  create: z.union([ z.lazy(() => InstanceCreateWithoutFlowsInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutFlowsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => InstanceCreateOrConnectWithoutFlowsInputSchema).optional(),
  upsert: z.lazy(() => InstanceUpsertWithoutFlowsInputSchema).optional(),
  connect: z.lazy(() => InstanceWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => InstanceUpdateToOneWithWhereWithoutFlowsInputSchema),z.lazy(() => InstanceUpdateWithoutFlowsInputSchema),z.lazy(() => InstanceUncheckedUpdateWithoutFlowsInputSchema) ]).optional(),
}).strict();

export const NodeUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.NodeUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutFlowInputSchema),z.lazy(() => NodeCreateWithoutFlowInputSchema).array(),z.lazy(() => NodeUncheckedCreateWithoutFlowInputSchema),z.lazy(() => NodeUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => NodeCreateOrConnectWithoutFlowInputSchema),z.lazy(() => NodeCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => NodeUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => NodeUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => NodeCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => NodeUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => NodeUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => NodeUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => NodeUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => NodeScalarWhereInputSchema),z.lazy(() => NodeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SecretUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.SecretUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => SecretCreateWithoutFlowInputSchema),z.lazy(() => SecretCreateWithoutFlowInputSchema).array(),z.lazy(() => SecretUncheckedCreateWithoutFlowInputSchema),z.lazy(() => SecretUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SecretCreateOrConnectWithoutFlowInputSchema),z.lazy(() => SecretCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SecretUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => SecretUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SecretCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SecretUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => SecretUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SecretUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => SecretUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SecretScalarWhereInputSchema),z.lazy(() => SecretScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TagUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.TagUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutFlowInputSchema),z.lazy(() => TagCreateWithoutFlowInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutFlowInputSchema),z.lazy(() => TagUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutFlowInputSchema),z.lazy(() => TagCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TagUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => TagUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TagUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => TagUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TagUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => TagUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TagScalarWhereInputSchema),z.lazy(() => TagScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TestCaseUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.TestCaseUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => TestCaseCreateWithoutFlowInputSchema),z.lazy(() => TestCaseCreateWithoutFlowInputSchema).array(),z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputSchema),z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TestCaseCreateOrConnectWithoutFlowInputSchema),z.lazy(() => TestCaseCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TestCaseUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => TestCaseUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TestCaseCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TestCaseWhereUniqueInputSchema),z.lazy(() => TestCaseWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TestCaseWhereUniqueInputSchema),z.lazy(() => TestCaseWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TestCaseWhereUniqueInputSchema),z.lazy(() => TestCaseWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TestCaseWhereUniqueInputSchema),z.lazy(() => TestCaseWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TestCaseUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => TestCaseUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TestCaseUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => TestCaseUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TestCaseScalarWhereInputSchema),z.lazy(() => TestCaseScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AuditLogUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.AuditLogUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => AuditLogCreateWithoutFlowInputSchema),z.lazy(() => AuditLogCreateWithoutFlowInputSchema).array(),z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputSchema),z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AuditLogCreateOrConnectWithoutFlowInputSchema),z.lazy(() => AuditLogCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AuditLogCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AuditLogUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => AuditLogUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AuditLogScalarWhereInputSchema),z.lazy(() => AuditLogScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FlowStatisticsUpdateOneWithoutFlowNestedInputSchema: z.ZodType<Prisma.FlowStatisticsUpdateOneWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowStatisticsCreateWithoutFlowInputSchema),z.lazy(() => FlowStatisticsUncheckedCreateWithoutFlowInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowStatisticsCreateOrConnectWithoutFlowInputSchema).optional(),
  upsert: z.lazy(() => FlowStatisticsUpsertWithoutFlowInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => FlowStatisticsWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => FlowStatisticsWhereInputSchema) ]).optional(),
  connect: z.lazy(() => FlowStatisticsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FlowStatisticsUpdateToOneWithWhereWithoutFlowInputSchema),z.lazy(() => FlowStatisticsUpdateWithoutFlowInputSchema),z.lazy(() => FlowStatisticsUncheckedUpdateWithoutFlowInputSchema) ]).optional(),
}).strict();

export const EdgeUncheckedUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.EdgeUncheckedUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => EdgeCreateWithoutFlowInputSchema),z.lazy(() => EdgeCreateWithoutFlowInputSchema).array(),z.lazy(() => EdgeUncheckedCreateWithoutFlowInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EdgeCreateOrConnectWithoutFlowInputSchema),z.lazy(() => EdgeCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EdgeUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => EdgeUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EdgeCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EdgeUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => EdgeUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EdgeUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => EdgeUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EdgeScalarWhereInputSchema),z.lazy(() => EdgeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FlowRunUncheckedUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.FlowRunUncheckedUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowRunCreateWithoutFlowInputSchema),z.lazy(() => FlowRunCreateWithoutFlowInputSchema).array(),z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowRunCreateOrConnectWithoutFlowInputSchema),z.lazy(() => FlowRunCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FlowRunUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => FlowRunUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowRunCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FlowRunUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => FlowRunUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FlowRunUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => FlowRunUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FlowRunScalarWhereInputSchema),z.lazy(() => FlowRunScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FlowEventUncheckedUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.FlowEventUncheckedUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowEventCreateWithoutFlowInputSchema),z.lazy(() => FlowEventCreateWithoutFlowInputSchema).array(),z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputSchema),z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowEventCreateOrConnectWithoutFlowInputSchema),z.lazy(() => FlowEventCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FlowEventUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => FlowEventUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowEventCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FlowEventUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => FlowEventUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FlowEventUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => FlowEventUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FlowEventScalarWhereInputSchema),z.lazy(() => FlowEventScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const NodeUncheckedUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.NodeUncheckedUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutFlowInputSchema),z.lazy(() => NodeCreateWithoutFlowInputSchema).array(),z.lazy(() => NodeUncheckedCreateWithoutFlowInputSchema),z.lazy(() => NodeUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => NodeCreateOrConnectWithoutFlowInputSchema),z.lazy(() => NodeCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => NodeUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => NodeUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => NodeCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => NodeUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => NodeUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => NodeUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => NodeUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => NodeScalarWhereInputSchema),z.lazy(() => NodeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SecretUncheckedUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.SecretUncheckedUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => SecretCreateWithoutFlowInputSchema),z.lazy(() => SecretCreateWithoutFlowInputSchema).array(),z.lazy(() => SecretUncheckedCreateWithoutFlowInputSchema),z.lazy(() => SecretUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SecretCreateOrConnectWithoutFlowInputSchema),z.lazy(() => SecretCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SecretUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => SecretUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SecretCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SecretUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => SecretUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SecretUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => SecretUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SecretScalarWhereInputSchema),z.lazy(() => SecretScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TagUncheckedUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.TagUncheckedUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutFlowInputSchema),z.lazy(() => TagCreateWithoutFlowInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutFlowInputSchema),z.lazy(() => TagUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutFlowInputSchema),z.lazy(() => TagCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TagUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => TagUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TagUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => TagUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TagUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => TagUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TagScalarWhereInputSchema),z.lazy(() => TagScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TestCaseUncheckedUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.TestCaseUncheckedUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => TestCaseCreateWithoutFlowInputSchema),z.lazy(() => TestCaseCreateWithoutFlowInputSchema).array(),z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputSchema),z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TestCaseCreateOrConnectWithoutFlowInputSchema),z.lazy(() => TestCaseCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TestCaseUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => TestCaseUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TestCaseCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TestCaseWhereUniqueInputSchema),z.lazy(() => TestCaseWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TestCaseWhereUniqueInputSchema),z.lazy(() => TestCaseWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TestCaseWhereUniqueInputSchema),z.lazy(() => TestCaseWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TestCaseWhereUniqueInputSchema),z.lazy(() => TestCaseWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TestCaseUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => TestCaseUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TestCaseUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => TestCaseUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TestCaseScalarWhereInputSchema),z.lazy(() => TestCaseScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AuditLogUncheckedUpdateManyWithoutFlowNestedInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateManyWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => AuditLogCreateWithoutFlowInputSchema),z.lazy(() => AuditLogCreateWithoutFlowInputSchema).array(),z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputSchema),z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AuditLogCreateOrConnectWithoutFlowInputSchema),z.lazy(() => AuditLogCreateOrConnectWithoutFlowInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AuditLogCreateManyFlowInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutFlowInputSchema),z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutFlowInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AuditLogUpdateManyWithWhereWithoutFlowInputSchema),z.lazy(() => AuditLogUpdateManyWithWhereWithoutFlowInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AuditLogScalarWhereInputSchema),z.lazy(() => AuditLogScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputSchema: z.ZodType<Prisma.FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowStatisticsCreateWithoutFlowInputSchema),z.lazy(() => FlowStatisticsUncheckedCreateWithoutFlowInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowStatisticsCreateOrConnectWithoutFlowInputSchema).optional(),
  upsert: z.lazy(() => FlowStatisticsUpsertWithoutFlowInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => FlowStatisticsWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => FlowStatisticsWhereInputSchema) ]).optional(),
  connect: z.lazy(() => FlowStatisticsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FlowStatisticsUpdateToOneWithWhereWithoutFlowInputSchema),z.lazy(() => FlowStatisticsUpdateWithoutFlowInputSchema),z.lazy(() => FlowStatisticsUncheckedUpdateWithoutFlowInputSchema) ]).optional(),
}).strict();

export const FlowRunCreateNestedOneWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowRunCreateNestedOneWithoutFlowEventsInput> = z.object({
  create: z.union([ z.lazy(() => FlowRunCreateWithoutFlowEventsInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutFlowEventsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowRunCreateOrConnectWithoutFlowEventsInputSchema).optional(),
  connect: z.lazy(() => FlowRunWhereUniqueInputSchema).optional()
}).strict();

export const FlowCreateNestedOneWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowCreateNestedOneWithoutFlowEventsInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutFlowEventsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutFlowEventsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutFlowEventsInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional()
}).strict();

export const EnumStartedByFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumStartedByFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => StartedBySchema).optional()
}).strict();

export const FlowRunUpdateOneRequiredWithoutFlowEventsNestedInputSchema: z.ZodType<Prisma.FlowRunUpdateOneRequiredWithoutFlowEventsNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowRunCreateWithoutFlowEventsInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutFlowEventsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowRunCreateOrConnectWithoutFlowEventsInputSchema).optional(),
  upsert: z.lazy(() => FlowRunUpsertWithoutFlowEventsInputSchema).optional(),
  connect: z.lazy(() => FlowRunWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FlowRunUpdateToOneWithWhereWithoutFlowEventsInputSchema),z.lazy(() => FlowRunUpdateWithoutFlowEventsInputSchema),z.lazy(() => FlowRunUncheckedUpdateWithoutFlowEventsInputSchema) ]).optional(),
}).strict();

export const FlowUpdateOneRequiredWithoutFlowEventsNestedInputSchema: z.ZodType<Prisma.FlowUpdateOneRequiredWithoutFlowEventsNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutFlowEventsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutFlowEventsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutFlowEventsInputSchema).optional(),
  upsert: z.lazy(() => FlowUpsertWithoutFlowEventsInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FlowUpdateToOneWithWhereWithoutFlowEventsInputSchema),z.lazy(() => FlowUpdateWithoutFlowEventsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutFlowEventsInputSchema) ]).optional(),
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const FlowCreateNestedOneWithoutFlowRunsInputSchema: z.ZodType<Prisma.FlowCreateNestedOneWithoutFlowRunsInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutFlowRunsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutFlowRunsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutFlowRunsInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional()
}).strict();

export const FlowEventCreateNestedManyWithoutFlowRunInputSchema: z.ZodType<Prisma.FlowEventCreateNestedManyWithoutFlowRunInput> = z.object({
  create: z.union([ z.lazy(() => FlowEventCreateWithoutFlowRunInputSchema),z.lazy(() => FlowEventCreateWithoutFlowRunInputSchema).array(),z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputSchema),z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowEventCreateOrConnectWithoutFlowRunInputSchema),z.lazy(() => FlowEventCreateOrConnectWithoutFlowRunInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowEventCreateManyFlowRunInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ScheduledJobCreateNestedOneWithoutFlowRunsInputSchema: z.ZodType<Prisma.ScheduledJobCreateNestedOneWithoutFlowRunsInput> = z.object({
  create: z.union([ z.lazy(() => ScheduledJobCreateWithoutFlowRunsInputSchema),z.lazy(() => ScheduledJobUncheckedCreateWithoutFlowRunsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ScheduledJobCreateOrConnectWithoutFlowRunsInputSchema).optional(),
  connect: z.lazy(() => ScheduledJobWhereUniqueInputSchema).optional()
}).strict();

export const FlowEventUncheckedCreateNestedManyWithoutFlowRunInputSchema: z.ZodType<Prisma.FlowEventUncheckedCreateNestedManyWithoutFlowRunInput> = z.object({
  create: z.union([ z.lazy(() => FlowEventCreateWithoutFlowRunInputSchema),z.lazy(() => FlowEventCreateWithoutFlowRunInputSchema).array(),z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputSchema),z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowEventCreateOrConnectWithoutFlowRunInputSchema),z.lazy(() => FlowEventCreateOrConnectWithoutFlowRunInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowEventCreateManyFlowRunInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NullableBoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableBoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional().nullable()
}).strict();

export const EnumRunStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRunStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => RunStatusSchema).optional()
}).strict();

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional().nullable()
}).strict();

export const FlowUpdateOneRequiredWithoutFlowRunsNestedInputSchema: z.ZodType<Prisma.FlowUpdateOneRequiredWithoutFlowRunsNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutFlowRunsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutFlowRunsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutFlowRunsInputSchema).optional(),
  upsert: z.lazy(() => FlowUpsertWithoutFlowRunsInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FlowUpdateToOneWithWhereWithoutFlowRunsInputSchema),z.lazy(() => FlowUpdateWithoutFlowRunsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutFlowRunsInputSchema) ]).optional(),
}).strict();

export const FlowEventUpdateManyWithoutFlowRunNestedInputSchema: z.ZodType<Prisma.FlowEventUpdateManyWithoutFlowRunNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowEventCreateWithoutFlowRunInputSchema),z.lazy(() => FlowEventCreateWithoutFlowRunInputSchema).array(),z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputSchema),z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowEventCreateOrConnectWithoutFlowRunInputSchema),z.lazy(() => FlowEventCreateOrConnectWithoutFlowRunInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FlowEventUpsertWithWhereUniqueWithoutFlowRunInputSchema),z.lazy(() => FlowEventUpsertWithWhereUniqueWithoutFlowRunInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowEventCreateManyFlowRunInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FlowEventUpdateWithWhereUniqueWithoutFlowRunInputSchema),z.lazy(() => FlowEventUpdateWithWhereUniqueWithoutFlowRunInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FlowEventUpdateManyWithWhereWithoutFlowRunInputSchema),z.lazy(() => FlowEventUpdateManyWithWhereWithoutFlowRunInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FlowEventScalarWhereInputSchema),z.lazy(() => FlowEventScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ScheduledJobUpdateOneWithoutFlowRunsNestedInputSchema: z.ZodType<Prisma.ScheduledJobUpdateOneWithoutFlowRunsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ScheduledJobCreateWithoutFlowRunsInputSchema),z.lazy(() => ScheduledJobUncheckedCreateWithoutFlowRunsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ScheduledJobCreateOrConnectWithoutFlowRunsInputSchema).optional(),
  upsert: z.lazy(() => ScheduledJobUpsertWithoutFlowRunsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ScheduledJobWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ScheduledJobWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ScheduledJobWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ScheduledJobUpdateToOneWithWhereWithoutFlowRunsInputSchema),z.lazy(() => ScheduledJobUpdateWithoutFlowRunsInputSchema),z.lazy(() => ScheduledJobUncheckedUpdateWithoutFlowRunsInputSchema) ]).optional(),
}).strict();

export const NullableIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const FlowEventUncheckedUpdateManyWithoutFlowRunNestedInputSchema: z.ZodType<Prisma.FlowEventUncheckedUpdateManyWithoutFlowRunNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowEventCreateWithoutFlowRunInputSchema),z.lazy(() => FlowEventCreateWithoutFlowRunInputSchema).array(),z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputSchema),z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowEventCreateOrConnectWithoutFlowRunInputSchema),z.lazy(() => FlowEventCreateOrConnectWithoutFlowRunInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FlowEventUpsertWithWhereUniqueWithoutFlowRunInputSchema),z.lazy(() => FlowEventUpsertWithWhereUniqueWithoutFlowRunInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowEventCreateManyFlowRunInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FlowEventWhereUniqueInputSchema),z.lazy(() => FlowEventWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FlowEventUpdateWithWhereUniqueWithoutFlowRunInputSchema),z.lazy(() => FlowEventUpdateWithWhereUniqueWithoutFlowRunInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FlowEventUpdateManyWithWhereWithoutFlowRunInputSchema),z.lazy(() => FlowEventUpdateManyWithWhereWithoutFlowRunInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FlowEventScalarWhereInputSchema),z.lazy(() => FlowEventScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const NodeCreateNestedManyWithoutInfrastructureInputSchema: z.ZodType<Prisma.NodeCreateNestedManyWithoutInfrastructureInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutInfrastructureInputSchema),z.lazy(() => NodeCreateWithoutInfrastructureInputSchema).array(),z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputSchema),z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => NodeCreateOrConnectWithoutInfrastructureInputSchema),z.lazy(() => NodeCreateOrConnectWithoutInfrastructureInputSchema).array() ]).optional(),
  createMany: z.lazy(() => NodeCreateManyInfrastructureInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NodeUncheckedCreateNestedManyWithoutInfrastructureInputSchema: z.ZodType<Prisma.NodeUncheckedCreateNestedManyWithoutInfrastructureInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutInfrastructureInputSchema),z.lazy(() => NodeCreateWithoutInfrastructureInputSchema).array(),z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputSchema),z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => NodeCreateOrConnectWithoutInfrastructureInputSchema),z.lazy(() => NodeCreateOrConnectWithoutInfrastructureInputSchema).array() ]).optional(),
  createMany: z.lazy(() => NodeCreateManyInfrastructureInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EnumInfraTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumInfraTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => InfraTypeSchema).optional()
}).strict();

export const NodeUpdateManyWithoutInfrastructureNestedInputSchema: z.ZodType<Prisma.NodeUpdateManyWithoutInfrastructureNestedInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutInfrastructureInputSchema),z.lazy(() => NodeCreateWithoutInfrastructureInputSchema).array(),z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputSchema),z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => NodeCreateOrConnectWithoutInfrastructureInputSchema),z.lazy(() => NodeCreateOrConnectWithoutInfrastructureInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => NodeUpsertWithWhereUniqueWithoutInfrastructureInputSchema),z.lazy(() => NodeUpsertWithWhereUniqueWithoutInfrastructureInputSchema).array() ]).optional(),
  createMany: z.lazy(() => NodeCreateManyInfrastructureInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => NodeUpdateWithWhereUniqueWithoutInfrastructureInputSchema),z.lazy(() => NodeUpdateWithWhereUniqueWithoutInfrastructureInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => NodeUpdateManyWithWhereWithoutInfrastructureInputSchema),z.lazy(() => NodeUpdateManyWithWhereWithoutInfrastructureInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => NodeScalarWhereInputSchema),z.lazy(() => NodeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const NodeUncheckedUpdateManyWithoutInfrastructureNestedInputSchema: z.ZodType<Prisma.NodeUncheckedUpdateManyWithoutInfrastructureNestedInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutInfrastructureInputSchema),z.lazy(() => NodeCreateWithoutInfrastructureInputSchema).array(),z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputSchema),z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => NodeCreateOrConnectWithoutInfrastructureInputSchema),z.lazy(() => NodeCreateOrConnectWithoutInfrastructureInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => NodeUpsertWithWhereUniqueWithoutInfrastructureInputSchema),z.lazy(() => NodeUpsertWithWhereUniqueWithoutInfrastructureInputSchema).array() ]).optional(),
  createMany: z.lazy(() => NodeCreateManyInfrastructureInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => NodeWhereUniqueInputSchema),z.lazy(() => NodeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => NodeUpdateWithWhereUniqueWithoutInfrastructureInputSchema),z.lazy(() => NodeUpdateWithWhereUniqueWithoutInfrastructureInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => NodeUpdateManyWithWhereWithoutInfrastructureInputSchema),z.lazy(() => NodeUpdateManyWithWhereWithoutInfrastructureInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => NodeScalarWhereInputSchema),z.lazy(() => NodeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FlowCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.FlowCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutInstanceInputSchema),z.lazy(() => FlowCreateWithoutInstanceInputSchema).array(),z.lazy(() => FlowUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => FlowUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => FlowCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FlowWhereUniqueInputSchema),z.lazy(() => FlowWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TagCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.TagCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutInstanceInputSchema),z.lazy(() => TagCreateWithoutInstanceInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => TagUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => TagCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TagGroupCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.TagGroupCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => TagGroupCreateWithoutInstanceInputSchema),z.lazy(() => TagGroupCreateWithoutInstanceInputSchema).array(),z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagGroupCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => TagGroupCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagGroupCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TagGroupWhereUniqueInputSchema),z.lazy(() => TagGroupWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutInstancesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutInstancesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInstancesInputSchema),z.lazy(() => UserUncheckedCreateWithoutInstancesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutInstancesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const FlowUncheckedCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.FlowUncheckedCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutInstanceInputSchema),z.lazy(() => FlowCreateWithoutInstanceInputSchema).array(),z.lazy(() => FlowUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => FlowUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => FlowCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FlowWhereUniqueInputSchema),z.lazy(() => FlowWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TagUncheckedCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.TagUncheckedCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutInstanceInputSchema),z.lazy(() => TagCreateWithoutInstanceInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => TagUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => TagCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TagGroupUncheckedCreateNestedManyWithoutInstanceInputSchema: z.ZodType<Prisma.TagGroupUncheckedCreateNestedManyWithoutInstanceInput> = z.object({
  create: z.union([ z.lazy(() => TagGroupCreateWithoutInstanceInputSchema),z.lazy(() => TagGroupCreateWithoutInstanceInputSchema).array(),z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagGroupCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => TagGroupCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagGroupCreateManyInstanceInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TagGroupWhereUniqueInputSchema),z.lazy(() => TagGroupWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FlowUpdateManyWithoutInstanceNestedInputSchema: z.ZodType<Prisma.FlowUpdateManyWithoutInstanceNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutInstanceInputSchema),z.lazy(() => FlowCreateWithoutInstanceInputSchema).array(),z.lazy(() => FlowUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => FlowUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => FlowCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FlowUpsertWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => FlowUpsertWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowCreateManyInstanceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FlowWhereUniqueInputSchema),z.lazy(() => FlowWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FlowWhereUniqueInputSchema),z.lazy(() => FlowWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FlowWhereUniqueInputSchema),z.lazy(() => FlowWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FlowWhereUniqueInputSchema),z.lazy(() => FlowWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FlowUpdateWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => FlowUpdateWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FlowUpdateManyWithWhereWithoutInstanceInputSchema),z.lazy(() => FlowUpdateManyWithWhereWithoutInstanceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FlowScalarWhereInputSchema),z.lazy(() => FlowScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TagUpdateManyWithoutInstanceNestedInputSchema: z.ZodType<Prisma.TagUpdateManyWithoutInstanceNestedInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutInstanceInputSchema),z.lazy(() => TagCreateWithoutInstanceInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => TagUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => TagCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TagUpsertWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => TagUpsertWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyInstanceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TagUpdateWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => TagUpdateWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TagUpdateManyWithWhereWithoutInstanceInputSchema),z.lazy(() => TagUpdateManyWithWhereWithoutInstanceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TagScalarWhereInputSchema),z.lazy(() => TagScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TagGroupUpdateManyWithoutInstanceNestedInputSchema: z.ZodType<Prisma.TagGroupUpdateManyWithoutInstanceNestedInput> = z.object({
  create: z.union([ z.lazy(() => TagGroupCreateWithoutInstanceInputSchema),z.lazy(() => TagGroupCreateWithoutInstanceInputSchema).array(),z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagGroupCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => TagGroupCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TagGroupUpsertWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => TagGroupUpsertWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagGroupCreateManyInstanceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TagGroupWhereUniqueInputSchema),z.lazy(() => TagGroupWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TagGroupWhereUniqueInputSchema),z.lazy(() => TagGroupWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TagGroupWhereUniqueInputSchema),z.lazy(() => TagGroupWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TagGroupWhereUniqueInputSchema),z.lazy(() => TagGroupWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TagGroupUpdateWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => TagGroupUpdateWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TagGroupUpdateManyWithWhereWithoutInstanceInputSchema),z.lazy(() => TagGroupUpdateManyWithWhereWithoutInstanceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TagGroupScalarWhereInputSchema),z.lazy(() => TagGroupScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserUpdateOneWithoutInstancesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutInstancesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInstancesInputSchema),z.lazy(() => UserUncheckedCreateWithoutInstancesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutInstancesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutInstancesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutInstancesInputSchema),z.lazy(() => UserUpdateWithoutInstancesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInstancesInputSchema) ]).optional(),
}).strict();

export const FlowUncheckedUpdateManyWithoutInstanceNestedInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateManyWithoutInstanceNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutInstanceInputSchema),z.lazy(() => FlowCreateWithoutInstanceInputSchema).array(),z.lazy(() => FlowUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => FlowUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => FlowCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FlowUpsertWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => FlowUpsertWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowCreateManyInstanceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FlowWhereUniqueInputSchema),z.lazy(() => FlowWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FlowWhereUniqueInputSchema),z.lazy(() => FlowWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FlowWhereUniqueInputSchema),z.lazy(() => FlowWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FlowWhereUniqueInputSchema),z.lazy(() => FlowWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FlowUpdateWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => FlowUpdateWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FlowUpdateManyWithWhereWithoutInstanceInputSchema),z.lazy(() => FlowUpdateManyWithWhereWithoutInstanceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FlowScalarWhereInputSchema),z.lazy(() => FlowScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TagUncheckedUpdateManyWithoutInstanceNestedInputSchema: z.ZodType<Prisma.TagUncheckedUpdateManyWithoutInstanceNestedInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutInstanceInputSchema),z.lazy(() => TagCreateWithoutInstanceInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => TagUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => TagCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TagUpsertWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => TagUpsertWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyInstanceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TagUpdateWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => TagUpdateWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TagUpdateManyWithWhereWithoutInstanceInputSchema),z.lazy(() => TagUpdateManyWithWhereWithoutInstanceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TagScalarWhereInputSchema),z.lazy(() => TagScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TagGroupUncheckedUpdateManyWithoutInstanceNestedInputSchema: z.ZodType<Prisma.TagGroupUncheckedUpdateManyWithoutInstanceNestedInput> = z.object({
  create: z.union([ z.lazy(() => TagGroupCreateWithoutInstanceInputSchema),z.lazy(() => TagGroupCreateWithoutInstanceInputSchema).array(),z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputSchema),z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagGroupCreateOrConnectWithoutInstanceInputSchema),z.lazy(() => TagGroupCreateOrConnectWithoutInstanceInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TagGroupUpsertWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => TagGroupUpsertWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagGroupCreateManyInstanceInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TagGroupWhereUniqueInputSchema),z.lazy(() => TagGroupWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TagGroupWhereUniqueInputSchema),z.lazy(() => TagGroupWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TagGroupWhereUniqueInputSchema),z.lazy(() => TagGroupWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TagGroupWhereUniqueInputSchema),z.lazy(() => TagGroupWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TagGroupUpdateWithWhereUniqueWithoutInstanceInputSchema),z.lazy(() => TagGroupUpdateWithWhereUniqueWithoutInstanceInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TagGroupUpdateManyWithWhereWithoutInstanceInputSchema),z.lazy(() => TagGroupUpdateManyWithWhereWithoutInstanceInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TagGroupScalarWhereInputSchema),z.lazy(() => TagGroupScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FlowCreateNestedOneWithoutNodesInputSchema: z.ZodType<Prisma.FlowCreateNestedOneWithoutNodesInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutNodesInputSchema),z.lazy(() => FlowUncheckedCreateWithoutNodesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutNodesInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional()
}).strict();

export const InfrastructureCreateNestedOneWithoutNodesInputSchema: z.ZodType<Prisma.InfrastructureCreateNestedOneWithoutNodesInput> = z.object({
  create: z.union([ z.lazy(() => InfrastructureCreateWithoutNodesInputSchema),z.lazy(() => InfrastructureUncheckedCreateWithoutNodesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => InfrastructureCreateOrConnectWithoutNodesInputSchema).optional(),
  connect: z.lazy(() => InfrastructureWhereUniqueInputSchema).optional()
}).strict();

export const SecretCreateNestedManyWithoutNodeInputSchema: z.ZodType<Prisma.SecretCreateNestedManyWithoutNodeInput> = z.object({
  create: z.union([ z.lazy(() => SecretCreateWithoutNodeInputSchema),z.lazy(() => SecretCreateWithoutNodeInputSchema).array(),z.lazy(() => SecretUncheckedCreateWithoutNodeInputSchema),z.lazy(() => SecretUncheckedCreateWithoutNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SecretCreateOrConnectWithoutNodeInputSchema),z.lazy(() => SecretCreateOrConnectWithoutNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SecretCreateManyNodeInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EdgeCreateNestedManyWithoutSourceNodeInputSchema: z.ZodType<Prisma.EdgeCreateNestedManyWithoutSourceNodeInput> = z.object({
  create: z.union([ z.lazy(() => EdgeCreateWithoutSourceNodeInputSchema),z.lazy(() => EdgeCreateWithoutSourceNodeInputSchema).array(),z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EdgeCreateOrConnectWithoutSourceNodeInputSchema),z.lazy(() => EdgeCreateOrConnectWithoutSourceNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EdgeCreateManySourceNodeInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EdgeCreateNestedManyWithoutTargetNodeInputSchema: z.ZodType<Prisma.EdgeCreateNestedManyWithoutTargetNodeInput> = z.object({
  create: z.union([ z.lazy(() => EdgeCreateWithoutTargetNodeInputSchema),z.lazy(() => EdgeCreateWithoutTargetNodeInputSchema).array(),z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EdgeCreateOrConnectWithoutTargetNodeInputSchema),z.lazy(() => EdgeCreateOrConnectWithoutTargetNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EdgeCreateManyTargetNodeInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TagCreateNestedManyWithoutNodeInputSchema: z.ZodType<Prisma.TagCreateNestedManyWithoutNodeInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutNodeInputSchema),z.lazy(() => TagCreateWithoutNodeInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutNodeInputSchema),z.lazy(() => TagUncheckedCreateWithoutNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutNodeInputSchema),z.lazy(() => TagCreateOrConnectWithoutNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyNodeInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SecretUncheckedCreateNestedManyWithoutNodeInputSchema: z.ZodType<Prisma.SecretUncheckedCreateNestedManyWithoutNodeInput> = z.object({
  create: z.union([ z.lazy(() => SecretCreateWithoutNodeInputSchema),z.lazy(() => SecretCreateWithoutNodeInputSchema).array(),z.lazy(() => SecretUncheckedCreateWithoutNodeInputSchema),z.lazy(() => SecretUncheckedCreateWithoutNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SecretCreateOrConnectWithoutNodeInputSchema),z.lazy(() => SecretCreateOrConnectWithoutNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SecretCreateManyNodeInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EdgeUncheckedCreateNestedManyWithoutSourceNodeInputSchema: z.ZodType<Prisma.EdgeUncheckedCreateNestedManyWithoutSourceNodeInput> = z.object({
  create: z.union([ z.lazy(() => EdgeCreateWithoutSourceNodeInputSchema),z.lazy(() => EdgeCreateWithoutSourceNodeInputSchema).array(),z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EdgeCreateOrConnectWithoutSourceNodeInputSchema),z.lazy(() => EdgeCreateOrConnectWithoutSourceNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EdgeCreateManySourceNodeInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EdgeUncheckedCreateNestedManyWithoutTargetNodeInputSchema: z.ZodType<Prisma.EdgeUncheckedCreateNestedManyWithoutTargetNodeInput> = z.object({
  create: z.union([ z.lazy(() => EdgeCreateWithoutTargetNodeInputSchema),z.lazy(() => EdgeCreateWithoutTargetNodeInputSchema).array(),z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EdgeCreateOrConnectWithoutTargetNodeInputSchema),z.lazy(() => EdgeCreateOrConnectWithoutTargetNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EdgeCreateManyTargetNodeInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TagUncheckedCreateNestedManyWithoutNodeInputSchema: z.ZodType<Prisma.TagUncheckedCreateNestedManyWithoutNodeInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutNodeInputSchema),z.lazy(() => TagCreateWithoutNodeInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutNodeInputSchema),z.lazy(() => TagUncheckedCreateWithoutNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutNodeInputSchema),z.lazy(() => TagCreateOrConnectWithoutNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyNodeInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EnumNodeTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumNodeTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => NodeTypeSchema).optional()
}).strict();

export const FlowUpdateOneRequiredWithoutNodesNestedInputSchema: z.ZodType<Prisma.FlowUpdateOneRequiredWithoutNodesNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutNodesInputSchema),z.lazy(() => FlowUncheckedCreateWithoutNodesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutNodesInputSchema).optional(),
  upsert: z.lazy(() => FlowUpsertWithoutNodesInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FlowUpdateToOneWithWhereWithoutNodesInputSchema),z.lazy(() => FlowUpdateWithoutNodesInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutNodesInputSchema) ]).optional(),
}).strict();

export const InfrastructureUpdateOneWithoutNodesNestedInputSchema: z.ZodType<Prisma.InfrastructureUpdateOneWithoutNodesNestedInput> = z.object({
  create: z.union([ z.lazy(() => InfrastructureCreateWithoutNodesInputSchema),z.lazy(() => InfrastructureUncheckedCreateWithoutNodesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => InfrastructureCreateOrConnectWithoutNodesInputSchema).optional(),
  upsert: z.lazy(() => InfrastructureUpsertWithoutNodesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => InfrastructureWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => InfrastructureWhereInputSchema) ]).optional(),
  connect: z.lazy(() => InfrastructureWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => InfrastructureUpdateToOneWithWhereWithoutNodesInputSchema),z.lazy(() => InfrastructureUpdateWithoutNodesInputSchema),z.lazy(() => InfrastructureUncheckedUpdateWithoutNodesInputSchema) ]).optional(),
}).strict();

export const SecretUpdateManyWithoutNodeNestedInputSchema: z.ZodType<Prisma.SecretUpdateManyWithoutNodeNestedInput> = z.object({
  create: z.union([ z.lazy(() => SecretCreateWithoutNodeInputSchema),z.lazy(() => SecretCreateWithoutNodeInputSchema).array(),z.lazy(() => SecretUncheckedCreateWithoutNodeInputSchema),z.lazy(() => SecretUncheckedCreateWithoutNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SecretCreateOrConnectWithoutNodeInputSchema),z.lazy(() => SecretCreateOrConnectWithoutNodeInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SecretUpsertWithWhereUniqueWithoutNodeInputSchema),z.lazy(() => SecretUpsertWithWhereUniqueWithoutNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SecretCreateManyNodeInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SecretUpdateWithWhereUniqueWithoutNodeInputSchema),z.lazy(() => SecretUpdateWithWhereUniqueWithoutNodeInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SecretUpdateManyWithWhereWithoutNodeInputSchema),z.lazy(() => SecretUpdateManyWithWhereWithoutNodeInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SecretScalarWhereInputSchema),z.lazy(() => SecretScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EdgeUpdateManyWithoutSourceNodeNestedInputSchema: z.ZodType<Prisma.EdgeUpdateManyWithoutSourceNodeNestedInput> = z.object({
  create: z.union([ z.lazy(() => EdgeCreateWithoutSourceNodeInputSchema),z.lazy(() => EdgeCreateWithoutSourceNodeInputSchema).array(),z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EdgeCreateOrConnectWithoutSourceNodeInputSchema),z.lazy(() => EdgeCreateOrConnectWithoutSourceNodeInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EdgeUpsertWithWhereUniqueWithoutSourceNodeInputSchema),z.lazy(() => EdgeUpsertWithWhereUniqueWithoutSourceNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EdgeCreateManySourceNodeInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EdgeUpdateWithWhereUniqueWithoutSourceNodeInputSchema),z.lazy(() => EdgeUpdateWithWhereUniqueWithoutSourceNodeInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EdgeUpdateManyWithWhereWithoutSourceNodeInputSchema),z.lazy(() => EdgeUpdateManyWithWhereWithoutSourceNodeInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EdgeScalarWhereInputSchema),z.lazy(() => EdgeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EdgeUpdateManyWithoutTargetNodeNestedInputSchema: z.ZodType<Prisma.EdgeUpdateManyWithoutTargetNodeNestedInput> = z.object({
  create: z.union([ z.lazy(() => EdgeCreateWithoutTargetNodeInputSchema),z.lazy(() => EdgeCreateWithoutTargetNodeInputSchema).array(),z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EdgeCreateOrConnectWithoutTargetNodeInputSchema),z.lazy(() => EdgeCreateOrConnectWithoutTargetNodeInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EdgeUpsertWithWhereUniqueWithoutTargetNodeInputSchema),z.lazy(() => EdgeUpsertWithWhereUniqueWithoutTargetNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EdgeCreateManyTargetNodeInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EdgeUpdateWithWhereUniqueWithoutTargetNodeInputSchema),z.lazy(() => EdgeUpdateWithWhereUniqueWithoutTargetNodeInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EdgeUpdateManyWithWhereWithoutTargetNodeInputSchema),z.lazy(() => EdgeUpdateManyWithWhereWithoutTargetNodeInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EdgeScalarWhereInputSchema),z.lazy(() => EdgeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TagUpdateManyWithoutNodeNestedInputSchema: z.ZodType<Prisma.TagUpdateManyWithoutNodeNestedInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutNodeInputSchema),z.lazy(() => TagCreateWithoutNodeInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutNodeInputSchema),z.lazy(() => TagUncheckedCreateWithoutNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutNodeInputSchema),z.lazy(() => TagCreateOrConnectWithoutNodeInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TagUpsertWithWhereUniqueWithoutNodeInputSchema),z.lazy(() => TagUpsertWithWhereUniqueWithoutNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyNodeInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TagUpdateWithWhereUniqueWithoutNodeInputSchema),z.lazy(() => TagUpdateWithWhereUniqueWithoutNodeInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TagUpdateManyWithWhereWithoutNodeInputSchema),z.lazy(() => TagUpdateManyWithWhereWithoutNodeInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TagScalarWhereInputSchema),z.lazy(() => TagScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SecretUncheckedUpdateManyWithoutNodeNestedInputSchema: z.ZodType<Prisma.SecretUncheckedUpdateManyWithoutNodeNestedInput> = z.object({
  create: z.union([ z.lazy(() => SecretCreateWithoutNodeInputSchema),z.lazy(() => SecretCreateWithoutNodeInputSchema).array(),z.lazy(() => SecretUncheckedCreateWithoutNodeInputSchema),z.lazy(() => SecretUncheckedCreateWithoutNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SecretCreateOrConnectWithoutNodeInputSchema),z.lazy(() => SecretCreateOrConnectWithoutNodeInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SecretUpsertWithWhereUniqueWithoutNodeInputSchema),z.lazy(() => SecretUpsertWithWhereUniqueWithoutNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SecretCreateManyNodeInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SecretWhereUniqueInputSchema),z.lazy(() => SecretWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SecretUpdateWithWhereUniqueWithoutNodeInputSchema),z.lazy(() => SecretUpdateWithWhereUniqueWithoutNodeInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SecretUpdateManyWithWhereWithoutNodeInputSchema),z.lazy(() => SecretUpdateManyWithWhereWithoutNodeInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SecretScalarWhereInputSchema),z.lazy(() => SecretScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EdgeUncheckedUpdateManyWithoutSourceNodeNestedInputSchema: z.ZodType<Prisma.EdgeUncheckedUpdateManyWithoutSourceNodeNestedInput> = z.object({
  create: z.union([ z.lazy(() => EdgeCreateWithoutSourceNodeInputSchema),z.lazy(() => EdgeCreateWithoutSourceNodeInputSchema).array(),z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EdgeCreateOrConnectWithoutSourceNodeInputSchema),z.lazy(() => EdgeCreateOrConnectWithoutSourceNodeInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EdgeUpsertWithWhereUniqueWithoutSourceNodeInputSchema),z.lazy(() => EdgeUpsertWithWhereUniqueWithoutSourceNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EdgeCreateManySourceNodeInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EdgeUpdateWithWhereUniqueWithoutSourceNodeInputSchema),z.lazy(() => EdgeUpdateWithWhereUniqueWithoutSourceNodeInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EdgeUpdateManyWithWhereWithoutSourceNodeInputSchema),z.lazy(() => EdgeUpdateManyWithWhereWithoutSourceNodeInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EdgeScalarWhereInputSchema),z.lazy(() => EdgeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EdgeUncheckedUpdateManyWithoutTargetNodeNestedInputSchema: z.ZodType<Prisma.EdgeUncheckedUpdateManyWithoutTargetNodeNestedInput> = z.object({
  create: z.union([ z.lazy(() => EdgeCreateWithoutTargetNodeInputSchema),z.lazy(() => EdgeCreateWithoutTargetNodeInputSchema).array(),z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EdgeCreateOrConnectWithoutTargetNodeInputSchema),z.lazy(() => EdgeCreateOrConnectWithoutTargetNodeInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EdgeUpsertWithWhereUniqueWithoutTargetNodeInputSchema),z.lazy(() => EdgeUpsertWithWhereUniqueWithoutTargetNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EdgeCreateManyTargetNodeInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EdgeWhereUniqueInputSchema),z.lazy(() => EdgeWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EdgeUpdateWithWhereUniqueWithoutTargetNodeInputSchema),z.lazy(() => EdgeUpdateWithWhereUniqueWithoutTargetNodeInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EdgeUpdateManyWithWhereWithoutTargetNodeInputSchema),z.lazy(() => EdgeUpdateManyWithWhereWithoutTargetNodeInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EdgeScalarWhereInputSchema),z.lazy(() => EdgeScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TagUncheckedUpdateManyWithoutNodeNestedInputSchema: z.ZodType<Prisma.TagUncheckedUpdateManyWithoutNodeNestedInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutNodeInputSchema),z.lazy(() => TagCreateWithoutNodeInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutNodeInputSchema),z.lazy(() => TagUncheckedCreateWithoutNodeInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutNodeInputSchema),z.lazy(() => TagCreateOrConnectWithoutNodeInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TagUpsertWithWhereUniqueWithoutNodeInputSchema),z.lazy(() => TagUpsertWithWhereUniqueWithoutNodeInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyNodeInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TagUpdateWithWhereUniqueWithoutNodeInputSchema),z.lazy(() => TagUpdateWithWhereUniqueWithoutNodeInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TagUpdateManyWithWhereWithoutNodeInputSchema),z.lazy(() => TagUpdateManyWithWhereWithoutNodeInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TagScalarWhereInputSchema),z.lazy(() => TagScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FlowRunCreateNestedManyWithoutScheduledJobInputSchema: z.ZodType<Prisma.FlowRunCreateNestedManyWithoutScheduledJobInput> = z.object({
  create: z.union([ z.lazy(() => FlowRunCreateWithoutScheduledJobInputSchema),z.lazy(() => FlowRunCreateWithoutScheduledJobInputSchema).array(),z.lazy(() => FlowRunUncheckedCreateWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutScheduledJobInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowRunCreateOrConnectWithoutScheduledJobInputSchema),z.lazy(() => FlowRunCreateOrConnectWithoutScheduledJobInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowRunCreateManyScheduledJobInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FlowRunUncheckedCreateNestedManyWithoutScheduledJobInputSchema: z.ZodType<Prisma.FlowRunUncheckedCreateNestedManyWithoutScheduledJobInput> = z.object({
  create: z.union([ z.lazy(() => FlowRunCreateWithoutScheduledJobInputSchema),z.lazy(() => FlowRunCreateWithoutScheduledJobInputSchema).array(),z.lazy(() => FlowRunUncheckedCreateWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutScheduledJobInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowRunCreateOrConnectWithoutScheduledJobInputSchema),z.lazy(() => FlowRunCreateOrConnectWithoutScheduledJobInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowRunCreateManyScheduledJobInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FlowRunUpdateManyWithoutScheduledJobNestedInputSchema: z.ZodType<Prisma.FlowRunUpdateManyWithoutScheduledJobNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowRunCreateWithoutScheduledJobInputSchema),z.lazy(() => FlowRunCreateWithoutScheduledJobInputSchema).array(),z.lazy(() => FlowRunUncheckedCreateWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutScheduledJobInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowRunCreateOrConnectWithoutScheduledJobInputSchema),z.lazy(() => FlowRunCreateOrConnectWithoutScheduledJobInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FlowRunUpsertWithWhereUniqueWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUpsertWithWhereUniqueWithoutScheduledJobInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowRunCreateManyScheduledJobInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FlowRunUpdateWithWhereUniqueWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUpdateWithWhereUniqueWithoutScheduledJobInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FlowRunUpdateManyWithWhereWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUpdateManyWithWhereWithoutScheduledJobInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FlowRunScalarWhereInputSchema),z.lazy(() => FlowRunScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FlowRunUncheckedUpdateManyWithoutScheduledJobNestedInputSchema: z.ZodType<Prisma.FlowRunUncheckedUpdateManyWithoutScheduledJobNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowRunCreateWithoutScheduledJobInputSchema),z.lazy(() => FlowRunCreateWithoutScheduledJobInputSchema).array(),z.lazy(() => FlowRunUncheckedCreateWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutScheduledJobInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FlowRunCreateOrConnectWithoutScheduledJobInputSchema),z.lazy(() => FlowRunCreateOrConnectWithoutScheduledJobInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FlowRunUpsertWithWhereUniqueWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUpsertWithWhereUniqueWithoutScheduledJobInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FlowRunCreateManyScheduledJobInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FlowRunWhereUniqueInputSchema),z.lazy(() => FlowRunWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FlowRunUpdateWithWhereUniqueWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUpdateWithWhereUniqueWithoutScheduledJobInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FlowRunUpdateManyWithWhereWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUpdateManyWithWhereWithoutScheduledJobInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FlowRunScalarWhereInputSchema),z.lazy(() => FlowRunScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FlowCreateNestedOneWithoutSecretsInputSchema: z.ZodType<Prisma.FlowCreateNestedOneWithoutSecretsInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutSecretsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutSecretsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutSecretsInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional()
}).strict();

export const NodeCreateNestedOneWithoutSecretsInputSchema: z.ZodType<Prisma.NodeCreateNestedOneWithoutSecretsInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutSecretsInputSchema),z.lazy(() => NodeUncheckedCreateWithoutSecretsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => NodeCreateOrConnectWithoutSecretsInputSchema).optional(),
  connect: z.lazy(() => NodeWhereUniqueInputSchema).optional()
}).strict();

export const EnumSecretCategoryFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumSecretCategoryFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => SecretCategorySchema).optional()
}).strict();

export const FlowUpdateOneWithoutSecretsNestedInputSchema: z.ZodType<Prisma.FlowUpdateOneWithoutSecretsNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutSecretsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutSecretsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutSecretsInputSchema).optional(),
  upsert: z.lazy(() => FlowUpsertWithoutSecretsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => FlowWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => FlowWhereInputSchema) ]).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FlowUpdateToOneWithWhereWithoutSecretsInputSchema),z.lazy(() => FlowUpdateWithoutSecretsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutSecretsInputSchema) ]).optional(),
}).strict();

export const NodeUpdateOneWithoutSecretsNestedInputSchema: z.ZodType<Prisma.NodeUpdateOneWithoutSecretsNestedInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutSecretsInputSchema),z.lazy(() => NodeUncheckedCreateWithoutSecretsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => NodeCreateOrConnectWithoutSecretsInputSchema).optional(),
  upsert: z.lazy(() => NodeUpsertWithoutSecretsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => NodeWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => NodeWhereInputSchema) ]).optional(),
  connect: z.lazy(() => NodeWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => NodeUpdateToOneWithWhereWithoutSecretsInputSchema),z.lazy(() => NodeUpdateWithoutSecretsInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutSecretsInputSchema) ]).optional(),
}).strict();

export const FlowCreateNestedOneWithoutTagsInputSchema: z.ZodType<Prisma.FlowCreateNestedOneWithoutTagsInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutTagsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutTagsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutTagsInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional()
}).strict();

export const NodeCreateNestedOneWithoutTagInputSchema: z.ZodType<Prisma.NodeCreateNestedOneWithoutTagInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutTagInputSchema),z.lazy(() => NodeUncheckedCreateWithoutTagInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => NodeCreateOrConnectWithoutTagInputSchema).optional(),
  connect: z.lazy(() => NodeWhereUniqueInputSchema).optional()
}).strict();

export const TagGroupCreateNestedOneWithoutTagsInputSchema: z.ZodType<Prisma.TagGroupCreateNestedOneWithoutTagsInput> = z.object({
  create: z.union([ z.lazy(() => TagGroupCreateWithoutTagsInputSchema),z.lazy(() => TagGroupUncheckedCreateWithoutTagsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TagGroupCreateOrConnectWithoutTagsInputSchema).optional(),
  connect: z.lazy(() => TagGroupWhereUniqueInputSchema).optional()
}).strict();

export const InstanceCreateNestedOneWithoutTagsInputSchema: z.ZodType<Prisma.InstanceCreateNestedOneWithoutTagsInput> = z.object({
  create: z.union([ z.lazy(() => InstanceCreateWithoutTagsInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutTagsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => InstanceCreateOrConnectWithoutTagsInputSchema).optional(),
  connect: z.lazy(() => InstanceWhereUniqueInputSchema).optional()
}).strict();

export const FlowUpdateOneWithoutTagsNestedInputSchema: z.ZodType<Prisma.FlowUpdateOneWithoutTagsNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutTagsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutTagsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutTagsInputSchema).optional(),
  upsert: z.lazy(() => FlowUpsertWithoutTagsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => FlowWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => FlowWhereInputSchema) ]).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FlowUpdateToOneWithWhereWithoutTagsInputSchema),z.lazy(() => FlowUpdateWithoutTagsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutTagsInputSchema) ]).optional(),
}).strict();

export const NodeUpdateOneWithoutTagNestedInputSchema: z.ZodType<Prisma.NodeUpdateOneWithoutTagNestedInput> = z.object({
  create: z.union([ z.lazy(() => NodeCreateWithoutTagInputSchema),z.lazy(() => NodeUncheckedCreateWithoutTagInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => NodeCreateOrConnectWithoutTagInputSchema).optional(),
  upsert: z.lazy(() => NodeUpsertWithoutTagInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => NodeWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => NodeWhereInputSchema) ]).optional(),
  connect: z.lazy(() => NodeWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => NodeUpdateToOneWithWhereWithoutTagInputSchema),z.lazy(() => NodeUpdateWithoutTagInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutTagInputSchema) ]).optional(),
}).strict();

export const TagGroupUpdateOneWithoutTagsNestedInputSchema: z.ZodType<Prisma.TagGroupUpdateOneWithoutTagsNestedInput> = z.object({
  create: z.union([ z.lazy(() => TagGroupCreateWithoutTagsInputSchema),z.lazy(() => TagGroupUncheckedCreateWithoutTagsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TagGroupCreateOrConnectWithoutTagsInputSchema).optional(),
  upsert: z.lazy(() => TagGroupUpsertWithoutTagsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => TagGroupWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => TagGroupWhereInputSchema) ]).optional(),
  connect: z.lazy(() => TagGroupWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TagGroupUpdateToOneWithWhereWithoutTagsInputSchema),z.lazy(() => TagGroupUpdateWithoutTagsInputSchema),z.lazy(() => TagGroupUncheckedUpdateWithoutTagsInputSchema) ]).optional(),
}).strict();

export const InstanceUpdateOneRequiredWithoutTagsNestedInputSchema: z.ZodType<Prisma.InstanceUpdateOneRequiredWithoutTagsNestedInput> = z.object({
  create: z.union([ z.lazy(() => InstanceCreateWithoutTagsInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutTagsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => InstanceCreateOrConnectWithoutTagsInputSchema).optional(),
  upsert: z.lazy(() => InstanceUpsertWithoutTagsInputSchema).optional(),
  connect: z.lazy(() => InstanceWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => InstanceUpdateToOneWithWhereWithoutTagsInputSchema),z.lazy(() => InstanceUpdateWithoutTagsInputSchema),z.lazy(() => InstanceUncheckedUpdateWithoutTagsInputSchema) ]).optional(),
}).strict();

export const TagCreateNestedManyWithoutTagGroupInputSchema: z.ZodType<Prisma.TagCreateNestedManyWithoutTagGroupInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutTagGroupInputSchema),z.lazy(() => TagCreateWithoutTagGroupInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutTagGroupInputSchema),z.lazy(() => TagUncheckedCreateWithoutTagGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutTagGroupInputSchema),z.lazy(() => TagCreateOrConnectWithoutTagGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyTagGroupInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const InstanceCreateNestedOneWithoutTagGroupsInputSchema: z.ZodType<Prisma.InstanceCreateNestedOneWithoutTagGroupsInput> = z.object({
  create: z.union([ z.lazy(() => InstanceCreateWithoutTagGroupsInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutTagGroupsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => InstanceCreateOrConnectWithoutTagGroupsInputSchema).optional(),
  connect: z.lazy(() => InstanceWhereUniqueInputSchema).optional()
}).strict();

export const TagUncheckedCreateNestedManyWithoutTagGroupInputSchema: z.ZodType<Prisma.TagUncheckedCreateNestedManyWithoutTagGroupInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutTagGroupInputSchema),z.lazy(() => TagCreateWithoutTagGroupInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutTagGroupInputSchema),z.lazy(() => TagUncheckedCreateWithoutTagGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutTagGroupInputSchema),z.lazy(() => TagCreateOrConnectWithoutTagGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyTagGroupInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const TagUpdateManyWithoutTagGroupNestedInputSchema: z.ZodType<Prisma.TagUpdateManyWithoutTagGroupNestedInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutTagGroupInputSchema),z.lazy(() => TagCreateWithoutTagGroupInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutTagGroupInputSchema),z.lazy(() => TagUncheckedCreateWithoutTagGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutTagGroupInputSchema),z.lazy(() => TagCreateOrConnectWithoutTagGroupInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TagUpsertWithWhereUniqueWithoutTagGroupInputSchema),z.lazy(() => TagUpsertWithWhereUniqueWithoutTagGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyTagGroupInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TagUpdateWithWhereUniqueWithoutTagGroupInputSchema),z.lazy(() => TagUpdateWithWhereUniqueWithoutTagGroupInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TagUpdateManyWithWhereWithoutTagGroupInputSchema),z.lazy(() => TagUpdateManyWithWhereWithoutTagGroupInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TagScalarWhereInputSchema),z.lazy(() => TagScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const InstanceUpdateOneRequiredWithoutTagGroupsNestedInputSchema: z.ZodType<Prisma.InstanceUpdateOneRequiredWithoutTagGroupsNestedInput> = z.object({
  create: z.union([ z.lazy(() => InstanceCreateWithoutTagGroupsInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutTagGroupsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => InstanceCreateOrConnectWithoutTagGroupsInputSchema).optional(),
  upsert: z.lazy(() => InstanceUpsertWithoutTagGroupsInputSchema).optional(),
  connect: z.lazy(() => InstanceWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => InstanceUpdateToOneWithWhereWithoutTagGroupsInputSchema),z.lazy(() => InstanceUpdateWithoutTagGroupsInputSchema),z.lazy(() => InstanceUncheckedUpdateWithoutTagGroupsInputSchema) ]).optional(),
}).strict();

export const TagUncheckedUpdateManyWithoutTagGroupNestedInputSchema: z.ZodType<Prisma.TagUncheckedUpdateManyWithoutTagGroupNestedInput> = z.object({
  create: z.union([ z.lazy(() => TagCreateWithoutTagGroupInputSchema),z.lazy(() => TagCreateWithoutTagGroupInputSchema).array(),z.lazy(() => TagUncheckedCreateWithoutTagGroupInputSchema),z.lazy(() => TagUncheckedCreateWithoutTagGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TagCreateOrConnectWithoutTagGroupInputSchema),z.lazy(() => TagCreateOrConnectWithoutTagGroupInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TagUpsertWithWhereUniqueWithoutTagGroupInputSchema),z.lazy(() => TagUpsertWithWhereUniqueWithoutTagGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TagCreateManyTagGroupInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TagWhereUniqueInputSchema),z.lazy(() => TagWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TagUpdateWithWhereUniqueWithoutTagGroupInputSchema),z.lazy(() => TagUpdateWithWhereUniqueWithoutTagGroupInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TagUpdateManyWithWhereWithoutTagGroupInputSchema),z.lazy(() => TagUpdateManyWithWhereWithoutTagGroupInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TagScalarWhereInputSchema),z.lazy(() => TagScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FlowCreateNestedOneWithoutTestCasesInputSchema: z.ZodType<Prisma.FlowCreateNestedOneWithoutTestCasesInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutTestCasesInputSchema),z.lazy(() => FlowUncheckedCreateWithoutTestCasesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutTestCasesInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional()
}).strict();

export const EnumMantineColorFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumMantineColorFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => MantineColorSchema).optional()
}).strict();

export const FlowUpdateOneRequiredWithoutTestCasesNestedInputSchema: z.ZodType<Prisma.FlowUpdateOneRequiredWithoutTestCasesNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutTestCasesInputSchema),z.lazy(() => FlowUncheckedCreateWithoutTestCasesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutTestCasesInputSchema).optional(),
  upsert: z.lazy(() => FlowUpsertWithoutTestCasesInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FlowUpdateToOneWithWhereWithoutTestCasesInputSchema),z.lazy(() => FlowUpdateWithoutTestCasesInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutTestCasesInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutAccountsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutAccountsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccountsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAccountsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutAccountsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutAccountsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccountsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAccountsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutAccountsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutAccountsInputSchema),z.lazy(() => UserUpdateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAccountsInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutSessionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSessionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutSessionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutSessionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSessionsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutSessionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutSessionsInputSchema),z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]).optional(),
}).strict();

export const AccountCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AccountCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountCreateWithoutUserInputSchema).array(),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccountCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const InstanceCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.InstanceCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => InstanceCreateWithoutUserInputSchema),z.lazy(() => InstanceCreateWithoutUserInputSchema).array(),z.lazy(() => InstanceUncheckedCreateWithoutUserInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InstanceCreateOrConnectWithoutUserInputSchema),z.lazy(() => InstanceCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InstanceCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => InstanceWhereUniqueInputSchema),z.lazy(() => InstanceWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SessionCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AuditLogCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AuditLogCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AuditLogCreateWithoutUserInputSchema),z.lazy(() => AuditLogCreateWithoutUserInputSchema).array(),z.lazy(() => AuditLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => AuditLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AuditLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => AuditLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AuditLogCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AccountUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AccountUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountCreateWithoutUserInputSchema).array(),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccountCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const InstanceUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.InstanceUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => InstanceCreateWithoutUserInputSchema),z.lazy(() => InstanceCreateWithoutUserInputSchema).array(),z.lazy(() => InstanceUncheckedCreateWithoutUserInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InstanceCreateOrConnectWithoutUserInputSchema),z.lazy(() => InstanceCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InstanceCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => InstanceWhereUniqueInputSchema),z.lazy(() => InstanceWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SessionUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AuditLogUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AuditLogUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AuditLogCreateWithoutUserInputSchema),z.lazy(() => AuditLogCreateWithoutUserInputSchema).array(),z.lazy(() => AuditLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => AuditLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AuditLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => AuditLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AuditLogCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AccountUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.AccountUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountCreateWithoutUserInputSchema).array(),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AccountUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccountUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccountCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AccountUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccountUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AccountUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => AccountUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AccountScalarWhereInputSchema),z.lazy(() => AccountScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const InstanceUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.InstanceUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => InstanceCreateWithoutUserInputSchema),z.lazy(() => InstanceCreateWithoutUserInputSchema).array(),z.lazy(() => InstanceUncheckedCreateWithoutUserInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InstanceCreateOrConnectWithoutUserInputSchema),z.lazy(() => InstanceCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => InstanceUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => InstanceUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InstanceCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => InstanceWhereUniqueInputSchema),z.lazy(() => InstanceWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => InstanceWhereUniqueInputSchema),z.lazy(() => InstanceWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => InstanceWhereUniqueInputSchema),z.lazy(() => InstanceWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => InstanceWhereUniqueInputSchema),z.lazy(() => InstanceWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => InstanceUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => InstanceUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => InstanceUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => InstanceUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => InstanceScalarWhereInputSchema),z.lazy(() => InstanceScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SessionUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SessionUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AuditLogUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.AuditLogUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AuditLogCreateWithoutUserInputSchema),z.lazy(() => AuditLogCreateWithoutUserInputSchema).array(),z.lazy(() => AuditLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => AuditLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AuditLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => AuditLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AuditLogCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AuditLogUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => AuditLogUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AuditLogScalarWhereInputSchema),z.lazy(() => AuditLogScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AccountUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountCreateWithoutUserInputSchema).array(),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AccountUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccountUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccountCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AccountUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccountUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AccountUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => AccountUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AccountScalarWhereInputSchema),z.lazy(() => AccountScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const InstanceUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.InstanceUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => InstanceCreateWithoutUserInputSchema),z.lazy(() => InstanceCreateWithoutUserInputSchema).array(),z.lazy(() => InstanceUncheckedCreateWithoutUserInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InstanceCreateOrConnectWithoutUserInputSchema),z.lazy(() => InstanceCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => InstanceUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => InstanceUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InstanceCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => InstanceWhereUniqueInputSchema),z.lazy(() => InstanceWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => InstanceWhereUniqueInputSchema),z.lazy(() => InstanceWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => InstanceWhereUniqueInputSchema),z.lazy(() => InstanceWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => InstanceWhereUniqueInputSchema),z.lazy(() => InstanceWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => InstanceUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => InstanceUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => InstanceUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => InstanceUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => InstanceScalarWhereInputSchema),z.lazy(() => InstanceScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AuditLogUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AuditLogCreateWithoutUserInputSchema),z.lazy(() => AuditLogCreateWithoutUserInputSchema).array(),z.lazy(() => AuditLogUncheckedCreateWithoutUserInputSchema),z.lazy(() => AuditLogUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AuditLogCreateOrConnectWithoutUserInputSchema),z.lazy(() => AuditLogCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AuditLogCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AuditLogWhereUniqueInputSchema),z.lazy(() => AuditLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AuditLogUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => AuditLogUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AuditLogScalarWhereInputSchema),z.lazy(() => AuditLogScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutAuditLogsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAuditLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAuditLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAuditLogsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const FlowCreateNestedOneWithoutAuditLogsInputSchema: z.ZodType<Prisma.FlowCreateNestedOneWithoutAuditLogsInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutAuditLogsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutAuditLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutAuditLogsInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutAuditLogsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutAuditLogsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAuditLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAuditLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAuditLogsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutAuditLogsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutAuditLogsInputSchema),z.lazy(() => UserUpdateWithoutAuditLogsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAuditLogsInputSchema) ]).optional(),
}).strict();

export const FlowUpdateOneRequiredWithoutAuditLogsNestedInputSchema: z.ZodType<Prisma.FlowUpdateOneRequiredWithoutAuditLogsNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutAuditLogsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutAuditLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutAuditLogsInputSchema).optional(),
  upsert: z.lazy(() => FlowUpsertWithoutAuditLogsInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FlowUpdateToOneWithWhereWithoutAuditLogsInputSchema),z.lazy(() => FlowUpdateWithoutAuditLogsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutAuditLogsInputSchema) ]).optional(),
}).strict();

export const FlowCreateNestedOneWithoutStatisticsInputSchema: z.ZodType<Prisma.FlowCreateNestedOneWithoutStatisticsInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutStatisticsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutStatisticsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutStatisticsInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional()
}).strict();

export const FlowUpdateOneRequiredWithoutStatisticsNestedInputSchema: z.ZodType<Prisma.FlowUpdateOneRequiredWithoutStatisticsNestedInput> = z.object({
  create: z.union([ z.lazy(() => FlowCreateWithoutStatisticsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutStatisticsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FlowCreateOrConnectWithoutStatisticsInputSchema).optional(),
  upsert: z.lazy(() => FlowUpsertWithoutStatisticsInputSchema).optional(),
  connect: z.lazy(() => FlowWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FlowUpdateToOneWithWhereWithoutStatisticsInputSchema),z.lazy(() => FlowUpdateWithoutStatisticsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutStatisticsInputSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedEnumEdgeTypeFilterSchema: z.ZodType<Prisma.NestedEnumEdgeTypeFilter> = z.object({
  equals: z.lazy(() => EdgeTypeSchema).optional(),
  in: z.lazy(() => EdgeTypeSchema).array().optional(),
  notIn: z.lazy(() => EdgeTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => NestedEnumEdgeTypeFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const NestedEnumEdgeTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumEdgeTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => EdgeTypeSchema).optional(),
  in: z.lazy(() => EdgeTypeSchema).array().optional(),
  notIn: z.lazy(() => EdgeTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => NestedEnumEdgeTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumEdgeTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumEdgeTypeFilterSchema).optional()
}).strict();

export const NestedJsonNullableFilterSchema: z.ZodType<Prisma.NestedJsonNullableFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional()
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedEnumFlowMethodFilterSchema: z.ZodType<Prisma.NestedEnumFlowMethodFilter> = z.object({
  equals: z.lazy(() => FlowMethodSchema).optional(),
  in: z.lazy(() => FlowMethodSchema).array().optional(),
  notIn: z.lazy(() => FlowMethodSchema).array().optional(),
  not: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => NestedEnumFlowMethodFilterSchema) ]).optional(),
}).strict();

export const NestedEnumFlowMethodWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumFlowMethodWithAggregatesFilter> = z.object({
  equals: z.lazy(() => FlowMethodSchema).optional(),
  in: z.lazy(() => FlowMethodSchema).array().optional(),
  notIn: z.lazy(() => FlowMethodSchema).array().optional(),
  not: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => NestedEnumFlowMethodWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumFlowMethodFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumFlowMethodFilterSchema).optional()
}).strict();

export const NestedEnumStartedByFilterSchema: z.ZodType<Prisma.NestedEnumStartedByFilter> = z.object({
  equals: z.lazy(() => StartedBySchema).optional(),
  in: z.lazy(() => StartedBySchema).array().optional(),
  notIn: z.lazy(() => StartedBySchema).array().optional(),
  not: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => NestedEnumStartedByFilterSchema) ]).optional(),
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedEnumStartedByWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumStartedByWithAggregatesFilter> = z.object({
  equals: z.lazy(() => StartedBySchema).optional(),
  in: z.lazy(() => StartedBySchema).array().optional(),
  notIn: z.lazy(() => StartedBySchema).array().optional(),
  not: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => NestedEnumStartedByWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumStartedByFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumStartedByFilterSchema).optional()
}).strict();

export const NestedBoolNullableFilterSchema: z.ZodType<Prisma.NestedBoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumRunStatusFilterSchema: z.ZodType<Prisma.NestedEnumRunStatusFilter> = z.object({
  equals: z.lazy(() => RunStatusSchema).optional(),
  in: z.lazy(() => RunStatusSchema).array().optional(),
  notIn: z.lazy(() => RunStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => NestedEnumRunStatusFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedBoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional()
}).strict();

export const NestedEnumRunStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRunStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RunStatusSchema).optional(),
  in: z.lazy(() => RunStatusSchema).array().optional(),
  notIn: z.lazy(() => RunStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => NestedEnumRunStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRunStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRunStatusFilterSchema).optional()
}).strict();

export const NestedIntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict();

export const NestedEnumInfraTypeFilterSchema: z.ZodType<Prisma.NestedEnumInfraTypeFilter> = z.object({
  equals: z.lazy(() => InfraTypeSchema).optional(),
  in: z.lazy(() => InfraTypeSchema).array().optional(),
  notIn: z.lazy(() => InfraTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => InfraTypeSchema),z.lazy(() => NestedEnumInfraTypeFilterSchema) ]).optional(),
}).strict();

export const NestedEnumInfraTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumInfraTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => InfraTypeSchema).optional(),
  in: z.lazy(() => InfraTypeSchema).array().optional(),
  notIn: z.lazy(() => InfraTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => InfraTypeSchema),z.lazy(() => NestedEnumInfraTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumInfraTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumInfraTypeFilterSchema).optional()
}).strict();

export const NestedEnumNodeTypeFilterSchema: z.ZodType<Prisma.NestedEnumNodeTypeFilter> = z.object({
  equals: z.lazy(() => NodeTypeSchema).optional(),
  in: z.lazy(() => NodeTypeSchema).array().optional(),
  notIn: z.lazy(() => NodeTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => NestedEnumNodeTypeFilterSchema) ]).optional(),
}).strict();

export const NestedEnumNodeTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumNodeTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => NodeTypeSchema).optional(),
  in: z.lazy(() => NodeTypeSchema).array().optional(),
  notIn: z.lazy(() => NodeTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => NestedEnumNodeTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumNodeTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumNodeTypeFilterSchema).optional()
}).strict();

export const NestedEnumSecretCategoryFilterSchema: z.ZodType<Prisma.NestedEnumSecretCategoryFilter> = z.object({
  equals: z.lazy(() => SecretCategorySchema).optional(),
  in: z.lazy(() => SecretCategorySchema).array().optional(),
  notIn: z.lazy(() => SecretCategorySchema).array().optional(),
  not: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => NestedEnumSecretCategoryFilterSchema) ]).optional(),
}).strict();

export const NestedEnumSecretCategoryWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumSecretCategoryWithAggregatesFilter> = z.object({
  equals: z.lazy(() => SecretCategorySchema).optional(),
  in: z.lazy(() => SecretCategorySchema).array().optional(),
  notIn: z.lazy(() => SecretCategorySchema).array().optional(),
  not: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => NestedEnumSecretCategoryWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumSecretCategoryFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumSecretCategoryFilterSchema).optional()
}).strict();

export const NestedEnumMantineColorFilterSchema: z.ZodType<Prisma.NestedEnumMantineColorFilter> = z.object({
  equals: z.lazy(() => MantineColorSchema).optional(),
  in: z.lazy(() => MantineColorSchema).array().optional(),
  notIn: z.lazy(() => MantineColorSchema).array().optional(),
  not: z.union([ z.lazy(() => MantineColorSchema),z.lazy(() => NestedEnumMantineColorFilterSchema) ]).optional(),
}).strict();

export const NestedEnumMantineColorWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumMantineColorWithAggregatesFilter> = z.object({
  equals: z.lazy(() => MantineColorSchema).optional(),
  in: z.lazy(() => MantineColorSchema).array().optional(),
  notIn: z.lazy(() => MantineColorSchema).array().optional(),
  not: z.union([ z.lazy(() => MantineColorSchema),z.lazy(() => NestedEnumMantineColorWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumMantineColorFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumMantineColorFilterSchema).optional()
}).strict();

export const FlowCreateWithoutEdgesInputSchema: z.ZodType<Prisma.FlowCreateWithoutEdgesInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  flowRuns: z.lazy(() => FlowRunCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutFlowsInputSchema),
  nodes: z.lazy(() => NodeCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowUncheckedCreateWithoutEdgesInputSchema: z.ZodType<Prisma.FlowUncheckedCreateWithoutEdgesInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowCreateOrConnectWithoutEdgesInputSchema: z.ZodType<Prisma.FlowCreateOrConnectWithoutEdgesInput> = z.object({
  where: z.lazy(() => FlowWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowCreateWithoutEdgesInputSchema),z.lazy(() => FlowUncheckedCreateWithoutEdgesInputSchema) ]),
}).strict();

export const NodeCreateWithoutSourceEdgesInputSchema: z.ZodType<Prisma.NodeCreateWithoutSourceEdgesInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutNodesInputSchema),
  infrastructure: z.lazy(() => InfrastructureCreateNestedOneWithoutNodesInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutNodeInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeCreateNestedManyWithoutTargetNodeInputSchema).optional(),
  Tag: z.lazy(() => TagCreateNestedManyWithoutNodeInputSchema).optional()
}).strict();

export const NodeUncheckedCreateWithoutSourceEdgesInputSchema: z.ZodType<Prisma.NodeUncheckedCreateWithoutSourceEdgesInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  flowId: z.string(),
  id: z.string().cuid().optional(),
  infrastructureId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutNodeInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutTargetNodeInputSchema).optional(),
  Tag: z.lazy(() => TagUncheckedCreateNestedManyWithoutNodeInputSchema).optional()
}).strict();

export const NodeCreateOrConnectWithoutSourceEdgesInputSchema: z.ZodType<Prisma.NodeCreateOrConnectWithoutSourceEdgesInput> = z.object({
  where: z.lazy(() => NodeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => NodeCreateWithoutSourceEdgesInputSchema),z.lazy(() => NodeUncheckedCreateWithoutSourceEdgesInputSchema) ]),
}).strict();

export const NodeCreateWithoutTargetEdgesInputSchema: z.ZodType<Prisma.NodeCreateWithoutTargetEdgesInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutNodesInputSchema),
  infrastructure: z.lazy(() => InfrastructureCreateNestedOneWithoutNodesInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutNodeInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeCreateNestedManyWithoutSourceNodeInputSchema).optional(),
  Tag: z.lazy(() => TagCreateNestedManyWithoutNodeInputSchema).optional()
}).strict();

export const NodeUncheckedCreateWithoutTargetEdgesInputSchema: z.ZodType<Prisma.NodeUncheckedCreateWithoutTargetEdgesInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  flowId: z.string(),
  id: z.string().cuid().optional(),
  infrastructureId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutNodeInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutSourceNodeInputSchema).optional(),
  Tag: z.lazy(() => TagUncheckedCreateNestedManyWithoutNodeInputSchema).optional()
}).strict();

export const NodeCreateOrConnectWithoutTargetEdgesInputSchema: z.ZodType<Prisma.NodeCreateOrConnectWithoutTargetEdgesInput> = z.object({
  where: z.lazy(() => NodeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => NodeCreateWithoutTargetEdgesInputSchema),z.lazy(() => NodeUncheckedCreateWithoutTargetEdgesInputSchema) ]),
}).strict();

export const FlowUpsertWithoutEdgesInputSchema: z.ZodType<Prisma.FlowUpsertWithoutEdgesInput> = z.object({
  update: z.union([ z.lazy(() => FlowUpdateWithoutEdgesInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutEdgesInputSchema) ]),
  create: z.union([ z.lazy(() => FlowCreateWithoutEdgesInputSchema),z.lazy(() => FlowUncheckedCreateWithoutEdgesInputSchema) ]),
  where: z.lazy(() => FlowWhereInputSchema).optional()
}).strict();

export const FlowUpdateToOneWithWhereWithoutEdgesInputSchema: z.ZodType<Prisma.FlowUpdateToOneWithWhereWithoutEdgesInput> = z.object({
  where: z.lazy(() => FlowWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => FlowUpdateWithoutEdgesInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutEdgesInputSchema) ]),
}).strict();

export const FlowUpdateWithoutEdgesInputSchema: z.ZodType<Prisma.FlowUpdateWithoutEdgesInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flowRuns: z.lazy(() => FlowRunUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutFlowsNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowUncheckedUpdateWithoutEdgesInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateWithoutEdgesInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const NodeUpsertWithoutSourceEdgesInputSchema: z.ZodType<Prisma.NodeUpsertWithoutSourceEdgesInput> = z.object({
  update: z.union([ z.lazy(() => NodeUpdateWithoutSourceEdgesInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutSourceEdgesInputSchema) ]),
  create: z.union([ z.lazy(() => NodeCreateWithoutSourceEdgesInputSchema),z.lazy(() => NodeUncheckedCreateWithoutSourceEdgesInputSchema) ]),
  where: z.lazy(() => NodeWhereInputSchema).optional()
}).strict();

export const NodeUpdateToOneWithWhereWithoutSourceEdgesInputSchema: z.ZodType<Prisma.NodeUpdateToOneWithWhereWithoutSourceEdgesInput> = z.object({
  where: z.lazy(() => NodeWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => NodeUpdateWithoutSourceEdgesInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutSourceEdgesInputSchema) ]),
}).strict();

export const NodeUpdateWithoutSourceEdgesInputSchema: z.ZodType<Prisma.NodeUpdateWithoutSourceEdgesInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutNodesNestedInputSchema).optional(),
  infrastructure: z.lazy(() => InfrastructureUpdateOneWithoutNodesNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutNodeNestedInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUpdateManyWithoutTargetNodeNestedInputSchema).optional(),
  Tag: z.lazy(() => TagUpdateManyWithoutNodeNestedInputSchema).optional()
}).strict();

export const NodeUncheckedUpdateWithoutSourceEdgesInputSchema: z.ZodType<Prisma.NodeUncheckedUpdateWithoutSourceEdgesInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  infrastructureId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutNodeNestedInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUncheckedUpdateManyWithoutTargetNodeNestedInputSchema).optional(),
  Tag: z.lazy(() => TagUncheckedUpdateManyWithoutNodeNestedInputSchema).optional()
}).strict();

export const NodeUpsertWithoutTargetEdgesInputSchema: z.ZodType<Prisma.NodeUpsertWithoutTargetEdgesInput> = z.object({
  update: z.union([ z.lazy(() => NodeUpdateWithoutTargetEdgesInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutTargetEdgesInputSchema) ]),
  create: z.union([ z.lazy(() => NodeCreateWithoutTargetEdgesInputSchema),z.lazy(() => NodeUncheckedCreateWithoutTargetEdgesInputSchema) ]),
  where: z.lazy(() => NodeWhereInputSchema).optional()
}).strict();

export const NodeUpdateToOneWithWhereWithoutTargetEdgesInputSchema: z.ZodType<Prisma.NodeUpdateToOneWithWhereWithoutTargetEdgesInput> = z.object({
  where: z.lazy(() => NodeWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => NodeUpdateWithoutTargetEdgesInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutTargetEdgesInputSchema) ]),
}).strict();

export const NodeUpdateWithoutTargetEdgesInputSchema: z.ZodType<Prisma.NodeUpdateWithoutTargetEdgesInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutNodesNestedInputSchema).optional(),
  infrastructure: z.lazy(() => InfrastructureUpdateOneWithoutNodesNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutNodeNestedInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUpdateManyWithoutSourceNodeNestedInputSchema).optional(),
  Tag: z.lazy(() => TagUpdateManyWithoutNodeNestedInputSchema).optional()
}).strict();

export const NodeUncheckedUpdateWithoutTargetEdgesInputSchema: z.ZodType<Prisma.NodeUncheckedUpdateWithoutTargetEdgesInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  infrastructureId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutNodeNestedInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUncheckedUpdateManyWithoutSourceNodeNestedInputSchema).optional(),
  Tag: z.lazy(() => TagUncheckedUpdateManyWithoutNodeNestedInputSchema).optional()
}).strict();

export const EdgeCreateWithoutFlowInputSchema: z.ZodType<Prisma.EdgeCreateWithoutFlowInput> = z.object({
  id: z.string().cuid().optional(),
  rfId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  type: z.lazy(() => EdgeTypeSchema).optional(),
  normalizedKey: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  sourceNode: z.lazy(() => NodeCreateNestedOneWithoutSourceEdgesInputSchema),
  targetNode: z.lazy(() => NodeCreateNestedOneWithoutTargetEdgesInputSchema)
}).strict();

export const EdgeUncheckedCreateWithoutFlowInputSchema: z.ZodType<Prisma.EdgeUncheckedCreateWithoutFlowInput> = z.object({
  id: z.string().cuid().optional(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  rfId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  type: z.lazy(() => EdgeTypeSchema).optional(),
  normalizedKey: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const EdgeCreateOrConnectWithoutFlowInputSchema: z.ZodType<Prisma.EdgeCreateOrConnectWithoutFlowInput> = z.object({
  where: z.lazy(() => EdgeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EdgeCreateWithoutFlowInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const EdgeCreateManyFlowInputEnvelopeSchema: z.ZodType<Prisma.EdgeCreateManyFlowInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => EdgeCreateManyFlowInputSchema),z.lazy(() => EdgeCreateManyFlowInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const FlowRunCreateWithoutFlowInputSchema: z.ZodType<Prisma.FlowRunCreateWithoutFlowInput> = z.object({
  isScheduled: z.boolean().optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.lazy(() => RunStatusSchema),
  startedBy: z.lazy(() => StartedBySchema),
  timeEnded: z.coerce.date().optional().nullable(),
  timeStarted: z.coerce.date().optional(),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowRunInputSchema).optional(),
  scheduledJob: z.lazy(() => ScheduledJobCreateNestedOneWithoutFlowRunsInputSchema).optional()
}).strict();

export const FlowRunUncheckedCreateWithoutFlowInputSchema: z.ZodType<Prisma.FlowRunUncheckedCreateWithoutFlowInput> = z.object({
  id: z.number().int().optional(),
  isScheduled: z.boolean().optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.lazy(() => RunStatusSchema),
  scheduledJobId: z.number().int().optional().nullable(),
  startedBy: z.lazy(() => StartedBySchema),
  timeEnded: z.coerce.date().optional().nullable(),
  timeStarted: z.coerce.date().optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowRunInputSchema).optional()
}).strict();

export const FlowRunCreateOrConnectWithoutFlowInputSchema: z.ZodType<Prisma.FlowRunCreateOrConnectWithoutFlowInput> = z.object({
  where: z.lazy(() => FlowRunWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowRunCreateWithoutFlowInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const FlowRunCreateManyFlowInputEnvelopeSchema: z.ZodType<Prisma.FlowRunCreateManyFlowInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => FlowRunCreateManyFlowInputSchema),z.lazy(() => FlowRunCreateManyFlowInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const FlowEventCreateWithoutFlowInputSchema: z.ZodType<Prisma.FlowEventCreateWithoutFlowInput> = z.object({
  createdAt: z.coerce.date().optional(),
  nodeId: z.string(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.lazy(() => StartedBySchema),
  flowRun: z.lazy(() => FlowRunCreateNestedOneWithoutFlowEventsInputSchema)
}).strict();

export const FlowEventUncheckedCreateWithoutFlowInputSchema: z.ZodType<Prisma.FlowEventUncheckedCreateWithoutFlowInput> = z.object({
  createdAt: z.coerce.date().optional(),
  flowRunId: z.number().int(),
  id: z.number().int().optional(),
  nodeId: z.string(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.lazy(() => StartedBySchema)
}).strict();

export const FlowEventCreateOrConnectWithoutFlowInputSchema: z.ZodType<Prisma.FlowEventCreateOrConnectWithoutFlowInput> = z.object({
  where: z.lazy(() => FlowEventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowEventCreateWithoutFlowInputSchema),z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const FlowEventCreateManyFlowInputEnvelopeSchema: z.ZodType<Prisma.FlowEventCreateManyFlowInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => FlowEventCreateManyFlowInputSchema),z.lazy(() => FlowEventCreateManyFlowInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const InstanceCreateWithoutFlowsInputSchema: z.ZodType<Prisma.InstanceCreateWithoutFlowsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  id: z.string().cuid().optional(),
  image: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutInstanceInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupCreateNestedManyWithoutInstanceInputSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutInstancesInputSchema).optional()
}).strict();

export const InstanceUncheckedCreateWithoutFlowsInputSchema: z.ZodType<Prisma.InstanceUncheckedCreateWithoutFlowsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  id: z.string().cuid().optional(),
  image: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutInstanceInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupUncheckedCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict();

export const InstanceCreateOrConnectWithoutFlowsInputSchema: z.ZodType<Prisma.InstanceCreateOrConnectWithoutFlowsInput> = z.object({
  where: z.lazy(() => InstanceWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => InstanceCreateWithoutFlowsInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutFlowsInputSchema) ]),
}).strict();

export const NodeCreateWithoutFlowInputSchema: z.ZodType<Prisma.NodeCreateWithoutFlowInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  infrastructure: z.lazy(() => InfrastructureCreateNestedOneWithoutNodesInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutNodeInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeCreateNestedManyWithoutSourceNodeInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeCreateNestedManyWithoutTargetNodeInputSchema).optional(),
  Tag: z.lazy(() => TagCreateNestedManyWithoutNodeInputSchema).optional()
}).strict();

export const NodeUncheckedCreateWithoutFlowInputSchema: z.ZodType<Prisma.NodeUncheckedCreateWithoutFlowInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  infrastructureId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutNodeInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutSourceNodeInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutTargetNodeInputSchema).optional(),
  Tag: z.lazy(() => TagUncheckedCreateNestedManyWithoutNodeInputSchema).optional()
}).strict();

export const NodeCreateOrConnectWithoutFlowInputSchema: z.ZodType<Prisma.NodeCreateOrConnectWithoutFlowInput> = z.object({
  where: z.lazy(() => NodeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => NodeCreateWithoutFlowInputSchema),z.lazy(() => NodeUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const NodeCreateManyFlowInputEnvelopeSchema: z.ZodType<Prisma.NodeCreateManyFlowInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => NodeCreateManyFlowInputSchema),z.lazy(() => NodeCreateManyFlowInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const SecretCreateWithoutFlowInputSchema: z.ZodType<Prisma.SecretCreateWithoutFlowInput> = z.object({
  name: z.string(),
  category: z.lazy(() => SecretCategorySchema),
  createdAt: z.coerce.date().optional(),
  secret: z.string(),
  shouldEncrypt: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  node: z.lazy(() => NodeCreateNestedOneWithoutSecretsInputSchema).optional()
}).strict();

export const SecretUncheckedCreateWithoutFlowInputSchema: z.ZodType<Prisma.SecretUncheckedCreateWithoutFlowInput> = z.object({
  name: z.string(),
  category: z.lazy(() => SecretCategorySchema),
  createdAt: z.coerce.date().optional(),
  id: z.number().int().optional(),
  nodeId: z.string().optional().nullable(),
  secret: z.string(),
  shouldEncrypt: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const SecretCreateOrConnectWithoutFlowInputSchema: z.ZodType<Prisma.SecretCreateOrConnectWithoutFlowInput> = z.object({
  where: z.lazy(() => SecretWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SecretCreateWithoutFlowInputSchema),z.lazy(() => SecretUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const SecretCreateManyFlowInputEnvelopeSchema: z.ZodType<Prisma.SecretCreateManyFlowInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SecretCreateManyFlowInputSchema),z.lazy(() => SecretCreateManyFlowInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const TagCreateWithoutFlowInputSchema: z.ZodType<Prisma.TagCreateWithoutFlowInput> = z.object({
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  node: z.lazy(() => NodeCreateNestedOneWithoutTagInputSchema).optional(),
  tagGroup: z.lazy(() => TagGroupCreateNestedOneWithoutTagsInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutTagsInputSchema)
}).strict();

export const TagUncheckedCreateWithoutFlowInputSchema: z.ZodType<Prisma.TagUncheckedCreateWithoutFlowInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  nodeId: z.string().optional().nullable(),
  tagGroupId: z.string().optional().nullable(),
  instanceId: z.string()
}).strict();

export const TagCreateOrConnectWithoutFlowInputSchema: z.ZodType<Prisma.TagCreateOrConnectWithoutFlowInput> = z.object({
  where: z.lazy(() => TagWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TagCreateWithoutFlowInputSchema),z.lazy(() => TagUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const TagCreateManyFlowInputEnvelopeSchema: z.ZodType<Prisma.TagCreateManyFlowInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => TagCreateManyFlowInputSchema),z.lazy(() => TagCreateManyFlowInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const TestCaseCreateWithoutFlowInputSchema: z.ZodType<Prisma.TestCaseCreateWithoutFlowInput> = z.object({
  color: z.lazy(() => MantineColorSchema),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const TestCaseUncheckedCreateWithoutFlowInputSchema: z.ZodType<Prisma.TestCaseUncheckedCreateWithoutFlowInput> = z.object({
  color: z.lazy(() => MantineColorSchema),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const TestCaseCreateOrConnectWithoutFlowInputSchema: z.ZodType<Prisma.TestCaseCreateOrConnectWithoutFlowInput> = z.object({
  where: z.lazy(() => TestCaseWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TestCaseCreateWithoutFlowInputSchema),z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const TestCaseCreateManyFlowInputEnvelopeSchema: z.ZodType<Prisma.TestCaseCreateManyFlowInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => TestCaseCreateManyFlowInputSchema),z.lazy(() => TestCaseCreateManyFlowInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const AuditLogCreateWithoutFlowInputSchema: z.ZodType<Prisma.AuditLogCreateWithoutFlowInput> = z.object({
  id: z.string().cuid().optional(),
  entityType: z.string(),
  entityId: z.string(),
  changeType: z.string(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  timestamp: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutAuditLogsInputSchema)
}).strict();

export const AuditLogUncheckedCreateWithoutFlowInputSchema: z.ZodType<Prisma.AuditLogUncheckedCreateWithoutFlowInput> = z.object({
  id: z.string().cuid().optional(),
  entityType: z.string(),
  entityId: z.string(),
  changeType: z.string(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  userId: z.string(),
  timestamp: z.coerce.date().optional()
}).strict();

export const AuditLogCreateOrConnectWithoutFlowInputSchema: z.ZodType<Prisma.AuditLogCreateOrConnectWithoutFlowInput> = z.object({
  where: z.lazy(() => AuditLogWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AuditLogCreateWithoutFlowInputSchema),z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const AuditLogCreateManyFlowInputEnvelopeSchema: z.ZodType<Prisma.AuditLogCreateManyFlowInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AuditLogCreateManyFlowInputSchema),z.lazy(() => AuditLogCreateManyFlowInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const FlowStatisticsCreateWithoutFlowInputSchema: z.ZodType<Prisma.FlowStatisticsCreateWithoutFlowInput> = z.object({
  id: z.string().cuid().optional(),
  totalRuns: z.number().int().optional(),
  successfulRuns: z.number().int().optional(),
  failedRuns: z.number().int().optional(),
  lastUpdated: z.coerce.date().optional()
}).strict();

export const FlowStatisticsUncheckedCreateWithoutFlowInputSchema: z.ZodType<Prisma.FlowStatisticsUncheckedCreateWithoutFlowInput> = z.object({
  id: z.string().cuid().optional(),
  totalRuns: z.number().int().optional(),
  successfulRuns: z.number().int().optional(),
  failedRuns: z.number().int().optional(),
  lastUpdated: z.coerce.date().optional()
}).strict();

export const FlowStatisticsCreateOrConnectWithoutFlowInputSchema: z.ZodType<Prisma.FlowStatisticsCreateOrConnectWithoutFlowInput> = z.object({
  where: z.lazy(() => FlowStatisticsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowStatisticsCreateWithoutFlowInputSchema),z.lazy(() => FlowStatisticsUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const EdgeUpsertWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.EdgeUpsertWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => EdgeWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EdgeUpdateWithoutFlowInputSchema),z.lazy(() => EdgeUncheckedUpdateWithoutFlowInputSchema) ]),
  create: z.union([ z.lazy(() => EdgeCreateWithoutFlowInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const EdgeUpdateWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.EdgeUpdateWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => EdgeWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EdgeUpdateWithoutFlowInputSchema),z.lazy(() => EdgeUncheckedUpdateWithoutFlowInputSchema) ]),
}).strict();

export const EdgeUpdateManyWithWhereWithoutFlowInputSchema: z.ZodType<Prisma.EdgeUpdateManyWithWhereWithoutFlowInput> = z.object({
  where: z.lazy(() => EdgeScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EdgeUpdateManyMutationInputSchema),z.lazy(() => EdgeUncheckedUpdateManyWithoutFlowInputSchema) ]),
}).strict();

export const EdgeScalarWhereInputSchema: z.ZodType<Prisma.EdgeScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EdgeScalarWhereInputSchema),z.lazy(() => EdgeScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EdgeScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EdgeScalarWhereInputSchema),z.lazy(() => EdgeScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sourceNodeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  targetNodeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  rfId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  label: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  type: z.union([ z.lazy(() => EnumEdgeTypeFilterSchema),z.lazy(() => EdgeTypeSchema) ]).optional(),
  normalizedKey: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
}).strict();

export const FlowRunUpsertWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.FlowRunUpsertWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => FlowRunWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FlowRunUpdateWithoutFlowInputSchema),z.lazy(() => FlowRunUncheckedUpdateWithoutFlowInputSchema) ]),
  create: z.union([ z.lazy(() => FlowRunCreateWithoutFlowInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const FlowRunUpdateWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.FlowRunUpdateWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => FlowRunWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FlowRunUpdateWithoutFlowInputSchema),z.lazy(() => FlowRunUncheckedUpdateWithoutFlowInputSchema) ]),
}).strict();

export const FlowRunUpdateManyWithWhereWithoutFlowInputSchema: z.ZodType<Prisma.FlowRunUpdateManyWithWhereWithoutFlowInput> = z.object({
  where: z.lazy(() => FlowRunScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FlowRunUpdateManyMutationInputSchema),z.lazy(() => FlowRunUncheckedUpdateManyWithoutFlowInputSchema) ]),
}).strict();

export const FlowRunScalarWhereInputSchema: z.ZodType<Prisma.FlowRunScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => FlowRunScalarWhereInputSchema),z.lazy(() => FlowRunScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowRunScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowRunScalarWhereInputSchema),z.lazy(() => FlowRunScalarWhereInputSchema).array() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  isScheduled: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  payload: z.lazy(() => JsonNullableFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  runStatus: z.union([ z.lazy(() => EnumRunStatusFilterSchema),z.lazy(() => RunStatusSchema) ]).optional(),
  scheduledJobId: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  startedBy: z.union([ z.lazy(() => EnumStartedByFilterSchema),z.lazy(() => StartedBySchema) ]).optional(),
  timeEnded: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  timeStarted: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const FlowEventUpsertWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.FlowEventUpsertWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => FlowEventWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FlowEventUpdateWithoutFlowInputSchema),z.lazy(() => FlowEventUncheckedUpdateWithoutFlowInputSchema) ]),
  create: z.union([ z.lazy(() => FlowEventCreateWithoutFlowInputSchema),z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const FlowEventUpdateWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.FlowEventUpdateWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => FlowEventWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FlowEventUpdateWithoutFlowInputSchema),z.lazy(() => FlowEventUncheckedUpdateWithoutFlowInputSchema) ]),
}).strict();

export const FlowEventUpdateManyWithWhereWithoutFlowInputSchema: z.ZodType<Prisma.FlowEventUpdateManyWithWhereWithoutFlowInput> = z.object({
  where: z.lazy(() => FlowEventScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FlowEventUpdateManyMutationInputSchema),z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowInputSchema) ]),
}).strict();

export const FlowEventScalarWhereInputSchema: z.ZodType<Prisma.FlowEventScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => FlowEventScalarWhereInputSchema),z.lazy(() => FlowEventScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowEventScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowEventScalarWhereInputSchema),z.lazy(() => FlowEventScalarWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flowRunId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  nodeId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  payload: z.lazy(() => JsonNullableFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  startedBy: z.union([ z.lazy(() => EnumStartedByFilterSchema),z.lazy(() => StartedBySchema) ]).optional(),
}).strict();

export const InstanceUpsertWithoutFlowsInputSchema: z.ZodType<Prisma.InstanceUpsertWithoutFlowsInput> = z.object({
  update: z.union([ z.lazy(() => InstanceUpdateWithoutFlowsInputSchema),z.lazy(() => InstanceUncheckedUpdateWithoutFlowsInputSchema) ]),
  create: z.union([ z.lazy(() => InstanceCreateWithoutFlowsInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutFlowsInputSchema) ]),
  where: z.lazy(() => InstanceWhereInputSchema).optional()
}).strict();

export const InstanceUpdateToOneWithWhereWithoutFlowsInputSchema: z.ZodType<Prisma.InstanceUpdateToOneWithWhereWithoutFlowsInput> = z.object({
  where: z.lazy(() => InstanceWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => InstanceUpdateWithoutFlowsInputSchema),z.lazy(() => InstanceUncheckedUpdateWithoutFlowsInputSchema) ]),
}).strict();

export const InstanceUpdateWithoutFlowsInputSchema: z.ZodType<Prisma.InstanceUpdateWithoutFlowsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupUpdateManyWithoutInstanceNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneWithoutInstancesNestedInputSchema).optional()
}).strict();

export const InstanceUncheckedUpdateWithoutFlowsInputSchema: z.ZodType<Prisma.InstanceUncheckedUpdateWithoutFlowsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict();

export const NodeUpsertWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.NodeUpsertWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => NodeWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => NodeUpdateWithoutFlowInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutFlowInputSchema) ]),
  create: z.union([ z.lazy(() => NodeCreateWithoutFlowInputSchema),z.lazy(() => NodeUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const NodeUpdateWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.NodeUpdateWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => NodeWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => NodeUpdateWithoutFlowInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutFlowInputSchema) ]),
}).strict();

export const NodeUpdateManyWithWhereWithoutFlowInputSchema: z.ZodType<Prisma.NodeUpdateManyWithWhereWithoutFlowInput> = z.object({
  where: z.lazy(() => NodeScalarWhereInputSchema),
  data: z.union([ z.lazy(() => NodeUpdateManyMutationInputSchema),z.lazy(() => NodeUncheckedUpdateManyWithoutFlowInputSchema) ]),
}).strict();

export const NodeScalarWhereInputSchema: z.ZodType<Prisma.NodeScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => NodeScalarWhereInputSchema),z.lazy(() => NodeScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => NodeScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => NodeScalarWhereInputSchema),z.lazy(() => NodeScalarWhereInputSchema).array() ]).optional(),
  arn: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  infrastructureId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  position: z.lazy(() => JsonNullableFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  rfId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumNodeTypeFilterSchema),z.lazy(() => NodeTypeSchema) ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
}).strict();

export const SecretUpsertWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.SecretUpsertWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => SecretWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => SecretUpdateWithoutFlowInputSchema),z.lazy(() => SecretUncheckedUpdateWithoutFlowInputSchema) ]),
  create: z.union([ z.lazy(() => SecretCreateWithoutFlowInputSchema),z.lazy(() => SecretUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const SecretUpdateWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.SecretUpdateWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => SecretWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => SecretUpdateWithoutFlowInputSchema),z.lazy(() => SecretUncheckedUpdateWithoutFlowInputSchema) ]),
}).strict();

export const SecretUpdateManyWithWhereWithoutFlowInputSchema: z.ZodType<Prisma.SecretUpdateManyWithWhereWithoutFlowInput> = z.object({
  where: z.lazy(() => SecretScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SecretUpdateManyMutationInputSchema),z.lazy(() => SecretUncheckedUpdateManyWithoutFlowInputSchema) ]),
}).strict();

export const SecretScalarWhereInputSchema: z.ZodType<Prisma.SecretScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SecretScalarWhereInputSchema),z.lazy(() => SecretScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SecretScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SecretScalarWhereInputSchema),z.lazy(() => SecretScalarWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  category: z.union([ z.lazy(() => EnumSecretCategoryFilterSchema),z.lazy(() => SecretCategorySchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flowId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  nodeId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  secret: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  shouldEncrypt: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
}).strict();

export const TagUpsertWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.TagUpsertWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => TagWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TagUpdateWithoutFlowInputSchema),z.lazy(() => TagUncheckedUpdateWithoutFlowInputSchema) ]),
  create: z.union([ z.lazy(() => TagCreateWithoutFlowInputSchema),z.lazy(() => TagUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const TagUpdateWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.TagUpdateWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => TagWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TagUpdateWithoutFlowInputSchema),z.lazy(() => TagUncheckedUpdateWithoutFlowInputSchema) ]),
}).strict();

export const TagUpdateManyWithWhereWithoutFlowInputSchema: z.ZodType<Prisma.TagUpdateManyWithWhereWithoutFlowInput> = z.object({
  where: z.lazy(() => TagScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TagUpdateManyMutationInputSchema),z.lazy(() => TagUncheckedUpdateManyWithoutFlowInputSchema) ]),
}).strict();

export const TagScalarWhereInputSchema: z.ZodType<Prisma.TagScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TagScalarWhereInputSchema),z.lazy(() => TagScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagScalarWhereInputSchema),z.lazy(() => TagScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  flowId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  nodeId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tagGroupId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const TestCaseUpsertWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.TestCaseUpsertWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => TestCaseWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TestCaseUpdateWithoutFlowInputSchema),z.lazy(() => TestCaseUncheckedUpdateWithoutFlowInputSchema) ]),
  create: z.union([ z.lazy(() => TestCaseCreateWithoutFlowInputSchema),z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const TestCaseUpdateWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.TestCaseUpdateWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => TestCaseWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TestCaseUpdateWithoutFlowInputSchema),z.lazy(() => TestCaseUncheckedUpdateWithoutFlowInputSchema) ]),
}).strict();

export const TestCaseUpdateManyWithWhereWithoutFlowInputSchema: z.ZodType<Prisma.TestCaseUpdateManyWithWhereWithoutFlowInput> = z.object({
  where: z.lazy(() => TestCaseScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TestCaseUpdateManyMutationInputSchema),z.lazy(() => TestCaseUncheckedUpdateManyWithoutFlowInputSchema) ]),
}).strict();

export const TestCaseScalarWhereInputSchema: z.ZodType<Prisma.TestCaseScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TestCaseScalarWhereInputSchema),z.lazy(() => TestCaseScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TestCaseScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TestCaseScalarWhereInputSchema),z.lazy(() => TestCaseScalarWhereInputSchema).array() ]).optional(),
  color: z.union([ z.lazy(() => EnumMantineColorFilterSchema),z.lazy(() => MantineColorSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
}).strict();

export const AuditLogUpsertWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.AuditLogUpsertWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => AuditLogWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AuditLogUpdateWithoutFlowInputSchema),z.lazy(() => AuditLogUncheckedUpdateWithoutFlowInputSchema) ]),
  create: z.union([ z.lazy(() => AuditLogCreateWithoutFlowInputSchema),z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputSchema) ]),
}).strict();

export const AuditLogUpdateWithWhereUniqueWithoutFlowInputSchema: z.ZodType<Prisma.AuditLogUpdateWithWhereUniqueWithoutFlowInput> = z.object({
  where: z.lazy(() => AuditLogWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AuditLogUpdateWithoutFlowInputSchema),z.lazy(() => AuditLogUncheckedUpdateWithoutFlowInputSchema) ]),
}).strict();

export const AuditLogUpdateManyWithWhereWithoutFlowInputSchema: z.ZodType<Prisma.AuditLogUpdateManyWithWhereWithoutFlowInput> = z.object({
  where: z.lazy(() => AuditLogScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AuditLogUpdateManyMutationInputSchema),z.lazy(() => AuditLogUncheckedUpdateManyWithoutFlowInputSchema) ]),
}).strict();

export const AuditLogScalarWhereInputSchema: z.ZodType<Prisma.AuditLogScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AuditLogScalarWhereInputSchema),z.lazy(() => AuditLogScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AuditLogScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AuditLogScalarWhereInputSchema),z.lazy(() => AuditLogScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  entityType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  entityId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  flowId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  changeType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  before: z.lazy(() => JsonNullableFilterSchema).optional(),
  after: z.lazy(() => JsonNullableFilterSchema).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const FlowStatisticsUpsertWithoutFlowInputSchema: z.ZodType<Prisma.FlowStatisticsUpsertWithoutFlowInput> = z.object({
  update: z.union([ z.lazy(() => FlowStatisticsUpdateWithoutFlowInputSchema),z.lazy(() => FlowStatisticsUncheckedUpdateWithoutFlowInputSchema) ]),
  create: z.union([ z.lazy(() => FlowStatisticsCreateWithoutFlowInputSchema),z.lazy(() => FlowStatisticsUncheckedCreateWithoutFlowInputSchema) ]),
  where: z.lazy(() => FlowStatisticsWhereInputSchema).optional()
}).strict();

export const FlowStatisticsUpdateToOneWithWhereWithoutFlowInputSchema: z.ZodType<Prisma.FlowStatisticsUpdateToOneWithWhereWithoutFlowInput> = z.object({
  where: z.lazy(() => FlowStatisticsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => FlowStatisticsUpdateWithoutFlowInputSchema),z.lazy(() => FlowStatisticsUncheckedUpdateWithoutFlowInputSchema) ]),
}).strict();

export const FlowStatisticsUpdateWithoutFlowInputSchema: z.ZodType<Prisma.FlowStatisticsUpdateWithoutFlowInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  totalRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  successfulRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  failedRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastUpdated: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowStatisticsUncheckedUpdateWithoutFlowInputSchema: z.ZodType<Prisma.FlowStatisticsUncheckedUpdateWithoutFlowInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  totalRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  successfulRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  failedRuns: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lastUpdated: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowRunCreateWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowRunCreateWithoutFlowEventsInput> = z.object({
  isScheduled: z.boolean().optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.lazy(() => RunStatusSchema),
  startedBy: z.lazy(() => StartedBySchema),
  timeEnded: z.coerce.date().optional().nullable(),
  timeStarted: z.coerce.date().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutFlowRunsInputSchema),
  scheduledJob: z.lazy(() => ScheduledJobCreateNestedOneWithoutFlowRunsInputSchema).optional()
}).strict();

export const FlowRunUncheckedCreateWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowRunUncheckedCreateWithoutFlowEventsInput> = z.object({
  flowId: z.string(),
  id: z.number().int().optional(),
  isScheduled: z.boolean().optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.lazy(() => RunStatusSchema),
  scheduledJobId: z.number().int().optional().nullable(),
  startedBy: z.lazy(() => StartedBySchema),
  timeEnded: z.coerce.date().optional().nullable(),
  timeStarted: z.coerce.date().optional()
}).strict();

export const FlowRunCreateOrConnectWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowRunCreateOrConnectWithoutFlowEventsInput> = z.object({
  where: z.lazy(() => FlowRunWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowRunCreateWithoutFlowEventsInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutFlowEventsInputSchema) ]),
}).strict();

export const FlowCreateWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowCreateWithoutFlowEventsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunCreateNestedManyWithoutFlowInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutFlowsInputSchema),
  nodes: z.lazy(() => NodeCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowUncheckedCreateWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowUncheckedCreateWithoutFlowEventsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowCreateOrConnectWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowCreateOrConnectWithoutFlowEventsInput> = z.object({
  where: z.lazy(() => FlowWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowCreateWithoutFlowEventsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutFlowEventsInputSchema) ]),
}).strict();

export const FlowRunUpsertWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowRunUpsertWithoutFlowEventsInput> = z.object({
  update: z.union([ z.lazy(() => FlowRunUpdateWithoutFlowEventsInputSchema),z.lazy(() => FlowRunUncheckedUpdateWithoutFlowEventsInputSchema) ]),
  create: z.union([ z.lazy(() => FlowRunCreateWithoutFlowEventsInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutFlowEventsInputSchema) ]),
  where: z.lazy(() => FlowRunWhereInputSchema).optional()
}).strict();

export const FlowRunUpdateToOneWithWhereWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowRunUpdateToOneWithWhereWithoutFlowEventsInput> = z.object({
  where: z.lazy(() => FlowRunWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => FlowRunUpdateWithoutFlowEventsInputSchema),z.lazy(() => FlowRunUncheckedUpdateWithoutFlowEventsInputSchema) ]),
}).strict();

export const FlowRunUpdateWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowRunUpdateWithoutFlowEventsInput> = z.object({
  isScheduled: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => EnumRunStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  timeEnded: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeStarted: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutFlowRunsNestedInputSchema).optional(),
  scheduledJob: z.lazy(() => ScheduledJobUpdateOneWithoutFlowRunsNestedInputSchema).optional()
}).strict();

export const FlowRunUncheckedUpdateWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowRunUncheckedUpdateWithoutFlowEventsInput> = z.object({
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isScheduled: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => EnumRunStatusFieldUpdateOperationsInputSchema) ]).optional(),
  scheduledJobId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  timeEnded: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeStarted: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowUpsertWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowUpsertWithoutFlowEventsInput> = z.object({
  update: z.union([ z.lazy(() => FlowUpdateWithoutFlowEventsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutFlowEventsInputSchema) ]),
  create: z.union([ z.lazy(() => FlowCreateWithoutFlowEventsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutFlowEventsInputSchema) ]),
  where: z.lazy(() => FlowWhereInputSchema).optional()
}).strict();

export const FlowUpdateToOneWithWhereWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowUpdateToOneWithWhereWithoutFlowEventsInput> = z.object({
  where: z.lazy(() => FlowWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => FlowUpdateWithoutFlowEventsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutFlowEventsInputSchema) ]),
}).strict();

export const FlowUpdateWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowUpdateWithoutFlowEventsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUpdateManyWithoutFlowNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutFlowsNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowUncheckedUpdateWithoutFlowEventsInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateWithoutFlowEventsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowCreateWithoutFlowRunsInputSchema: z.ZodType<Prisma.FlowCreateWithoutFlowRunsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutFlowsInputSchema),
  nodes: z.lazy(() => NodeCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowUncheckedCreateWithoutFlowRunsInputSchema: z.ZodType<Prisma.FlowUncheckedCreateWithoutFlowRunsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowCreateOrConnectWithoutFlowRunsInputSchema: z.ZodType<Prisma.FlowCreateOrConnectWithoutFlowRunsInput> = z.object({
  where: z.lazy(() => FlowWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowCreateWithoutFlowRunsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutFlowRunsInputSchema) ]),
}).strict();

export const FlowEventCreateWithoutFlowRunInputSchema: z.ZodType<Prisma.FlowEventCreateWithoutFlowRunInput> = z.object({
  createdAt: z.coerce.date().optional(),
  nodeId: z.string(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.lazy(() => StartedBySchema),
  flow: z.lazy(() => FlowCreateNestedOneWithoutFlowEventsInputSchema)
}).strict();

export const FlowEventUncheckedCreateWithoutFlowRunInputSchema: z.ZodType<Prisma.FlowEventUncheckedCreateWithoutFlowRunInput> = z.object({
  createdAt: z.coerce.date().optional(),
  flowId: z.string(),
  id: z.number().int().optional(),
  nodeId: z.string(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.lazy(() => StartedBySchema)
}).strict();

export const FlowEventCreateOrConnectWithoutFlowRunInputSchema: z.ZodType<Prisma.FlowEventCreateOrConnectWithoutFlowRunInput> = z.object({
  where: z.lazy(() => FlowEventWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowEventCreateWithoutFlowRunInputSchema),z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputSchema) ]),
}).strict();

export const FlowEventCreateManyFlowRunInputEnvelopeSchema: z.ZodType<Prisma.FlowEventCreateManyFlowRunInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => FlowEventCreateManyFlowRunInputSchema),z.lazy(() => FlowEventCreateManyFlowRunInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ScheduledJobCreateWithoutFlowRunsInputSchema: z.ZodType<Prisma.ScheduledJobCreateWithoutFlowRunsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  createdBy: z.string(),
  endpoint: z.string(),
  frequency: z.string(),
  name: z.string(),
  deleted: z.boolean().optional()
}).strict();

export const ScheduledJobUncheckedCreateWithoutFlowRunsInputSchema: z.ZodType<Prisma.ScheduledJobUncheckedCreateWithoutFlowRunsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  createdBy: z.string(),
  endpoint: z.string(),
  frequency: z.string(),
  id: z.number().int().optional(),
  name: z.string(),
  deleted: z.boolean().optional()
}).strict();

export const ScheduledJobCreateOrConnectWithoutFlowRunsInputSchema: z.ZodType<Prisma.ScheduledJobCreateOrConnectWithoutFlowRunsInput> = z.object({
  where: z.lazy(() => ScheduledJobWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ScheduledJobCreateWithoutFlowRunsInputSchema),z.lazy(() => ScheduledJobUncheckedCreateWithoutFlowRunsInputSchema) ]),
}).strict();

export const FlowUpsertWithoutFlowRunsInputSchema: z.ZodType<Prisma.FlowUpsertWithoutFlowRunsInput> = z.object({
  update: z.union([ z.lazy(() => FlowUpdateWithoutFlowRunsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutFlowRunsInputSchema) ]),
  create: z.union([ z.lazy(() => FlowCreateWithoutFlowRunsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutFlowRunsInputSchema) ]),
  where: z.lazy(() => FlowWhereInputSchema).optional()
}).strict();

export const FlowUpdateToOneWithWhereWithoutFlowRunsInputSchema: z.ZodType<Prisma.FlowUpdateToOneWithWhereWithoutFlowRunsInput> = z.object({
  where: z.lazy(() => FlowWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => FlowUpdateWithoutFlowRunsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutFlowRunsInputSchema) ]),
}).strict();

export const FlowUpdateWithoutFlowRunsInputSchema: z.ZodType<Prisma.FlowUpdateWithoutFlowRunsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutFlowsNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowUncheckedUpdateWithoutFlowRunsInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateWithoutFlowRunsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowEventUpsertWithWhereUniqueWithoutFlowRunInputSchema: z.ZodType<Prisma.FlowEventUpsertWithWhereUniqueWithoutFlowRunInput> = z.object({
  where: z.lazy(() => FlowEventWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FlowEventUpdateWithoutFlowRunInputSchema),z.lazy(() => FlowEventUncheckedUpdateWithoutFlowRunInputSchema) ]),
  create: z.union([ z.lazy(() => FlowEventCreateWithoutFlowRunInputSchema),z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputSchema) ]),
}).strict();

export const FlowEventUpdateWithWhereUniqueWithoutFlowRunInputSchema: z.ZodType<Prisma.FlowEventUpdateWithWhereUniqueWithoutFlowRunInput> = z.object({
  where: z.lazy(() => FlowEventWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FlowEventUpdateWithoutFlowRunInputSchema),z.lazy(() => FlowEventUncheckedUpdateWithoutFlowRunInputSchema) ]),
}).strict();

export const FlowEventUpdateManyWithWhereWithoutFlowRunInputSchema: z.ZodType<Prisma.FlowEventUpdateManyWithWhereWithoutFlowRunInput> = z.object({
  where: z.lazy(() => FlowEventScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FlowEventUpdateManyMutationInputSchema),z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowRunInputSchema) ]),
}).strict();

export const ScheduledJobUpsertWithoutFlowRunsInputSchema: z.ZodType<Prisma.ScheduledJobUpsertWithoutFlowRunsInput> = z.object({
  update: z.union([ z.lazy(() => ScheduledJobUpdateWithoutFlowRunsInputSchema),z.lazy(() => ScheduledJobUncheckedUpdateWithoutFlowRunsInputSchema) ]),
  create: z.union([ z.lazy(() => ScheduledJobCreateWithoutFlowRunsInputSchema),z.lazy(() => ScheduledJobUncheckedCreateWithoutFlowRunsInputSchema) ]),
  where: z.lazy(() => ScheduledJobWhereInputSchema).optional()
}).strict();

export const ScheduledJobUpdateToOneWithWhereWithoutFlowRunsInputSchema: z.ZodType<Prisma.ScheduledJobUpdateToOneWithWhereWithoutFlowRunsInput> = z.object({
  where: z.lazy(() => ScheduledJobWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ScheduledJobUpdateWithoutFlowRunsInputSchema),z.lazy(() => ScheduledJobUncheckedUpdateWithoutFlowRunsInputSchema) ]),
}).strict();

export const ScheduledJobUpdateWithoutFlowRunsInputSchema: z.ZodType<Prisma.ScheduledJobUpdateWithoutFlowRunsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdBy: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  frequency: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ScheduledJobUncheckedUpdateWithoutFlowRunsInputSchema: z.ZodType<Prisma.ScheduledJobUncheckedUpdateWithoutFlowRunsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdBy: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  frequency: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const NodeCreateWithoutInfrastructureInputSchema: z.ZodType<Prisma.NodeCreateWithoutInfrastructureInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutNodesInputSchema),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutNodeInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeCreateNestedManyWithoutSourceNodeInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeCreateNestedManyWithoutTargetNodeInputSchema).optional(),
  Tag: z.lazy(() => TagCreateNestedManyWithoutNodeInputSchema).optional()
}).strict();

export const NodeUncheckedCreateWithoutInfrastructureInputSchema: z.ZodType<Prisma.NodeUncheckedCreateWithoutInfrastructureInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  flowId: z.string(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutNodeInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutSourceNodeInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutTargetNodeInputSchema).optional(),
  Tag: z.lazy(() => TagUncheckedCreateNestedManyWithoutNodeInputSchema).optional()
}).strict();

export const NodeCreateOrConnectWithoutInfrastructureInputSchema: z.ZodType<Prisma.NodeCreateOrConnectWithoutInfrastructureInput> = z.object({
  where: z.lazy(() => NodeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => NodeCreateWithoutInfrastructureInputSchema),z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputSchema) ]),
}).strict();

export const NodeCreateManyInfrastructureInputEnvelopeSchema: z.ZodType<Prisma.NodeCreateManyInfrastructureInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => NodeCreateManyInfrastructureInputSchema),z.lazy(() => NodeCreateManyInfrastructureInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const NodeUpsertWithWhereUniqueWithoutInfrastructureInputSchema: z.ZodType<Prisma.NodeUpsertWithWhereUniqueWithoutInfrastructureInput> = z.object({
  where: z.lazy(() => NodeWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => NodeUpdateWithoutInfrastructureInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutInfrastructureInputSchema) ]),
  create: z.union([ z.lazy(() => NodeCreateWithoutInfrastructureInputSchema),z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputSchema) ]),
}).strict();

export const NodeUpdateWithWhereUniqueWithoutInfrastructureInputSchema: z.ZodType<Prisma.NodeUpdateWithWhereUniqueWithoutInfrastructureInput> = z.object({
  where: z.lazy(() => NodeWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => NodeUpdateWithoutInfrastructureInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutInfrastructureInputSchema) ]),
}).strict();

export const NodeUpdateManyWithWhereWithoutInfrastructureInputSchema: z.ZodType<Prisma.NodeUpdateManyWithWhereWithoutInfrastructureInput> = z.object({
  where: z.lazy(() => NodeScalarWhereInputSchema),
  data: z.union([ z.lazy(() => NodeUpdateManyMutationInputSchema),z.lazy(() => NodeUncheckedUpdateManyWithoutInfrastructureInputSchema) ]),
}).strict();

export const FlowCreateWithoutInstanceInputSchema: z.ZodType<Prisma.FlowCreateWithoutInstanceInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowInputSchema).optional(),
  nodes: z.lazy(() => NodeCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowUncheckedCreateWithoutInstanceInputSchema: z.ZodType<Prisma.FlowUncheckedCreateWithoutInstanceInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowCreateOrConnectWithoutInstanceInputSchema: z.ZodType<Prisma.FlowCreateOrConnectWithoutInstanceInput> = z.object({
  where: z.lazy(() => FlowWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowCreateWithoutInstanceInputSchema),z.lazy(() => FlowUncheckedCreateWithoutInstanceInputSchema) ]),
}).strict();

export const FlowCreateManyInstanceInputEnvelopeSchema: z.ZodType<Prisma.FlowCreateManyInstanceInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => FlowCreateManyInstanceInputSchema),z.lazy(() => FlowCreateManyInstanceInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const TagCreateWithoutInstanceInputSchema: z.ZodType<Prisma.TagCreateWithoutInstanceInput> = z.object({
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutTagsInputSchema).optional(),
  node: z.lazy(() => NodeCreateNestedOneWithoutTagInputSchema).optional(),
  tagGroup: z.lazy(() => TagGroupCreateNestedOneWithoutTagsInputSchema).optional()
}).strict();

export const TagUncheckedCreateWithoutInstanceInputSchema: z.ZodType<Prisma.TagUncheckedCreateWithoutInstanceInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.string().optional().nullable(),
  nodeId: z.string().optional().nullable(),
  tagGroupId: z.string().optional().nullable()
}).strict();

export const TagCreateOrConnectWithoutInstanceInputSchema: z.ZodType<Prisma.TagCreateOrConnectWithoutInstanceInput> = z.object({
  where: z.lazy(() => TagWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TagCreateWithoutInstanceInputSchema),z.lazy(() => TagUncheckedCreateWithoutInstanceInputSchema) ]),
}).strict();

export const TagCreateManyInstanceInputEnvelopeSchema: z.ZodType<Prisma.TagCreateManyInstanceInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => TagCreateManyInstanceInputSchema),z.lazy(() => TagCreateManyInstanceInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const TagGroupCreateWithoutInstanceInputSchema: z.ZodType<Prisma.TagGroupCreateWithoutInstanceInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  color: z.string(),
  deleted: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutTagGroupInputSchema).optional()
}).strict();

export const TagGroupUncheckedCreateWithoutInstanceInputSchema: z.ZodType<Prisma.TagGroupUncheckedCreateWithoutInstanceInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  color: z.string(),
  deleted: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutTagGroupInputSchema).optional()
}).strict();

export const TagGroupCreateOrConnectWithoutInstanceInputSchema: z.ZodType<Prisma.TagGroupCreateOrConnectWithoutInstanceInput> = z.object({
  where: z.lazy(() => TagGroupWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TagGroupCreateWithoutInstanceInputSchema),z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputSchema) ]),
}).strict();

export const TagGroupCreateManyInstanceInputEnvelopeSchema: z.ZodType<Prisma.TagGroupCreateManyInstanceInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => TagGroupCreateManyInstanceInputSchema),z.lazy(() => TagGroupCreateManyInstanceInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserCreateWithoutInstancesInputSchema: z.ZodType<Prisma.UserCreateWithoutInstancesInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutInstancesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutInstancesInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutInstancesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutInstancesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutInstancesInputSchema),z.lazy(() => UserUncheckedCreateWithoutInstancesInputSchema) ]),
}).strict();

export const FlowUpsertWithWhereUniqueWithoutInstanceInputSchema: z.ZodType<Prisma.FlowUpsertWithWhereUniqueWithoutInstanceInput> = z.object({
  where: z.lazy(() => FlowWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FlowUpdateWithoutInstanceInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutInstanceInputSchema) ]),
  create: z.union([ z.lazy(() => FlowCreateWithoutInstanceInputSchema),z.lazy(() => FlowUncheckedCreateWithoutInstanceInputSchema) ]),
}).strict();

export const FlowUpdateWithWhereUniqueWithoutInstanceInputSchema: z.ZodType<Prisma.FlowUpdateWithWhereUniqueWithoutInstanceInput> = z.object({
  where: z.lazy(() => FlowWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FlowUpdateWithoutInstanceInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutInstanceInputSchema) ]),
}).strict();

export const FlowUpdateManyWithWhereWithoutInstanceInputSchema: z.ZodType<Prisma.FlowUpdateManyWithWhereWithoutInstanceInput> = z.object({
  where: z.lazy(() => FlowScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FlowUpdateManyMutationInputSchema),z.lazy(() => FlowUncheckedUpdateManyWithoutInstanceInputSchema) ]),
}).strict();

export const FlowScalarWhereInputSchema: z.ZodType<Prisma.FlowScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => FlowScalarWhereInputSchema),z.lazy(() => FlowScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FlowScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FlowScalarWhereInputSchema),z.lazy(() => FlowScalarWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isEnabled: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  method: z.union([ z.lazy(() => EnumFlowMethodFilterSchema),z.lazy(() => FlowMethodSchema) ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  viewport: z.lazy(() => JsonNullableFilterSchema).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
}).strict();

export const TagUpsertWithWhereUniqueWithoutInstanceInputSchema: z.ZodType<Prisma.TagUpsertWithWhereUniqueWithoutInstanceInput> = z.object({
  where: z.lazy(() => TagWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TagUpdateWithoutInstanceInputSchema),z.lazy(() => TagUncheckedUpdateWithoutInstanceInputSchema) ]),
  create: z.union([ z.lazy(() => TagCreateWithoutInstanceInputSchema),z.lazy(() => TagUncheckedCreateWithoutInstanceInputSchema) ]),
}).strict();

export const TagUpdateWithWhereUniqueWithoutInstanceInputSchema: z.ZodType<Prisma.TagUpdateWithWhereUniqueWithoutInstanceInput> = z.object({
  where: z.lazy(() => TagWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TagUpdateWithoutInstanceInputSchema),z.lazy(() => TagUncheckedUpdateWithoutInstanceInputSchema) ]),
}).strict();

export const TagUpdateManyWithWhereWithoutInstanceInputSchema: z.ZodType<Prisma.TagUpdateManyWithWhereWithoutInstanceInput> = z.object({
  where: z.lazy(() => TagScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TagUpdateManyMutationInputSchema),z.lazy(() => TagUncheckedUpdateManyWithoutInstanceInputSchema) ]),
}).strict();

export const TagGroupUpsertWithWhereUniqueWithoutInstanceInputSchema: z.ZodType<Prisma.TagGroupUpsertWithWhereUniqueWithoutInstanceInput> = z.object({
  where: z.lazy(() => TagGroupWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TagGroupUpdateWithoutInstanceInputSchema),z.lazy(() => TagGroupUncheckedUpdateWithoutInstanceInputSchema) ]),
  create: z.union([ z.lazy(() => TagGroupCreateWithoutInstanceInputSchema),z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputSchema) ]),
}).strict();

export const TagGroupUpdateWithWhereUniqueWithoutInstanceInputSchema: z.ZodType<Prisma.TagGroupUpdateWithWhereUniqueWithoutInstanceInput> = z.object({
  where: z.lazy(() => TagGroupWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TagGroupUpdateWithoutInstanceInputSchema),z.lazy(() => TagGroupUncheckedUpdateWithoutInstanceInputSchema) ]),
}).strict();

export const TagGroupUpdateManyWithWhereWithoutInstanceInputSchema: z.ZodType<Prisma.TagGroupUpdateManyWithWhereWithoutInstanceInput> = z.object({
  where: z.lazy(() => TagGroupScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TagGroupUpdateManyMutationInputSchema),z.lazy(() => TagGroupUncheckedUpdateManyWithoutInstanceInputSchema) ]),
}).strict();

export const TagGroupScalarWhereInputSchema: z.ZodType<Prisma.TagGroupScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TagGroupScalarWhereInputSchema),z.lazy(() => TagGroupScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagGroupScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagGroupScalarWhereInputSchema),z.lazy(() => TagGroupScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  deleted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  instanceId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const UserUpsertWithoutInstancesInputSchema: z.ZodType<Prisma.UserUpsertWithoutInstancesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutInstancesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInstancesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutInstancesInputSchema),z.lazy(() => UserUncheckedCreateWithoutInstancesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutInstancesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutInstancesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutInstancesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInstancesInputSchema) ]),
}).strict();

export const UserUpdateWithoutInstancesInputSchema: z.ZodType<Prisma.UserUpdateWithoutInstancesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutInstancesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutInstancesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const FlowCreateWithoutNodesInputSchema: z.ZodType<Prisma.FlowCreateWithoutNodesInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutFlowsInputSchema),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowUncheckedCreateWithoutNodesInputSchema: z.ZodType<Prisma.FlowUncheckedCreateWithoutNodesInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowCreateOrConnectWithoutNodesInputSchema: z.ZodType<Prisma.FlowCreateOrConnectWithoutNodesInput> = z.object({
  where: z.lazy(() => FlowWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowCreateWithoutNodesInputSchema),z.lazy(() => FlowUncheckedCreateWithoutNodesInputSchema) ]),
}).strict();

export const InfrastructureCreateWithoutNodesInputSchema: z.ZodType<Prisma.InfrastructureCreateWithoutNodesInput> = z.object({
  arn: z.string().optional().nullable(),
  canControl: z.boolean(),
  createdAt: z.coerce.date().optional(),
  data: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  type: z.lazy(() => InfraTypeSchema),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const InfrastructureUncheckedCreateWithoutNodesInputSchema: z.ZodType<Prisma.InfrastructureUncheckedCreateWithoutNodesInput> = z.object({
  arn: z.string().optional().nullable(),
  canControl: z.boolean(),
  createdAt: z.coerce.date().optional(),
  data: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  type: z.lazy(() => InfraTypeSchema),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const InfrastructureCreateOrConnectWithoutNodesInputSchema: z.ZodType<Prisma.InfrastructureCreateOrConnectWithoutNodesInput> = z.object({
  where: z.lazy(() => InfrastructureWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => InfrastructureCreateWithoutNodesInputSchema),z.lazy(() => InfrastructureUncheckedCreateWithoutNodesInputSchema) ]),
}).strict();

export const SecretCreateWithoutNodeInputSchema: z.ZodType<Prisma.SecretCreateWithoutNodeInput> = z.object({
  name: z.string(),
  category: z.lazy(() => SecretCategorySchema),
  createdAt: z.coerce.date().optional(),
  secret: z.string(),
  shouldEncrypt: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutSecretsInputSchema).optional()
}).strict();

export const SecretUncheckedCreateWithoutNodeInputSchema: z.ZodType<Prisma.SecretUncheckedCreateWithoutNodeInput> = z.object({
  name: z.string(),
  category: z.lazy(() => SecretCategorySchema),
  createdAt: z.coerce.date().optional(),
  flowId: z.string().optional().nullable(),
  id: z.number().int().optional(),
  secret: z.string(),
  shouldEncrypt: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const SecretCreateOrConnectWithoutNodeInputSchema: z.ZodType<Prisma.SecretCreateOrConnectWithoutNodeInput> = z.object({
  where: z.lazy(() => SecretWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SecretCreateWithoutNodeInputSchema),z.lazy(() => SecretUncheckedCreateWithoutNodeInputSchema) ]),
}).strict();

export const SecretCreateManyNodeInputEnvelopeSchema: z.ZodType<Prisma.SecretCreateManyNodeInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SecretCreateManyNodeInputSchema),z.lazy(() => SecretCreateManyNodeInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const EdgeCreateWithoutSourceNodeInputSchema: z.ZodType<Prisma.EdgeCreateWithoutSourceNodeInput> = z.object({
  id: z.string().cuid().optional(),
  rfId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  type: z.lazy(() => EdgeTypeSchema).optional(),
  normalizedKey: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutEdgesInputSchema),
  targetNode: z.lazy(() => NodeCreateNestedOneWithoutTargetEdgesInputSchema)
}).strict();

export const EdgeUncheckedCreateWithoutSourceNodeInputSchema: z.ZodType<Prisma.EdgeUncheckedCreateWithoutSourceNodeInput> = z.object({
  id: z.string().cuid().optional(),
  targetNodeId: z.string(),
  flowId: z.string(),
  rfId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  type: z.lazy(() => EdgeTypeSchema).optional(),
  normalizedKey: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const EdgeCreateOrConnectWithoutSourceNodeInputSchema: z.ZodType<Prisma.EdgeCreateOrConnectWithoutSourceNodeInput> = z.object({
  where: z.lazy(() => EdgeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EdgeCreateWithoutSourceNodeInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputSchema) ]),
}).strict();

export const EdgeCreateManySourceNodeInputEnvelopeSchema: z.ZodType<Prisma.EdgeCreateManySourceNodeInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => EdgeCreateManySourceNodeInputSchema),z.lazy(() => EdgeCreateManySourceNodeInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const EdgeCreateWithoutTargetNodeInputSchema: z.ZodType<Prisma.EdgeCreateWithoutTargetNodeInput> = z.object({
  id: z.string().cuid().optional(),
  rfId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  type: z.lazy(() => EdgeTypeSchema).optional(),
  normalizedKey: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutEdgesInputSchema),
  sourceNode: z.lazy(() => NodeCreateNestedOneWithoutSourceEdgesInputSchema)
}).strict();

export const EdgeUncheckedCreateWithoutTargetNodeInputSchema: z.ZodType<Prisma.EdgeUncheckedCreateWithoutTargetNodeInput> = z.object({
  id: z.string().cuid().optional(),
  sourceNodeId: z.string(),
  flowId: z.string(),
  rfId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  type: z.lazy(() => EdgeTypeSchema).optional(),
  normalizedKey: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const EdgeCreateOrConnectWithoutTargetNodeInputSchema: z.ZodType<Prisma.EdgeCreateOrConnectWithoutTargetNodeInput> = z.object({
  where: z.lazy(() => EdgeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EdgeCreateWithoutTargetNodeInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputSchema) ]),
}).strict();

export const EdgeCreateManyTargetNodeInputEnvelopeSchema: z.ZodType<Prisma.EdgeCreateManyTargetNodeInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => EdgeCreateManyTargetNodeInputSchema),z.lazy(() => EdgeCreateManyTargetNodeInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const TagCreateWithoutNodeInputSchema: z.ZodType<Prisma.TagCreateWithoutNodeInput> = z.object({
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutTagsInputSchema).optional(),
  tagGroup: z.lazy(() => TagGroupCreateNestedOneWithoutTagsInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutTagsInputSchema)
}).strict();

export const TagUncheckedCreateWithoutNodeInputSchema: z.ZodType<Prisma.TagUncheckedCreateWithoutNodeInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.string().optional().nullable(),
  tagGroupId: z.string().optional().nullable(),
  instanceId: z.string()
}).strict();

export const TagCreateOrConnectWithoutNodeInputSchema: z.ZodType<Prisma.TagCreateOrConnectWithoutNodeInput> = z.object({
  where: z.lazy(() => TagWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TagCreateWithoutNodeInputSchema),z.lazy(() => TagUncheckedCreateWithoutNodeInputSchema) ]),
}).strict();

export const TagCreateManyNodeInputEnvelopeSchema: z.ZodType<Prisma.TagCreateManyNodeInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => TagCreateManyNodeInputSchema),z.lazy(() => TagCreateManyNodeInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const FlowUpsertWithoutNodesInputSchema: z.ZodType<Prisma.FlowUpsertWithoutNodesInput> = z.object({
  update: z.union([ z.lazy(() => FlowUpdateWithoutNodesInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutNodesInputSchema) ]),
  create: z.union([ z.lazy(() => FlowCreateWithoutNodesInputSchema),z.lazy(() => FlowUncheckedCreateWithoutNodesInputSchema) ]),
  where: z.lazy(() => FlowWhereInputSchema).optional()
}).strict();

export const FlowUpdateToOneWithWhereWithoutNodesInputSchema: z.ZodType<Prisma.FlowUpdateToOneWithWhereWithoutNodesInput> = z.object({
  where: z.lazy(() => FlowWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => FlowUpdateWithoutNodesInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutNodesInputSchema) ]),
}).strict();

export const FlowUpdateWithoutNodesInputSchema: z.ZodType<Prisma.FlowUpdateWithoutNodesInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutFlowsNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowUncheckedUpdateWithoutNodesInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateWithoutNodesInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const InfrastructureUpsertWithoutNodesInputSchema: z.ZodType<Prisma.InfrastructureUpsertWithoutNodesInput> = z.object({
  update: z.union([ z.lazy(() => InfrastructureUpdateWithoutNodesInputSchema),z.lazy(() => InfrastructureUncheckedUpdateWithoutNodesInputSchema) ]),
  create: z.union([ z.lazy(() => InfrastructureCreateWithoutNodesInputSchema),z.lazy(() => InfrastructureUncheckedCreateWithoutNodesInputSchema) ]),
  where: z.lazy(() => InfrastructureWhereInputSchema).optional()
}).strict();

export const InfrastructureUpdateToOneWithWhereWithoutNodesInputSchema: z.ZodType<Prisma.InfrastructureUpdateToOneWithWhereWithoutNodesInput> = z.object({
  where: z.lazy(() => InfrastructureWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => InfrastructureUpdateWithoutNodesInputSchema),z.lazy(() => InfrastructureUncheckedUpdateWithoutNodesInputSchema) ]),
}).strict();

export const InfrastructureUpdateWithoutNodesInputSchema: z.ZodType<Prisma.InfrastructureUpdateWithoutNodesInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  canControl: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  data: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => InfraTypeSchema),z.lazy(() => EnumInfraTypeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InfrastructureUncheckedUpdateWithoutNodesInputSchema: z.ZodType<Prisma.InfrastructureUncheckedUpdateWithoutNodesInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  canControl: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  data: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => InfraTypeSchema),z.lazy(() => EnumInfraTypeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SecretUpsertWithWhereUniqueWithoutNodeInputSchema: z.ZodType<Prisma.SecretUpsertWithWhereUniqueWithoutNodeInput> = z.object({
  where: z.lazy(() => SecretWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => SecretUpdateWithoutNodeInputSchema),z.lazy(() => SecretUncheckedUpdateWithoutNodeInputSchema) ]),
  create: z.union([ z.lazy(() => SecretCreateWithoutNodeInputSchema),z.lazy(() => SecretUncheckedCreateWithoutNodeInputSchema) ]),
}).strict();

export const SecretUpdateWithWhereUniqueWithoutNodeInputSchema: z.ZodType<Prisma.SecretUpdateWithWhereUniqueWithoutNodeInput> = z.object({
  where: z.lazy(() => SecretWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => SecretUpdateWithoutNodeInputSchema),z.lazy(() => SecretUncheckedUpdateWithoutNodeInputSchema) ]),
}).strict();

export const SecretUpdateManyWithWhereWithoutNodeInputSchema: z.ZodType<Prisma.SecretUpdateManyWithWhereWithoutNodeInput> = z.object({
  where: z.lazy(() => SecretScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SecretUpdateManyMutationInputSchema),z.lazy(() => SecretUncheckedUpdateManyWithoutNodeInputSchema) ]),
}).strict();

export const EdgeUpsertWithWhereUniqueWithoutSourceNodeInputSchema: z.ZodType<Prisma.EdgeUpsertWithWhereUniqueWithoutSourceNodeInput> = z.object({
  where: z.lazy(() => EdgeWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EdgeUpdateWithoutSourceNodeInputSchema),z.lazy(() => EdgeUncheckedUpdateWithoutSourceNodeInputSchema) ]),
  create: z.union([ z.lazy(() => EdgeCreateWithoutSourceNodeInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputSchema) ]),
}).strict();

export const EdgeUpdateWithWhereUniqueWithoutSourceNodeInputSchema: z.ZodType<Prisma.EdgeUpdateWithWhereUniqueWithoutSourceNodeInput> = z.object({
  where: z.lazy(() => EdgeWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EdgeUpdateWithoutSourceNodeInputSchema),z.lazy(() => EdgeUncheckedUpdateWithoutSourceNodeInputSchema) ]),
}).strict();

export const EdgeUpdateManyWithWhereWithoutSourceNodeInputSchema: z.ZodType<Prisma.EdgeUpdateManyWithWhereWithoutSourceNodeInput> = z.object({
  where: z.lazy(() => EdgeScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EdgeUpdateManyMutationInputSchema),z.lazy(() => EdgeUncheckedUpdateManyWithoutSourceNodeInputSchema) ]),
}).strict();

export const EdgeUpsertWithWhereUniqueWithoutTargetNodeInputSchema: z.ZodType<Prisma.EdgeUpsertWithWhereUniqueWithoutTargetNodeInput> = z.object({
  where: z.lazy(() => EdgeWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EdgeUpdateWithoutTargetNodeInputSchema),z.lazy(() => EdgeUncheckedUpdateWithoutTargetNodeInputSchema) ]),
  create: z.union([ z.lazy(() => EdgeCreateWithoutTargetNodeInputSchema),z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputSchema) ]),
}).strict();

export const EdgeUpdateWithWhereUniqueWithoutTargetNodeInputSchema: z.ZodType<Prisma.EdgeUpdateWithWhereUniqueWithoutTargetNodeInput> = z.object({
  where: z.lazy(() => EdgeWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EdgeUpdateWithoutTargetNodeInputSchema),z.lazy(() => EdgeUncheckedUpdateWithoutTargetNodeInputSchema) ]),
}).strict();

export const EdgeUpdateManyWithWhereWithoutTargetNodeInputSchema: z.ZodType<Prisma.EdgeUpdateManyWithWhereWithoutTargetNodeInput> = z.object({
  where: z.lazy(() => EdgeScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EdgeUpdateManyMutationInputSchema),z.lazy(() => EdgeUncheckedUpdateManyWithoutTargetNodeInputSchema) ]),
}).strict();

export const TagUpsertWithWhereUniqueWithoutNodeInputSchema: z.ZodType<Prisma.TagUpsertWithWhereUniqueWithoutNodeInput> = z.object({
  where: z.lazy(() => TagWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TagUpdateWithoutNodeInputSchema),z.lazy(() => TagUncheckedUpdateWithoutNodeInputSchema) ]),
  create: z.union([ z.lazy(() => TagCreateWithoutNodeInputSchema),z.lazy(() => TagUncheckedCreateWithoutNodeInputSchema) ]),
}).strict();

export const TagUpdateWithWhereUniqueWithoutNodeInputSchema: z.ZodType<Prisma.TagUpdateWithWhereUniqueWithoutNodeInput> = z.object({
  where: z.lazy(() => TagWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TagUpdateWithoutNodeInputSchema),z.lazy(() => TagUncheckedUpdateWithoutNodeInputSchema) ]),
}).strict();

export const TagUpdateManyWithWhereWithoutNodeInputSchema: z.ZodType<Prisma.TagUpdateManyWithWhereWithoutNodeInput> = z.object({
  where: z.lazy(() => TagScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TagUpdateManyMutationInputSchema),z.lazy(() => TagUncheckedUpdateManyWithoutNodeInputSchema) ]),
}).strict();

export const FlowRunCreateWithoutScheduledJobInputSchema: z.ZodType<Prisma.FlowRunCreateWithoutScheduledJobInput> = z.object({
  isScheduled: z.boolean().optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.lazy(() => RunStatusSchema),
  startedBy: z.lazy(() => StartedBySchema),
  timeEnded: z.coerce.date().optional().nullable(),
  timeStarted: z.coerce.date().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutFlowRunsInputSchema),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowRunInputSchema).optional()
}).strict();

export const FlowRunUncheckedCreateWithoutScheduledJobInputSchema: z.ZodType<Prisma.FlowRunUncheckedCreateWithoutScheduledJobInput> = z.object({
  flowId: z.string(),
  id: z.number().int().optional(),
  isScheduled: z.boolean().optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.lazy(() => RunStatusSchema),
  startedBy: z.lazy(() => StartedBySchema),
  timeEnded: z.coerce.date().optional().nullable(),
  timeStarted: z.coerce.date().optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowRunInputSchema).optional()
}).strict();

export const FlowRunCreateOrConnectWithoutScheduledJobInputSchema: z.ZodType<Prisma.FlowRunCreateOrConnectWithoutScheduledJobInput> = z.object({
  where: z.lazy(() => FlowRunWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowRunCreateWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutScheduledJobInputSchema) ]),
}).strict();

export const FlowRunCreateManyScheduledJobInputEnvelopeSchema: z.ZodType<Prisma.FlowRunCreateManyScheduledJobInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => FlowRunCreateManyScheduledJobInputSchema),z.lazy(() => FlowRunCreateManyScheduledJobInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const FlowRunUpsertWithWhereUniqueWithoutScheduledJobInputSchema: z.ZodType<Prisma.FlowRunUpsertWithWhereUniqueWithoutScheduledJobInput> = z.object({
  where: z.lazy(() => FlowRunWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FlowRunUpdateWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUncheckedUpdateWithoutScheduledJobInputSchema) ]),
  create: z.union([ z.lazy(() => FlowRunCreateWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUncheckedCreateWithoutScheduledJobInputSchema) ]),
}).strict();

export const FlowRunUpdateWithWhereUniqueWithoutScheduledJobInputSchema: z.ZodType<Prisma.FlowRunUpdateWithWhereUniqueWithoutScheduledJobInput> = z.object({
  where: z.lazy(() => FlowRunWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FlowRunUpdateWithoutScheduledJobInputSchema),z.lazy(() => FlowRunUncheckedUpdateWithoutScheduledJobInputSchema) ]),
}).strict();

export const FlowRunUpdateManyWithWhereWithoutScheduledJobInputSchema: z.ZodType<Prisma.FlowRunUpdateManyWithWhereWithoutScheduledJobInput> = z.object({
  where: z.lazy(() => FlowRunScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FlowRunUpdateManyMutationInputSchema),z.lazy(() => FlowRunUncheckedUpdateManyWithoutScheduledJobInputSchema) ]),
}).strict();

export const FlowCreateWithoutSecretsInputSchema: z.ZodType<Prisma.FlowCreateWithoutSecretsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutFlowsInputSchema),
  nodes: z.lazy(() => NodeCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowUncheckedCreateWithoutSecretsInputSchema: z.ZodType<Prisma.FlowUncheckedCreateWithoutSecretsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowCreateOrConnectWithoutSecretsInputSchema: z.ZodType<Prisma.FlowCreateOrConnectWithoutSecretsInput> = z.object({
  where: z.lazy(() => FlowWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowCreateWithoutSecretsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutSecretsInputSchema) ]),
}).strict();

export const NodeCreateWithoutSecretsInputSchema: z.ZodType<Prisma.NodeCreateWithoutSecretsInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutNodesInputSchema),
  infrastructure: z.lazy(() => InfrastructureCreateNestedOneWithoutNodesInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeCreateNestedManyWithoutSourceNodeInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeCreateNestedManyWithoutTargetNodeInputSchema).optional(),
  Tag: z.lazy(() => TagCreateNestedManyWithoutNodeInputSchema).optional()
}).strict();

export const NodeUncheckedCreateWithoutSecretsInputSchema: z.ZodType<Prisma.NodeUncheckedCreateWithoutSecretsInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  flowId: z.string(),
  id: z.string().cuid().optional(),
  infrastructureId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  sourceEdges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutSourceNodeInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutTargetNodeInputSchema).optional(),
  Tag: z.lazy(() => TagUncheckedCreateNestedManyWithoutNodeInputSchema).optional()
}).strict();

export const NodeCreateOrConnectWithoutSecretsInputSchema: z.ZodType<Prisma.NodeCreateOrConnectWithoutSecretsInput> = z.object({
  where: z.lazy(() => NodeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => NodeCreateWithoutSecretsInputSchema),z.lazy(() => NodeUncheckedCreateWithoutSecretsInputSchema) ]),
}).strict();

export const FlowUpsertWithoutSecretsInputSchema: z.ZodType<Prisma.FlowUpsertWithoutSecretsInput> = z.object({
  update: z.union([ z.lazy(() => FlowUpdateWithoutSecretsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutSecretsInputSchema) ]),
  create: z.union([ z.lazy(() => FlowCreateWithoutSecretsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutSecretsInputSchema) ]),
  where: z.lazy(() => FlowWhereInputSchema).optional()
}).strict();

export const FlowUpdateToOneWithWhereWithoutSecretsInputSchema: z.ZodType<Prisma.FlowUpdateToOneWithWhereWithoutSecretsInput> = z.object({
  where: z.lazy(() => FlowWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => FlowUpdateWithoutSecretsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutSecretsInputSchema) ]),
}).strict();

export const FlowUpdateWithoutSecretsInputSchema: z.ZodType<Prisma.FlowUpdateWithoutSecretsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutFlowsNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowUncheckedUpdateWithoutSecretsInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateWithoutSecretsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const NodeUpsertWithoutSecretsInputSchema: z.ZodType<Prisma.NodeUpsertWithoutSecretsInput> = z.object({
  update: z.union([ z.lazy(() => NodeUpdateWithoutSecretsInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutSecretsInputSchema) ]),
  create: z.union([ z.lazy(() => NodeCreateWithoutSecretsInputSchema),z.lazy(() => NodeUncheckedCreateWithoutSecretsInputSchema) ]),
  where: z.lazy(() => NodeWhereInputSchema).optional()
}).strict();

export const NodeUpdateToOneWithWhereWithoutSecretsInputSchema: z.ZodType<Prisma.NodeUpdateToOneWithWhereWithoutSecretsInput> = z.object({
  where: z.lazy(() => NodeWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => NodeUpdateWithoutSecretsInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutSecretsInputSchema) ]),
}).strict();

export const NodeUpdateWithoutSecretsInputSchema: z.ZodType<Prisma.NodeUpdateWithoutSecretsInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutNodesNestedInputSchema).optional(),
  infrastructure: z.lazy(() => InfrastructureUpdateOneWithoutNodesNestedInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUpdateManyWithoutSourceNodeNestedInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUpdateManyWithoutTargetNodeNestedInputSchema).optional(),
  Tag: z.lazy(() => TagUpdateManyWithoutNodeNestedInputSchema).optional()
}).strict();

export const NodeUncheckedUpdateWithoutSecretsInputSchema: z.ZodType<Prisma.NodeUncheckedUpdateWithoutSecretsInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  infrastructureId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  sourceEdges: z.lazy(() => EdgeUncheckedUpdateManyWithoutSourceNodeNestedInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUncheckedUpdateManyWithoutTargetNodeNestedInputSchema).optional(),
  Tag: z.lazy(() => TagUncheckedUpdateManyWithoutNodeNestedInputSchema).optional()
}).strict();

export const FlowCreateWithoutTagsInputSchema: z.ZodType<Prisma.FlowCreateWithoutTagsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutFlowsInputSchema),
  nodes: z.lazy(() => NodeCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowUncheckedCreateWithoutTagsInputSchema: z.ZodType<Prisma.FlowUncheckedCreateWithoutTagsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowCreateOrConnectWithoutTagsInputSchema: z.ZodType<Prisma.FlowCreateOrConnectWithoutTagsInput> = z.object({
  where: z.lazy(() => FlowWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowCreateWithoutTagsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutTagsInputSchema) ]),
}).strict();

export const NodeCreateWithoutTagInputSchema: z.ZodType<Prisma.NodeCreateWithoutTagInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutNodesInputSchema),
  infrastructure: z.lazy(() => InfrastructureCreateNestedOneWithoutNodesInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutNodeInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeCreateNestedManyWithoutSourceNodeInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeCreateNestedManyWithoutTargetNodeInputSchema).optional()
}).strict();

export const NodeUncheckedCreateWithoutTagInputSchema: z.ZodType<Prisma.NodeUncheckedCreateWithoutTagInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  flowId: z.string(),
  id: z.string().cuid().optional(),
  infrastructureId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutNodeInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutSourceNodeInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutTargetNodeInputSchema).optional()
}).strict();

export const NodeCreateOrConnectWithoutTagInputSchema: z.ZodType<Prisma.NodeCreateOrConnectWithoutTagInput> = z.object({
  where: z.lazy(() => NodeWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => NodeCreateWithoutTagInputSchema),z.lazy(() => NodeUncheckedCreateWithoutTagInputSchema) ]),
}).strict();

export const TagGroupCreateWithoutTagsInputSchema: z.ZodType<Prisma.TagGroupCreateWithoutTagsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  color: z.string(),
  deleted: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutTagGroupsInputSchema)
}).strict();

export const TagGroupUncheckedCreateWithoutTagsInputSchema: z.ZodType<Prisma.TagGroupUncheckedCreateWithoutTagsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  color: z.string(),
  deleted: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  instanceId: z.string()
}).strict();

export const TagGroupCreateOrConnectWithoutTagsInputSchema: z.ZodType<Prisma.TagGroupCreateOrConnectWithoutTagsInput> = z.object({
  where: z.lazy(() => TagGroupWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TagGroupCreateWithoutTagsInputSchema),z.lazy(() => TagGroupUncheckedCreateWithoutTagsInputSchema) ]),
}).strict();

export const InstanceCreateWithoutTagsInputSchema: z.ZodType<Prisma.InstanceCreateWithoutTagsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  id: z.string().cuid().optional(),
  image: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  flows: z.lazy(() => FlowCreateNestedManyWithoutInstanceInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupCreateNestedManyWithoutInstanceInputSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutInstancesInputSchema).optional()
}).strict();

export const InstanceUncheckedCreateWithoutTagsInputSchema: z.ZodType<Prisma.InstanceUncheckedCreateWithoutTagsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  id: z.string().cuid().optional(),
  image: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable(),
  flows: z.lazy(() => FlowUncheckedCreateNestedManyWithoutInstanceInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupUncheckedCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict();

export const InstanceCreateOrConnectWithoutTagsInputSchema: z.ZodType<Prisma.InstanceCreateOrConnectWithoutTagsInput> = z.object({
  where: z.lazy(() => InstanceWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => InstanceCreateWithoutTagsInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutTagsInputSchema) ]),
}).strict();

export const FlowUpsertWithoutTagsInputSchema: z.ZodType<Prisma.FlowUpsertWithoutTagsInput> = z.object({
  update: z.union([ z.lazy(() => FlowUpdateWithoutTagsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutTagsInputSchema) ]),
  create: z.union([ z.lazy(() => FlowCreateWithoutTagsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutTagsInputSchema) ]),
  where: z.lazy(() => FlowWhereInputSchema).optional()
}).strict();

export const FlowUpdateToOneWithWhereWithoutTagsInputSchema: z.ZodType<Prisma.FlowUpdateToOneWithWhereWithoutTagsInput> = z.object({
  where: z.lazy(() => FlowWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => FlowUpdateWithoutTagsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutTagsInputSchema) ]),
}).strict();

export const FlowUpdateWithoutTagsInputSchema: z.ZodType<Prisma.FlowUpdateWithoutTagsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutFlowsNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowUncheckedUpdateWithoutTagsInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateWithoutTagsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const NodeUpsertWithoutTagInputSchema: z.ZodType<Prisma.NodeUpsertWithoutTagInput> = z.object({
  update: z.union([ z.lazy(() => NodeUpdateWithoutTagInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutTagInputSchema) ]),
  create: z.union([ z.lazy(() => NodeCreateWithoutTagInputSchema),z.lazy(() => NodeUncheckedCreateWithoutTagInputSchema) ]),
  where: z.lazy(() => NodeWhereInputSchema).optional()
}).strict();

export const NodeUpdateToOneWithWhereWithoutTagInputSchema: z.ZodType<Prisma.NodeUpdateToOneWithWhereWithoutTagInput> = z.object({
  where: z.lazy(() => NodeWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => NodeUpdateWithoutTagInputSchema),z.lazy(() => NodeUncheckedUpdateWithoutTagInputSchema) ]),
}).strict();

export const NodeUpdateWithoutTagInputSchema: z.ZodType<Prisma.NodeUpdateWithoutTagInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutNodesNestedInputSchema).optional(),
  infrastructure: z.lazy(() => InfrastructureUpdateOneWithoutNodesNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutNodeNestedInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUpdateManyWithoutSourceNodeNestedInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUpdateManyWithoutTargetNodeNestedInputSchema).optional()
}).strict();

export const NodeUncheckedUpdateWithoutTagInputSchema: z.ZodType<Prisma.NodeUncheckedUpdateWithoutTagInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  infrastructureId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutNodeNestedInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUncheckedUpdateManyWithoutSourceNodeNestedInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUncheckedUpdateManyWithoutTargetNodeNestedInputSchema).optional()
}).strict();

export const TagGroupUpsertWithoutTagsInputSchema: z.ZodType<Prisma.TagGroupUpsertWithoutTagsInput> = z.object({
  update: z.union([ z.lazy(() => TagGroupUpdateWithoutTagsInputSchema),z.lazy(() => TagGroupUncheckedUpdateWithoutTagsInputSchema) ]),
  create: z.union([ z.lazy(() => TagGroupCreateWithoutTagsInputSchema),z.lazy(() => TagGroupUncheckedCreateWithoutTagsInputSchema) ]),
  where: z.lazy(() => TagGroupWhereInputSchema).optional()
}).strict();

export const TagGroupUpdateToOneWithWhereWithoutTagsInputSchema: z.ZodType<Prisma.TagGroupUpdateToOneWithWhereWithoutTagsInput> = z.object({
  where: z.lazy(() => TagGroupWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TagGroupUpdateWithoutTagsInputSchema),z.lazy(() => TagGroupUncheckedUpdateWithoutTagsInputSchema) ]),
}).strict();

export const TagGroupUpdateWithoutTagsInputSchema: z.ZodType<Prisma.TagGroupUpdateWithoutTagsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutTagGroupsNestedInputSchema).optional()
}).strict();

export const TagGroupUncheckedUpdateWithoutTagsInputSchema: z.ZodType<Prisma.TagGroupUncheckedUpdateWithoutTagsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InstanceUpsertWithoutTagsInputSchema: z.ZodType<Prisma.InstanceUpsertWithoutTagsInput> = z.object({
  update: z.union([ z.lazy(() => InstanceUpdateWithoutTagsInputSchema),z.lazy(() => InstanceUncheckedUpdateWithoutTagsInputSchema) ]),
  create: z.union([ z.lazy(() => InstanceCreateWithoutTagsInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutTagsInputSchema) ]),
  where: z.lazy(() => InstanceWhereInputSchema).optional()
}).strict();

export const InstanceUpdateToOneWithWhereWithoutTagsInputSchema: z.ZodType<Prisma.InstanceUpdateToOneWithWhereWithoutTagsInput> = z.object({
  where: z.lazy(() => InstanceWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => InstanceUpdateWithoutTagsInputSchema),z.lazy(() => InstanceUncheckedUpdateWithoutTagsInputSchema) ]),
}).strict();

export const InstanceUpdateWithoutTagsInputSchema: z.ZodType<Prisma.InstanceUpdateWithoutTagsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flows: z.lazy(() => FlowUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupUpdateManyWithoutInstanceNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneWithoutInstancesNestedInputSchema).optional()
}).strict();

export const InstanceUncheckedUpdateWithoutTagsInputSchema: z.ZodType<Prisma.InstanceUncheckedUpdateWithoutTagsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  flows: z.lazy(() => FlowUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict();

export const TagCreateWithoutTagGroupInputSchema: z.ZodType<Prisma.TagCreateWithoutTagGroupInput> = z.object({
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutTagsInputSchema).optional(),
  node: z.lazy(() => NodeCreateNestedOneWithoutTagInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutTagsInputSchema)
}).strict();

export const TagUncheckedCreateWithoutTagGroupInputSchema: z.ZodType<Prisma.TagUncheckedCreateWithoutTagGroupInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.string().optional().nullable(),
  nodeId: z.string().optional().nullable(),
  instanceId: z.string()
}).strict();

export const TagCreateOrConnectWithoutTagGroupInputSchema: z.ZodType<Prisma.TagCreateOrConnectWithoutTagGroupInput> = z.object({
  where: z.lazy(() => TagWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TagCreateWithoutTagGroupInputSchema),z.lazy(() => TagUncheckedCreateWithoutTagGroupInputSchema) ]),
}).strict();

export const TagCreateManyTagGroupInputEnvelopeSchema: z.ZodType<Prisma.TagCreateManyTagGroupInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => TagCreateManyTagGroupInputSchema),z.lazy(() => TagCreateManyTagGroupInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const InstanceCreateWithoutTagGroupsInputSchema: z.ZodType<Prisma.InstanceCreateWithoutTagGroupsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  id: z.string().cuid().optional(),
  image: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  flows: z.lazy(() => FlowCreateNestedManyWithoutInstanceInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutInstanceInputSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutInstancesInputSchema).optional()
}).strict();

export const InstanceUncheckedCreateWithoutTagGroupsInputSchema: z.ZodType<Prisma.InstanceUncheckedCreateWithoutTagGroupsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  id: z.string().cuid().optional(),
  image: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  userId: z.string().optional().nullable(),
  flows: z.lazy(() => FlowUncheckedCreateNestedManyWithoutInstanceInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict();

export const InstanceCreateOrConnectWithoutTagGroupsInputSchema: z.ZodType<Prisma.InstanceCreateOrConnectWithoutTagGroupsInput> = z.object({
  where: z.lazy(() => InstanceWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => InstanceCreateWithoutTagGroupsInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutTagGroupsInputSchema) ]),
}).strict();

export const TagUpsertWithWhereUniqueWithoutTagGroupInputSchema: z.ZodType<Prisma.TagUpsertWithWhereUniqueWithoutTagGroupInput> = z.object({
  where: z.lazy(() => TagWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TagUpdateWithoutTagGroupInputSchema),z.lazy(() => TagUncheckedUpdateWithoutTagGroupInputSchema) ]),
  create: z.union([ z.lazy(() => TagCreateWithoutTagGroupInputSchema),z.lazy(() => TagUncheckedCreateWithoutTagGroupInputSchema) ]),
}).strict();

export const TagUpdateWithWhereUniqueWithoutTagGroupInputSchema: z.ZodType<Prisma.TagUpdateWithWhereUniqueWithoutTagGroupInput> = z.object({
  where: z.lazy(() => TagWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TagUpdateWithoutTagGroupInputSchema),z.lazy(() => TagUncheckedUpdateWithoutTagGroupInputSchema) ]),
}).strict();

export const TagUpdateManyWithWhereWithoutTagGroupInputSchema: z.ZodType<Prisma.TagUpdateManyWithWhereWithoutTagGroupInput> = z.object({
  where: z.lazy(() => TagScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TagUpdateManyMutationInputSchema),z.lazy(() => TagUncheckedUpdateManyWithoutTagGroupInputSchema) ]),
}).strict();

export const InstanceUpsertWithoutTagGroupsInputSchema: z.ZodType<Prisma.InstanceUpsertWithoutTagGroupsInput> = z.object({
  update: z.union([ z.lazy(() => InstanceUpdateWithoutTagGroupsInputSchema),z.lazy(() => InstanceUncheckedUpdateWithoutTagGroupsInputSchema) ]),
  create: z.union([ z.lazy(() => InstanceCreateWithoutTagGroupsInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutTagGroupsInputSchema) ]),
  where: z.lazy(() => InstanceWhereInputSchema).optional()
}).strict();

export const InstanceUpdateToOneWithWhereWithoutTagGroupsInputSchema: z.ZodType<Prisma.InstanceUpdateToOneWithWhereWithoutTagGroupsInput> = z.object({
  where: z.lazy(() => InstanceWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => InstanceUpdateWithoutTagGroupsInputSchema),z.lazy(() => InstanceUncheckedUpdateWithoutTagGroupsInputSchema) ]),
}).strict();

export const InstanceUpdateWithoutTagGroupsInputSchema: z.ZodType<Prisma.InstanceUpdateWithoutTagGroupsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flows: z.lazy(() => FlowUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutInstanceNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneWithoutInstancesNestedInputSchema).optional()
}).strict();

export const InstanceUncheckedUpdateWithoutTagGroupsInputSchema: z.ZodType<Prisma.InstanceUncheckedUpdateWithoutTagGroupsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  flows: z.lazy(() => FlowUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict();

export const FlowCreateWithoutTestCasesInputSchema: z.ZodType<Prisma.FlowCreateWithoutTestCasesInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutFlowsInputSchema),
  nodes: z.lazy(() => NodeCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowUncheckedCreateWithoutTestCasesInputSchema: z.ZodType<Prisma.FlowUncheckedCreateWithoutTestCasesInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowCreateOrConnectWithoutTestCasesInputSchema: z.ZodType<Prisma.FlowCreateOrConnectWithoutTestCasesInput> = z.object({
  where: z.lazy(() => FlowWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowCreateWithoutTestCasesInputSchema),z.lazy(() => FlowUncheckedCreateWithoutTestCasesInputSchema) ]),
}).strict();

export const FlowUpsertWithoutTestCasesInputSchema: z.ZodType<Prisma.FlowUpsertWithoutTestCasesInput> = z.object({
  update: z.union([ z.lazy(() => FlowUpdateWithoutTestCasesInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutTestCasesInputSchema) ]),
  create: z.union([ z.lazy(() => FlowCreateWithoutTestCasesInputSchema),z.lazy(() => FlowUncheckedCreateWithoutTestCasesInputSchema) ]),
  where: z.lazy(() => FlowWhereInputSchema).optional()
}).strict();

export const FlowUpdateToOneWithWhereWithoutTestCasesInputSchema: z.ZodType<Prisma.FlowUpdateToOneWithWhereWithoutTestCasesInput> = z.object({
  where: z.lazy(() => FlowWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => FlowUpdateWithoutTestCasesInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutTestCasesInputSchema) ]),
}).strict();

export const FlowUpdateWithoutTestCasesInputSchema: z.ZodType<Prisma.FlowUpdateWithoutTestCasesInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutFlowsNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowUncheckedUpdateWithoutTestCasesInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateWithoutTestCasesInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutAccountsInputSchema: z.ZodType<Prisma.UserCreateWithoutAccountsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  instances: z.lazy(() => InstanceCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutAccountsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutAccountsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  instances: z.lazy(() => InstanceUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutAccountsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutAccountsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccountsInputSchema) ]),
}).strict();

export const UserUpsertWithoutAccountsInputSchema: z.ZodType<Prisma.UserUpsertWithoutAccountsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAccountsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccountsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutAccountsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutAccountsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAccountsInputSchema) ]),
}).strict();

export const UserUpdateWithoutAccountsInputSchema: z.ZodType<Prisma.UserUpdateWithoutAccountsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  instances: z.lazy(() => InstanceUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutAccountsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutAccountsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  instances: z.lazy(() => InstanceUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateWithoutSessionsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  instances: z.lazy(() => InstanceCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutSessionsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  instances: z.lazy(() => InstanceUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutSessionsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]),
}).strict();

export const UserUpsertWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutSessionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutSessionsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]),
}).strict();

export const UserUpdateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpdateWithoutSessionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  instances: z.lazy(() => InstanceUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutSessionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  instances: z.lazy(() => InstanceUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const AccountCreateWithoutUserInputSchema: z.ZodType<Prisma.AccountCreateWithoutUserInput> = z.object({
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  id: z.string().cuid().optional(),
  id_token: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  refresh_token_expires_in: z.number().int().optional().nullable(),
  scope: z.string().optional().nullable(),
  session_state: z.string().optional().nullable(),
  token_type: z.string().optional().nullable(),
  type: z.string()
}).strict();

export const AccountUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.AccountUncheckedCreateWithoutUserInput> = z.object({
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  id: z.string().cuid().optional(),
  id_token: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  refresh_token_expires_in: z.number().int().optional().nullable(),
  scope: z.string().optional().nullable(),
  session_state: z.string().optional().nullable(),
  token_type: z.string().optional().nullable(),
  type: z.string()
}).strict();

export const AccountCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.AccountCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => AccountWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AccountCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.AccountCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AccountCreateManyUserInputSchema),z.lazy(() => AccountCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const InstanceCreateWithoutUserInputSchema: z.ZodType<Prisma.InstanceCreateWithoutUserInput> = z.object({
  createdAt: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  id: z.string().cuid().optional(),
  image: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  flows: z.lazy(() => FlowCreateNestedManyWithoutInstanceInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutInstanceInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict();

export const InstanceUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.InstanceUncheckedCreateWithoutUserInput> = z.object({
  createdAt: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  id: z.string().cuid().optional(),
  image: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  flows: z.lazy(() => FlowUncheckedCreateNestedManyWithoutInstanceInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutInstanceInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupUncheckedCreateNestedManyWithoutInstanceInputSchema).optional()
}).strict();

export const InstanceCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.InstanceCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => InstanceWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => InstanceCreateWithoutUserInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const InstanceCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.InstanceCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => InstanceCreateManyUserInputSchema),z.lazy(() => InstanceCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const SessionCreateWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateWithoutUserInput> = z.object({
  createdAt: z.coerce.date().optional(),
  expires: z.coerce.date(),
  id: z.string().cuid().optional(),
  sessionToken: z.string()
}).strict();

export const SessionUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedCreateWithoutUserInput> = z.object({
  createdAt: z.coerce.date().optional(),
  expires: z.coerce.date(),
  id: z.string().cuid().optional(),
  sessionToken: z.string()
}).strict();

export const SessionCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const SessionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.SessionCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SessionCreateManyUserInputSchema),z.lazy(() => SessionCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const AuditLogCreateWithoutUserInputSchema: z.ZodType<Prisma.AuditLogCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  entityType: z.string(),
  entityId: z.string(),
  changeType: z.string(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  timestamp: z.coerce.date().optional(),
  flow: z.lazy(() => FlowCreateNestedOneWithoutAuditLogsInputSchema)
}).strict();

export const AuditLogUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.AuditLogUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  entityType: z.string(),
  entityId: z.string(),
  flowId: z.string(),
  changeType: z.string(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  timestamp: z.coerce.date().optional()
}).strict();

export const AuditLogCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.AuditLogCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => AuditLogWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AuditLogCreateWithoutUserInputSchema),z.lazy(() => AuditLogUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AuditLogCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.AuditLogCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AuditLogCreateManyUserInputSchema),z.lazy(() => AuditLogCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const AccountUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AccountUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AccountWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AccountUpdateWithoutUserInputSchema),z.lazy(() => AccountUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AccountUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AccountUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AccountWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AccountUpdateWithoutUserInputSchema),z.lazy(() => AccountUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const AccountUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.AccountUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => AccountScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AccountUpdateManyMutationInputSchema),z.lazy(() => AccountUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const AccountScalarWhereInputSchema: z.ZodType<Prisma.AccountScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AccountScalarWhereInputSchema),z.lazy(() => AccountScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountScalarWhereInputSchema),z.lazy(() => AccountScalarWhereInputSchema).array() ]).optional(),
  access_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  expires_at: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  id_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  oauth_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  oauth_token_secret: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  provider: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  providerAccountId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  refresh_token: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  scope: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  session_state: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  token_type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const InstanceUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.InstanceUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => InstanceWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => InstanceUpdateWithoutUserInputSchema),z.lazy(() => InstanceUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => InstanceCreateWithoutUserInputSchema),z.lazy(() => InstanceUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const InstanceUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.InstanceUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => InstanceWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => InstanceUpdateWithoutUserInputSchema),z.lazy(() => InstanceUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const InstanceUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.InstanceUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => InstanceScalarWhereInputSchema),
  data: z.union([ z.lazy(() => InstanceUpdateManyMutationInputSchema),z.lazy(() => InstanceUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const InstanceScalarWhereInputSchema: z.ZodType<Prisma.InstanceScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => InstanceScalarWhereInputSchema),z.lazy(() => InstanceScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => InstanceScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InstanceScalarWhereInputSchema),z.lazy(() => InstanceScalarWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  logo: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const SessionUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SessionUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => SessionUpdateWithoutUserInputSchema),z.lazy(() => SessionUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const SessionUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => SessionUpdateWithoutUserInputSchema),z.lazy(() => SessionUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const SessionUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => SessionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SessionUpdateManyMutationInputSchema),z.lazy(() => SessionUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const SessionScalarWhereInputSchema: z.ZodType<Prisma.SessionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  expires: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sessionToken: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const AuditLogUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AuditLogUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AuditLogWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AuditLogUpdateWithoutUserInputSchema),z.lazy(() => AuditLogUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => AuditLogCreateWithoutUserInputSchema),z.lazy(() => AuditLogUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AuditLogUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AuditLogUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AuditLogWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AuditLogUpdateWithoutUserInputSchema),z.lazy(() => AuditLogUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const AuditLogUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.AuditLogUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => AuditLogScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AuditLogUpdateManyMutationInputSchema),z.lazy(() => AuditLogUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserCreateWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserCreateWithoutAuditLogsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  instances: z.lazy(() => InstanceCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutAuditLogsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  email: z.string().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
  image: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  instances: z.lazy(() => InstanceUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutAuditLogsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutAuditLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAuditLogsInputSchema) ]),
}).strict();

export const FlowCreateWithoutAuditLogsInputSchema: z.ZodType<Prisma.FlowCreateWithoutAuditLogsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutFlowsInputSchema),
  nodes: z.lazy(() => NodeCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowUncheckedCreateWithoutAuditLogsInputSchema: z.ZodType<Prisma.FlowUncheckedCreateWithoutAuditLogsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputSchema).optional()
}).strict();

export const FlowCreateOrConnectWithoutAuditLogsInputSchema: z.ZodType<Prisma.FlowCreateOrConnectWithoutAuditLogsInput> = z.object({
  where: z.lazy(() => FlowWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowCreateWithoutAuditLogsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutAuditLogsInputSchema) ]),
}).strict();

export const UserUpsertWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserUpsertWithoutAuditLogsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutAuditLogsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAuditLogsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutAuditLogsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAuditLogsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutAuditLogsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutAuditLogsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAuditLogsInputSchema) ]),
}).strict();

export const UserUpdateWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserUpdateWithoutAuditLogsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  instances: z.lazy(() => InstanceUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutAuditLogsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutAuditLogsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  emailVerified: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  instances: z.lazy(() => InstanceUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const FlowUpsertWithoutAuditLogsInputSchema: z.ZodType<Prisma.FlowUpsertWithoutAuditLogsInput> = z.object({
  update: z.union([ z.lazy(() => FlowUpdateWithoutAuditLogsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutAuditLogsInputSchema) ]),
  create: z.union([ z.lazy(() => FlowCreateWithoutAuditLogsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutAuditLogsInputSchema) ]),
  where: z.lazy(() => FlowWhereInputSchema).optional()
}).strict();

export const FlowUpdateToOneWithWhereWithoutAuditLogsInputSchema: z.ZodType<Prisma.FlowUpdateToOneWithWhereWithoutAuditLogsInput> = z.object({
  where: z.lazy(() => FlowWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => FlowUpdateWithoutAuditLogsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutAuditLogsInputSchema) ]),
}).strict();

export const FlowUpdateWithoutAuditLogsInputSchema: z.ZodType<Prisma.FlowUpdateWithoutAuditLogsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutFlowsNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowUncheckedUpdateWithoutAuditLogsInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateWithoutAuditLogsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowCreateWithoutStatisticsInputSchema: z.ZodType<Prisma.FlowCreateWithoutStatisticsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventCreateNestedManyWithoutFlowInputSchema).optional(),
  instance: z.lazy(() => InstanceCreateNestedOneWithoutFlowsInputSchema),
  nodes: z.lazy(() => NodeCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogCreateNestedManyWithoutFlowInputSchema).optional()
}).strict();

export const FlowUncheckedCreateWithoutStatisticsInputSchema: z.ZodType<Prisma.FlowUncheckedCreateWithoutStatisticsInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  instanceId: z.string(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional(),
  edges: z.lazy(() => EdgeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedCreateNestedManyWithoutFlowInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedCreateNestedManyWithoutFlowInputSchema).optional()
}).strict();

export const FlowCreateOrConnectWithoutStatisticsInputSchema: z.ZodType<Prisma.FlowCreateOrConnectWithoutStatisticsInput> = z.object({
  where: z.lazy(() => FlowWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FlowCreateWithoutStatisticsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutStatisticsInputSchema) ]),
}).strict();

export const FlowUpsertWithoutStatisticsInputSchema: z.ZodType<Prisma.FlowUpsertWithoutStatisticsInput> = z.object({
  update: z.union([ z.lazy(() => FlowUpdateWithoutStatisticsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutStatisticsInputSchema) ]),
  create: z.union([ z.lazy(() => FlowCreateWithoutStatisticsInputSchema),z.lazy(() => FlowUncheckedCreateWithoutStatisticsInputSchema) ]),
  where: z.lazy(() => FlowWhereInputSchema).optional()
}).strict();

export const FlowUpdateToOneWithWhereWithoutStatisticsInputSchema: z.ZodType<Prisma.FlowUpdateToOneWithWhereWithoutStatisticsInput> = z.object({
  where: z.lazy(() => FlowWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => FlowUpdateWithoutStatisticsInputSchema),z.lazy(() => FlowUncheckedUpdateWithoutStatisticsInputSchema) ]),
}).strict();

export const FlowUpdateWithoutStatisticsInputSchema: z.ZodType<Prisma.FlowUpdateWithoutStatisticsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutFlowsNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowUncheckedUpdateWithoutStatisticsInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateWithoutStatisticsInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutFlowNestedInputSchema).optional()
}).strict();

export const EdgeCreateManyFlowInputSchema: z.ZodType<Prisma.EdgeCreateManyFlowInput> = z.object({
  id: z.string().cuid().optional(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  rfId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  type: z.lazy(() => EdgeTypeSchema).optional(),
  normalizedKey: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const FlowRunCreateManyFlowInputSchema: z.ZodType<Prisma.FlowRunCreateManyFlowInput> = z.object({
  id: z.number().int().optional(),
  isScheduled: z.boolean().optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.lazy(() => RunStatusSchema),
  scheduledJobId: z.number().int().optional().nullable(),
  startedBy: z.lazy(() => StartedBySchema),
  timeEnded: z.coerce.date().optional().nullable(),
  timeStarted: z.coerce.date().optional()
}).strict();

export const FlowEventCreateManyFlowInputSchema: z.ZodType<Prisma.FlowEventCreateManyFlowInput> = z.object({
  createdAt: z.coerce.date().optional(),
  flowRunId: z.number().int(),
  id: z.number().int().optional(),
  nodeId: z.string(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.lazy(() => StartedBySchema)
}).strict();

export const NodeCreateManyFlowInputSchema: z.ZodType<Prisma.NodeCreateManyFlowInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  infrastructureId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const SecretCreateManyFlowInputSchema: z.ZodType<Prisma.SecretCreateManyFlowInput> = z.object({
  name: z.string(),
  category: z.lazy(() => SecretCategorySchema),
  createdAt: z.coerce.date().optional(),
  id: z.number().int().optional(),
  nodeId: z.string().optional().nullable(),
  secret: z.string(),
  shouldEncrypt: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const TagCreateManyFlowInputSchema: z.ZodType<Prisma.TagCreateManyFlowInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  nodeId: z.string().optional().nullable(),
  tagGroupId: z.string().optional().nullable(),
  instanceId: z.string()
}).strict();

export const TestCaseCreateManyFlowInputSchema: z.ZodType<Prisma.TestCaseCreateManyFlowInput> = z.object({
  color: z.lazy(() => MantineColorSchema),
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const AuditLogCreateManyFlowInputSchema: z.ZodType<Prisma.AuditLogCreateManyFlowInput> = z.object({
  id: z.string().cuid().optional(),
  entityType: z.string(),
  entityId: z.string(),
  changeType: z.string(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  userId: z.string(),
  timestamp: z.coerce.date().optional()
}).strict();

export const EdgeUpdateWithoutFlowInputSchema: z.ZodType<Prisma.EdgeUpdateWithoutFlowInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  sourceNode: z.lazy(() => NodeUpdateOneRequiredWithoutSourceEdgesNestedInputSchema).optional(),
  targetNode: z.lazy(() => NodeUpdateOneRequiredWithoutTargetEdgesNestedInputSchema).optional()
}).strict();

export const EdgeUncheckedUpdateWithoutFlowInputSchema: z.ZodType<Prisma.EdgeUncheckedUpdateWithoutFlowInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sourceNodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetNodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EdgeUncheckedUpdateManyWithoutFlowInputSchema: z.ZodType<Prisma.EdgeUncheckedUpdateManyWithoutFlowInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sourceNodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetNodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowRunUpdateWithoutFlowInputSchema: z.ZodType<Prisma.FlowRunUpdateWithoutFlowInput> = z.object({
  isScheduled: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => EnumRunStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  timeEnded: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeStarted: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowRunNestedInputSchema).optional(),
  scheduledJob: z.lazy(() => ScheduledJobUpdateOneWithoutFlowRunsNestedInputSchema).optional()
}).strict();

export const FlowRunUncheckedUpdateWithoutFlowInputSchema: z.ZodType<Prisma.FlowRunUncheckedUpdateWithoutFlowInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isScheduled: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => EnumRunStatusFieldUpdateOperationsInputSchema) ]).optional(),
  scheduledJobId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  timeEnded: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeStarted: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowRunNestedInputSchema).optional()
}).strict();

export const FlowRunUncheckedUpdateManyWithoutFlowInputSchema: z.ZodType<Prisma.FlowRunUncheckedUpdateManyWithoutFlowInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isScheduled: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => EnumRunStatusFieldUpdateOperationsInputSchema) ]).optional(),
  scheduledJobId: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  timeEnded: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeStarted: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowEventUpdateWithoutFlowInputSchema: z.ZodType<Prisma.FlowEventUpdateWithoutFlowInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  flowRun: z.lazy(() => FlowRunUpdateOneRequiredWithoutFlowEventsNestedInputSchema).optional()
}).strict();

export const FlowEventUncheckedUpdateWithoutFlowInputSchema: z.ZodType<Prisma.FlowEventUncheckedUpdateWithoutFlowInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowRunId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowEventUncheckedUpdateManyWithoutFlowInputSchema: z.ZodType<Prisma.FlowEventUncheckedUpdateManyWithoutFlowInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowRunId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const NodeUpdateWithoutFlowInputSchema: z.ZodType<Prisma.NodeUpdateWithoutFlowInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  infrastructure: z.lazy(() => InfrastructureUpdateOneWithoutNodesNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutNodeNestedInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUpdateManyWithoutSourceNodeNestedInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUpdateManyWithoutTargetNodeNestedInputSchema).optional(),
  Tag: z.lazy(() => TagUpdateManyWithoutNodeNestedInputSchema).optional()
}).strict();

export const NodeUncheckedUpdateWithoutFlowInputSchema: z.ZodType<Prisma.NodeUncheckedUpdateWithoutFlowInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  infrastructureId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutNodeNestedInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUncheckedUpdateManyWithoutSourceNodeNestedInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUncheckedUpdateManyWithoutTargetNodeNestedInputSchema).optional(),
  Tag: z.lazy(() => TagUncheckedUpdateManyWithoutNodeNestedInputSchema).optional()
}).strict();

export const NodeUncheckedUpdateManyWithoutFlowInputSchema: z.ZodType<Prisma.NodeUncheckedUpdateManyWithoutFlowInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  infrastructureId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SecretUpdateWithoutFlowInputSchema: z.ZodType<Prisma.SecretUpdateWithoutFlowInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => EnumSecretCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  secret: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shouldEncrypt: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  node: z.lazy(() => NodeUpdateOneWithoutSecretsNestedInputSchema).optional()
}).strict();

export const SecretUncheckedUpdateWithoutFlowInputSchema: z.ZodType<Prisma.SecretUncheckedUpdateWithoutFlowInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => EnumSecretCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  secret: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shouldEncrypt: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SecretUncheckedUpdateManyWithoutFlowInputSchema: z.ZodType<Prisma.SecretUncheckedUpdateManyWithoutFlowInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => EnumSecretCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  secret: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shouldEncrypt: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagUpdateWithoutFlowInputSchema: z.ZodType<Prisma.TagUpdateWithoutFlowInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  node: z.lazy(() => NodeUpdateOneWithoutTagNestedInputSchema).optional(),
  tagGroup: z.lazy(() => TagGroupUpdateOneWithoutTagsNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutTagsNestedInputSchema).optional()
}).strict();

export const TagUncheckedUpdateWithoutFlowInputSchema: z.ZodType<Prisma.TagUncheckedUpdateWithoutFlowInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tagGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagUncheckedUpdateManyWithoutFlowInputSchema: z.ZodType<Prisma.TagUncheckedUpdateManyWithoutFlowInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tagGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TestCaseUpdateWithoutFlowInputSchema: z.ZodType<Prisma.TestCaseUpdateWithoutFlowInput> = z.object({
  color: z.union([ z.lazy(() => MantineColorSchema),z.lazy(() => EnumMantineColorFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TestCaseUncheckedUpdateWithoutFlowInputSchema: z.ZodType<Prisma.TestCaseUncheckedUpdateWithoutFlowInput> = z.object({
  color: z.union([ z.lazy(() => MantineColorSchema),z.lazy(() => EnumMantineColorFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TestCaseUncheckedUpdateManyWithoutFlowInputSchema: z.ZodType<Prisma.TestCaseUncheckedUpdateManyWithoutFlowInput> = z.object({
  color: z.union([ z.lazy(() => MantineColorSchema),z.lazy(() => EnumMantineColorFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AuditLogUpdateWithoutFlowInputSchema: z.ZodType<Prisma.AuditLogUpdateWithoutFlowInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changeType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutAuditLogsNestedInputSchema).optional()
}).strict();

export const AuditLogUncheckedUpdateWithoutFlowInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateWithoutFlowInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changeType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AuditLogUncheckedUpdateManyWithoutFlowInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateManyWithoutFlowInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changeType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowEventCreateManyFlowRunInputSchema: z.ZodType<Prisma.FlowEventCreateManyFlowRunInput> = z.object({
  createdAt: z.coerce.date().optional(),
  flowId: z.string(),
  id: z.number().int().optional(),
  nodeId: z.string(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.lazy(() => StartedBySchema)
}).strict();

export const FlowEventUpdateWithoutFlowRunInputSchema: z.ZodType<Prisma.FlowEventUpdateWithoutFlowRunInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutFlowEventsNestedInputSchema).optional()
}).strict();

export const FlowEventUncheckedUpdateWithoutFlowRunInputSchema: z.ZodType<Prisma.FlowEventUncheckedUpdateWithoutFlowRunInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowEventUncheckedUpdateManyWithoutFlowRunInputSchema: z.ZodType<Prisma.FlowEventUncheckedUpdateManyWithoutFlowRunInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  nodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const NodeCreateManyInfrastructureInputSchema: z.ZodType<Prisma.NodeCreateManyInfrastructureInput> = z.object({
  arn: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  flowId: z.string(),
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.string(),
  type: z.lazy(() => NodeTypeSchema),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const NodeUpdateWithoutInfrastructureInputSchema: z.ZodType<Prisma.NodeUpdateWithoutInfrastructureInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutNodesNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutNodeNestedInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUpdateManyWithoutSourceNodeNestedInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUpdateManyWithoutTargetNodeNestedInputSchema).optional(),
  Tag: z.lazy(() => TagUpdateManyWithoutNodeNestedInputSchema).optional()
}).strict();

export const NodeUncheckedUpdateWithoutInfrastructureInputSchema: z.ZodType<Prisma.NodeUncheckedUpdateWithoutInfrastructureInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutNodeNestedInputSchema).optional(),
  sourceEdges: z.lazy(() => EdgeUncheckedUpdateManyWithoutSourceNodeNestedInputSchema).optional(),
  targetEdges: z.lazy(() => EdgeUncheckedUpdateManyWithoutTargetNodeNestedInputSchema).optional(),
  Tag: z.lazy(() => TagUncheckedUpdateManyWithoutNodeNestedInputSchema).optional()
}).strict();

export const NodeUncheckedUpdateManyWithoutInfrastructureInputSchema: z.ZodType<Prisma.NodeUncheckedUpdateManyWithoutInfrastructureInput> = z.object({
  arn: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  position: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => NodeTypeSchema),z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowCreateManyInstanceInputSchema: z.ZodType<Prisma.FlowCreateManyInstanceInput> = z.object({
  createdAt: z.coerce.date().optional(),
  id: z.string().cuid().optional(),
  isEnabled: z.boolean().optional(),
  method: z.lazy(() => FlowMethodSchema).optional(),
  name: z.string(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.boolean().optional()
}).strict();

export const TagCreateManyInstanceInputSchema: z.ZodType<Prisma.TagCreateManyInstanceInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.string().optional().nullable(),
  nodeId: z.string().optional().nullable(),
  tagGroupId: z.string().optional().nullable()
}).strict();

export const TagGroupCreateManyInstanceInputSchema: z.ZodType<Prisma.TagGroupCreateManyInstanceInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  color: z.string(),
  deleted: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const FlowUpdateWithoutInstanceInputSchema: z.ZodType<Prisma.FlowUpdateWithoutInstanceInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowUncheckedUpdateWithoutInstanceInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateWithoutInstanceInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  edges: z.lazy(() => EdgeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowRuns: z.lazy(() => FlowRunUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  nodes: z.lazy(() => NodeUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  secrets: z.lazy(() => SecretUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  testCases: z.lazy(() => TestCaseUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  auditLogs: z.lazy(() => AuditLogUncheckedUpdateManyWithoutFlowNestedInputSchema).optional(),
  statistics: z.lazy(() => FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputSchema).optional()
}).strict();

export const FlowUncheckedUpdateManyWithoutInstanceInputSchema: z.ZodType<Prisma.FlowUncheckedUpdateManyWithoutInstanceInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isEnabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => FlowMethodSchema),z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  viewport: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagUpdateWithoutInstanceInputSchema: z.ZodType<Prisma.TagUpdateWithoutInstanceInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flow: z.lazy(() => FlowUpdateOneWithoutTagsNestedInputSchema).optional(),
  node: z.lazy(() => NodeUpdateOneWithoutTagNestedInputSchema).optional(),
  tagGroup: z.lazy(() => TagGroupUpdateOneWithoutTagsNestedInputSchema).optional()
}).strict();

export const TagUncheckedUpdateWithoutInstanceInputSchema: z.ZodType<Prisma.TagUncheckedUpdateWithoutInstanceInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nodeId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tagGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const TagUncheckedUpdateManyWithoutInstanceInputSchema: z.ZodType<Prisma.TagUncheckedUpdateManyWithoutInstanceInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nodeId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tagGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const TagGroupUpdateWithoutInstanceInputSchema: z.ZodType<Prisma.TagGroupUpdateWithoutInstanceInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutTagGroupNestedInputSchema).optional()
}).strict();

export const TagGroupUncheckedUpdateWithoutInstanceInputSchema: z.ZodType<Prisma.TagGroupUncheckedUpdateWithoutInstanceInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutTagGroupNestedInputSchema).optional()
}).strict();

export const TagGroupUncheckedUpdateManyWithoutInstanceInputSchema: z.ZodType<Prisma.TagGroupUncheckedUpdateManyWithoutInstanceInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const SecretCreateManyNodeInputSchema: z.ZodType<Prisma.SecretCreateManyNodeInput> = z.object({
  name: z.string(),
  category: z.lazy(() => SecretCategorySchema),
  createdAt: z.coerce.date().optional(),
  flowId: z.string().optional().nullable(),
  id: z.number().int().optional(),
  secret: z.string(),
  shouldEncrypt: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const EdgeCreateManySourceNodeInputSchema: z.ZodType<Prisma.EdgeCreateManySourceNodeInput> = z.object({
  id: z.string().cuid().optional(),
  targetNodeId: z.string(),
  flowId: z.string(),
  rfId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  type: z.lazy(() => EdgeTypeSchema).optional(),
  normalizedKey: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const EdgeCreateManyTargetNodeInputSchema: z.ZodType<Prisma.EdgeCreateManyTargetNodeInput> = z.object({
  id: z.string().cuid().optional(),
  sourceNodeId: z.string(),
  flowId: z.string(),
  rfId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  type: z.lazy(() => EdgeTypeSchema).optional(),
  normalizedKey: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional()
}).strict();

export const TagCreateManyNodeInputSchema: z.ZodType<Prisma.TagCreateManyNodeInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.string().optional().nullable(),
  tagGroupId: z.string().optional().nullable(),
  instanceId: z.string()
}).strict();

export const SecretUpdateWithoutNodeInputSchema: z.ZodType<Prisma.SecretUpdateWithoutNodeInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => EnumSecretCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  secret: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shouldEncrypt: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneWithoutSecretsNestedInputSchema).optional()
}).strict();

export const SecretUncheckedUpdateWithoutNodeInputSchema: z.ZodType<Prisma.SecretUncheckedUpdateWithoutNodeInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => EnumSecretCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  secret: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shouldEncrypt: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SecretUncheckedUpdateManyWithoutNodeInputSchema: z.ZodType<Prisma.SecretUncheckedUpdateManyWithoutNodeInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.lazy(() => SecretCategorySchema),z.lazy(() => EnumSecretCategoryFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  secret: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  shouldEncrypt: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EdgeUpdateWithoutSourceNodeInputSchema: z.ZodType<Prisma.EdgeUpdateWithoutSourceNodeInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutEdgesNestedInputSchema).optional(),
  targetNode: z.lazy(() => NodeUpdateOneRequiredWithoutTargetEdgesNestedInputSchema).optional()
}).strict();

export const EdgeUncheckedUpdateWithoutSourceNodeInputSchema: z.ZodType<Prisma.EdgeUncheckedUpdateWithoutSourceNodeInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetNodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EdgeUncheckedUpdateManyWithoutSourceNodeInputSchema: z.ZodType<Prisma.EdgeUncheckedUpdateManyWithoutSourceNodeInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  targetNodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EdgeUpdateWithoutTargetNodeInputSchema: z.ZodType<Prisma.EdgeUpdateWithoutTargetNodeInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutEdgesNestedInputSchema).optional(),
  sourceNode: z.lazy(() => NodeUpdateOneRequiredWithoutSourceEdgesNestedInputSchema).optional()
}).strict();

export const EdgeUncheckedUpdateWithoutTargetNodeInputSchema: z.ZodType<Prisma.EdgeUncheckedUpdateWithoutTargetNodeInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sourceNodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EdgeUncheckedUpdateManyWithoutTargetNodeInputSchema: z.ZodType<Prisma.EdgeUncheckedUpdateManyWithoutTargetNodeInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sourceNodeId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rfId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  label: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => EdgeTypeSchema),z.lazy(() => EnumEdgeTypeFieldUpdateOperationsInputSchema) ]).optional(),
  normalizedKey: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagUpdateWithoutNodeInputSchema: z.ZodType<Prisma.TagUpdateWithoutNodeInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flow: z.lazy(() => FlowUpdateOneWithoutTagsNestedInputSchema).optional(),
  tagGroup: z.lazy(() => TagGroupUpdateOneWithoutTagsNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutTagsNestedInputSchema).optional()
}).strict();

export const TagUncheckedUpdateWithoutNodeInputSchema: z.ZodType<Prisma.TagUncheckedUpdateWithoutNodeInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tagGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagUncheckedUpdateManyWithoutNodeInputSchema: z.ZodType<Prisma.TagUncheckedUpdateManyWithoutNodeInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tagGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FlowRunCreateManyScheduledJobInputSchema: z.ZodType<Prisma.FlowRunCreateManyScheduledJobInput> = z.object({
  flowId: z.string(),
  id: z.number().int().optional(),
  isScheduled: z.boolean().optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.lazy(() => RunStatusSchema),
  startedBy: z.lazy(() => StartedBySchema),
  timeEnded: z.coerce.date().optional().nullable(),
  timeStarted: z.coerce.date().optional()
}).strict();

export const FlowRunUpdateWithoutScheduledJobInputSchema: z.ZodType<Prisma.FlowRunUpdateWithoutScheduledJobInput> = z.object({
  isScheduled: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => EnumRunStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  timeEnded: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeStarted: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutFlowRunsNestedInputSchema).optional(),
  flowEvents: z.lazy(() => FlowEventUpdateManyWithoutFlowRunNestedInputSchema).optional()
}).strict();

export const FlowRunUncheckedUpdateWithoutScheduledJobInputSchema: z.ZodType<Prisma.FlowRunUncheckedUpdateWithoutScheduledJobInput> = z.object({
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isScheduled: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => EnumRunStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  timeEnded: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeStarted: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flowEvents: z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowRunNestedInputSchema).optional()
}).strict();

export const FlowRunUncheckedUpdateManyWithoutScheduledJobInputSchema: z.ZodType<Prisma.FlowRunUncheckedUpdateManyWithoutScheduledJobInput> = z.object({
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  isScheduled: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payload: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  runStatus: z.union([ z.lazy(() => RunStatusSchema),z.lazy(() => EnumRunStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startedBy: z.union([ z.lazy(() => StartedBySchema),z.lazy(() => EnumStartedByFieldUpdateOperationsInputSchema) ]).optional(),
  timeEnded: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  timeStarted: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagCreateManyTagGroupInputSchema: z.ZodType<Prisma.TagCreateManyTagGroupInput> = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.string().optional().nullable(),
  nodeId: z.string().optional().nullable(),
  instanceId: z.string()
}).strict();

export const TagUpdateWithoutTagGroupInputSchema: z.ZodType<Prisma.TagUpdateWithoutTagGroupInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flow: z.lazy(() => FlowUpdateOneWithoutTagsNestedInputSchema).optional(),
  node: z.lazy(() => NodeUpdateOneWithoutTagNestedInputSchema).optional(),
  instance: z.lazy(() => InstanceUpdateOneRequiredWithoutTagsNestedInputSchema).optional()
}).strict();

export const TagUncheckedUpdateWithoutTagGroupInputSchema: z.ZodType<Prisma.TagUncheckedUpdateWithoutTagGroupInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nodeId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TagUncheckedUpdateManyWithoutTagGroupInputSchema: z.ZodType<Prisma.TagUncheckedUpdateManyWithoutTagGroupInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nodeId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  instanceId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountCreateManyUserInputSchema: z.ZodType<Prisma.AccountCreateManyUserInput> = z.object({
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  id: z.string().cuid().optional(),
  id_token: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  refresh_token_expires_in: z.number().int().optional().nullable(),
  scope: z.string().optional().nullable(),
  session_state: z.string().optional().nullable(),
  token_type: z.string().optional().nullable(),
  type: z.string()
}).strict();

export const InstanceCreateManyUserInputSchema: z.ZodType<Prisma.InstanceCreateManyUserInput> = z.object({
  createdAt: z.coerce.date().optional(),
  description: z.string().optional().nullable(),
  id: z.string().cuid().optional(),
  image: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const SessionCreateManyUserInputSchema: z.ZodType<Prisma.SessionCreateManyUserInput> = z.object({
  createdAt: z.coerce.date().optional(),
  expires: z.coerce.date(),
  id: z.string().cuid().optional(),
  sessionToken: z.string()
}).strict();

export const AuditLogCreateManyUserInputSchema: z.ZodType<Prisma.AuditLogCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  entityType: z.string(),
  entityId: z.string(),
  flowId: z.string(),
  changeType: z.string(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  timestamp: z.coerce.date().optional()
}).strict();

export const AccountUpdateWithoutUserInputSchema: z.ZodType<Prisma.AccountUpdateWithoutUserInput> = z.object({
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateWithoutUserInput> = z.object({
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateManyWithoutUserInput> = z.object({
  access_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expires_at: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  id_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  oauth_token_secret: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerAccountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  refresh_token: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refresh_token_expires_in: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  session_state: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_type: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InstanceUpdateWithoutUserInputSchema: z.ZodType<Prisma.InstanceUpdateWithoutUserInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flows: z.lazy(() => FlowUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tags: z.lazy(() => TagUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict();

export const InstanceUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.InstanceUncheckedUpdateWithoutUserInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flows: z.lazy(() => FlowUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tags: z.lazy(() => TagUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional(),
  tagGroups: z.lazy(() => TagGroupUncheckedUpdateManyWithoutInstanceNestedInputSchema).optional()
}).strict();

export const InstanceUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.InstanceUncheckedUpdateManyWithoutUserInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUpdateWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateWithoutUserInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateWithoutUserInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyWithoutUserInput> = z.object({
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  expires: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionToken: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AuditLogUpdateWithoutUserInputSchema: z.ZodType<Prisma.AuditLogUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changeType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flow: z.lazy(() => FlowUpdateOneRequiredWithoutAuditLogsNestedInputSchema).optional()
}).strict();

export const AuditLogUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changeType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AuditLogUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.AuditLogUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entityId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  flowId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  changeType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  before: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  after: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const EdgeFindFirstArgsSchema: z.ZodType<Prisma.EdgeFindFirstArgs> = z.object({
  select: EdgeSelectSchema.optional(),
  include: EdgeIncludeSchema.optional(),
  where: EdgeWhereInputSchema.optional(),
  orderBy: z.union([ EdgeOrderByWithRelationInputSchema.array(),EdgeOrderByWithRelationInputSchema ]).optional(),
  cursor: EdgeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EdgeScalarFieldEnumSchema,EdgeScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const EdgeFindFirstOrThrowArgsSchema: z.ZodType<Prisma.EdgeFindFirstOrThrowArgs> = z.object({
  select: EdgeSelectSchema.optional(),
  include: EdgeIncludeSchema.optional(),
  where: EdgeWhereInputSchema.optional(),
  orderBy: z.union([ EdgeOrderByWithRelationInputSchema.array(),EdgeOrderByWithRelationInputSchema ]).optional(),
  cursor: EdgeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EdgeScalarFieldEnumSchema,EdgeScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const EdgeFindManyArgsSchema: z.ZodType<Prisma.EdgeFindManyArgs> = z.object({
  select: EdgeSelectSchema.optional(),
  include: EdgeIncludeSchema.optional(),
  where: EdgeWhereInputSchema.optional(),
  orderBy: z.union([ EdgeOrderByWithRelationInputSchema.array(),EdgeOrderByWithRelationInputSchema ]).optional(),
  cursor: EdgeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EdgeScalarFieldEnumSchema,EdgeScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const EdgeAggregateArgsSchema: z.ZodType<Prisma.EdgeAggregateArgs> = z.object({
  where: EdgeWhereInputSchema.optional(),
  orderBy: z.union([ EdgeOrderByWithRelationInputSchema.array(),EdgeOrderByWithRelationInputSchema ]).optional(),
  cursor: EdgeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const EdgeGroupByArgsSchema: z.ZodType<Prisma.EdgeGroupByArgs> = z.object({
  where: EdgeWhereInputSchema.optional(),
  orderBy: z.union([ EdgeOrderByWithAggregationInputSchema.array(),EdgeOrderByWithAggregationInputSchema ]).optional(),
  by: EdgeScalarFieldEnumSchema.array(),
  having: EdgeScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const EdgeFindUniqueArgsSchema: z.ZodType<Prisma.EdgeFindUniqueArgs> = z.object({
  select: EdgeSelectSchema.optional(),
  include: EdgeIncludeSchema.optional(),
  where: EdgeWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const EdgeFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.EdgeFindUniqueOrThrowArgs> = z.object({
  select: EdgeSelectSchema.optional(),
  include: EdgeIncludeSchema.optional(),
  where: EdgeWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowFindFirstArgsSchema: z.ZodType<Prisma.FlowFindFirstArgs> = z.object({
  select: FlowSelectSchema.optional(),
  include: FlowIncludeSchema.optional(),
  where: FlowWhereInputSchema.optional(),
  orderBy: z.union([ FlowOrderByWithRelationInputSchema.array(),FlowOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FlowScalarFieldEnumSchema,FlowScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowFindFirstOrThrowArgsSchema: z.ZodType<Prisma.FlowFindFirstOrThrowArgs> = z.object({
  select: FlowSelectSchema.optional(),
  include: FlowIncludeSchema.optional(),
  where: FlowWhereInputSchema.optional(),
  orderBy: z.union([ FlowOrderByWithRelationInputSchema.array(),FlowOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FlowScalarFieldEnumSchema,FlowScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowFindManyArgsSchema: z.ZodType<Prisma.FlowFindManyArgs> = z.object({
  select: FlowSelectSchema.optional(),
  include: FlowIncludeSchema.optional(),
  where: FlowWhereInputSchema.optional(),
  orderBy: z.union([ FlowOrderByWithRelationInputSchema.array(),FlowOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FlowScalarFieldEnumSchema,FlowScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowAggregateArgsSchema: z.ZodType<Prisma.FlowAggregateArgs> = z.object({
  where: FlowWhereInputSchema.optional(),
  orderBy: z.union([ FlowOrderByWithRelationInputSchema.array(),FlowOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const FlowGroupByArgsSchema: z.ZodType<Prisma.FlowGroupByArgs> = z.object({
  where: FlowWhereInputSchema.optional(),
  orderBy: z.union([ FlowOrderByWithAggregationInputSchema.array(),FlowOrderByWithAggregationInputSchema ]).optional(),
  by: FlowScalarFieldEnumSchema.array(),
  having: FlowScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const FlowFindUniqueArgsSchema: z.ZodType<Prisma.FlowFindUniqueArgs> = z.object({
  select: FlowSelectSchema.optional(),
  include: FlowIncludeSchema.optional(),
  where: FlowWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.FlowFindUniqueOrThrowArgs> = z.object({
  select: FlowSelectSchema.optional(),
  include: FlowIncludeSchema.optional(),
  where: FlowWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowEventFindFirstArgsSchema: z.ZodType<Prisma.FlowEventFindFirstArgs> = z.object({
  select: FlowEventSelectSchema.optional(),
  include: FlowEventIncludeSchema.optional(),
  where: FlowEventWhereInputSchema.optional(),
  orderBy: z.union([ FlowEventOrderByWithRelationInputSchema.array(),FlowEventOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowEventWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FlowEventScalarFieldEnumSchema,FlowEventScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowEventFindFirstOrThrowArgsSchema: z.ZodType<Prisma.FlowEventFindFirstOrThrowArgs> = z.object({
  select: FlowEventSelectSchema.optional(),
  include: FlowEventIncludeSchema.optional(),
  where: FlowEventWhereInputSchema.optional(),
  orderBy: z.union([ FlowEventOrderByWithRelationInputSchema.array(),FlowEventOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowEventWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FlowEventScalarFieldEnumSchema,FlowEventScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowEventFindManyArgsSchema: z.ZodType<Prisma.FlowEventFindManyArgs> = z.object({
  select: FlowEventSelectSchema.optional(),
  include: FlowEventIncludeSchema.optional(),
  where: FlowEventWhereInputSchema.optional(),
  orderBy: z.union([ FlowEventOrderByWithRelationInputSchema.array(),FlowEventOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowEventWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FlowEventScalarFieldEnumSchema,FlowEventScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowEventAggregateArgsSchema: z.ZodType<Prisma.FlowEventAggregateArgs> = z.object({
  where: FlowEventWhereInputSchema.optional(),
  orderBy: z.union([ FlowEventOrderByWithRelationInputSchema.array(),FlowEventOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowEventWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const FlowEventGroupByArgsSchema: z.ZodType<Prisma.FlowEventGroupByArgs> = z.object({
  where: FlowEventWhereInputSchema.optional(),
  orderBy: z.union([ FlowEventOrderByWithAggregationInputSchema.array(),FlowEventOrderByWithAggregationInputSchema ]).optional(),
  by: FlowEventScalarFieldEnumSchema.array(),
  having: FlowEventScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const FlowEventFindUniqueArgsSchema: z.ZodType<Prisma.FlowEventFindUniqueArgs> = z.object({
  select: FlowEventSelectSchema.optional(),
  include: FlowEventIncludeSchema.optional(),
  where: FlowEventWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowEventFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.FlowEventFindUniqueOrThrowArgs> = z.object({
  select: FlowEventSelectSchema.optional(),
  include: FlowEventIncludeSchema.optional(),
  where: FlowEventWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowRunFindFirstArgsSchema: z.ZodType<Prisma.FlowRunFindFirstArgs> = z.object({
  select: FlowRunSelectSchema.optional(),
  include: FlowRunIncludeSchema.optional(),
  where: FlowRunWhereInputSchema.optional(),
  orderBy: z.union([ FlowRunOrderByWithRelationInputSchema.array(),FlowRunOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowRunWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FlowRunScalarFieldEnumSchema,FlowRunScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowRunFindFirstOrThrowArgsSchema: z.ZodType<Prisma.FlowRunFindFirstOrThrowArgs> = z.object({
  select: FlowRunSelectSchema.optional(),
  include: FlowRunIncludeSchema.optional(),
  where: FlowRunWhereInputSchema.optional(),
  orderBy: z.union([ FlowRunOrderByWithRelationInputSchema.array(),FlowRunOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowRunWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FlowRunScalarFieldEnumSchema,FlowRunScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowRunFindManyArgsSchema: z.ZodType<Prisma.FlowRunFindManyArgs> = z.object({
  select: FlowRunSelectSchema.optional(),
  include: FlowRunIncludeSchema.optional(),
  where: FlowRunWhereInputSchema.optional(),
  orderBy: z.union([ FlowRunOrderByWithRelationInputSchema.array(),FlowRunOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowRunWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FlowRunScalarFieldEnumSchema,FlowRunScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowRunAggregateArgsSchema: z.ZodType<Prisma.FlowRunAggregateArgs> = z.object({
  where: FlowRunWhereInputSchema.optional(),
  orderBy: z.union([ FlowRunOrderByWithRelationInputSchema.array(),FlowRunOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowRunWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const FlowRunGroupByArgsSchema: z.ZodType<Prisma.FlowRunGroupByArgs> = z.object({
  where: FlowRunWhereInputSchema.optional(),
  orderBy: z.union([ FlowRunOrderByWithAggregationInputSchema.array(),FlowRunOrderByWithAggregationInputSchema ]).optional(),
  by: FlowRunScalarFieldEnumSchema.array(),
  having: FlowRunScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const FlowRunFindUniqueArgsSchema: z.ZodType<Prisma.FlowRunFindUniqueArgs> = z.object({
  select: FlowRunSelectSchema.optional(),
  include: FlowRunIncludeSchema.optional(),
  where: FlowRunWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowRunFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.FlowRunFindUniqueOrThrowArgs> = z.object({
  select: FlowRunSelectSchema.optional(),
  include: FlowRunIncludeSchema.optional(),
  where: FlowRunWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InfrastructureFindFirstArgsSchema: z.ZodType<Prisma.InfrastructureFindFirstArgs> = z.object({
  select: InfrastructureSelectSchema.optional(),
  include: InfrastructureIncludeSchema.optional(),
  where: InfrastructureWhereInputSchema.optional(),
  orderBy: z.union([ InfrastructureOrderByWithRelationInputSchema.array(),InfrastructureOrderByWithRelationInputSchema ]).optional(),
  cursor: InfrastructureWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ InfrastructureScalarFieldEnumSchema,InfrastructureScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InfrastructureFindFirstOrThrowArgsSchema: z.ZodType<Prisma.InfrastructureFindFirstOrThrowArgs> = z.object({
  select: InfrastructureSelectSchema.optional(),
  include: InfrastructureIncludeSchema.optional(),
  where: InfrastructureWhereInputSchema.optional(),
  orderBy: z.union([ InfrastructureOrderByWithRelationInputSchema.array(),InfrastructureOrderByWithRelationInputSchema ]).optional(),
  cursor: InfrastructureWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ InfrastructureScalarFieldEnumSchema,InfrastructureScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InfrastructureFindManyArgsSchema: z.ZodType<Prisma.InfrastructureFindManyArgs> = z.object({
  select: InfrastructureSelectSchema.optional(),
  include: InfrastructureIncludeSchema.optional(),
  where: InfrastructureWhereInputSchema.optional(),
  orderBy: z.union([ InfrastructureOrderByWithRelationInputSchema.array(),InfrastructureOrderByWithRelationInputSchema ]).optional(),
  cursor: InfrastructureWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ InfrastructureScalarFieldEnumSchema,InfrastructureScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InfrastructureAggregateArgsSchema: z.ZodType<Prisma.InfrastructureAggregateArgs> = z.object({
  where: InfrastructureWhereInputSchema.optional(),
  orderBy: z.union([ InfrastructureOrderByWithRelationInputSchema.array(),InfrastructureOrderByWithRelationInputSchema ]).optional(),
  cursor: InfrastructureWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const InfrastructureGroupByArgsSchema: z.ZodType<Prisma.InfrastructureGroupByArgs> = z.object({
  where: InfrastructureWhereInputSchema.optional(),
  orderBy: z.union([ InfrastructureOrderByWithAggregationInputSchema.array(),InfrastructureOrderByWithAggregationInputSchema ]).optional(),
  by: InfrastructureScalarFieldEnumSchema.array(),
  having: InfrastructureScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const InfrastructureFindUniqueArgsSchema: z.ZodType<Prisma.InfrastructureFindUniqueArgs> = z.object({
  select: InfrastructureSelectSchema.optional(),
  include: InfrastructureIncludeSchema.optional(),
  where: InfrastructureWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InfrastructureFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.InfrastructureFindUniqueOrThrowArgs> = z.object({
  select: InfrastructureSelectSchema.optional(),
  include: InfrastructureIncludeSchema.optional(),
  where: InfrastructureWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InstanceFindFirstArgsSchema: z.ZodType<Prisma.InstanceFindFirstArgs> = z.object({
  select: InstanceSelectSchema.optional(),
  include: InstanceIncludeSchema.optional(),
  where: InstanceWhereInputSchema.optional(),
  orderBy: z.union([ InstanceOrderByWithRelationInputSchema.array(),InstanceOrderByWithRelationInputSchema ]).optional(),
  cursor: InstanceWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ InstanceScalarFieldEnumSchema,InstanceScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InstanceFindFirstOrThrowArgsSchema: z.ZodType<Prisma.InstanceFindFirstOrThrowArgs> = z.object({
  select: InstanceSelectSchema.optional(),
  include: InstanceIncludeSchema.optional(),
  where: InstanceWhereInputSchema.optional(),
  orderBy: z.union([ InstanceOrderByWithRelationInputSchema.array(),InstanceOrderByWithRelationInputSchema ]).optional(),
  cursor: InstanceWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ InstanceScalarFieldEnumSchema,InstanceScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InstanceFindManyArgsSchema: z.ZodType<Prisma.InstanceFindManyArgs> = z.object({
  select: InstanceSelectSchema.optional(),
  include: InstanceIncludeSchema.optional(),
  where: InstanceWhereInputSchema.optional(),
  orderBy: z.union([ InstanceOrderByWithRelationInputSchema.array(),InstanceOrderByWithRelationInputSchema ]).optional(),
  cursor: InstanceWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ InstanceScalarFieldEnumSchema,InstanceScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InstanceAggregateArgsSchema: z.ZodType<Prisma.InstanceAggregateArgs> = z.object({
  where: InstanceWhereInputSchema.optional(),
  orderBy: z.union([ InstanceOrderByWithRelationInputSchema.array(),InstanceOrderByWithRelationInputSchema ]).optional(),
  cursor: InstanceWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const InstanceGroupByArgsSchema: z.ZodType<Prisma.InstanceGroupByArgs> = z.object({
  where: InstanceWhereInputSchema.optional(),
  orderBy: z.union([ InstanceOrderByWithAggregationInputSchema.array(),InstanceOrderByWithAggregationInputSchema ]).optional(),
  by: InstanceScalarFieldEnumSchema.array(),
  having: InstanceScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const InstanceFindUniqueArgsSchema: z.ZodType<Prisma.InstanceFindUniqueArgs> = z.object({
  select: InstanceSelectSchema.optional(),
  include: InstanceIncludeSchema.optional(),
  where: InstanceWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InstanceFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.InstanceFindUniqueOrThrowArgs> = z.object({
  select: InstanceSelectSchema.optional(),
  include: InstanceIncludeSchema.optional(),
  where: InstanceWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const NodeFindFirstArgsSchema: z.ZodType<Prisma.NodeFindFirstArgs> = z.object({
  select: NodeSelectSchema.optional(),
  include: NodeIncludeSchema.optional(),
  where: NodeWhereInputSchema.optional(),
  orderBy: z.union([ NodeOrderByWithRelationInputSchema.array(),NodeOrderByWithRelationInputSchema ]).optional(),
  cursor: NodeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ NodeScalarFieldEnumSchema,NodeScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const NodeFindFirstOrThrowArgsSchema: z.ZodType<Prisma.NodeFindFirstOrThrowArgs> = z.object({
  select: NodeSelectSchema.optional(),
  include: NodeIncludeSchema.optional(),
  where: NodeWhereInputSchema.optional(),
  orderBy: z.union([ NodeOrderByWithRelationInputSchema.array(),NodeOrderByWithRelationInputSchema ]).optional(),
  cursor: NodeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ NodeScalarFieldEnumSchema,NodeScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const NodeFindManyArgsSchema: z.ZodType<Prisma.NodeFindManyArgs> = z.object({
  select: NodeSelectSchema.optional(),
  include: NodeIncludeSchema.optional(),
  where: NodeWhereInputSchema.optional(),
  orderBy: z.union([ NodeOrderByWithRelationInputSchema.array(),NodeOrderByWithRelationInputSchema ]).optional(),
  cursor: NodeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ NodeScalarFieldEnumSchema,NodeScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const NodeAggregateArgsSchema: z.ZodType<Prisma.NodeAggregateArgs> = z.object({
  where: NodeWhereInputSchema.optional(),
  orderBy: z.union([ NodeOrderByWithRelationInputSchema.array(),NodeOrderByWithRelationInputSchema ]).optional(),
  cursor: NodeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const NodeGroupByArgsSchema: z.ZodType<Prisma.NodeGroupByArgs> = z.object({
  where: NodeWhereInputSchema.optional(),
  orderBy: z.union([ NodeOrderByWithAggregationInputSchema.array(),NodeOrderByWithAggregationInputSchema ]).optional(),
  by: NodeScalarFieldEnumSchema.array(),
  having: NodeScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const NodeFindUniqueArgsSchema: z.ZodType<Prisma.NodeFindUniqueArgs> = z.object({
  select: NodeSelectSchema.optional(),
  include: NodeIncludeSchema.optional(),
  where: NodeWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const NodeFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.NodeFindUniqueOrThrowArgs> = z.object({
  select: NodeSelectSchema.optional(),
  include: NodeIncludeSchema.optional(),
  where: NodeWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const ScheduledJobFindFirstArgsSchema: z.ZodType<Prisma.ScheduledJobFindFirstArgs> = z.object({
  select: ScheduledJobSelectSchema.optional(),
  include: ScheduledJobIncludeSchema.optional(),
  where: ScheduledJobWhereInputSchema.optional(),
  orderBy: z.union([ ScheduledJobOrderByWithRelationInputSchema.array(),ScheduledJobOrderByWithRelationInputSchema ]).optional(),
  cursor: ScheduledJobWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ScheduledJobScalarFieldEnumSchema,ScheduledJobScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const ScheduledJobFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ScheduledJobFindFirstOrThrowArgs> = z.object({
  select: ScheduledJobSelectSchema.optional(),
  include: ScheduledJobIncludeSchema.optional(),
  where: ScheduledJobWhereInputSchema.optional(),
  orderBy: z.union([ ScheduledJobOrderByWithRelationInputSchema.array(),ScheduledJobOrderByWithRelationInputSchema ]).optional(),
  cursor: ScheduledJobWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ScheduledJobScalarFieldEnumSchema,ScheduledJobScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const ScheduledJobFindManyArgsSchema: z.ZodType<Prisma.ScheduledJobFindManyArgs> = z.object({
  select: ScheduledJobSelectSchema.optional(),
  include: ScheduledJobIncludeSchema.optional(),
  where: ScheduledJobWhereInputSchema.optional(),
  orderBy: z.union([ ScheduledJobOrderByWithRelationInputSchema.array(),ScheduledJobOrderByWithRelationInputSchema ]).optional(),
  cursor: ScheduledJobWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ScheduledJobScalarFieldEnumSchema,ScheduledJobScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const ScheduledJobAggregateArgsSchema: z.ZodType<Prisma.ScheduledJobAggregateArgs> = z.object({
  where: ScheduledJobWhereInputSchema.optional(),
  orderBy: z.union([ ScheduledJobOrderByWithRelationInputSchema.array(),ScheduledJobOrderByWithRelationInputSchema ]).optional(),
  cursor: ScheduledJobWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ScheduledJobGroupByArgsSchema: z.ZodType<Prisma.ScheduledJobGroupByArgs> = z.object({
  where: ScheduledJobWhereInputSchema.optional(),
  orderBy: z.union([ ScheduledJobOrderByWithAggregationInputSchema.array(),ScheduledJobOrderByWithAggregationInputSchema ]).optional(),
  by: ScheduledJobScalarFieldEnumSchema.array(),
  having: ScheduledJobScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ScheduledJobFindUniqueArgsSchema: z.ZodType<Prisma.ScheduledJobFindUniqueArgs> = z.object({
  select: ScheduledJobSelectSchema.optional(),
  include: ScheduledJobIncludeSchema.optional(),
  where: ScheduledJobWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const ScheduledJobFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ScheduledJobFindUniqueOrThrowArgs> = z.object({
  select: ScheduledJobSelectSchema.optional(),
  include: ScheduledJobIncludeSchema.optional(),
  where: ScheduledJobWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SecretFindFirstArgsSchema: z.ZodType<Prisma.SecretFindFirstArgs> = z.object({
  select: SecretSelectSchema.optional(),
  include: SecretIncludeSchema.optional(),
  where: SecretWhereInputSchema.optional(),
  orderBy: z.union([ SecretOrderByWithRelationInputSchema.array(),SecretOrderByWithRelationInputSchema ]).optional(),
  cursor: SecretWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SecretScalarFieldEnumSchema,SecretScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SecretFindFirstOrThrowArgsSchema: z.ZodType<Prisma.SecretFindFirstOrThrowArgs> = z.object({
  select: SecretSelectSchema.optional(),
  include: SecretIncludeSchema.optional(),
  where: SecretWhereInputSchema.optional(),
  orderBy: z.union([ SecretOrderByWithRelationInputSchema.array(),SecretOrderByWithRelationInputSchema ]).optional(),
  cursor: SecretWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SecretScalarFieldEnumSchema,SecretScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SecretFindManyArgsSchema: z.ZodType<Prisma.SecretFindManyArgs> = z.object({
  select: SecretSelectSchema.optional(),
  include: SecretIncludeSchema.optional(),
  where: SecretWhereInputSchema.optional(),
  orderBy: z.union([ SecretOrderByWithRelationInputSchema.array(),SecretOrderByWithRelationInputSchema ]).optional(),
  cursor: SecretWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SecretScalarFieldEnumSchema,SecretScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SecretAggregateArgsSchema: z.ZodType<Prisma.SecretAggregateArgs> = z.object({
  where: SecretWhereInputSchema.optional(),
  orderBy: z.union([ SecretOrderByWithRelationInputSchema.array(),SecretOrderByWithRelationInputSchema ]).optional(),
  cursor: SecretWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SecretGroupByArgsSchema: z.ZodType<Prisma.SecretGroupByArgs> = z.object({
  where: SecretWhereInputSchema.optional(),
  orderBy: z.union([ SecretOrderByWithAggregationInputSchema.array(),SecretOrderByWithAggregationInputSchema ]).optional(),
  by: SecretScalarFieldEnumSchema.array(),
  having: SecretScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SecretFindUniqueArgsSchema: z.ZodType<Prisma.SecretFindUniqueArgs> = z.object({
  select: SecretSelectSchema.optional(),
  include: SecretIncludeSchema.optional(),
  where: SecretWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SecretFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.SecretFindUniqueOrThrowArgs> = z.object({
  select: SecretSelectSchema.optional(),
  include: SecretIncludeSchema.optional(),
  where: SecretWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagFindFirstArgsSchema: z.ZodType<Prisma.TagFindFirstArgs> = z.object({
  select: TagSelectSchema.optional(),
  include: TagIncludeSchema.optional(),
  where: TagWhereInputSchema.optional(),
  orderBy: z.union([ TagOrderByWithRelationInputSchema.array(),TagOrderByWithRelationInputSchema ]).optional(),
  cursor: TagWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TagScalarFieldEnumSchema,TagScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TagFindFirstOrThrowArgs> = z.object({
  select: TagSelectSchema.optional(),
  include: TagIncludeSchema.optional(),
  where: TagWhereInputSchema.optional(),
  orderBy: z.union([ TagOrderByWithRelationInputSchema.array(),TagOrderByWithRelationInputSchema ]).optional(),
  cursor: TagWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TagScalarFieldEnumSchema,TagScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagFindManyArgsSchema: z.ZodType<Prisma.TagFindManyArgs> = z.object({
  select: TagSelectSchema.optional(),
  include: TagIncludeSchema.optional(),
  where: TagWhereInputSchema.optional(),
  orderBy: z.union([ TagOrderByWithRelationInputSchema.array(),TagOrderByWithRelationInputSchema ]).optional(),
  cursor: TagWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TagScalarFieldEnumSchema,TagScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagAggregateArgsSchema: z.ZodType<Prisma.TagAggregateArgs> = z.object({
  where: TagWhereInputSchema.optional(),
  orderBy: z.union([ TagOrderByWithRelationInputSchema.array(),TagOrderByWithRelationInputSchema ]).optional(),
  cursor: TagWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TagGroupByArgsSchema: z.ZodType<Prisma.TagGroupByArgs> = z.object({
  where: TagWhereInputSchema.optional(),
  orderBy: z.union([ TagOrderByWithAggregationInputSchema.array(),TagOrderByWithAggregationInputSchema ]).optional(),
  by: TagScalarFieldEnumSchema.array(),
  having: TagScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TagFindUniqueArgsSchema: z.ZodType<Prisma.TagFindUniqueArgs> = z.object({
  select: TagSelectSchema.optional(),
  include: TagIncludeSchema.optional(),
  where: TagWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TagFindUniqueOrThrowArgs> = z.object({
  select: TagSelectSchema.optional(),
  include: TagIncludeSchema.optional(),
  where: TagWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagGroupFindFirstArgsSchema: z.ZodType<Prisma.TagGroupFindFirstArgs> = z.object({
  select: TagGroupSelectSchema.optional(),
  include: TagGroupIncludeSchema.optional(),
  where: TagGroupWhereInputSchema.optional(),
  orderBy: z.union([ TagGroupOrderByWithRelationInputSchema.array(),TagGroupOrderByWithRelationInputSchema ]).optional(),
  cursor: TagGroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TagGroupScalarFieldEnumSchema,TagGroupScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagGroupFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TagGroupFindFirstOrThrowArgs> = z.object({
  select: TagGroupSelectSchema.optional(),
  include: TagGroupIncludeSchema.optional(),
  where: TagGroupWhereInputSchema.optional(),
  orderBy: z.union([ TagGroupOrderByWithRelationInputSchema.array(),TagGroupOrderByWithRelationInputSchema ]).optional(),
  cursor: TagGroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TagGroupScalarFieldEnumSchema,TagGroupScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagGroupFindManyArgsSchema: z.ZodType<Prisma.TagGroupFindManyArgs> = z.object({
  select: TagGroupSelectSchema.optional(),
  include: TagGroupIncludeSchema.optional(),
  where: TagGroupWhereInputSchema.optional(),
  orderBy: z.union([ TagGroupOrderByWithRelationInputSchema.array(),TagGroupOrderByWithRelationInputSchema ]).optional(),
  cursor: TagGroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TagGroupScalarFieldEnumSchema,TagGroupScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagGroupAggregateArgsSchema: z.ZodType<Prisma.TagGroupAggregateArgs> = z.object({
  where: TagGroupWhereInputSchema.optional(),
  orderBy: z.union([ TagGroupOrderByWithRelationInputSchema.array(),TagGroupOrderByWithRelationInputSchema ]).optional(),
  cursor: TagGroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TagGroupGroupByArgsSchema: z.ZodType<Prisma.TagGroupGroupByArgs> = z.object({
  where: TagGroupWhereInputSchema.optional(),
  orderBy: z.union([ TagGroupOrderByWithAggregationInputSchema.array(),TagGroupOrderByWithAggregationInputSchema ]).optional(),
  by: TagGroupScalarFieldEnumSchema.array(),
  having: TagGroupScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TagGroupFindUniqueArgsSchema: z.ZodType<Prisma.TagGroupFindUniqueArgs> = z.object({
  select: TagGroupSelectSchema.optional(),
  include: TagGroupIncludeSchema.optional(),
  where: TagGroupWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagGroupFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TagGroupFindUniqueOrThrowArgs> = z.object({
  select: TagGroupSelectSchema.optional(),
  include: TagGroupIncludeSchema.optional(),
  where: TagGroupWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TestCaseFindFirstArgsSchema: z.ZodType<Prisma.TestCaseFindFirstArgs> = z.object({
  select: TestCaseSelectSchema.optional(),
  include: TestCaseIncludeSchema.optional(),
  where: TestCaseWhereInputSchema.optional(),
  orderBy: z.union([ TestCaseOrderByWithRelationInputSchema.array(),TestCaseOrderByWithRelationInputSchema ]).optional(),
  cursor: TestCaseWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TestCaseScalarFieldEnumSchema,TestCaseScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TestCaseFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TestCaseFindFirstOrThrowArgs> = z.object({
  select: TestCaseSelectSchema.optional(),
  include: TestCaseIncludeSchema.optional(),
  where: TestCaseWhereInputSchema.optional(),
  orderBy: z.union([ TestCaseOrderByWithRelationInputSchema.array(),TestCaseOrderByWithRelationInputSchema ]).optional(),
  cursor: TestCaseWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TestCaseScalarFieldEnumSchema,TestCaseScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TestCaseFindManyArgsSchema: z.ZodType<Prisma.TestCaseFindManyArgs> = z.object({
  select: TestCaseSelectSchema.optional(),
  include: TestCaseIncludeSchema.optional(),
  where: TestCaseWhereInputSchema.optional(),
  orderBy: z.union([ TestCaseOrderByWithRelationInputSchema.array(),TestCaseOrderByWithRelationInputSchema ]).optional(),
  cursor: TestCaseWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TestCaseScalarFieldEnumSchema,TestCaseScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TestCaseAggregateArgsSchema: z.ZodType<Prisma.TestCaseAggregateArgs> = z.object({
  where: TestCaseWhereInputSchema.optional(),
  orderBy: z.union([ TestCaseOrderByWithRelationInputSchema.array(),TestCaseOrderByWithRelationInputSchema ]).optional(),
  cursor: TestCaseWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TestCaseGroupByArgsSchema: z.ZodType<Prisma.TestCaseGroupByArgs> = z.object({
  where: TestCaseWhereInputSchema.optional(),
  orderBy: z.union([ TestCaseOrderByWithAggregationInputSchema.array(),TestCaseOrderByWithAggregationInputSchema ]).optional(),
  by: TestCaseScalarFieldEnumSchema.array(),
  having: TestCaseScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const TestCaseFindUniqueArgsSchema: z.ZodType<Prisma.TestCaseFindUniqueArgs> = z.object({
  select: TestCaseSelectSchema.optional(),
  include: TestCaseIncludeSchema.optional(),
  where: TestCaseWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TestCaseFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TestCaseFindUniqueOrThrowArgs> = z.object({
  select: TestCaseSelectSchema.optional(),
  include: TestCaseIncludeSchema.optional(),
  where: TestCaseWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AccountFindFirstArgsSchema: z.ZodType<Prisma.AccountFindFirstArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountScalarFieldEnumSchema,AccountScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AccountFindFirstOrThrowArgsSchema: z.ZodType<Prisma.AccountFindFirstOrThrowArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountScalarFieldEnumSchema,AccountScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AccountFindManyArgsSchema: z.ZodType<Prisma.AccountFindManyArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountScalarFieldEnumSchema,AccountScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AccountAggregateArgsSchema: z.ZodType<Prisma.AccountAggregateArgs> = z.object({
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const AccountGroupByArgsSchema: z.ZodType<Prisma.AccountGroupByArgs> = z.object({
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithAggregationInputSchema.array(),AccountOrderByWithAggregationInputSchema ]).optional(),
  by: AccountScalarFieldEnumSchema.array(),
  having: AccountScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const AccountFindUniqueArgsSchema: z.ZodType<Prisma.AccountFindUniqueArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AccountFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.AccountFindUniqueOrThrowArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SessionFindFirstArgsSchema: z.ZodType<Prisma.SessionFindFirstArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SessionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.SessionFindFirstOrThrowArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SessionFindManyArgsSchema: z.ZodType<Prisma.SessionFindManyArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SessionAggregateArgsSchema: z.ZodType<Prisma.SessionAggregateArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SessionGroupByArgsSchema: z.ZodType<Prisma.SessionGroupByArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithAggregationInputSchema.array(),SessionOrderByWithAggregationInputSchema ]).optional(),
  by: SessionScalarFieldEnumSchema.array(),
  having: SessionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SessionFindUniqueArgsSchema: z.ZodType<Prisma.SessionFindUniqueArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SessionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.SessionFindUniqueOrThrowArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(),UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(),
  having: UserScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const VerificationTokenFindFirstArgsSchema: z.ZodType<Prisma.VerificationTokenFindFirstArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereInputSchema.optional(),
  orderBy: z.union([ VerificationTokenOrderByWithRelationInputSchema.array(),VerificationTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VerificationTokenScalarFieldEnumSchema,VerificationTokenScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const VerificationTokenFindFirstOrThrowArgsSchema: z.ZodType<Prisma.VerificationTokenFindFirstOrThrowArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereInputSchema.optional(),
  orderBy: z.union([ VerificationTokenOrderByWithRelationInputSchema.array(),VerificationTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VerificationTokenScalarFieldEnumSchema,VerificationTokenScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const VerificationTokenFindManyArgsSchema: z.ZodType<Prisma.VerificationTokenFindManyArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereInputSchema.optional(),
  orderBy: z.union([ VerificationTokenOrderByWithRelationInputSchema.array(),VerificationTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VerificationTokenScalarFieldEnumSchema,VerificationTokenScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const VerificationTokenAggregateArgsSchema: z.ZodType<Prisma.VerificationTokenAggregateArgs> = z.object({
  where: VerificationTokenWhereInputSchema.optional(),
  orderBy: z.union([ VerificationTokenOrderByWithRelationInputSchema.array(),VerificationTokenOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const VerificationTokenGroupByArgsSchema: z.ZodType<Prisma.VerificationTokenGroupByArgs> = z.object({
  where: VerificationTokenWhereInputSchema.optional(),
  orderBy: z.union([ VerificationTokenOrderByWithAggregationInputSchema.array(),VerificationTokenOrderByWithAggregationInputSchema ]).optional(),
  by: VerificationTokenScalarFieldEnumSchema.array(),
  having: VerificationTokenScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const VerificationTokenFindUniqueArgsSchema: z.ZodType<Prisma.VerificationTokenFindUniqueArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const VerificationTokenFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.VerificationTokenFindUniqueOrThrowArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AuditLogFindFirstArgsSchema: z.ZodType<Prisma.AuditLogFindFirstArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereInputSchema.optional(),
  orderBy: z.union([ AuditLogOrderByWithRelationInputSchema.array(),AuditLogOrderByWithRelationInputSchema ]).optional(),
  cursor: AuditLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AuditLogScalarFieldEnumSchema,AuditLogScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AuditLogFindFirstOrThrowArgsSchema: z.ZodType<Prisma.AuditLogFindFirstOrThrowArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereInputSchema.optional(),
  orderBy: z.union([ AuditLogOrderByWithRelationInputSchema.array(),AuditLogOrderByWithRelationInputSchema ]).optional(),
  cursor: AuditLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AuditLogScalarFieldEnumSchema,AuditLogScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AuditLogFindManyArgsSchema: z.ZodType<Prisma.AuditLogFindManyArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereInputSchema.optional(),
  orderBy: z.union([ AuditLogOrderByWithRelationInputSchema.array(),AuditLogOrderByWithRelationInputSchema ]).optional(),
  cursor: AuditLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AuditLogScalarFieldEnumSchema,AuditLogScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AuditLogAggregateArgsSchema: z.ZodType<Prisma.AuditLogAggregateArgs> = z.object({
  where: AuditLogWhereInputSchema.optional(),
  orderBy: z.union([ AuditLogOrderByWithRelationInputSchema.array(),AuditLogOrderByWithRelationInputSchema ]).optional(),
  cursor: AuditLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const AuditLogGroupByArgsSchema: z.ZodType<Prisma.AuditLogGroupByArgs> = z.object({
  where: AuditLogWhereInputSchema.optional(),
  orderBy: z.union([ AuditLogOrderByWithAggregationInputSchema.array(),AuditLogOrderByWithAggregationInputSchema ]).optional(),
  by: AuditLogScalarFieldEnumSchema.array(),
  having: AuditLogScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const AuditLogFindUniqueArgsSchema: z.ZodType<Prisma.AuditLogFindUniqueArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AuditLogFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.AuditLogFindUniqueOrThrowArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowStatisticsFindFirstArgsSchema: z.ZodType<Prisma.FlowStatisticsFindFirstArgs> = z.object({
  select: FlowStatisticsSelectSchema.optional(),
  include: FlowStatisticsIncludeSchema.optional(),
  where: FlowStatisticsWhereInputSchema.optional(),
  orderBy: z.union([ FlowStatisticsOrderByWithRelationInputSchema.array(),FlowStatisticsOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowStatisticsWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FlowStatisticsScalarFieldEnumSchema,FlowStatisticsScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowStatisticsFindFirstOrThrowArgsSchema: z.ZodType<Prisma.FlowStatisticsFindFirstOrThrowArgs> = z.object({
  select: FlowStatisticsSelectSchema.optional(),
  include: FlowStatisticsIncludeSchema.optional(),
  where: FlowStatisticsWhereInputSchema.optional(),
  orderBy: z.union([ FlowStatisticsOrderByWithRelationInputSchema.array(),FlowStatisticsOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowStatisticsWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FlowStatisticsScalarFieldEnumSchema,FlowStatisticsScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowStatisticsFindManyArgsSchema: z.ZodType<Prisma.FlowStatisticsFindManyArgs> = z.object({
  select: FlowStatisticsSelectSchema.optional(),
  include: FlowStatisticsIncludeSchema.optional(),
  where: FlowStatisticsWhereInputSchema.optional(),
  orderBy: z.union([ FlowStatisticsOrderByWithRelationInputSchema.array(),FlowStatisticsOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowStatisticsWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FlowStatisticsScalarFieldEnumSchema,FlowStatisticsScalarFieldEnumSchema.array() ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowStatisticsAggregateArgsSchema: z.ZodType<Prisma.FlowStatisticsAggregateArgs> = z.object({
  where: FlowStatisticsWhereInputSchema.optional(),
  orderBy: z.union([ FlowStatisticsOrderByWithRelationInputSchema.array(),FlowStatisticsOrderByWithRelationInputSchema ]).optional(),
  cursor: FlowStatisticsWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const FlowStatisticsGroupByArgsSchema: z.ZodType<Prisma.FlowStatisticsGroupByArgs> = z.object({
  where: FlowStatisticsWhereInputSchema.optional(),
  orderBy: z.union([ FlowStatisticsOrderByWithAggregationInputSchema.array(),FlowStatisticsOrderByWithAggregationInputSchema ]).optional(),
  by: FlowStatisticsScalarFieldEnumSchema.array(),
  having: FlowStatisticsScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const FlowStatisticsFindUniqueArgsSchema: z.ZodType<Prisma.FlowStatisticsFindUniqueArgs> = z.object({
  select: FlowStatisticsSelectSchema.optional(),
  include: FlowStatisticsIncludeSchema.optional(),
  where: FlowStatisticsWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowStatisticsFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.FlowStatisticsFindUniqueOrThrowArgs> = z.object({
  select: FlowStatisticsSelectSchema.optional(),
  include: FlowStatisticsIncludeSchema.optional(),
  where: FlowStatisticsWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const EdgeCreateArgsSchema: z.ZodType<Prisma.EdgeCreateArgs> = z.object({
  select: EdgeSelectSchema.optional(),
  include: EdgeIncludeSchema.optional(),
  data: z.union([ EdgeCreateInputSchema,EdgeUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const EdgeUpsertArgsSchema: z.ZodType<Prisma.EdgeUpsertArgs> = z.object({
  select: EdgeSelectSchema.optional(),
  include: EdgeIncludeSchema.optional(),
  where: EdgeWhereUniqueInputSchema,
  create: z.union([ EdgeCreateInputSchema,EdgeUncheckedCreateInputSchema ]),
  update: z.union([ EdgeUpdateInputSchema,EdgeUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const EdgeCreateManyArgsSchema: z.ZodType<Prisma.EdgeCreateManyArgs> = z.object({
  data: z.union([ EdgeCreateManyInputSchema,EdgeCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const EdgeCreateManyAndReturnArgsSchema: z.ZodType<Prisma.EdgeCreateManyAndReturnArgs> = z.object({
  data: z.union([ EdgeCreateManyInputSchema,EdgeCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const EdgeDeleteArgsSchema: z.ZodType<Prisma.EdgeDeleteArgs> = z.object({
  select: EdgeSelectSchema.optional(),
  include: EdgeIncludeSchema.optional(),
  where: EdgeWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const EdgeUpdateArgsSchema: z.ZodType<Prisma.EdgeUpdateArgs> = z.object({
  select: EdgeSelectSchema.optional(),
  include: EdgeIncludeSchema.optional(),
  data: z.union([ EdgeUpdateInputSchema,EdgeUncheckedUpdateInputSchema ]),
  where: EdgeWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const EdgeUpdateManyArgsSchema: z.ZodType<Prisma.EdgeUpdateManyArgs> = z.object({
  data: z.union([ EdgeUpdateManyMutationInputSchema,EdgeUncheckedUpdateManyInputSchema ]),
  where: EdgeWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const EdgeUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.EdgeUpdateManyAndReturnArgs> = z.object({
  data: z.union([ EdgeUpdateManyMutationInputSchema,EdgeUncheckedUpdateManyInputSchema ]),
  where: EdgeWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const EdgeDeleteManyArgsSchema: z.ZodType<Prisma.EdgeDeleteManyArgs> = z.object({
  where: EdgeWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FlowCreateArgsSchema: z.ZodType<Prisma.FlowCreateArgs> = z.object({
  select: FlowSelectSchema.optional(),
  include: FlowIncludeSchema.optional(),
  data: z.union([ FlowCreateInputSchema,FlowUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowUpsertArgsSchema: z.ZodType<Prisma.FlowUpsertArgs> = z.object({
  select: FlowSelectSchema.optional(),
  include: FlowIncludeSchema.optional(),
  where: FlowWhereUniqueInputSchema,
  create: z.union([ FlowCreateInputSchema,FlowUncheckedCreateInputSchema ]),
  update: z.union([ FlowUpdateInputSchema,FlowUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowCreateManyArgsSchema: z.ZodType<Prisma.FlowCreateManyArgs> = z.object({
  data: z.union([ FlowCreateManyInputSchema,FlowCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const FlowCreateManyAndReturnArgsSchema: z.ZodType<Prisma.FlowCreateManyAndReturnArgs> = z.object({
  data: z.union([ FlowCreateManyInputSchema,FlowCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const FlowDeleteArgsSchema: z.ZodType<Prisma.FlowDeleteArgs> = z.object({
  select: FlowSelectSchema.optional(),
  include: FlowIncludeSchema.optional(),
  where: FlowWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowUpdateArgsSchema: z.ZodType<Prisma.FlowUpdateArgs> = z.object({
  select: FlowSelectSchema.optional(),
  include: FlowIncludeSchema.optional(),
  data: z.union([ FlowUpdateInputSchema,FlowUncheckedUpdateInputSchema ]),
  where: FlowWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowUpdateManyArgsSchema: z.ZodType<Prisma.FlowUpdateManyArgs> = z.object({
  data: z.union([ FlowUpdateManyMutationInputSchema,FlowUncheckedUpdateManyInputSchema ]),
  where: FlowWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FlowUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.FlowUpdateManyAndReturnArgs> = z.object({
  data: z.union([ FlowUpdateManyMutationInputSchema,FlowUncheckedUpdateManyInputSchema ]),
  where: FlowWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FlowDeleteManyArgsSchema: z.ZodType<Prisma.FlowDeleteManyArgs> = z.object({
  where: FlowWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FlowEventCreateArgsSchema: z.ZodType<Prisma.FlowEventCreateArgs> = z.object({
  select: FlowEventSelectSchema.optional(),
  include: FlowEventIncludeSchema.optional(),
  data: z.union([ FlowEventCreateInputSchema,FlowEventUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowEventUpsertArgsSchema: z.ZodType<Prisma.FlowEventUpsertArgs> = z.object({
  select: FlowEventSelectSchema.optional(),
  include: FlowEventIncludeSchema.optional(),
  where: FlowEventWhereUniqueInputSchema,
  create: z.union([ FlowEventCreateInputSchema,FlowEventUncheckedCreateInputSchema ]),
  update: z.union([ FlowEventUpdateInputSchema,FlowEventUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowEventCreateManyArgsSchema: z.ZodType<Prisma.FlowEventCreateManyArgs> = z.object({
  data: z.union([ FlowEventCreateManyInputSchema,FlowEventCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const FlowEventCreateManyAndReturnArgsSchema: z.ZodType<Prisma.FlowEventCreateManyAndReturnArgs> = z.object({
  data: z.union([ FlowEventCreateManyInputSchema,FlowEventCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const FlowEventDeleteArgsSchema: z.ZodType<Prisma.FlowEventDeleteArgs> = z.object({
  select: FlowEventSelectSchema.optional(),
  include: FlowEventIncludeSchema.optional(),
  where: FlowEventWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowEventUpdateArgsSchema: z.ZodType<Prisma.FlowEventUpdateArgs> = z.object({
  select: FlowEventSelectSchema.optional(),
  include: FlowEventIncludeSchema.optional(),
  data: z.union([ FlowEventUpdateInputSchema,FlowEventUncheckedUpdateInputSchema ]),
  where: FlowEventWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowEventUpdateManyArgsSchema: z.ZodType<Prisma.FlowEventUpdateManyArgs> = z.object({
  data: z.union([ FlowEventUpdateManyMutationInputSchema,FlowEventUncheckedUpdateManyInputSchema ]),
  where: FlowEventWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FlowEventUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.FlowEventUpdateManyAndReturnArgs> = z.object({
  data: z.union([ FlowEventUpdateManyMutationInputSchema,FlowEventUncheckedUpdateManyInputSchema ]),
  where: FlowEventWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FlowEventDeleteManyArgsSchema: z.ZodType<Prisma.FlowEventDeleteManyArgs> = z.object({
  where: FlowEventWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FlowRunCreateArgsSchema: z.ZodType<Prisma.FlowRunCreateArgs> = z.object({
  select: FlowRunSelectSchema.optional(),
  include: FlowRunIncludeSchema.optional(),
  data: z.union([ FlowRunCreateInputSchema,FlowRunUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowRunUpsertArgsSchema: z.ZodType<Prisma.FlowRunUpsertArgs> = z.object({
  select: FlowRunSelectSchema.optional(),
  include: FlowRunIncludeSchema.optional(),
  where: FlowRunWhereUniqueInputSchema,
  create: z.union([ FlowRunCreateInputSchema,FlowRunUncheckedCreateInputSchema ]),
  update: z.union([ FlowRunUpdateInputSchema,FlowRunUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowRunCreateManyArgsSchema: z.ZodType<Prisma.FlowRunCreateManyArgs> = z.object({
  data: z.union([ FlowRunCreateManyInputSchema,FlowRunCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const FlowRunCreateManyAndReturnArgsSchema: z.ZodType<Prisma.FlowRunCreateManyAndReturnArgs> = z.object({
  data: z.union([ FlowRunCreateManyInputSchema,FlowRunCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const FlowRunDeleteArgsSchema: z.ZodType<Prisma.FlowRunDeleteArgs> = z.object({
  select: FlowRunSelectSchema.optional(),
  include: FlowRunIncludeSchema.optional(),
  where: FlowRunWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowRunUpdateArgsSchema: z.ZodType<Prisma.FlowRunUpdateArgs> = z.object({
  select: FlowRunSelectSchema.optional(),
  include: FlowRunIncludeSchema.optional(),
  data: z.union([ FlowRunUpdateInputSchema,FlowRunUncheckedUpdateInputSchema ]),
  where: FlowRunWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowRunUpdateManyArgsSchema: z.ZodType<Prisma.FlowRunUpdateManyArgs> = z.object({
  data: z.union([ FlowRunUpdateManyMutationInputSchema,FlowRunUncheckedUpdateManyInputSchema ]),
  where: FlowRunWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FlowRunUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.FlowRunUpdateManyAndReturnArgs> = z.object({
  data: z.union([ FlowRunUpdateManyMutationInputSchema,FlowRunUncheckedUpdateManyInputSchema ]),
  where: FlowRunWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FlowRunDeleteManyArgsSchema: z.ZodType<Prisma.FlowRunDeleteManyArgs> = z.object({
  where: FlowRunWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const InfrastructureCreateArgsSchema: z.ZodType<Prisma.InfrastructureCreateArgs> = z.object({
  select: InfrastructureSelectSchema.optional(),
  include: InfrastructureIncludeSchema.optional(),
  data: z.union([ InfrastructureCreateInputSchema,InfrastructureUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InfrastructureUpsertArgsSchema: z.ZodType<Prisma.InfrastructureUpsertArgs> = z.object({
  select: InfrastructureSelectSchema.optional(),
  include: InfrastructureIncludeSchema.optional(),
  where: InfrastructureWhereUniqueInputSchema,
  create: z.union([ InfrastructureCreateInputSchema,InfrastructureUncheckedCreateInputSchema ]),
  update: z.union([ InfrastructureUpdateInputSchema,InfrastructureUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InfrastructureCreateManyArgsSchema: z.ZodType<Prisma.InfrastructureCreateManyArgs> = z.object({
  data: z.union([ InfrastructureCreateManyInputSchema,InfrastructureCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const InfrastructureCreateManyAndReturnArgsSchema: z.ZodType<Prisma.InfrastructureCreateManyAndReturnArgs> = z.object({
  data: z.union([ InfrastructureCreateManyInputSchema,InfrastructureCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const InfrastructureDeleteArgsSchema: z.ZodType<Prisma.InfrastructureDeleteArgs> = z.object({
  select: InfrastructureSelectSchema.optional(),
  include: InfrastructureIncludeSchema.optional(),
  where: InfrastructureWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InfrastructureUpdateArgsSchema: z.ZodType<Prisma.InfrastructureUpdateArgs> = z.object({
  select: InfrastructureSelectSchema.optional(),
  include: InfrastructureIncludeSchema.optional(),
  data: z.union([ InfrastructureUpdateInputSchema,InfrastructureUncheckedUpdateInputSchema ]),
  where: InfrastructureWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InfrastructureUpdateManyArgsSchema: z.ZodType<Prisma.InfrastructureUpdateManyArgs> = z.object({
  data: z.union([ InfrastructureUpdateManyMutationInputSchema,InfrastructureUncheckedUpdateManyInputSchema ]),
  where: InfrastructureWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const InfrastructureUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.InfrastructureUpdateManyAndReturnArgs> = z.object({
  data: z.union([ InfrastructureUpdateManyMutationInputSchema,InfrastructureUncheckedUpdateManyInputSchema ]),
  where: InfrastructureWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const InfrastructureDeleteManyArgsSchema: z.ZodType<Prisma.InfrastructureDeleteManyArgs> = z.object({
  where: InfrastructureWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const InstanceCreateArgsSchema: z.ZodType<Prisma.InstanceCreateArgs> = z.object({
  select: InstanceSelectSchema.optional(),
  include: InstanceIncludeSchema.optional(),
  data: z.union([ InstanceCreateInputSchema,InstanceUncheckedCreateInputSchema ]).optional(),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InstanceUpsertArgsSchema: z.ZodType<Prisma.InstanceUpsertArgs> = z.object({
  select: InstanceSelectSchema.optional(),
  include: InstanceIncludeSchema.optional(),
  where: InstanceWhereUniqueInputSchema,
  create: z.union([ InstanceCreateInputSchema,InstanceUncheckedCreateInputSchema ]),
  update: z.union([ InstanceUpdateInputSchema,InstanceUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InstanceCreateManyArgsSchema: z.ZodType<Prisma.InstanceCreateManyArgs> = z.object({
  data: z.union([ InstanceCreateManyInputSchema,InstanceCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const InstanceCreateManyAndReturnArgsSchema: z.ZodType<Prisma.InstanceCreateManyAndReturnArgs> = z.object({
  data: z.union([ InstanceCreateManyInputSchema,InstanceCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const InstanceDeleteArgsSchema: z.ZodType<Prisma.InstanceDeleteArgs> = z.object({
  select: InstanceSelectSchema.optional(),
  include: InstanceIncludeSchema.optional(),
  where: InstanceWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InstanceUpdateArgsSchema: z.ZodType<Prisma.InstanceUpdateArgs> = z.object({
  select: InstanceSelectSchema.optional(),
  include: InstanceIncludeSchema.optional(),
  data: z.union([ InstanceUpdateInputSchema,InstanceUncheckedUpdateInputSchema ]),
  where: InstanceWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const InstanceUpdateManyArgsSchema: z.ZodType<Prisma.InstanceUpdateManyArgs> = z.object({
  data: z.union([ InstanceUpdateManyMutationInputSchema,InstanceUncheckedUpdateManyInputSchema ]),
  where: InstanceWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const InstanceUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.InstanceUpdateManyAndReturnArgs> = z.object({
  data: z.union([ InstanceUpdateManyMutationInputSchema,InstanceUncheckedUpdateManyInputSchema ]),
  where: InstanceWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const InstanceDeleteManyArgsSchema: z.ZodType<Prisma.InstanceDeleteManyArgs> = z.object({
  where: InstanceWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const NodeCreateArgsSchema: z.ZodType<Prisma.NodeCreateArgs> = z.object({
  select: NodeSelectSchema.optional(),
  include: NodeIncludeSchema.optional(),
  data: z.union([ NodeCreateInputSchema,NodeUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const NodeUpsertArgsSchema: z.ZodType<Prisma.NodeUpsertArgs> = z.object({
  select: NodeSelectSchema.optional(),
  include: NodeIncludeSchema.optional(),
  where: NodeWhereUniqueInputSchema,
  create: z.union([ NodeCreateInputSchema,NodeUncheckedCreateInputSchema ]),
  update: z.union([ NodeUpdateInputSchema,NodeUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const NodeCreateManyArgsSchema: z.ZodType<Prisma.NodeCreateManyArgs> = z.object({
  data: z.union([ NodeCreateManyInputSchema,NodeCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const NodeCreateManyAndReturnArgsSchema: z.ZodType<Prisma.NodeCreateManyAndReturnArgs> = z.object({
  data: z.union([ NodeCreateManyInputSchema,NodeCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const NodeDeleteArgsSchema: z.ZodType<Prisma.NodeDeleteArgs> = z.object({
  select: NodeSelectSchema.optional(),
  include: NodeIncludeSchema.optional(),
  where: NodeWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const NodeUpdateArgsSchema: z.ZodType<Prisma.NodeUpdateArgs> = z.object({
  select: NodeSelectSchema.optional(),
  include: NodeIncludeSchema.optional(),
  data: z.union([ NodeUpdateInputSchema,NodeUncheckedUpdateInputSchema ]),
  where: NodeWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const NodeUpdateManyArgsSchema: z.ZodType<Prisma.NodeUpdateManyArgs> = z.object({
  data: z.union([ NodeUpdateManyMutationInputSchema,NodeUncheckedUpdateManyInputSchema ]),
  where: NodeWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const NodeUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.NodeUpdateManyAndReturnArgs> = z.object({
  data: z.union([ NodeUpdateManyMutationInputSchema,NodeUncheckedUpdateManyInputSchema ]),
  where: NodeWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const NodeDeleteManyArgsSchema: z.ZodType<Prisma.NodeDeleteManyArgs> = z.object({
  where: NodeWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ScheduledJobCreateArgsSchema: z.ZodType<Prisma.ScheduledJobCreateArgs> = z.object({
  select: ScheduledJobSelectSchema.optional(),
  include: ScheduledJobIncludeSchema.optional(),
  data: z.union([ ScheduledJobCreateInputSchema,ScheduledJobUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const ScheduledJobUpsertArgsSchema: z.ZodType<Prisma.ScheduledJobUpsertArgs> = z.object({
  select: ScheduledJobSelectSchema.optional(),
  include: ScheduledJobIncludeSchema.optional(),
  where: ScheduledJobWhereUniqueInputSchema,
  create: z.union([ ScheduledJobCreateInputSchema,ScheduledJobUncheckedCreateInputSchema ]),
  update: z.union([ ScheduledJobUpdateInputSchema,ScheduledJobUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const ScheduledJobCreateManyArgsSchema: z.ZodType<Prisma.ScheduledJobCreateManyArgs> = z.object({
  data: z.union([ ScheduledJobCreateManyInputSchema,ScheduledJobCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ScheduledJobCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ScheduledJobCreateManyAndReturnArgs> = z.object({
  data: z.union([ ScheduledJobCreateManyInputSchema,ScheduledJobCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ScheduledJobDeleteArgsSchema: z.ZodType<Prisma.ScheduledJobDeleteArgs> = z.object({
  select: ScheduledJobSelectSchema.optional(),
  include: ScheduledJobIncludeSchema.optional(),
  where: ScheduledJobWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const ScheduledJobUpdateArgsSchema: z.ZodType<Prisma.ScheduledJobUpdateArgs> = z.object({
  select: ScheduledJobSelectSchema.optional(),
  include: ScheduledJobIncludeSchema.optional(),
  data: z.union([ ScheduledJobUpdateInputSchema,ScheduledJobUncheckedUpdateInputSchema ]),
  where: ScheduledJobWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const ScheduledJobUpdateManyArgsSchema: z.ZodType<Prisma.ScheduledJobUpdateManyArgs> = z.object({
  data: z.union([ ScheduledJobUpdateManyMutationInputSchema,ScheduledJobUncheckedUpdateManyInputSchema ]),
  where: ScheduledJobWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ScheduledJobUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ScheduledJobUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ScheduledJobUpdateManyMutationInputSchema,ScheduledJobUncheckedUpdateManyInputSchema ]),
  where: ScheduledJobWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const ScheduledJobDeleteManyArgsSchema: z.ZodType<Prisma.ScheduledJobDeleteManyArgs> = z.object({
  where: ScheduledJobWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const SecretCreateArgsSchema: z.ZodType<Prisma.SecretCreateArgs> = z.object({
  select: SecretSelectSchema.optional(),
  include: SecretIncludeSchema.optional(),
  data: z.union([ SecretCreateInputSchema,SecretUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SecretUpsertArgsSchema: z.ZodType<Prisma.SecretUpsertArgs> = z.object({
  select: SecretSelectSchema.optional(),
  include: SecretIncludeSchema.optional(),
  where: SecretWhereUniqueInputSchema,
  create: z.union([ SecretCreateInputSchema,SecretUncheckedCreateInputSchema ]),
  update: z.union([ SecretUpdateInputSchema,SecretUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SecretCreateManyArgsSchema: z.ZodType<Prisma.SecretCreateManyArgs> = z.object({
  data: z.union([ SecretCreateManyInputSchema,SecretCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SecretCreateManyAndReturnArgsSchema: z.ZodType<Prisma.SecretCreateManyAndReturnArgs> = z.object({
  data: z.union([ SecretCreateManyInputSchema,SecretCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SecretDeleteArgsSchema: z.ZodType<Prisma.SecretDeleteArgs> = z.object({
  select: SecretSelectSchema.optional(),
  include: SecretIncludeSchema.optional(),
  where: SecretWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SecretUpdateArgsSchema: z.ZodType<Prisma.SecretUpdateArgs> = z.object({
  select: SecretSelectSchema.optional(),
  include: SecretIncludeSchema.optional(),
  data: z.union([ SecretUpdateInputSchema,SecretUncheckedUpdateInputSchema ]),
  where: SecretWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SecretUpdateManyArgsSchema: z.ZodType<Prisma.SecretUpdateManyArgs> = z.object({
  data: z.union([ SecretUpdateManyMutationInputSchema,SecretUncheckedUpdateManyInputSchema ]),
  where: SecretWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const SecretUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.SecretUpdateManyAndReturnArgs> = z.object({
  data: z.union([ SecretUpdateManyMutationInputSchema,SecretUncheckedUpdateManyInputSchema ]),
  where: SecretWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const SecretDeleteManyArgsSchema: z.ZodType<Prisma.SecretDeleteManyArgs> = z.object({
  where: SecretWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const TagCreateArgsSchema: z.ZodType<Prisma.TagCreateArgs> = z.object({
  select: TagSelectSchema.optional(),
  include: TagIncludeSchema.optional(),
  data: z.union([ TagCreateInputSchema,TagUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagUpsertArgsSchema: z.ZodType<Prisma.TagUpsertArgs> = z.object({
  select: TagSelectSchema.optional(),
  include: TagIncludeSchema.optional(),
  where: TagWhereUniqueInputSchema,
  create: z.union([ TagCreateInputSchema,TagUncheckedCreateInputSchema ]),
  update: z.union([ TagUpdateInputSchema,TagUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagCreateManyArgsSchema: z.ZodType<Prisma.TagCreateManyArgs> = z.object({
  data: z.union([ TagCreateManyInputSchema,TagCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const TagCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TagCreateManyAndReturnArgs> = z.object({
  data: z.union([ TagCreateManyInputSchema,TagCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const TagDeleteArgsSchema: z.ZodType<Prisma.TagDeleteArgs> = z.object({
  select: TagSelectSchema.optional(),
  include: TagIncludeSchema.optional(),
  where: TagWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagUpdateArgsSchema: z.ZodType<Prisma.TagUpdateArgs> = z.object({
  select: TagSelectSchema.optional(),
  include: TagIncludeSchema.optional(),
  data: z.union([ TagUpdateInputSchema,TagUncheckedUpdateInputSchema ]),
  where: TagWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagUpdateManyArgsSchema: z.ZodType<Prisma.TagUpdateManyArgs> = z.object({
  data: z.union([ TagUpdateManyMutationInputSchema,TagUncheckedUpdateManyInputSchema ]),
  where: TagWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const TagUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.TagUpdateManyAndReturnArgs> = z.object({
  data: z.union([ TagUpdateManyMutationInputSchema,TagUncheckedUpdateManyInputSchema ]),
  where: TagWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const TagDeleteManyArgsSchema: z.ZodType<Prisma.TagDeleteManyArgs> = z.object({
  where: TagWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const TagGroupCreateArgsSchema: z.ZodType<Prisma.TagGroupCreateArgs> = z.object({
  select: TagGroupSelectSchema.optional(),
  include: TagGroupIncludeSchema.optional(),
  data: z.union([ TagGroupCreateInputSchema,TagGroupUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagGroupUpsertArgsSchema: z.ZodType<Prisma.TagGroupUpsertArgs> = z.object({
  select: TagGroupSelectSchema.optional(),
  include: TagGroupIncludeSchema.optional(),
  where: TagGroupWhereUniqueInputSchema,
  create: z.union([ TagGroupCreateInputSchema,TagGroupUncheckedCreateInputSchema ]),
  update: z.union([ TagGroupUpdateInputSchema,TagGroupUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagGroupCreateManyArgsSchema: z.ZodType<Prisma.TagGroupCreateManyArgs> = z.object({
  data: z.union([ TagGroupCreateManyInputSchema,TagGroupCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const TagGroupCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TagGroupCreateManyAndReturnArgs> = z.object({
  data: z.union([ TagGroupCreateManyInputSchema,TagGroupCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const TagGroupDeleteArgsSchema: z.ZodType<Prisma.TagGroupDeleteArgs> = z.object({
  select: TagGroupSelectSchema.optional(),
  include: TagGroupIncludeSchema.optional(),
  where: TagGroupWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagGroupUpdateArgsSchema: z.ZodType<Prisma.TagGroupUpdateArgs> = z.object({
  select: TagGroupSelectSchema.optional(),
  include: TagGroupIncludeSchema.optional(),
  data: z.union([ TagGroupUpdateInputSchema,TagGroupUncheckedUpdateInputSchema ]),
  where: TagGroupWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TagGroupUpdateManyArgsSchema: z.ZodType<Prisma.TagGroupUpdateManyArgs> = z.object({
  data: z.union([ TagGroupUpdateManyMutationInputSchema,TagGroupUncheckedUpdateManyInputSchema ]),
  where: TagGroupWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const TagGroupUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.TagGroupUpdateManyAndReturnArgs> = z.object({
  data: z.union([ TagGroupUpdateManyMutationInputSchema,TagGroupUncheckedUpdateManyInputSchema ]),
  where: TagGroupWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const TagGroupDeleteManyArgsSchema: z.ZodType<Prisma.TagGroupDeleteManyArgs> = z.object({
  where: TagGroupWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const TestCaseCreateArgsSchema: z.ZodType<Prisma.TestCaseCreateArgs> = z.object({
  select: TestCaseSelectSchema.optional(),
  include: TestCaseIncludeSchema.optional(),
  data: z.union([ TestCaseCreateInputSchema,TestCaseUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TestCaseUpsertArgsSchema: z.ZodType<Prisma.TestCaseUpsertArgs> = z.object({
  select: TestCaseSelectSchema.optional(),
  include: TestCaseIncludeSchema.optional(),
  where: TestCaseWhereUniqueInputSchema,
  create: z.union([ TestCaseCreateInputSchema,TestCaseUncheckedCreateInputSchema ]),
  update: z.union([ TestCaseUpdateInputSchema,TestCaseUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TestCaseCreateManyArgsSchema: z.ZodType<Prisma.TestCaseCreateManyArgs> = z.object({
  data: z.union([ TestCaseCreateManyInputSchema,TestCaseCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const TestCaseCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TestCaseCreateManyAndReturnArgs> = z.object({
  data: z.union([ TestCaseCreateManyInputSchema,TestCaseCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const TestCaseDeleteArgsSchema: z.ZodType<Prisma.TestCaseDeleteArgs> = z.object({
  select: TestCaseSelectSchema.optional(),
  include: TestCaseIncludeSchema.optional(),
  where: TestCaseWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TestCaseUpdateArgsSchema: z.ZodType<Prisma.TestCaseUpdateArgs> = z.object({
  select: TestCaseSelectSchema.optional(),
  include: TestCaseIncludeSchema.optional(),
  data: z.union([ TestCaseUpdateInputSchema,TestCaseUncheckedUpdateInputSchema ]),
  where: TestCaseWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const TestCaseUpdateManyArgsSchema: z.ZodType<Prisma.TestCaseUpdateManyArgs> = z.object({
  data: z.union([ TestCaseUpdateManyMutationInputSchema,TestCaseUncheckedUpdateManyInputSchema ]),
  where: TestCaseWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const TestCaseUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.TestCaseUpdateManyAndReturnArgs> = z.object({
  data: z.union([ TestCaseUpdateManyMutationInputSchema,TestCaseUncheckedUpdateManyInputSchema ]),
  where: TestCaseWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const TestCaseDeleteManyArgsSchema: z.ZodType<Prisma.TestCaseDeleteManyArgs> = z.object({
  where: TestCaseWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const AccountCreateArgsSchema: z.ZodType<Prisma.AccountCreateArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  data: z.union([ AccountCreateInputSchema,AccountUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AccountUpsertArgsSchema: z.ZodType<Prisma.AccountUpsertArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereUniqueInputSchema,
  create: z.union([ AccountCreateInputSchema,AccountUncheckedCreateInputSchema ]),
  update: z.union([ AccountUpdateInputSchema,AccountUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AccountCreateManyArgsSchema: z.ZodType<Prisma.AccountCreateManyArgs> = z.object({
  data: z.union([ AccountCreateManyInputSchema,AccountCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const AccountCreateManyAndReturnArgsSchema: z.ZodType<Prisma.AccountCreateManyAndReturnArgs> = z.object({
  data: z.union([ AccountCreateManyInputSchema,AccountCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const AccountDeleteArgsSchema: z.ZodType<Prisma.AccountDeleteArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  where: AccountWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AccountUpdateArgsSchema: z.ZodType<Prisma.AccountUpdateArgs> = z.object({
  select: AccountSelectSchema.optional(),
  include: AccountIncludeSchema.optional(),
  data: z.union([ AccountUpdateInputSchema,AccountUncheckedUpdateInputSchema ]),
  where: AccountWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AccountUpdateManyArgsSchema: z.ZodType<Prisma.AccountUpdateManyArgs> = z.object({
  data: z.union([ AccountUpdateManyMutationInputSchema,AccountUncheckedUpdateManyInputSchema ]),
  where: AccountWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const AccountUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.AccountUpdateManyAndReturnArgs> = z.object({
  data: z.union([ AccountUpdateManyMutationInputSchema,AccountUncheckedUpdateManyInputSchema ]),
  where: AccountWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const AccountDeleteManyArgsSchema: z.ZodType<Prisma.AccountDeleteManyArgs> = z.object({
  where: AccountWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const SessionCreateArgsSchema: z.ZodType<Prisma.SessionCreateArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  data: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SessionUpsertArgsSchema: z.ZodType<Prisma.SessionUpsertArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
  create: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
  update: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SessionCreateManyArgsSchema: z.ZodType<Prisma.SessionCreateManyArgs> = z.object({
  data: z.union([ SessionCreateManyInputSchema,SessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SessionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.SessionCreateManyAndReturnArgs> = z.object({
  data: z.union([ SessionCreateManyInputSchema,SessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SessionDeleteArgsSchema: z.ZodType<Prisma.SessionDeleteArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SessionUpdateArgsSchema: z.ZodType<Prisma.SessionUpdateArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  data: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
  where: SessionWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const SessionUpdateManyArgsSchema: z.ZodType<Prisma.SessionUpdateManyArgs> = z.object({
  data: z.union([ SessionUpdateManyMutationInputSchema,SessionUncheckedUpdateManyInputSchema ]),
  where: SessionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const SessionUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.SessionUpdateManyAndReturnArgs> = z.object({
  data: z.union([ SessionUpdateManyMutationInputSchema,SessionUncheckedUpdateManyInputSchema ]),
  where: SessionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const SessionDeleteManyArgsSchema: z.ZodType<Prisma.SessionDeleteManyArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  create: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const UserUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserUpdateManyAndReturnArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const VerificationTokenCreateArgsSchema: z.ZodType<Prisma.VerificationTokenCreateArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  data: z.union([ VerificationTokenCreateInputSchema,VerificationTokenUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const VerificationTokenUpsertArgsSchema: z.ZodType<Prisma.VerificationTokenUpsertArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereUniqueInputSchema,
  create: z.union([ VerificationTokenCreateInputSchema,VerificationTokenUncheckedCreateInputSchema ]),
  update: z.union([ VerificationTokenUpdateInputSchema,VerificationTokenUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const VerificationTokenCreateManyArgsSchema: z.ZodType<Prisma.VerificationTokenCreateManyArgs> = z.object({
  data: z.union([ VerificationTokenCreateManyInputSchema,VerificationTokenCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const VerificationTokenCreateManyAndReturnArgsSchema: z.ZodType<Prisma.VerificationTokenCreateManyAndReturnArgs> = z.object({
  data: z.union([ VerificationTokenCreateManyInputSchema,VerificationTokenCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const VerificationTokenDeleteArgsSchema: z.ZodType<Prisma.VerificationTokenDeleteArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  where: VerificationTokenWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const VerificationTokenUpdateArgsSchema: z.ZodType<Prisma.VerificationTokenUpdateArgs> = z.object({
  select: VerificationTokenSelectSchema.optional(),
  data: z.union([ VerificationTokenUpdateInputSchema,VerificationTokenUncheckedUpdateInputSchema ]),
  where: VerificationTokenWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const VerificationTokenUpdateManyArgsSchema: z.ZodType<Prisma.VerificationTokenUpdateManyArgs> = z.object({
  data: z.union([ VerificationTokenUpdateManyMutationInputSchema,VerificationTokenUncheckedUpdateManyInputSchema ]),
  where: VerificationTokenWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const VerificationTokenUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.VerificationTokenUpdateManyAndReturnArgs> = z.object({
  data: z.union([ VerificationTokenUpdateManyMutationInputSchema,VerificationTokenUncheckedUpdateManyInputSchema ]),
  where: VerificationTokenWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const VerificationTokenDeleteManyArgsSchema: z.ZodType<Prisma.VerificationTokenDeleteManyArgs> = z.object({
  where: VerificationTokenWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const AuditLogCreateArgsSchema: z.ZodType<Prisma.AuditLogCreateArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  data: z.union([ AuditLogCreateInputSchema,AuditLogUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AuditLogUpsertArgsSchema: z.ZodType<Prisma.AuditLogUpsertArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereUniqueInputSchema,
  create: z.union([ AuditLogCreateInputSchema,AuditLogUncheckedCreateInputSchema ]),
  update: z.union([ AuditLogUpdateInputSchema,AuditLogUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AuditLogCreateManyArgsSchema: z.ZodType<Prisma.AuditLogCreateManyArgs> = z.object({
  data: z.union([ AuditLogCreateManyInputSchema,AuditLogCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const AuditLogCreateManyAndReturnArgsSchema: z.ZodType<Prisma.AuditLogCreateManyAndReturnArgs> = z.object({
  data: z.union([ AuditLogCreateManyInputSchema,AuditLogCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const AuditLogDeleteArgsSchema: z.ZodType<Prisma.AuditLogDeleteArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  where: AuditLogWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AuditLogUpdateArgsSchema: z.ZodType<Prisma.AuditLogUpdateArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  include: AuditLogIncludeSchema.optional(),
  data: z.union([ AuditLogUpdateInputSchema,AuditLogUncheckedUpdateInputSchema ]),
  where: AuditLogWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const AuditLogUpdateManyArgsSchema: z.ZodType<Prisma.AuditLogUpdateManyArgs> = z.object({
  data: z.union([ AuditLogUpdateManyMutationInputSchema,AuditLogUncheckedUpdateManyInputSchema ]),
  where: AuditLogWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const AuditLogUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.AuditLogUpdateManyAndReturnArgs> = z.object({
  data: z.union([ AuditLogUpdateManyMutationInputSchema,AuditLogUncheckedUpdateManyInputSchema ]),
  where: AuditLogWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const AuditLogDeleteManyArgsSchema: z.ZodType<Prisma.AuditLogDeleteManyArgs> = z.object({
  where: AuditLogWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FlowStatisticsCreateArgsSchema: z.ZodType<Prisma.FlowStatisticsCreateArgs> = z.object({
  select: FlowStatisticsSelectSchema.optional(),
  include: FlowStatisticsIncludeSchema.optional(),
  data: z.union([ FlowStatisticsCreateInputSchema,FlowStatisticsUncheckedCreateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowStatisticsUpsertArgsSchema: z.ZodType<Prisma.FlowStatisticsUpsertArgs> = z.object({
  select: FlowStatisticsSelectSchema.optional(),
  include: FlowStatisticsIncludeSchema.optional(),
  where: FlowStatisticsWhereUniqueInputSchema,
  create: z.union([ FlowStatisticsCreateInputSchema,FlowStatisticsUncheckedCreateInputSchema ]),
  update: z.union([ FlowStatisticsUpdateInputSchema,FlowStatisticsUncheckedUpdateInputSchema ]),
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowStatisticsCreateManyArgsSchema: z.ZodType<Prisma.FlowStatisticsCreateManyArgs> = z.object({
  data: z.union([ FlowStatisticsCreateManyInputSchema,FlowStatisticsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const FlowStatisticsCreateManyAndReturnArgsSchema: z.ZodType<Prisma.FlowStatisticsCreateManyAndReturnArgs> = z.object({
  data: z.union([ FlowStatisticsCreateManyInputSchema,FlowStatisticsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const FlowStatisticsDeleteArgsSchema: z.ZodType<Prisma.FlowStatisticsDeleteArgs> = z.object({
  select: FlowStatisticsSelectSchema.optional(),
  include: FlowStatisticsIncludeSchema.optional(),
  where: FlowStatisticsWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowStatisticsUpdateArgsSchema: z.ZodType<Prisma.FlowStatisticsUpdateArgs> = z.object({
  select: FlowStatisticsSelectSchema.optional(),
  include: FlowStatisticsIncludeSchema.optional(),
  data: z.union([ FlowStatisticsUpdateInputSchema,FlowStatisticsUncheckedUpdateInputSchema ]),
  where: FlowStatisticsWhereUniqueInputSchema,
  relationLoadStrategy: RelationLoadStrategySchema.optional(),
}).strict() ;

export const FlowStatisticsUpdateManyArgsSchema: z.ZodType<Prisma.FlowStatisticsUpdateManyArgs> = z.object({
  data: z.union([ FlowStatisticsUpdateManyMutationInputSchema,FlowStatisticsUncheckedUpdateManyInputSchema ]),
  where: FlowStatisticsWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FlowStatisticsUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.FlowStatisticsUpdateManyAndReturnArgs> = z.object({
  data: z.union([ FlowStatisticsUpdateManyMutationInputSchema,FlowStatisticsUncheckedUpdateManyInputSchema ]),
  where: FlowStatisticsWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const FlowStatisticsDeleteManyArgsSchema: z.ZodType<Prisma.FlowStatisticsDeleteManyArgs> = z.object({
  where: FlowStatisticsWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;