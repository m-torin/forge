# Monitoring Module Variables

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "zone_id" {
  description = "Cloudflare zone ID (optional, required for dashboard route)"
  type        = string
  default     = ""
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# Email Notifications
variable "enable_email_notifications" {
  description = "Enable email notifications"
  type        = bool
  default     = true
}

variable "notification_email" {
  description = "Email address for notifications"
  type        = string
  default     = ""
}

# Custom Webhooks
variable "custom_webhooks" {
  description = "Custom webhook configurations"
  type = map(object({
    url    = string
    secret = optional(string)
  }))
  default = {}
}

# Worker Alerts
variable "worker_alerts" {
  description = "Worker alert configurations"
  type = object({
    error_alerts        = optional(bool, true)
    error_webhook_names = optional(list(string), [])
    cpu_alerts          = optional(bool, true)
    cpu_threshold       = optional(number, 90)
    cpu_webhook_names   = optional(list(string), [])
    usage_alerts        = optional(bool, true)
    usage_threshold     = optional(number, 80)
    usage_webhook_names = optional(list(string), [])
    script_name_filter  = optional(list(string), [])
  })
  default = {}
}

# HTTP Alerts
variable "http_alerts" {
  description = "HTTP alert configurations"
  type = object({
    enabled           = optional(bool, true)
    zone_ids          = optional(list(string), [])
    hostnames         = optional(list(string), [])
    error_threshold   = optional(number, 100)
    latency_threshold = optional(number, 1000) # milliseconds
    webhook_names     = optional(list(string), [])
  })
  default = {}
}

# DDoS Alerts
variable "ddos_alerts" {
  description = "DDoS alert configurations"
  type = object({
    enabled       = optional(bool, true)
    zone_ids      = optional(list(string), [])
    webhook_names = optional(list(string), [])
  })
  default = {}
}

# WAF Alerts
variable "waf_alerts" {
  description = "WAF alert configurations"
  type = object({
    enabled       = optional(bool, true)
    zone_ids      = optional(list(string), [])
    actions       = optional(list(string), ["block", "challenge"])
    rule_ids      = optional(list(string), [])
    threshold     = optional(number, 100)
    webhook_names = optional(list(string), [])
  })
  default = {}
}

# SSL Certificate Alerts
variable "ssl_alerts" {
  description = "SSL certificate alert configurations"
  type = object({
    enabled            = optional(bool, true)
    zone_ids           = optional(list(string), [])
    days_before_expiry = optional(number, 14)
    webhook_names      = optional(list(string), [])
  })
  default = {}
}

# Rate Limit Alerts
variable "rate_limit_alerts" {
  description = "Rate limit alert configurations"
  type = object({
    enabled       = optional(bool, true)
    zone_ids      = optional(list(string), [])
    threshold     = optional(number, 100)
    webhook_names = optional(list(string), [])
  })
  default = {}
}

# Origin Health Alerts
variable "origin_alerts" {
  description = "Origin health alert configurations"
  type = object({
    enabled              = optional(bool, true)
    zone_ids             = optional(list(string), [])
    health_status_filter = optional(list(string), ["unhealthy", "degraded"])
    webhook_names        = optional(list(string), [])
  })
  default = {}
}

# Custom Alert Rules
variable "custom_alerts" {
  description = "Custom alert configurations"
  type = map(object({
    description   = string
    alert_type    = string
    enabled       = optional(bool, true)
    send_email    = optional(bool, true)
    webhook_names = optional(list(string), [])
    filters       = any
  }))
  default = {}
}

# Logpush Jobs
variable "logpush_jobs" {
  description = "Logpush job configurations for monitoring"
  type = map(object({
    dataset             = string
    destination         = string
    enabled             = optional(bool, true)
    filter              = optional(string)
    frequency           = optional(string, "high")
    ownership_challenge = optional(string)
  }))
  default = {}
}

# Monitoring Dashboard
variable "enable_monitoring_dashboard" {
  description = "Enable monitoring dashboard worker"
  type        = bool
  default     = false
}

variable "monitoring_dashboard_hostname" {
  description = "Hostname pattern for monitoring dashboard"
  type        = string
  default     = "monitoring.example.com/*"
}

# Alert Aggregation
variable "alert_aggregation" {
  description = "Alert aggregation settings"
  type = object({
    enabled       = optional(bool, true)
    window_minutes = optional(number, 5)
    group_by      = optional(list(string), ["alert_type", "zone"])
  })
  default = {}
}

# Notification Channels
variable "notification_channels" {
  description = "Notification channel preferences"
  type = object({
    slack = optional(object({
      enabled     = optional(bool, false)
      webhook_url = optional(string)
      channel     = optional(string, "#alerts")
      username    = optional(string, "Cloudflare Monitor")
    }))
    pagerduty = optional(object({
      enabled         = optional(bool, false)
      integration_key = optional(string)
      severity_mapping = optional(map(string), {
        critical = "critical"
        high     = "error"
        medium   = "warning"
        low      = "info"
      })
    }))
    discord = optional(object({
      enabled     = optional(bool, false)
      webhook_url = optional(string)
    }))
    teams = optional(object({
      enabled     = optional(bool, false)
      webhook_url = optional(string)
    }))
  })
  default = {}
}

# Alert Severity Levels
variable "severity_thresholds" {
  description = "Thresholds for alert severity levels"
  type = object({
    critical = optional(object({
      error_rate_percent   = optional(number, 50)
      response_time_ms     = optional(number, 5000)
      cpu_usage_percent    = optional(number, 95)
      worker_usage_percent = optional(number, 95)
    }))
    high = optional(object({
      error_rate_percent   = optional(number, 25)
      response_time_ms     = optional(number, 3000)
      cpu_usage_percent    = optional(number, 85)
      worker_usage_percent = optional(number, 85)
    }))
    medium = optional(object({
      error_rate_percent   = optional(number, 10)
      response_time_ms     = optional(number, 1500)
      cpu_usage_percent    = optional(number, 75)
      worker_usage_percent = optional(number, 75)
    }))
    low = optional(object({
      error_rate_percent   = optional(number, 5)
      response_time_ms     = optional(number, 1000)
      cpu_usage_percent    = optional(number, 65)
      worker_usage_percent = optional(number, 65)
    }))
  })
  default = {}
}

# Maintenance Windows
variable "maintenance_windows" {
  description = "Maintenance windows when alerts should be suppressed"
  type = list(object({
    name       = string
    start_time = string # RFC3339 format
    end_time   = string # RFC3339 format
    recurring  = optional(string, "none") # none, daily, weekly, monthly
    timezone   = optional(string, "UTC")
  }))
  default = []
}

# Tags
variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}