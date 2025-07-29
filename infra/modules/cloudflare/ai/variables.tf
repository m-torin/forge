# AI Module Variables

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

# AI Gateway
variable "enable_ai_gateway" {
  description = "Enable AI Gateway"
  type        = bool
  default     = false
}

variable "ai_gateway_config" {
  description = "AI Gateway configuration"
  type = object({
    name        = optional(string)
    description = optional(string)
    
    # Caching
    enable_caching      = optional(bool, true)
    cache_ttl          = optional(number, 3600) # 1 hour
    cache_by_headers   = optional(list(string), [])
    cache_by_cookies   = optional(list(string), [])
    
    # Rate Limiting
    rate_limiting = optional(object({
      requests_per_minute = optional(number, 100)
      requests_per_hour   = optional(number, 1000)
      requests_per_day    = optional(number, 10000)
    }))
    
    # Logging
    enable_logging = optional(bool, true)
    log_sampling   = optional(number, 1.0) # 0.0 to 1.0
    
    # Cost Control
    max_cost_per_request = optional(number)
    max_cost_per_day     = optional(number)
    
    # Request/Response Modifications
    request_timeout_ms = optional(number, 30000) # 30 seconds
    max_retries        = optional(number, 2)
    
    # Providers
    allowed_providers = optional(list(string), ["openai", "workers-ai", "hugging-face", "azure", "google-ai", "anthropic"])
    fallback_provider = optional(string)
  })
  default = {}
}

# AI Gateway Routes
variable "ai_gateway_routes" {
  description = "AI Gateway route configurations"
  type = map(object({
    pattern      = string # e.g., "/chat/*", "/completions/*"
    target       = string # e.g., "https://api.openai.com"
    provider     = string # openai, workers-ai, etc.
    model        = optional(string)
    
    # Overrides
    rate_limit_override = optional(object({
      requests_per_minute = number
    }))
    cache_override = optional(object({
      enabled = bool
      ttl     = number
    }))
    
    # Transformations
    request_transform = optional(object({
      headers = optional(map(string))
      body    = optional(string) # JSONPath transformations
    }))
    response_transform = optional(object({
      headers = optional(map(string))
      body    = optional(string) # JSONPath transformations
    }))
  }))
  default = {}
}

# Workers AI
variable "enable_workers_ai" {
  description = "Enable Workers AI"
  type        = bool
  default     = false
}

variable "workers_ai_models" {
  description = "Workers AI models to enable"
  type = map(object({
    model_id    = string
    description = optional(string)
    type        = string # text-generation, text-classification, translation, etc.
    
    # Model-specific settings
    max_tokens      = optional(number)
    temperature     = optional(number)
    top_p           = optional(number)
    frequency_penalty = optional(number)
    presence_penalty  = optional(number)
  }))
  default = {}
}

# Vectorize
variable "enable_vectorize" {
  description = "Enable Vectorize (vector database)"
  type        = bool
  default     = false
}

variable "vectorize_indexes" {
  description = "Vectorize index configurations"
  type = map(object({
    dimensions   = number
    metric       = optional(string, "cosine") # cosine, euclidean, dot-product
    description  = optional(string)
    
    # Metadata configuration
    metadata_schema = optional(map(object({
      type     = string # string, number, boolean
      indexed  = optional(bool, false)
      filterable = optional(bool, false)
    })))
    
    # Capacity
    max_vectors = optional(number, 100000)
    
    # Data source
    data_source = optional(object({
      type   = string # r2, d1, kv
      source = string # bucket/database/namespace name
      prefix = optional(string)
    }))
  }))
  default = {}
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
    
    # AI bindings
    ai_binding = optional(object({
      name = optional(string, "AI")
    }))
    
    # Vectorize bindings
    vectorize_bindings = optional(map(object({
      index_name = string
    })))
    
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
    logpush_dataset     = optional(string, "ai_gateway_logs")
  })
  default = {}
}

# Model Marketplace
variable "model_marketplace_access" {
  description = "Model marketplace access configuration"
  type = object({
    enabled           = optional(bool, false)
    allowed_models    = optional(list(string), [])
    blocked_models    = optional(list(string), [])
    require_approval  = optional(bool, true)
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