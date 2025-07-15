// src/integrations/aws/sns/validation.ts

import { OperationContext } from '#/lib/integrationFactory';
import {
  SNSErrorCode,
  createSNSValidationError,
  type SNSErrorMetadata,
} from './errors';
import type {
  PublishCommandInput,
  CreatePlatformApplicationCommandInput,
  SetPlatformApplicationAttributesCommandInput,
  CreatePlatformEndpointCommandInput,
  SetEndpointAttributesCommandInput,
  OptInPhoneNumberCommandInput,
  CheckIfPhoneNumberIsOptedOutCommandInput,
  ListPhoneNumbersOptedOutCommandInput,
  GetSMSAttributesCommandInput,
  SetSMSAttributesCommandInput,
  GetDataProtectionPolicyCommandInput,
  PutDataProtectionPolicyCommandInput,
  VerifySMSSandboxPhoneNumberCommandInput,
  CreateSMSSandboxPhoneNumberCommandInput,
  DeleteSMSSandboxPhoneNumberCommandInput,
  ListSMSSandboxPhoneNumbersCommandInput,
} from '@aws-sdk/client-sns';

// ----------------------------------------
// Validation Helper Functions
// ----------------------------------------

/**
 * Validates message size
 */
export const validateMessageSize = (message: string): void => {
  const MAX_SIZE = 256 * 1024; // 256 KB
  if (new TextEncoder().encode(message).length > MAX_SIZE) {
    throw createSNSValidationError(
      `Message exceeds maximum size of ${MAX_SIZE} bytes`,
      SNSErrorCode.MESSAGE_TOO_LARGE,
      'ValidateMessageSize',
      { maxSize: MAX_SIZE },
    );
  }
};

/**
 * Validates topic name format
 */
export const validateTopicName = (name: string, isFifo: boolean): void => {
  if (isFifo && !name.endsWith('.fifo')) {
    throw createSNSValidationError(
      'FIFO topic names must end with .fifo',
      SNSErrorCode.TOPIC_NAME_INVALID,
      'ValidateTopicName',
      { topicName: name },
    );
  }

  if (!/^[a-zA-Z0-9-_]+$/.test(name.replace('.fifo', ''))) {
    throw createSNSValidationError(
      'Topic name contains invalid characters',
      SNSErrorCode.TOPIC_NAME_INVALID,
      'ValidateTopicName',
      { topicName: name },
    );
  }
};

/**
 * Validates FIFO topic attributes
 */
export const validateFifoAttributes = (
  input: PublishCommandInput,
  isFifo: boolean,
): void => {
  if (isFifo) {
    if (!input.MessageGroupId) {
      throw createSNSValidationError(
        'MessageGroupId is required for FIFO topics',
        SNSErrorCode.MESSAGE_GROUP_ID_REQUIRED,
        'ValidateFifoAttributes',
      );
    }
  }
};

/**
 * Type Guards for Platform Application Inputs
 */
const isCreatePlatformApplicationInput = (
  input:
    | CreatePlatformApplicationCommandInput
    | SetPlatformApplicationAttributesCommandInput,
): input is CreatePlatformApplicationCommandInput => {
  return (input as CreatePlatformApplicationCommandInput).Name !== undefined;
};

/**
 * Validates platform application attributes
 */
export const validatePlatformApplicationAttributes = (
  input:
    | CreatePlatformApplicationCommandInput
    | SetPlatformApplicationAttributesCommandInput,
  operation: 'CreatePlatformApplication' | 'SetPlatformApplicationAttributes',
): void => {
  if (isCreatePlatformApplicationInput(input)) {
    // Validate CreatePlatformApplicationCommandInput
    if (!input.Name || input.Name.trim() === '') {
      throw createSNSValidationError(
        'PlatformApplication Name is required',
        SNSErrorCode.INVALID_PARAMETER,
        operation,
        { parameter: 'Name' },
      );
    }

    if (!input.Platform) {
      throw createSNSValidationError(
        'Platform is required',
        SNSErrorCode.INVALID_PARAMETER,
        operation,
        { parameter: 'Platform' },
      );
    }
  }

  // Common validations for both input types
  if (!input.Attributes || Object.keys(input.Attributes).length === 0) {
    throw createSNSValidationError(
      'At least one attribute must be provided',
      SNSErrorCode.INVALID_PARAMETER,
      operation,
      { parameter: 'Attributes' },
    );
  }

  // Add more specific attribute validations as needed
};

/**
 * Type Guards for Platform Endpoint Inputs
 */
const isCreatePlatformEndpointInput = (
  input: CreatePlatformEndpointCommandInput | SetEndpointAttributesCommandInput,
): input is CreatePlatformEndpointCommandInput => {
  return (input as CreatePlatformEndpointCommandInput).Token !== undefined;
};

/**
 * Validates platform endpoint attributes
 */
export const validatePlatformEndpointAttributes = (
  input: CreatePlatformEndpointCommandInput | SetEndpointAttributesCommandInput,
  operation: 'CreatePlatformEndpoint' | 'SetEndpointAttributes',
): void => {
  if (isCreatePlatformEndpointInput(input)) {
    // Validate CreatePlatformEndpointCommandInput
    if (!input.PlatformApplicationArn) {
      throw createSNSValidationError(
        'PlatformApplicationArn is required',
        SNSErrorCode.INVALID_PARAMETER,
        operation,
        { parameter: 'PlatformApplicationArn' },
      );
    }

    if (!input.Token) {
      throw createSNSValidationError(
        'Token is required for CreatePlatformEndpoint',
        SNSErrorCode.INVALID_PARAMETER,
        operation,
        { parameter: 'Token' },
      );
    }
  } else {
    // Validate SetEndpointAttributesCommandInput
    if (!input.EndpointArn) {
      throw createSNSValidationError(
        'EndpointArn is required',
        SNSErrorCode.INVALID_PARAMETER,
        operation,
        { parameter: 'EndpointArn' },
      );
    }
  }

  if (input.Attributes && typeof input.Attributes !== 'object') {
    throw createSNSValidationError(
      'Attributes must be an object',
      SNSErrorCode.INVALID_PARAMETER,
      operation,
      { parameter: 'Attributes' },
    );
  }

  // Add more specific attribute validations as needed
};

/**
 * Validates phone number operations
 */
export const validatePhoneNumberOperation = (
  input:
    | OptInPhoneNumberCommandInput
    | CheckIfPhoneNumberIsOptedOutCommandInput
    | ListPhoneNumbersOptedOutCommandInput,
  operation:
    | 'OptInPhoneNumber'
    | 'CheckIfPhoneNumberIsOptedOut'
    | 'ListPhoneNumbersOptedOut',
): void => {
  if (operation !== 'ListPhoneNumbersOptedOut') {
    if (!('phoneNumber' in input) || !input.phoneNumber) {
      throw createSNSValidationError(
        'phoneNumber is required',
        SNSErrorCode.INVALID_PARAMETER,
        operation,
        { parameter: 'phoneNumber' },
      );
    }
  }

  // Additional validations can be added here
};

/**
 * Validates SMS operations
 */
export const validateSMSOperation = (
  input:
    | GetSMSAttributesCommandInput
    | SetSMSAttributesCommandInput
    | PublishCommandInput,
  operation: 'GetSMSAttributes' | 'SetSMSAttributes' | 'PublishSMS',
): void => {
  if (operation === 'SetSMSAttributes') {
    if (
      !('attributes' in input) ||
      !input.attributes ||
      Object.keys(input.attributes).length === 0
    ) {
      throw createSNSValidationError(
        'At least one attribute must be provided',
        SNSErrorCode.INVALID_PARAMETER,
        operation,
        { parameter: 'attributes' },
      );
    }
  }

  if (operation === 'PublishSMS') {
    if (!('PhoneNumber' in input) || !input.PhoneNumber) {
      throw createSNSValidationError(
        'PhoneNumber is required for PublishSMS',
        SNSErrorCode.INVALID_PARAMETER,
        operation,
        { parameter: 'PhoneNumber' },
      );
    }

    // Additional Publish-specific validations
    validateMessageSize(input.Message || '');

    const isFifo =
      typeof input.TopicArn === 'string' && input.TopicArn.endsWith('.fifo');

    // **FIXED: Ensure input.TopicArn is defined before passing to validateTopicName**
    if (!input.TopicArn) {
      throw createSNSValidationError(
        'TopicArn is required for PublishSMS',
        SNSErrorCode.INVALID_PARAMETER,
        operation,
        { parameter: 'TopicArn' },
      );
    }

    validateTopicName(input.TopicArn, isFifo);
  }

  // Add more specific validations as needed
};

/**
 * Validates mobile push operations
 */
export const validateMobilePushOperation = (
  input:
    | GetDataProtectionPolicyCommandInput
    | PutDataProtectionPolicyCommandInput
    | VerifySMSSandboxPhoneNumberCommandInput
    | CreateSMSSandboxPhoneNumberCommandInput
    | DeleteSMSSandboxPhoneNumberCommandInput
    | ListSMSSandboxPhoneNumbersCommandInput,
  operation:
    | 'GetDataProtectionPolicy'
    | 'PutDataProtectionPolicy'
    | 'VerifySMSSandboxPhoneNumber'
    | 'CreateSMSSandboxPhoneNumber'
    | 'DeleteSMSSandboxPhoneNumber'
    | 'ListSMSSandboxPhoneNumbers',
): void => {
  if (operation === 'PutDataProtectionPolicy') {
    if (!('DataProtectionPolicy' in input) || !input.DataProtectionPolicy) {
      throw createSNSValidationError(
        'DataProtectionPolicy is required',
        SNSErrorCode.INVALID_PARAMETER,
        operation,
        { parameter: 'DataProtectionPolicy' },
      );
    }
  }

  if (
    operation === 'VerifySMSSandboxPhoneNumber' ||
    operation === 'CreateSMSSandboxPhoneNumber' ||
    operation === 'DeleteSMSSandboxPhoneNumber'
  ) {
    if (!('PhoneNumber' in input) || !input.PhoneNumber) {
      throw createSNSValidationError(
        'PhoneNumber is required',
        SNSErrorCode.INVALID_PARAMETER,
        operation,
        { parameter: 'PhoneNumber' },
      );
    }
  }

  // Add more specific validations as needed
};

// ----------------------------------------
// Main Validation Function
// ----------------------------------------

/**
 * Main validation function for SNS inputs
 */
export const validateSNSInput = (
  input: any,
  operationName: string,
  options: SNSValidationOptions = DEFAULT_VALIDATION_OPTIONS,
  _context?: OperationContext,
): ValidationResult => {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    metadata: {},
  };

  try {
    switch (operationName) {
      // Existing validations
      case 'Publish':
        if (options.message?.validateStructure) {
          validateMessageSize(input.Message);
          // Add more message structure validations if needed
        }
        if (options.topic?.validateName) {
          // Assuming you have topic name in input
          const topicArn: string = input.TopicArn;
          const isFifo =
            typeof topicArn === 'string' && topicArn.endsWith('.fifo');
          if (!topicArn) {
            throw createSNSValidationError(
              'TopicArn is required',
              SNSErrorCode.INVALID_PARAMETER,
              'Publish',
              { parameter: 'TopicArn' },
            );
          }
          validateTopicName(topicArn, isFifo);
        }
        if (options.topic?.fifo) {
          const topicArn: string = input.TopicArn;
          const isFifo =
            typeof topicArn === 'string' && topicArn.endsWith('.fifo');
          if (!topicArn) {
            throw createSNSValidationError(
              'TopicArn is required for FIFO topics',
              SNSErrorCode.INVALID_PARAMETER,
              'Publish',
              { parameter: 'TopicArn' },
            );
          }
          validateFifoAttributes(input, isFifo);
        }
        break;

      // Platform Application Operations
      case 'CreatePlatformApplication':
      case 'SetPlatformApplicationAttributes':
        if (options.platformApplication?.validateAttributes) {
          validatePlatformApplicationAttributes(input, operationName as any);
        }
        break;
      case 'DeletePlatformApplication':
      case 'GetPlatformApplicationAttributes':
      case 'ListPlatformApplications':
        // Add validations if needed
        break;

      // Platform Endpoint Operations
      case 'CreatePlatformEndpoint':
      case 'SetEndpointAttributes':
        if (options.platformEndpoint?.validateAttributes) {
          validatePlatformEndpointAttributes(input, operationName as any);
        }
        break;
      case 'DeleteEndpoint':
      case 'GetEndpointAttributes':
      case 'ListEndpointsByPlatformApplication':
        // Add validations if needed
        break;

      // Phone Number Operations
      case 'OptInPhoneNumber':
      case 'CheckIfPhoneNumberIsOptedOut':
      case 'ListPhoneNumbersOptedOut':
        if (options.phoneNumber?.validateParameters) {
          validatePhoneNumberOperation(input, operationName as any);
        }
        break;

      // SMS Operations
      case 'GetSMSAttributes':
      case 'SetSMSAttributes':
      case 'PublishSMS':
        if (options.sms?.validateParameters) {
          validateSMSOperation(input, operationName as any);
        }
        break;

      // Mobile Push Operations
      case 'GetDataProtectionPolicy':
      case 'PutDataProtectionPolicy':
      case 'VerifySMSSandboxPhoneNumber':
      case 'CreateSMSSandboxPhoneNumber':
      case 'DeleteSMSSandboxPhoneNumber':
      case 'ListSMSSandboxPhoneNumbers':
        if (options.mobilePush?.validateParameters) {
          validateMobilePushOperation(input, operationName as any);
        }
        break;

      default:
        throw createSNSValidationError(
          `Unsupported operation: ${operationName}`,
          SNSErrorCode.UNSUPPORTED_OPERATION,
          'validateSNSInput',
          { operation: operationName },
        );
    }

    // Additional general validations can be added here
  } catch (error) {
    result.valid = false;
    if (error instanceof Error) {
      const errorCode =
        (error as any).code || SNSErrorCode.GENERAL_VALIDATION_ERROR;
      result.errors.push({
        snsErrorCode: errorCode,
        message: error.message,
        operation: operationName,
        timestamp: new Date().toISOString(),
      } as SNSErrorMetadata);
    }
  }

  return result;
};

// ----------------------------------------
// Validation Types and Defaults
// ----------------------------------------

export interface SNSValidationOptions {
  // Existing options
  message?: {
    maxSize?: number;
    validateStructure?: boolean;
    validateAttributes?: boolean;
  };
  topic?: {
    validateName?: boolean;
    validateAttributes?: boolean;
    fifo?: boolean;
  };
  // New options for added operations
  platformApplication?: {
    validateAttributes?: boolean;
  };
  platformEndpoint?: {
    validateAttributes?: boolean;
  };
  phoneNumber?: {
    validateParameters?: boolean;
  };
  sms?: {
    validateParameters?: boolean;
  };
  mobilePush?: {
    validateParameters?: boolean;
  };
  // Add more options as needed...
}

export const DEFAULT_VALIDATION_OPTIONS: Readonly<SNSValidationOptions> = {
  message: {
    maxSize: 256 * 1024,
    validateStructure: true,
    validateAttributes: true,
  },
  topic: {
    validateName: true,
    validateAttributes: true,
    fifo: false,
  },
  platformApplication: {
    validateAttributes: true,
  },
  platformEndpoint: {
    validateAttributes: true,
  },
  phoneNumber: {
    validateParameters: true,
  },
  sms: {
    validateParameters: true,
  },
  mobilePush: {
    validateParameters: true,
  },
} as const;

export interface ValidationResult {
  valid: boolean;
  errors: SNSErrorMetadata[];
  warnings: SNSErrorMetadata[];
  metadata: Record<string, unknown>;
}
