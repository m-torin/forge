# Autonomous Workflow Code Generation

Generate a complete Upstash Workflow implementation based on this specification.

## Workflow Specification

- **Name**: customer-onboarding
- **Description**: Automated customer onboarding workflow with email sequences
- **Type**: notification

## Input Contract

```typescript
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "name": {
      "type": "string"
    },
    "plan": {
      "type": "string",
      "enum": [
        "free",
        "pro",
        "enterprise"
      ]
    }
  },
  "required": [
    "userId",
    "email",
    "name",
    "plan"
  ]
}
```

## Output Contract

```typescript
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "onboardingSteps": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "step": {
            "type": "string"
          },
          "completed": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    },
    "nextActions": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}
```

## Business Logic Requirements

1. Create user profile with default settings
2. Send welcome email immediately
3. Wait 1 day
4. Send getting started guide
5. Wait 3 days
6. Check if user has logged in
7. If not logged in, send reminder email
8. If logged in, send feature tips email
9. Wait 7 days
10. Send feedback survey
11. Mark onboarding as complete

## Error Handling Requirements

1. Retry email sending up to 3 times with exponential backoff
2. Log failed email attempts to monitoring system
3. Continue workflow even if individual emails fail
4. Send daily summary of failed onboardings to ops team

## Performance Requirements

- **Timeout**: 1209600000ms
- **Retries**: 3
- **Rate Limit**: None

## Code Generation Strategy

Based on learning data, use the following approach:

- **Pattern**: Ensure implementation matches input/output contracts exactly
- **Success Rate**: 50.0%
- **Key Considerations**: Break down complex operations into smaller steps, Add comprehensive error
  handling, Validate input/output schemas, Ensure contract compliance

## Implementation Requirements

### 1. Main Workflow File: `src/workflows/customer-onboarding.ts`

```typescript
// Required structure:
import { serve } from '@upstash/workflow/nextjs';
import { z } from 'zod';

// Define input/output schemas using Zod
const inputSchema = z.object({
  // Match the input contract exactly
});

const outputSchema = z.object({
  // Match the output contract exactly
});

export const { POST } = serve<z.infer<typeof inputSchema>, z.infer<typeof outputSchema>>(
  async (context) => {
    // Implement business logic with proper error handling
    // Use context.run() for each step
    // Include logging and monitoring
  },
  {
    retries: 3,
    timeout: 1209600000,
  }
);
```

### 2. Unit Tests: `tests/unit/customer-onboarding.test.ts`

Generate comprehensive unit tests using Vitest:

- Test input validation
- Test each business logic step
- Test error scenarios
- Test edge cases
- Mock external dependencies

### 3. E2E Tests: `tests/e2e/customer-onboarding.e2e.ts`

Generate Playwright end-to-end tests:

- Test complete workflow execution
- Test API endpoints
- Test error recovery
- Test performance requirements
- Test concurrent executions

## Code Generation Instructions

1. **Use TypeScript** with strict typing
2. **Follow Upstash Workflow patterns** from official documentation
3. **Implement comprehensive error handling** with structured error types
4. **Add detailed logging** at each step for observability
5. **Include JSDoc documentation** for all public functions
6. **Ensure idempotency** where applicable
7. **Add input/output validation** using Zod schemas
8. **Implement proper timeout handling**
9. **Use environment variables** for configuration
10. **Generate realistic test data** for all test cases

## Quality Requirements

- All code must pass TypeScript compilation with strict mode
- 100% test coverage for business logic
- No ESLint errors or warnings
- Proper error boundaries and fallbacks
- Performance monitoring hooks
- Security best practices (no hardcoded secrets, input sanitization)

Generate all files with complete, production-ready implementations.
