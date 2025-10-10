# Workers Module Variables

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

# Image Processing Workers
variable "image_workers" {
  description = "Image processing worker configurations"
  type = map(object({
    script_name        = string
    script_content     = optional(string)
    script_path        = optional(string)
    routes             = list(string)
    compatibility_date = optional(string)

    # Bindings
    r2_buckets         = optional(list(string), ["IMAGES"])
    kv_namespaces      = optional(list(string), ["IMAGE_METADATA"])
    ai_binding         = optional(bool, false)

    # Environment variables
    environment_variables = optional(map(string), {})
    secrets              = optional(map(string), {})
  }))
  default = {
    "image-processor" = {
      script_name        = "image-processor"
      script_path        = "../../../services/cf-workers/image-processor/src/index.ts"
      routes             = ["/process", "/metadata/*"]
      compatibility_date = "2023-05-15"
      ai_binding         = true
      secrets            = {
        "SIGNING_KEY" = "image-signing-key"
      }
    }
    "image-transformer" = {
      script_name        = "image-transformer"
      script_path        = "../../../services/cf-workers/image-transformer/src/index.ts"
      routes             = ["/cdn-cgi/image/*", "/images/*"]
      compatibility_date = "2023-05-15"
    }
    "nextjs-image-optimizer" = {
      script_name        = "nextjs-image-optimizer"
      script_path        = "../../../services/cf-workers/nextjs-image-optimizer/src/index.ts"
      routes             = ["/api/_next/image"]
      compatibility_date = "2023-05-15"
    }
  }
}

# D1 Databases
variable "d1_databases" {
  description = "D1 database configurations"
  type = map(object({
    name                    = string
    enable_migrations      = optional(bool, false)
    enable_backups         = optional(bool, false)
    enable_admin_interface = optional(bool, false)
    backup_schedule        = optional(string, "0 2 * * *") # Daily at 2 AM
    admin_allowed_emails   = optional(list(string), [])
  }))
  default = {}
}

# Queues
variable "queues" {
  description = "Queue configurations"
  type = map(object({
    name = string
    consumer = optional(object({
      script_name = string
      settings = optional(object({
        max_batch_size    = optional(number, 10)
        max_wait_time_ms  = optional(number, 1000)
        max_retries       = optional(number, 3)
        dead_letter_queue = optional(string)
      }))
    }))
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

# Durable Objects
variable "durable_object_namespaces" {
  description = "Durable Object namespace configurations"
  type = map(object({
    name       = string
    class_name = string
    script_name = string
  }))
  default = {}
}

# Custom Domains
variable "custom_domains" {
  description = "Custom domain configurations for workers"
  type = map(object({
    domain    = string
    script_name = string
  }))
  default = {}
}

# Cron Triggers
variable "cron_triggers" {
  description = "Cron trigger configurations"
  type = map(object({
    script_name = string
    schedules   = list(string)
  }))
  default = {}
}

# Logpush Jobs
variable "logpush_jobs" {
  description = "Logpush job configurations"
  type = map(object({
    name             = string
    dataset          = string
    destination_conf = string
    enabled          = optional(bool, true)
  }))
  default = {}
}

# Tags
variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}