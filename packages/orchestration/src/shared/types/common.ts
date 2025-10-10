/**
 * Common types used throughout the orchestration package
 */

/**
 * JSON-serializable value
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

/**
 * JSON object
 */
export interface JsonObject {
  [key: string]: JsonValue;
}

/**
 * JSON array
 */
interface JsonArray extends Array<JsonValue> {}

/**
 * Generic input/output data for workflows
 */
export type WorkflowData = JsonObject;

/**
 * Generic metadata object
 */
export type Metadata = Record<string, JsonValue>;

/**
 * Error details object
 */
export interface ErrorDetails {
  code?: string;
  message?: string;
  stack?: string;
  [key: string]: JsonValue | undefined;
}

/**
 * Context object for operations
 */
interface OperationContext {
  workflowId?: string;
  executionId?: string;
  stepId?: string;
  userId?: string;
  organizationId?: string;
  [key: string]: JsonValue | undefined;
}

/**
 * Step input/output type
 */
type StepData = JsonObject;

/**
 * Event payload type
 */
export type EventPayload = JsonObject;

/**
 * Schedule data type
 */
interface ScheduleData {
  id: string;
  workflowId: string;
  cron?: string;
  timezone?: string;
  enabled: boolean;
  nextRun?: Date;
  lastRun?: Date;
  metadata?: Metadata;
}
