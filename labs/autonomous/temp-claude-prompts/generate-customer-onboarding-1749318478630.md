# Autonomous Workflow Code Generation

Generate a complete Upstash Workflow implementation based on this specification.

## Workflow Specification

- **Name**: customer-onboarding
- **Description**: Automated customer onboarding workflow with email sequences
- **Type**: notification

## Input Contract

```json
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
      "enum": ["free", "pro", "enterprise"]
    }
  },
  "required": ["userId", "email", "name", "plan"]
}
```

## Output Contract

```json
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
