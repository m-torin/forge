# AI Module Variables - Simplified (AI Gateway and Vectorize not available in Terraform provider)

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

# AI Workers
variable "ai_workers" {
  description = "AI-powered worker configurations"
  type = map(object({
    script_name        = string
    script_content     = optional(string)
    script_path        = optional(string)
    routes             = list(string)
    compatibility_date = optional(string)

    # Environment variables
    environment_variables = optional(map(string), {})
    secrets              = optional(map(string), {})

    # KV namespaces for caching
    kv_namespaces = optional(list(string), [])

    # R2 buckets for storage
    r2_buckets = optional(list(string), [])
  }))
  default = {}
}

# AI Analytics
variable "enable_ai_analytics" {
  description = "Enable AI usage analytics"
  type        = bool
  default     = true
}

variable "ai_analytics_config" {
  description = "AI analytics configuration"
  type = object({
    track_costs       = optional(bool, true)
    track_latency     = optional(bool, true)
    track_errors      = optional(bool, true)
    track_model_usage = optional(bool, true)

    # Logpush destination
    logpush_destination = optional(string)
    logpush_dataset     = optional(string, "ai_worker_logs")
  })
  default = {}
}

# Cost Controls
variable "ai_cost_controls" {
  description = "AI cost control settings"
  type = object({
    monthly_budget      = optional(number)
    daily_budget        = optional(number)
    alert_threshold_pct = optional(number, 80)
    auto_disable        = optional(bool, false)

    # Per-model limits
    model_limits = optional(map(object({
      max_requests_per_day = optional(number)
      max_cost_per_day     = optional(number)
    })))
  })
  default = {}
}

# Compliance
variable "ai_compliance" {
  description = "AI compliance settings"
  type = object({
    data_residency = optional(string) # Region restriction
    pii_detection  = optional(bool, false)
    pii_redaction  = optional(bool, false)

    # Content filtering
    content_filtering = optional(object({
      enabled            = bool
      filter_hate_speech = optional(bool, true)
      filter_violence    = optional(bool, true)
      filter_sexual      = optional(bool, true)
      filter_self_harm   = optional(bool, true)
    }))

    # Audit logging
    audit_logging = optional(object({
      enabled            = bool
      log_prompts        = optional(bool, false)
      log_responses      = optional(bool, false)
      retention_days     = optional(number, 90)
    }))
  })
  default = {}
}

# Tags
variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}