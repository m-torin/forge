// src/integrations/aws/eventbridge/validation.ts

import { OperationContext } from '#/lib/integrationFactory';
import {
  EventBridgeErrorCode,
  EventBridgeFactoryError,
  createEventBridgeValidationError,
  type EventBridgeErrorMetadata,
} from './errors';
import { PutEventsCommandInput } from '@aws-sdk/client-eventbridge';

// ----------------------------------------
// Validation Helper Functions
// ----------------------------------------

/**
 * Validates the size of an event.
 * Ensures that the event does not exceed AWS's maximum allowed size.
 *
 * @param event - The event object to validate.
 * @throws {EventBridgeValidationError} If the event size exceeds the maximum limit.
 */
export const validateEventSize = (event: any): void => {
  const MAX_EVENT_SIZE = 256 * 1024; // 256 KB

  const eventSize = new TextEncoder().encode(JSON.stringify(event)).length;
  if (eventSize > MAX_EVENT_SIZE) {
    throw createEventBridgeValidationError(
      `Event size ${eventSize} bytes exceeds AWS limit of ${MAX_EVENT_SIZE} bytes`,
      EventBridgeErrorCode.EVENT_TOO_LARGE,
      'ValidateEventSize',
      { eventSize, limit: MAX_EVENT_SIZE },
    );
  }
};

/**
 * Validates the structure of an event pattern.
 * Ensures that the event pattern is a valid JSON object.
 *
 * @param pattern - The event pattern as a JSON string.
 * @throws {EventBridgeValidationError} If the event pattern structure is invalid.
 */
export const validateEventPattern = (pattern: string): void => {
  try {
    const parsedPattern = JSON.parse(pattern);
    if (typeof parsedPattern !== 'object' || Array.isArray(parsedPattern)) {
      throw new Error('Event pattern must be a JSON object');
    }
    // Additional pattern-specific validations can be added here
  } catch (error) {
    throw createEventBridgeValidationError(
      `Invalid event pattern structure: ${(error as Error).message}`,
      EventBridgeErrorCode.EVENT_INVALID_FORMAT,
      'ValidateEventPattern',
      { eventPattern: pattern },
    );
  }
};

/**
 * Validates the name of an EventBridge rule.
 * Ensures that the rule name adheres to AWS naming conventions.
 *
 * @param ruleName - The name of the EventBridge rule.
 * @throws {EventBridgeValidationError} If the rule name format is invalid.
 */
export const validateRuleName = (ruleName: string): void => {
  const RULE_NAME_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

  if (!RULE_NAME_REGEX.test(ruleName)) {
    throw createEventBridgeValidationError(
      `Invalid rule name format: ${ruleName}`,
      EventBridgeErrorCode.RULE_INVALID_NAME,
      'ValidateRuleName',
      { ruleName },
    );
  }
};

/**
 * Validates the ARN format for EventBridge event buses.
 * Ensures that the provided ARN adheres to AWS ARN formatting rules.
 *
 * @param arn - The ARN of the EventBridge event bus.
 * @throws {EventBridgeValidationError} If the ARN format is invalid.
 */
export const validateEventBusArn = (arn: string): void => {
  const ARN_REGEX =
    /^arn:aws:eventbridge:[a-z\-0-9]+:\d{12}:event-bus\/[\w\-]+$/;

  if (!ARN_REGEX.test(arn)) {
    throw createEventBridgeValidationError(
      `Invalid EventBus ARN format: ${arn}`,
      EventBridgeErrorCode.EVENT_BUS_INVALID_ARN,
      'ValidateEventBusArn',
      { eventBusArn: arn },
    );
  }
};

/**
 * Validates target configurations for EventBridge rules.
 * Ensures that each target has a valid ID and Target ARN.
 *
 * @param target - The target configuration object.
 * @throws {EventBridgeValidationError} If the target configuration is invalid.
 */
export const validateTargetConfiguration = (target: any): void => {
  if (!target.Id || typeof target.Id !== 'string') {
    throw createEventBridgeValidationError(
      'Target must have a valid Id',
      EventBridgeErrorCode.TARGET_INVALID_ID,
      'ValidateTargetConfiguration',
      { targetId: target.Id },
    );
  }

  if (!target.TargetArn || typeof target.TargetArn !== 'string') {
    throw createEventBridgeValidationError(
      'Target must have a valid TargetArn',
      EventBridgeErrorCode.TARGET_INVALID_ARN,
      'ValidateTargetConfiguration',
      { targetArn: target.TargetArn },
    );
  }

  // Add more target-specific validations as needed
};

/**
 * Validates IAM policies attached to EventBridge resources.
 * Ensures that the policy is a valid JSON and contains necessary statements.
 *
 * @param policy - The IAM policy as a JSON string.
 * @throws {EventBridgeValidationError} If the IAM policy format is invalid.
 */
export const validateIAMPolicy = (policy: string): void => {
  try {
    const parsedPolicy = JSON.parse(policy);
    if (!parsedPolicy.Statement || !Array.isArray(parsedPolicy.Statement)) {
      throw new Error('Policy must contain a Statement array');
    }
    // Add more specific IAM policy validations as needed
  } catch (error) {
    throw createEventBridgeValidationError(
      `Invalid IAM policy format: ${(error as Error).message}`,
      EventBridgeErrorCode.POLICY_INVALID_FORMAT,
      'ValidateIAMPolicy',
      { policy },
    );
  }
};

/**
 * Validates cross-account access in the IAM policy.
 * Ensures that only authorized accounts have access.
 *
 * @param policy - The IAM policy as a JSON string.
 * @throws {EventBridgeValidationError} If unauthorized accounts are present in the policy.
 */
export const validateCrossAccountAccess = (policy: string): void => {
  try {
    const parsedPolicy = JSON.parse(policy);
    const allowedAccounts = process.env.AWS_ACCOUNT_ID ? [process.env.AWS_ACCOUNT_ID] : []; // Use environment variable

    parsedPolicy.Statement.forEach((statement: any) => {
      const principals = statement.Principal?.AWS;
      if (principals) {
        const principalsArray = Array.isArray(principals)
          ? principals
          : [principals];
        principalsArray.forEach((principal: string) => {
          if (!allowedAccounts.includes(principal)) {
            throw new Error(`Unauthorized account in policy: ${principal}`);
          }
        });
      }
    });
  } catch (error) {
    throw createEventBridgeValidationError(
      `Invalid cross-account access in policy: ${(error as Error).message}`,
      EventBridgeErrorCode.POLICY_INVALID_ACCESS,
      'ValidateCrossAccountAccess',
      { policy },
    );
  }
};

/**
 * Validates the structure of IAM Policy Statements.
 * Ensures that policies adhere to specific action and principal constraints.
 *
 * @param policy - The IAM policy as a JSON string.
 * @throws {EventBridgeValidationError} If policy statements are invalid.
 */
export const validatePolicyStatements = (policy: string): void => {
  try {
    const parsedPolicy = JSON.parse(policy);
    parsedPolicy.Statement.forEach((statement: any) => {
      if (statement.Effect !== 'Allow') return;

      // Restrict to specific actions
      const allowedActions = [
        'events:PutEvents',
        'events:PutRule',
        'events:PutTargets',
      ];
      const actions = Array.isArray(statement.Action)
        ? statement.Action
        : [statement.Action];
      actions.forEach((action: string) => {
        if (!allowedActions.includes(action)) {
          throw new Error(`Disallowed action in policy: ${action}`);
        }
      });

      // Restrict principals to specific services or accounts
      const allowedPrincipals = process.env.AWS_ACCOUNT_ID ? [`arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:root`] : []; // Use environment variable
      const principals = Array.isArray(statement.Principal?.AWS)
        ? statement.Principal.AWS
        : statement.Principal?.AWS
          ? [statement.Principal.AWS]
          : [];

      principals.forEach((principal: string) => {
        if (!allowedPrincipals.includes(principal)) {
          throw new Error(`Disallowed principal in policy: ${principal}`);
        }
      });
    });
  } catch (error) {
    throw createEventBridgeValidationError(
      `Invalid policy statements: ${(error as Error).message}`,
      EventBridgeErrorCode.POLICY_STATEMENTS_INVALID,
      'ValidatePolicyStatements',
      { policy },
    );
  }
};

// ----------------------------------------
// Main Validation Function
// ----------------------------------------

/**
 * Main validation function for EventBridge inputs.
 * Delegates to specific validation functions based on the operation name.
 *
 * @param input - The input parameters for the EventBridge operation.
 * @param operationName - The name of the EventBridge operation.
 * @param options - Optional validation options.
 * @param context - Optional operation context.
 * @returns {ValidationResult} The result of the validation.
 */
export const validateEventBridgeInput = (
  input: any,
  operationName: string,
  options: EventBridgeValidationOptions = DEFAULT_VALIDATION_OPTIONS,
  context?: OperationContext,
): ValidationResult => {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    metadata: {},
  };

  try {
    switch (operationName) {
      case 'PutEvents':
        validatePutEventsInput(input, options.putEvents);
        break;
      case 'PutRule':
      case 'DescribeRule':
      case 'EnableRule':
      case 'DisableRule':
      case 'DeleteRule':
      case 'ListRules':
        validateRuleInput(input, options.rule);
        break;
      case 'PutTargets':
      case 'RemoveTargets':
      case 'ListTargetsByRule':
        validateTargetInput(input, options.target);
        break;
      case 'CreateEventBus':
      case 'DeleteEventBus':
      case 'DescribeEventBus':
      case 'UpdateEventBus':
      case 'ListEventBuses':
        validateEventBusInput(input, options.eventBus);
        break;
      // Add more cases for other operations as needed
      default:
        // Generic validation or skip
        break;
    }

    // Add validation metadata to context if provided
    if (context) {
      const newMetadata: Record<string, unknown> = {
        ...context.metadata,
        validation: {
          performed: true,
          timestamp: new Date().toISOString(),
          options: { ...options },
        },
      };
      // Assigning a new object to replace readonly Record<string, unknown>
      (context as any).metadata = newMetadata;
    }
  } catch (error) {
    result.valid = false;
    if (error instanceof EventBridgeFactoryError) {
      result.errors.push({
        eventBridgeErrorCode: error.metadata?.eventBridgeErrorCode,
        message: error.message,
        operation: operationName,
        timestamp: new Date().toISOString(),
        ...error.metadata,
      } as EventBridgeErrorMetadata);
    } else if (error instanceof Error) {
      result.errors.push({
        eventBridgeErrorCode: EventBridgeErrorCode.GENERAL_VALIDATION_ERROR,
        message: error.message,
        operation: operationName,
        timestamp: new Date().toISOString(),
      } as EventBridgeErrorMetadata);
    }
  }

  return result;
};

// ----------------------------------------
// Specific Validation Functions
// ----------------------------------------

/**
 * Validates input for the PutEvents operation.
 *
 * @param input - The input parameters for the PutEvents operation.
 * @param options - Optional validation options specific to PutEvents.
 * @throws {EventBridgeValidationError} If the input is invalid.
 */
export const validatePutEventsInput = (
  input: PutEventsCommandInput,
  options: EventBridgeValidationOptions['putEvents'] = DEFAULT_VALIDATION_OPTIONS.putEvents,
): void => {
  if (
    !input.Entries ||
    !Array.isArray(input.Entries) ||
    input.Entries.length === 0
  ) {
    throw createEventBridgeValidationError(
      'Entries must be a non-empty array',
      EventBridgeErrorCode.EVENT_INVALID_FORMAT,
      'ValidatePutEventsInput',
      { entries: input.Entries },
    );
  }

  input.Entries.forEach((entry, index) => {
    if (!entry.Source || typeof entry.Source !== 'string') {
      throw createEventBridgeValidationError(
        `Entry at index ${index} is missing a valid Source`,
        EventBridgeErrorCode.EVENT_MISSING_REQUIRED,
        'ValidatePutEventsInput',
        { entryIndex: index },
      );
    }

    if (!entry.Detail || typeof entry.Detail !== 'string') {
      throw createEventBridgeValidationError(
        `Entry at index ${index} is missing a valid Detail`,
        EventBridgeErrorCode.EVENT_MISSING_REQUIRED,
        'ValidatePutEventsInput',
        { entryIndex: index },
      );
    }

    // Validate event size
    if (options?.validateEventSize) {
      validateEventSize(entry.Detail);
    }

    // Validate event pattern if provided
    if (entry.EventBusName && options?.validateEventPattern) {
      validateEventPattern(entry.Detail);
    }

    // Add more entry-specific validations as needed
  });
};

/**
 * Validates input for rule-related operations.
 *
 * @param input - The input parameters for the rule operation.
 * @param options - Optional validation options specific to rules.
 * @throws {EventBridgeValidationError} If the input is invalid.
 */
export const validateRuleInput = (
  input: any,
  options: EventBridgeValidationOptions['rule'] = DEFAULT_VALIDATION_OPTIONS.rule,
): void => {
  if (!input.Name || typeof input.Name !== 'string') {
    throw createEventBridgeValidationError(
      'Rule must have a valid Name',
      EventBridgeErrorCode.RULE_INVALID_NAME,
      'ValidateRuleInput',
      { ruleName: input.Name },
    );
  }

  validateRuleName(input.Name);

  if (input.EventPattern && options?.validateEventPattern) {
    validateEventPattern(input.EventPattern);
  }

  if (input.EventBusName) {
    validateEventBusArn(input.EventBusName);
  }

  // Add more rule-specific validations as needed
};

/**
 * Validates input for target-related operations.
 *
 * @param input - The input parameters for the target operation.
 * @param options - Optional validation options specific to targets.
 * @throws {EventBridgeValidationError} If the input is invalid.
 */
export const validateTargetInput = (
  input: any,
  _options: EventBridgeValidationOptions['target'] = DEFAULT_VALIDATION_OPTIONS.target,
): void => {
  if (!input.Rule || typeof input.Rule !== 'string') {
    throw createEventBridgeValidationError(
      'Target must specify a valid Rule',
      EventBridgeErrorCode.TARGET_INVALID_RULE,
      'ValidateTargetInput',
      { rule: input.Rule },
    );
  }

  if (input.Targets) {
    input.Targets.forEach((target: any, _index: number) => {
      validateTargetConfiguration(target);
      // Add more validations for target properties as needed
    });
  }
};

/**
 * Validates input for EventBus-related operations.
 *
 * @param input - The input parameters for the EventBus operation.
 * @param options - Optional validation options specific to EventBus.
 * @throws {EventBridgeValidationError} If the input is invalid.
 */
export const validateEventBusInput = (
  input: any,
  options: EventBridgeValidationOptions['eventBus'] = DEFAULT_VALIDATION_OPTIONS.eventBus,
): void => {
  if (input.Name) {
    validateEventBusArn(input.Name);
  }

  if (input.Policy) {
    if (options?.validatePolicy) {
      validateIAMPolicy(input.Policy);
      validateCrossAccountAccess(input.Policy);
    }
    if (options?.validatePolicyStatements) {
      validatePolicyStatements(input.Policy);
    }
  }

  // Add more EventBus-specific validations as needed
};

// ----------------------------------------
// Validation Types and Defaults
// ----------------------------------------

/**
 * Validation options for EventBridge operations with detailed constraints.
 */
export interface EventBridgeValidationOptions {
  // PutEvents Constraints
  putEvents?: {
    validateEventPattern?: boolean;
    validateEventSize?: boolean;
    // Add more options as needed
  };

  // Rule Operations Constraints
  rule?: {
    validateRuleName?: boolean;
    validateEventPattern?: boolean;
    // Add more options as needed
  };

  // Target Operations Constraints
  target?: {
    validateTargetConfiguration?: boolean;
    // Add more options as needed
  };

  // EventBus Operations Constraints
  eventBus?: {
    validatePolicyStatements?: boolean;
    validatePolicy?: boolean;
    // Add more options as needed
  };

  // Security Constraints
  security?: {
    validateIAMPolicy?: boolean;
    validateCrossAccountAccess?: boolean;
    // Add more options as needed
  };

  // Custom Validation
  custom?: {
    validators?: Array<(input: any) => void>;
    transformers?: Array<(input: any) => any>;
  };
}

/**
 * Default validation configuration with AWS EventBridge limits.
 */
export const DEFAULT_VALIDATION_OPTIONS: Readonly<EventBridgeValidationOptions> =
  {
    putEvents: {
      validateEventPattern: true,
      validateEventSize: true,
    },
    rule: {
      validateRuleName: true,
      validateEventPattern: true,
    },
    target: {
      validateTargetConfiguration: true,
    },
    eventBus: {
      validatePolicyStatements: true,
      validatePolicy: true,
    },
    security: {
      validateIAMPolicy: true,
      validateCrossAccountAccess: true,
    },
  } as const;

/**
 * Interface describing the validation result.
 */
export interface ValidationResult {
  valid: boolean;
  errors: EventBridgeErrorMetadata[];
  warnings: EventBridgeErrorMetadata[];
  metadata: Record<string, unknown>;
}
