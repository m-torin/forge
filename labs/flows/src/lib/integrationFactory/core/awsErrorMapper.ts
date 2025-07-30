// aws-errors.ts

import { Metadata } from './constants-types';
import { ErrorCode, ErrorSeverity, AWSFactoryError } from './errors';

export const mapAWSErrorToFactoryError = (
  error: any,
  service: string,
  operation: string,
  metadata?: Metadata,
): AWSFactoryError => {
  // Map AWS error codes to your ErrorCode enums
  let errorCode: ErrorCode = ErrorCode.OPERATION;

  switch (error.name) {
    case 'TimeoutError':
      errorCode = ErrorCode.TIMEOUT;
      break;
    case 'ThrottlingException':
    case 'TooManyRequestsException':
      errorCode = ErrorCode.RATE_LIMIT;
      break;
    case 'ValidationException':
    case 'InvalidParameterException':
      errorCode = ErrorCode.VALIDATION;
      break;
    case 'AccessDeniedException':
    case 'UnauthorizedOperation':
      errorCode = ErrorCode.CONNECTION;
      break;
    case 'ResourceNotFoundException':
      errorCode = ErrorCode.NOT_FOUND;
      break;
    // Add additional mappings as needed
    default:
      errorCode = ErrorCode.OPERATION;
  }

  const severity =
    errorCode === ErrorCode.OPERATION
      ? ErrorSeverity.MEDIUM
      : ErrorSeverity.HIGH;

  return new AWSFactoryError(
    error.message || 'An error occurred with AWS service',
    errorCode,
    service,
    operation,
    severity,
    metadata,
    error,
  );
};
