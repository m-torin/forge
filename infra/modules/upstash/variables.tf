# Upstash Module Variables

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# Redis Configuration
variable "enable_redis" {
  description = "Enable Upstash Redis"
  type        = bool
  default     = true
}

variable "redis_config" {
  description = "Redis database configuration"
  type = object({
    name           = optional(string)
    region         = optional(string, "us-east-1")
    multizone      = optional(bool, false)
    eviction       = optional(bool, true)
    auto_scale     = optional(bool, false)
    tls            = optional(bool, true)
    persistence    = optional(bool, true)
    max_request_size = optional(number, 1048576) # 1MB
    max_memory_size  = optional(number, 268435456) # 256MB
    max_entry_size   = optional(number, 104857600) # 100MB
    max_daily_bandwidth = optional(number, 53687091200) # 50GB
    max_commands_per_second = optional(number, 1000)
  })
  default = {}
}

# Redis ACL Users
variable "redis_users" {
  description = "Additional Redis ACL users"
  type = map(object({
    commands     = optional(list(string), ["+@all"])
    keys         = optional(list(string), ["*"])
    passwords    = optional(list(string), [])
    channels     = optional(list(string), ["*"])
    no_pass      = optional(bool, false)
  }))
  default = {}
}

# Kafka Configuration
variable "enable_kafka" {
  description = "Enable Upstash Kafka"
  type        = bool
  default     = false
}

variable "kafka_config" {
  description = "Kafka cluster configuration"
  type = object({
    name           = optional(string)
    region         = optional(string, "us-east-1")
    multizone      = optional(bool, false)
    max_retention_size = optional(number, 1073741824) # 1GB
    max_retention_time = optional(number, 604800000)  # 7 days in ms
    max_message_size   = optional(number, 1048576)    # 1MB
    max_partitions     = optional(number, 100)
    max_topics         = optional(number, 10)
  })
  default = {}
}

# Kafka Topics
variable "kafka_topics" {
  description = "Kafka topics to create"
  type = map(object({
    partitions        = optional(number, 1)
    retention_time    = optional(number, 604800000) # 7 days
    retention_size    = optional(number, 1073741824) # 1GB
    max_message_size  = optional(number, 1048576) # 1MB
    cleanup_policy    = optional(string, "delete")
  }))
  default = {}
}

# QStash Configuration
variable "enable_qstash" {
  description = "Enable QStash for message queuing"
  type        = bool
  default     = false
}

variable "qstash_config" {
  description = "QStash configuration"
  type = object({
    max_retries      = optional(number, 3)
    retry_delay      = optional(number, 60) # seconds
    visibility_timeout = optional(number, 300) # seconds
    max_receive_count  = optional(number, 3)
  })
  default = {}
}

# Rate Limiting
variable "enable_ratelimit" {
  description = "Enable rate limiting service"
  type        = bool
  default     = false
}

variable "ratelimit_config" {
  description = "Rate limiting configuration"
  type = object({
    database_id = optional(string) # Use existing Redis or create new
    algorithm   = optional(string, "sliding-window") # sliding-window, fixed-window, token-bucket
  })
  default = {}
}

# Rate Limit Rules
variable "rate_limit_rules" {
  description = "Rate limiting rules"
  type = map(object({
    limit    = number
    window   = string # e.g., "1m", "1h", "1d"
    key_prefix = optional(string)
    anonymous = optional(bool, false)
  }))
  default = {
    "api-default" = {
      limit  = 100
      window = "1m"
    }
  }
}

# Vector Database Configuration
variable "enable_vector" {
  description = "Enable Upstash Vector database"
  type        = bool
  default     = false
}

variable "vector_config" {
  description = "Vector database configuration"
  type = object({
    name           = optional(string)
    region         = optional(string, "us-east-1")
    dimension      = optional(number, 384)
    metric         = optional(string, "cosine") # cosine, euclidean, dot-product
    max_vectors    = optional(number, 100000)
    reserved_price = optional(string, "free") # free, pay-as-you-go, fixed-10, fixed-25, fixed-50, fixed-100
  })
  default = {}
}

# Vector Indexes
variable "vector_indexes" {
  description = "Vector indexes to create"
  type = map(object({
    dimension = number
    metric    = optional(string, "cosine")
    metadata_config = optional(object({
      indexed = optional(list(string), [])
    }))
  }))
  default = {}
}

# Team Configuration
variable "team_id" {
  description = "Upstash team ID"
  type        = string
  default     = ""
}

# Monitoring
variable "enable_monitoring" {
  description = "Enable monitoring alerts"
  type        = bool
  default     = true
}

variable "monitoring_config" {
  description = "Monitoring configuration"
  type = object({
    email_alerts = optional(list(string), [])
    slack_webhook = optional(string)
    alert_thresholds = optional(object({
      cpu_percent         = optional(number, 80)
      memory_percent      = optional(number, 80)
      bandwidth_percent   = optional(number, 90)
      commands_per_second = optional(number, 900)
    }))
  })
  default = {}
}

# QStash Configuration
variable "enable_qstash" {
  description = "Enable QStash message queue"
  type        = bool
  default     = false
}

variable "qstash_config" {
  description = "QStash configuration"
  type = object({
    enable_topics     = optional(bool, true)
    enable_schedules  = optional(bool, true)
    enable_dlq        = optional(bool, true)
    retention_days    = optional(number, 7)
  })
  default = {}
}

# QStash Topics
variable "qstash_topics" {
  description = "QStash topics to create"
  type = map(object({
    endpoints = list(object({
      url     = string
      headers = optional(map(string), {})
      retry   = optional(object({
        count    = optional(number, 3)
        delay    = optional(string, "10s")
        max_delay = optional(string, "1h")
      }))
    }))
  }))
  default = {}
}

# QStash Schedules
variable "qstash_schedules" {
  description = "QStash scheduled jobs"
  type = map(object({
    destination = string
    cron        = string
    body        = optional(string)
    headers     = optional(map(string), {})
    callback    = optional(string)
    failure_callback = optional(string)
    retry       = optional(object({
      count    = optional(number, 3)
      delay    = optional(string, "60s")
    }))
    delay       = optional(string)
    not_before  = optional(number)
  }))
  default = {}
}

# QStash URL Groups
variable "qstash_url_groups" {
  description = "QStash URL groups for fanout messaging"
  type = map(object({
    endpoints = list(object({
      url     = string
      headers = optional(map(string), {})
    }))
    retry_all = optional(bool, true)
  }))
  default = {}
}

# QStash Dead Letter Queue
variable "qstash_dlq_config" {
  description = "QStash dead letter queue configuration"
  type = object({
    enabled          = optional(bool, true)
    max_receive_count = optional(number, 3)
    retention_days   = optional(number, 14)
    webhook_url      = optional(string)
  })
  default = {}
}

# QStash Rate Limits
variable "qstash_rate_limits" {
  description = "QStash rate limiting per topic/endpoint"
  type = map(object({
    rate       = number
    burst      = optional(number)
    period     = string # "1s", "1m", "1h"
    key_by     = optional(string, "endpoint") # endpoint, topic, global
  }))
  default = {}
}

# Tags
variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}