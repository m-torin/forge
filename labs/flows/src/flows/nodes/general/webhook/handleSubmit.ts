import { FormValues } from './formSchema';
import { guards } from './initialValues';
import { logInfo, logError } from '@repo/observability';

/**
 * Type definition for the webhook form submission result
 */
type SubmitResult = {
  success: boolean;
  message?: string;
  error?: Error;
  errors?: { [key: string]: string };
};

/**
 * Handles webhook form submission by processing and validating the configuration
 * This function should encapsulate all webhook-specific submission logic
 *
 * Features:
 * - Webhook configuration validation
 * - Error handling
 * - Success/failure reporting
 *
 * @param {FormValues} values - The validated webhook configuration values
 * @returns {Promise<SubmitResult>} Result of the submission operation
 */
export const handleSubmit = async (
  values: FormValues,
): Promise<SubmitResult> => {
  try {
    // Note: Form validation is handled by Mantine form before this function is called

    const { metadata, name, isEnabled: _isEnabled, uxMeta } = values;

    // 1. Basic Node Validation
    if (!name?.trim()) {
      throw new Error('Node name is required');
    }

    // 2. Shared Configuration Validation
    const validateSharedConfig = () => {
      const {
        method,
        responseFormat,
        enableCustomContentType,
        contentType,
        customContentType,
        errorResponseFields,
        commonHeaders,
        compression,
        generateRequestId,
        requestIdHeader,
      } = metadata.shared;

      // Method Compatibility
      if (
        method === 'GET' &&
        guards.isDestinationMetadata(metadata) &&
        metadata.destination.bodyTemplate
      ) {
        throw new Error('GET requests cannot have a body template');
      }
      if (['HEAD', 'OPTIONS'].includes(method) && responseFormat !== 'text') {
        throw new Error(`${method} requests must use text response format`);
      }

      // Content Type Validation
      if (method !== 'GET' && enableCustomContentType) {
        if (
          contentType === 'custom' &&
          !customContentType?.match(/^[\w\-]+\/[\w\-+.]+$/)
        ) {
          throw new Error('Invalid custom content type format');
        }
      }

      // Response Format Validation
      if (responseFormat === 'binary' && compression !== 'none') {
        throw new Error('Binary response format cannot use compression');
      }

      // Header Validation
      const uniqueHeaders = new Set(commonHeaders);
      if (uniqueHeaders.size !== commonHeaders.length) {
        throw new Error('Duplicate headers detected');
      }

      if (generateRequestId && !requestIdHeader) {
        throw new Error(
          'Request ID header must be specified when generation is enabled',
        );
      }

      // Error Response Validation
      if (
        errorResponseFields.includes('stack') &&
        process.env.NODE_ENV === 'production'
      ) {
        throw new Error('Stack traces cannot be enabled in production');
      }
    };

    // 3. Source Configuration Validation
    const validateSourceConfig = () => {
      if (!guards.isSourceMetadata(metadata)) return;

      const {
        requiredHeaders: _requiredHeaders,
        enableRateLimit,
        rateLimit,
        rateLimitStrategy: _rateLimitStrategy,
        enableValidation,
        validationSchema,
        schemaPath,
        enableCache,
        cacheDuration,
        cacheStrategy,
        maxRequestSize,
        timeout: _timeout,
        enableCors: _enableCors,
        forceHttps: _forceHttps,
        enableLogging: _enableLogging,
        eventBridge,
      } = metadata.source;

      // Rate Limiting Validation
      if (enableRateLimit) {
        if (!rateLimit || rateLimit < 1) {
          throw new Error('Invalid rate limit configuration');
        }
        if (!process.env.REDIS_URL) {
          throw new Error('Redis configuration required for rate limiting');
        }
      }

      // Validation Schema
      if (enableValidation && (!validationSchema || !schemaPath)) {
        throw new Error(
          'Validation schema and path are required when validation is enabled',
        );
      }

      // Cache Configuration
      if (enableCache) {
        if (!process.env.CACHE_STORE) {
          throw new Error('Cache storage configuration required');
        }
        if (!cacheDuration || cacheDuration < 60 || cacheDuration > 86400) {
          throw new Error(
            'Cache duration must be between 1 minute and 24 hours',
          );
        }
        if (!cacheStrategy) {
          throw new Error(
            'Cache strategy must be specified when caching is enabled',
          );
        }
      }

      // EventBridge Configuration
      if (eventBridge.enabled) {
        if (
          !process.env.AWS_ACCESS_KEY_ID ||
          !process.env.AWS_SECRET_ACCESS_KEY
        ) {
          throw new Error(
            'AWS credentials required for EventBridge integration',
          );
        }
        if (!eventBridge.eventBusName) {
          throw new Error('Event bus name is required');
        }
        // Additional EventBridge validations...
      }

      // Resource Limits
      const sizes = {
        '1mb': 1,
        '5mb': 5,
        '10mb': 10,
        '50mb': 50,
        unlimited: -1,
      };
      const maxSize = sizes[maxRequestSize] ?? -1;
      if (maxSize > 50) {
        throw new Error('Maximum request size exceeded allowed limit');
      }
    };

    // 4. Destination Configuration Validation
    const validateDestinationConfig = () => {
      if (!guards.isDestinationMetadata(metadata)) return;

      const {
        targetUrl,
        queryParams: _queryParams,
        bodyTemplate: _bodyTemplate,
        authType: _authType,
        customHeaders,
        timeout: _timeout2,
        corsOrigins,
        maxRetries: _maxRetries,
        retryDelay: _retryDelay,
        maxRequestSize: _maxRequestSize,
      } = metadata.destination;

      if (!targetUrl) {
        throw new Error('Target URL is required for destination nodes');
      }

      // Validate custom headers
      if (customHeaders.some((header) => !header.key || !header.value)) {
        throw new Error('All custom headers must have both key and value');
      }

      // Validate CORS origins
      if (corsOrigins.includes('custom') && corsOrigins.length === 1) {
        throw new Error('Custom CORS origin must be specified');
      }
    };

    // 5. Enrichment Configuration Validation
    const validateEnrichmentConfig = () => {
      if (!guards.isEnrichmentMetadata(metadata)) return;

      const {
        webhookUrl: _webhookUrl,
        enrichmentType,
        transformationRules,
        validatePayload,
        validationRules,
        enableCache,
        cacheDuration,
        maxRequestSize: _maxRequestSize2,
        timeout: _timeout3,
      } = metadata.enrichment;

      if (
        enrichmentType === 'transform' &&
        (!transformationRules || transformationRules.length === 0)
      ) {
        throw new Error(
          'Transformation rules are required for transform enrichment type',
        );
      }

      if (
        validatePayload &&
        (!validationRules || validationRules.length === 0)
      ) {
        throw new Error(
          'Validation rules are required when payload validation is enabled',
        );
      }

      if (
        enableCache &&
        (!cacheDuration || cacheDuration < 60 || cacheDuration > 86400)
      ) {
        throw new Error(
          'Cache duration must be between 1 minute and 24 hours for enrichment',
        );
      }
    };

    // 6. UX Metadata Validation
    const validateUxMeta = () => {
      if (
        uxMeta.layer !== undefined &&
        (uxMeta.layer < 0 || uxMeta.layer > 100)
      ) {
        throw new Error('UX layer must be between 0 and 100');
      }
      // Add more UX metadata validations as needed
    };

    // Execute all validations
    await Promise.all([
      validateSharedConfig(),
      validateSourceConfig(),
      validateDestinationConfig(),
      validateEnrichmentConfig(),
      validateUxMeta(),
    ]);

    // 7. Persistence Operations (placeholder)
    // TODO: Implement actual persistence logic
    logInfo('Persisting webhook configuration', { values });

    return {
      success: true,
      message: 'Webhook configuration validated and saved successfully',
    };
  } catch (error) {
    logError('Webhook form submission failed', { error });
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Unknown error occurred'),
      errors:
        error instanceof Error
          ? { '': error.message }
          : { '': 'Unknown error' },
    };
  }
};
