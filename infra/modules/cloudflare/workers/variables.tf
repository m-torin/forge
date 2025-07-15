# Workers Module Variables

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

# Worker Configurations
variable "workers" {
  description = "Worker configurations"
  type = map(object({
    # Script configuration
    script_name        = string
    script_content     = optional(string)
    script_path        = optional(string)
    module_type        = optional(string, "esm") # esm or sw (service worker)
    compatibility_date = optional(string)
    compatibility_flags = optional(list(string), [])
    
    # Routes
    routes = optional(list(object({
      pattern = string
      zone_id = optional(string)
    })), [])
    
    # Custom domains (for Workers on custom domains)
    custom_domains = optional(list(string), [])
    
    # Worker configuration
    usage_model    = optional(string, "bundled") # bundled or unbound
    logpush        = optional(bool, false)
    
    # Environment variables
    environment_variables = optional(map(string), {})
    
    # Secrets
    secrets = optional(map(string), {})
    
    # Bindings
    kv_namespaces = optional(map(object({
      namespace_id = string
    })), {})
    
    durable_objects = optional(map(object({
      class_name  = string
      script_name = optional(string)
    })), {})
    
    r2_buckets = optional(map(object({
      bucket_name = string
    })), {})
    
    d1_databases = optional(map(object({
      database_id = string
    })), {})
    
    queues = optional(map(object({
      queue_name = string
    })), {})
    
    service_bindings = optional(map(object({
      service     = string
      environment = optional(string)
    })), {})
    
    analytics_engine_datasets = optional(map(object({
      dataset = string
    })), {})
    
    # Dispatch namespace binding
    dispatch_namespaces = optional(map(object({
      namespace = string
    })), {})
    
    # Browser rendering
    browser_bindings = optional(map(object({
      service = string
    })), {})
    
    # Rate limiting
    rate_limiting = optional(object({
      enabled         = bool
      requests_per_minute = optional(number, 1000)
    }))
    
    # Tail consumers
    tail_consumers = optional(list(string), [])
    
    # WebAssembly modules
    wasm_modules = optional(map(object({
      path = string
    })), {})
    
    # Plain text data
    plain_text_bindings = optional(map(string), {})
    
    # JSON data
    json_bindings = optional(map(any), {})
  }))
  default = {}
}

# KV Namespaces
variable "kv_namespaces" {
  description = "KV namespace configurations"
  type = map(object({
    title = string
  }))
  default = {}
}

# Durable Objects
variable "durable_objects" {
  description = "Durable Object configurations"
  type = map(object({
    name         = string
    class_name   = string
    script_name  = string
    environment  = optional(string)
    migrations   = optional(list(object({
      tag         = string
      new_classes = optional(list(string))
      renamed_classes = optional(list(object({
        from = string
        to   = string
      })))
      deleted_classes = optional(list(string))
    })), [])
  }))
  default = {}
}

# R2 Buckets (reference existing buckets)
variable "r2_bucket_names" {
  description = "R2 bucket names to reference"
  type        = list(string)
  default     = []
}

# D1 Databases
variable "d1_databases" {
  description = "D1 database configurations"
  type = map(object({
    name                     = string
    enable_migrations        = optional(bool, false)
    migrations_path          = optional(string)
    enable_backups          = optional(bool, false)
    backup_schedule         = optional(string, "0 2 * * *") # Daily at 2 AM
    backup_retention_days   = optional(number, 7)
    enable_admin_interface  = optional(bool, false)
    admin_allowed_emails    = optional(list(string), [])
  }))
  default = {}
}

# Queues
variable "queues" {
  description = "Queue configurations"
  type = map(object({
    name = string
    consumers = optional(list(object({
      script_name    = string
      batch_size     = optional(number, 10)
      max_batch_timeout = optional(number, 30)
      max_retries    = optional(number, 3)
      dead_letter_queue = optional(string)
    })), [])
  }))
  default = {}
}

# Worker Routes
variable "worker_routes" {
  description = "Additional worker route configurations"
  type = map(object({
    pattern     = string
    zone_id     = optional(string)
    script_name = string
  }))
  default = {}
}

# Cron Triggers
variable "cron_triggers" {
  description = "Cron trigger configurations"
  type = map(object({
    script_name = string
    schedules   = list(string) # Cron expressions
  }))
  default = {}
}

# Logpush Jobs
variable "logpush_jobs" {
  description = "Logpush job configurations for workers"
  type = map(object({
    dataset          = string # workers_trace_events
    destination_conf = string
    enabled          = optional(bool, true)
    filter           = optional(string)
    frequency        = optional(string, "high")
    ownership_challenge = optional(string)
  }))
  default = {}
}

# Worker Subdomain
variable "workers_subdomain" {
  description = "Workers subdomain configuration"
  type = object({
    enabled = optional(bool, false)
    name    = optional(string)
  })
  default = {}
}

# Service Environments
variable "service_environments" {
  description = "Service environment configurations"
  type = map(object({
    service_name = string
    environment  = string
    vars         = optional(map(string), {})
  }))
  default = {}
}

# Analytics Engine
variable "analytics_engine_datasets" {
  description = "Analytics Engine dataset configurations"
  type = map(object({
    name = string
  }))
  default = {}
}

# Workers for Platforms
variable "dispatch_namespaces" {
  description = "Workers for Platforms dispatch namespace configurations"
  type = map(object({
    name = string
  }))
  default = {}
}

# Browser Rendering
variable "browser_rendering" {
  description = "Browser rendering API configuration"
  type = object({
    enabled = optional(bool, false)
    limits  = optional(object({
      max_concurrent = optional(number, 2)
      timeout_ms     = optional(number, 30000)
    }))
  })
  default = {}
}

# Secrets (Global)
variable "worker_secrets" {
  description = "Global secrets for workers"
  type        = map(string)
  default     = {}
  sensitive   = true
}

# Tags
variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}