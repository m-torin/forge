# Environment Module Variables

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production"
  }
}

variable "project_name" {
  description = "Project name for Doppler"
  type        = string
  default     = "forge"
}

# Doppler Configuration
variable "enable_doppler" {
  description = "Enable Doppler for secrets management"
  type        = bool
  default     = true
}

variable "doppler_token" {
  description = "Doppler service token (optional - can use DOPPLER_TOKEN env var)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "doppler_config" {
  description = "Doppler environment configuration per provider"
  type = object({
    cloudflare = optional(object({
      config_name = optional(string)
      secrets = optional(list(string), [
        "CLOUDFLARE_API_TOKEN",
        "CLOUDFLARE_ACCOUNT_ID"
      ])
    }), {})

    upstash = optional(object({
      config_name = optional(string)
      secrets = optional(list(string), [
        "UPSTASH_EMAIL",
        "UPSTASH_API_KEY",
        "UPSTASH_TEAM_NAME"
      ])
    }), {})

    vercel = optional(object({
      config_name = optional(string)
      secrets = optional(list(string), [
        "VERCEL_API_TOKEN",
        "VERCEL_ORG_ID",
        "VERCEL_TEAM_ID"
      ])
    }), {})

    monitoring = optional(object({
      config_name = optional(string)
      secrets = optional(list(string), [
        "SLACK_WEBHOOK_URL",
        "PAGERDUTY_INTEGRATION_KEY",
        "DISCORD_WEBHOOK_URL",
        "DATADOG_API_KEY",
        "SENTRY_DSN"
      ])
    }), {})

    integrations = optional(object({
      config_name = optional(string)
      secrets = optional(list(string), [
        "STRIPE_API_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "GITHUB_TOKEN",
        "OPENAI_API_KEY",
        "RESEND_API_KEY",
        "KNOCK_API_KEY",
        "IMAGE_SIGNING_KEY"
      ])
    }), {})
  })
  default = {}
}

# Fallback values when Doppler is not enabled
variable "fallback_secrets" {
  description = "Fallback secret values when Doppler is not enabled"
  type = object({
    cloudflare_api_token     = optional(string, "")
    cloudflare_account_id    = optional(string, "")
    upstash_email           = optional(string, "")
    upstash_api_key         = optional(string, "")
    upstash_team_name       = optional(string, "")
    vercel_api_token        = optional(string, "")
    vercel_org_id           = optional(string, "")
    vercel_team_id          = optional(string, "")
    slack_webhook_url       = optional(string, "")
    pagerduty_integration_key = optional(string, "")
    discord_webhook_url     = optional(string, "")
    datadog_api_key         = optional(string, "")
    sentry_dsn              = optional(string, "")
    stripe_api_key          = optional(string, "")
    stripe_webhook_secret   = optional(string, "")
    github_token            = optional(string, "")
    openai_api_key          = optional(string, "")
    resend_api_key          = optional(string, "")
    knock_api_key           = optional(string, "")
    image_signing_key       = optional(string, "")
  })
  sensitive = true
  default   = {}
}

# Secret rotation configuration
variable "enable_secret_rotation" {
  description = "Enable automatic secret rotation reminders"
  type        = bool
  default     = true
}

variable "secret_rotation_days" {
  description = "Number of days before recommending secret rotation"
  type = object({
    api_tokens  = optional(number, 90)
    api_keys    = optional(number, 180)
    webhooks    = optional(number, 365)
  })
  default = {}
}

# Environment-specific configuration
variable "environment_config" {
  description = "Environment-specific configuration"
  type = object({
    allowed_ips = optional(list(string), [])
    enable_debug = optional(bool, false)
    log_level = optional(string, "info")
    features = optional(map(bool), {})
  })
  default = {}
}

# Tags
variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}