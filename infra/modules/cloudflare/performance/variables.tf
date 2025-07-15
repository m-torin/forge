# Performance Module Variables

variable "zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

# Caching Configuration
variable "cache_level" {
  description = "Cache level setting"
  type        = string
  default     = "standard"
  validation {
    condition     = contains(["bypass", "basic", "simplified", "aggressive", "standard"], var.cache_level)
    error_message = "Cache level must be one of: bypass, basic, simplified, aggressive, standard"
  }
}

variable "browser_cache_ttl" {
  description = "Browser cache TTL in seconds"
  type        = number
  default     = 14400 # 4 hours
}

variable "edge_cache_ttl" {
  description = "Edge cache TTL settings by status code"
  type = map(object({
    mode = string
    ttl  = number
  }))
  default = {
    "200" = {
      mode = "override_origin"
      ttl  = 86400 # 24 hours
    }
    "404" = {
      mode = "override_origin"
      ttl  = 60 # 1 minute
    }
  }
}

variable "cache_rules" {
  description = "Cache rules configuration"
  type = map(object({
    expression        = string
    cache_level       = optional(string)
    browser_cache_ttl = optional(number)
    edge_cache_ttl    = optional(number)
    bypass_cache      = optional(bool, false)
    description       = optional(string)
  }))
  default = {}
}

# Performance Features
variable "enable_argo" {
  description = "Enable Argo Smart Routing"
  type        = bool
  default     = false
}

variable "enable_tiered_caching" {
  description = "Enable Tiered Caching (requires Argo)"
  type        = bool
  default     = false
}

variable "enable_mirage" {
  description = "Enable Mirage (mobile image optimization)"
  type        = bool
  default     = false
}

variable "enable_polish" {
  description = "Enable Polish (image optimization)"
  type        = bool
  default     = false
}

variable "polish_settings" {
  description = "Polish configuration"
  type = object({
    mode  = optional(string, "off")
    webp  = optional(bool, true)
    avif  = optional(bool, false)
  })
  default = {}
  validation {
    condition     = contains(["off", "lossless", "lossy"], var.polish_settings.mode)
    error_message = "Polish mode must be one of: off, lossless, lossy"
  }
}

variable "enable_rocket_loader" {
  description = "Enable Rocket Loader for JavaScript"
  type        = bool
  default     = false
}

variable "enable_early_hints" {
  description = "Enable Early Hints (103 response)"
  type        = bool
  default     = false
}

variable "enable_h2_prioritization" {
  description = "Enable HTTP/2 prioritization"
  type        = bool
  default     = true
}

variable "enable_http3" {
  description = "Enable HTTP/3 (QUIC)"
  type        = bool
  default     = true
}

variable "enable_0rtt" {
  description = "Enable 0-RTT connection resumption"
  type        = bool
  default     = false
}

# Minification
variable "minify" {
  description = "Minification settings"
  type = object({
    css  = optional(bool, true)
    html = optional(bool, true)
    js   = optional(bool, true)
  })
  default = {}
}

# Compression
variable "enable_brotli" {
  description = "Enable Brotli compression"
  type        = bool
  default     = true
}

variable "enable_gzip" {
  description = "Enable gzip compression"
  type        = bool
  default     = true
}

# Prefetch and Preload
variable "prefetch_preload" {
  description = "Enable prefetch preload"
  type        = bool
  default     = false
}

# Auto Minify
variable "auto_minify" {
  description = "Auto minify settings"
  type = object({
    css  = optional(string, "on")
    html = optional(string, "on")
    js   = optional(string, "on")
  })
  default = {}
}

# Development Mode
variable "development_mode" {
  description = "Enable development mode (disables caching)"
  type        = bool
  default     = false
}

# Speed Optimization
variable "enable_speed_optimization" {
  description = "Enable Cloudflare Speed Optimization"
  type        = bool
  default     = false
}

# Health Checks
variable "enable_health_checks" {
  description = "Enable origin health checks"
  type        = bool
  default     = false
}

variable "health_checks" {
  description = "Health check configurations"
  type = map(object({
    address         = string
    name            = string
    description     = optional(string)
    check_regions   = optional(list(string), ["WNAM", "ENAM", "WEU", "EEU", "SEAS", "NEAS"])
    type            = optional(string, "HTTPS")
    port            = optional(number)
    method          = optional(string, "GET")
    path            = optional(string, "/")
    expected_codes  = optional(list(string), ["200"])
    expected_body   = optional(string)
    follow_redirects = optional(bool, false)
    allow_insecure  = optional(bool, false)
    timeout         = optional(number, 5)
    retries         = optional(number, 2)
    interval        = optional(number, 60)
    consecutive_fails = optional(number, 1)
    consecutive_successes = optional(number, 1)
    header          = optional(map(list(string)), {})
  }))
  default = {}
}

# Load Balancing
variable "enable_load_balancing" {
  description = "Enable load balancing"
  type        = bool
  default     = false
}

variable "load_balancer_pools" {
  description = "Load balancer pool configurations"
  type = map(object({
    name        = string
    description = optional(string)
    enabled     = optional(bool, true)
    minimum_origins = optional(number, 1)
    origins = list(object({
      name    = string
      address = string
      enabled = optional(bool, true)
      weight  = optional(number, 1)
      header  = optional(map(list(string)), {})
    }))
    origin_steering = optional(object({
      policy = optional(string, "random")
    }), {})
    notification_email = optional(string)
  }))
  default = {}
}

variable "load_balancers" {
  description = "Load balancer configurations"
  type = map(object({
    name            = string
    description     = optional(string)
    default_pool_ids = list(string)
    fallback_pool_id = string
    proxied         = optional(bool, true)
    ttl             = optional(number, 30)
    steering_policy = optional(string, "off")
    session_affinity = optional(string, "none")
    session_affinity_ttl = optional(number, 82800)
    session_affinity_attributes = optional(object({
      samesite = optional(string, "Auto")
      secure   = optional(string, "Auto")
      drain_duration = optional(number, 0)
    }), {})
    rules = optional(list(object({
      name      = string
      condition = string
      priority  = optional(number)
      disabled  = optional(bool, false)
      fixed_response = optional(object({
        message_body = optional(string)
        status_code  = optional(number)
        content_type = optional(string)
      }))
      overrides = optional(object({
        default_pools    = optional(list(string))
        fallback_pool    = optional(string)
        steering_policy  = optional(string)
        session_affinity = optional(string)
      }))
    })), [])
  }))
  default = {}
}

# Waiting Room
variable "enable_waiting_room" {
  description = "Enable waiting room"
  type        = bool
  default     = false
}

variable "waiting_rooms" {
  description = "Waiting room configurations"
  type = map(object({
    name                      = string
    host                      = string
    path                      = optional(string, "/")
    total_active_users        = number
    new_users_per_minute      = number
    custom_page_html          = optional(string)
    default_template_language = optional(string, "en-US")
    description               = optional(string)
    disable_session_renewal   = optional(bool, false)
    suspended                 = optional(bool, false)
    queue_all                 = optional(bool, false)
    json_response_enabled     = optional(bool, false)
    session_duration          = optional(number, 5)
    cookie_attributes = optional(object({
      samesite = optional(string, "auto")
      secure   = optional(string, "auto")
    }), {})
  }))
  default = {}
}

# Analytics and Monitoring
variable "enable_web_analytics" {
  description = "Enable Cloudflare Web Analytics"
  type        = bool
  default     = false
}

variable "web_analytics_site_tag" {
  description = "Web Analytics site tag"
  type        = string
  default     = ""
}

variable "enable_browser_insights" {
  description = "Enable Browser Insights (RUM)"
  type        = bool
  default     = false
}

# Tags
variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}