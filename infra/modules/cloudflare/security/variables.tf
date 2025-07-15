# Security Module Variables

variable "zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

# WAF Settings
variable "enable_waf" {
  description = "Enable Web Application Firewall"
  type        = bool
  default     = false
}

variable "waf_sensitivity" {
  description = "WAF sensitivity level"
  type        = string
  default     = "medium"
  validation {
    condition     = contains(["off", "low", "medium", "high"], var.waf_sensitivity)
    error_message = "WAF sensitivity must be one of: off, low, medium, high"
  }
}

variable "waf_action_mode" {
  description = "Default action for WAF rules"
  type        = string
  default     = "challenge"
  validation {
    condition     = contains(["simulate", "block", "challenge"], var.waf_action_mode)
    error_message = "WAF action mode must be one of: simulate, block, challenge"
  }
}

# DDoS Protection
variable "enable_ddos_protection" {
  description = "Enable advanced DDoS protection"
  type        = bool
  default     = true
}

variable "ddos_sensitivity" {
  description = "DDoS protection sensitivity"
  type        = string
  default     = "default"
  validation {
    condition     = contains(["default", "low", "high"], var.ddos_sensitivity)
    error_message = "DDoS sensitivity must be one of: default, low, high"
  }
}

# Bot Management
variable "enable_bot_management" {
  description = "Enable bot management"
  type        = bool
  default     = false
}

variable "bot_fight_mode" {
  description = "Enable Super Bot Fight Mode"
  type        = bool
  default     = false
}

variable "bot_management_rules" {
  description = "Bot management rule configurations"
  type = map(object({
    expression  = string
    action      = string
    description = optional(string)
  }))
  default = {}
}

# Rate Limiting
variable "enable_rate_limiting" {
  description = "Enable rate limiting"
  type        = bool
  default     = false
}

variable "rate_limit_rules" {
  description = "Rate limiting rules"
  type = map(object({
    threshold    = number
    period       = number
    action       = string
    expression   = string
    description  = optional(string)
    bypass_rules = optional(list(string), [])
  }))
  default = {}
}

# Security Headers
variable "security_headers" {
  description = "Security headers to add"
  type = map(object({
    name      = string
    value     = string
    operation = optional(string, "set")
  }))
  default = {
    "strict-transport-security" = {
      name  = "Strict-Transport-Security"
      value = "max-age=31536000; includeSubDomains; preload"
    }
    "x-content-type-options" = {
      name  = "X-Content-Type-Options"
      value = "nosniff"
    }
    "x-frame-options" = {
      name  = "X-Frame-Options"
      value = "SAMEORIGIN"
    }
    "x-xss-protection" = {
      name  = "X-XSS-Protection"
      value = "1; mode=block"
    }
    "referrer-policy" = {
      name  = "Referrer-Policy"
      value = "strict-origin-when-cross-origin"
    }
  }
}

# Content Security Policy
variable "content_security_policy" {
  description = "Content Security Policy configuration"
  type = object({
    enabled            = optional(bool, false)
    report_only        = optional(bool, false)
    directives         = optional(map(list(string)), {})
    report_uri         = optional(string)
    report_to          = optional(string)
    nonce_enabled      = optional(bool, true)
    hash_enabled       = optional(bool, false)
  })
  default = {}
}

# SSL/TLS Settings
variable "ssl_mode" {
  description = "SSL/TLS encryption mode"
  type        = string
  default     = "flexible"
  validation {
    condition     = contains(["off", "flexible", "full", "full_strict"], var.ssl_mode)
    error_message = "SSL mode must be one of: off, flexible, full, full_strict"
  }
}

variable "minimum_tls_version" {
  description = "Minimum TLS version"
  type        = string
  default     = "1.2"
  validation {
    condition     = contains(["1.0", "1.1", "1.2", "1.3"], var.minimum_tls_version)
    error_message = "Minimum TLS version must be one of: 1.0, 1.1, 1.2, 1.3"
  }
}

variable "tls_1_3" {
  description = "Enable TLS 1.3"
  type        = string
  default     = "on"
}

variable "enable_hsts" {
  description = "Enable HSTS"
  type        = bool
  default     = true
}

variable "hsts_settings" {
  description = "HSTS configuration"
  type = object({
    max_age            = optional(number, 31536000)
    include_subdomains = optional(bool, true)
    preload            = optional(bool, true)
    nosniff            = optional(bool, true)
  })
  default = {}
}

# Authenticated Origin Pulls
variable "enable_authenticated_origin_pulls" {
  description = "Enable authenticated origin pulls"
  type        = bool
  default     = false
}

variable "authenticated_origin_pulls_certificate" {
  description = "Certificate for authenticated origin pulls"
  type        = string
  default     = ""
  sensitive   = true
}

# Turnstile (CAPTCHA)
variable "enable_turnstile" {
  description = "Enable Turnstile CAPTCHA"
  type        = bool
  default     = false
}

variable "turnstile_widgets" {
  description = "Turnstile widget configurations"
  type = map(object({
    mode             = string
    domains          = list(string)
    bot_fight_mode   = optional(bool, false)
    offlabel         = optional(bool, false)
    clearance_level  = optional(string, "interactive")
    region           = optional(string)
  }))
  default = {}
}

# Page Shield
variable "enable_page_shield" {
  description = "Enable Page Shield"
  type        = bool
  default     = false
}

variable "page_shield_policies" {
  description = "Page Shield policies"
  type = map(object({
    action      = string
    expression  = string
    description = optional(string)
  }))
  default = {}
}

# CASB (Cloud Access Security Broker)
variable "enable_casb" {
  description = "Enable CASB"
  type        = bool
  default     = false
}

variable "casb_integrations" {
  description = "CASB integration configurations"
  type = object({
    enable_microsoft_365  = optional(bool, false)
    enable_google_workspace = optional(bool, false)
    enable_slack         = optional(bool, false)
    enable_github        = optional(bool, false)
    enable_salesforce    = optional(bool, false)
    enable_box           = optional(bool, false)
    enable_dropbox       = optional(bool, false)
  })
  default = {}
}

variable "casb_policies" {
  description = "CASB policies"
  type = map(object({
    name        = string
    type        = string # data_loss_prevention, access_control, shadow_it, compliance
    rules       = list(object({
      field     = string
      operator  = string
      value     = string
    }))
    actions     = list(string) # block, alert, log, quarantine
    severity    = optional(string, "medium")
    enabled     = optional(bool, true)
  }))
  default = {}
}

variable "casb_settings" {
  description = "CASB settings"
  type = object({
    enable_logging        = optional(bool, true)
    enable_reporting      = optional(bool, true)
    report_recipients     = optional(list(string), [])
    log_destination      = optional(string)
    scan_frequency       = optional(string, "real_time") # real_time, hourly, daily
    enable_dlp           = optional(bool, true)
    enable_threat_detection = optional(bool, true)
  })
  default = {}
}

# Leaked Credentials Detection
variable "enable_leaked_credentials" {
  description = "Enable leaked credentials detection"
  type        = bool
  default     = false
}

variable "leaked_credentials_settings" {
  description = "Leaked credentials detection settings"
  type = object({
    detection_mode     = optional(string, "automatic") # automatic, manual
    action            = optional(string, "log") # log, block, challenge
    notification_email = optional(string)
    auto_rotate       = optional(bool, false)
    check_frequency   = optional(string, "real_time") # real_time, hourly, daily
    password_policy   = optional(object({
      min_length     = optional(number, 12)
      require_upper  = optional(bool, true)
      require_lower  = optional(bool, true)
      require_number = optional(bool, true)
      require_special = optional(bool, true)
      max_age_days   = optional(number, 90)
    }))
  })
  default = {}
}

# Firewall Rules
variable "firewall_rules" {
  description = "Custom firewall rules"
  type = map(object({
    expression  = string
    action      = string
    description = optional(string)
    priority    = optional(number)
    products    = optional(list(string), ["zoneLockdown", "uaBlock", "bic", "hot", "securityLevel", "rateLimit", "waf"])
    paused      = optional(bool, false)
  }))
  default = {}
}

# IP Access Rules
variable "ip_access_rules" {
  description = "IP access rules"
  type = map(object({
    mode  = string
    target = string
    notes = optional(string)
  }))
  default = {}
}

# User Agent Blocking Rules
variable "user_agent_rules" {
  description = "User agent blocking rules"
  type = map(object({
    mode        = string
    target      = string
    description = optional(string)
  }))
  default = {}
}

# Zone Lockdown Rules
variable "zone_lockdown_rules" {
  description = "Zone lockdown rules"
  type = map(object({
    configurations = list(object({
      target = string
      value  = string
    }))
    urls         = list(string)
    description  = optional(string)
    paused       = optional(bool, false)
  }))
  default = {}
}

# Custom Error Pages
variable "custom_error_pages" {
  description = "Custom error page configurations"
  type = map(object({
    type        = string
    url         = string
    state       = optional(string, "customized")
  }))
  default = {}
}

# Notification Settings
variable "security_notifications" {
  description = "Security notification settings"
  type = object({
    enabled  = optional(bool, false)
    email    = optional(string)
    webhooks = optional(list(string), [])
  })
  default = {}
}

# Advanced Rules Engine
variable "enable_rules_engine" {
  description = "Enable advanced rules engine"
  type        = bool
  default     = false
}

variable "uri_normalization" {
  description = "URI normalization settings"
  type = object({
    # Basic normalization settings
    normalize_path        = optional(bool, true)
    normalize_slash       = optional(bool, true)
    normalize_percent     = optional(bool, true)
    remove_query_params   = optional(list(string), [])
    sort_query_params     = optional(bool, false)
    
    # Advanced granular control (migrated from legacy)
    use_advanced_normalization = optional(bool, false)
    normalize_incoming_uri     = optional(bool, true)
    normalize_slashes         = optional(bool, true)
    normalize_path_dots       = optional(bool, true)
    percent_encode_path       = optional(bool, true)
    lowercase_path            = optional(bool, true)
  })
  default = {}
}

variable "transform_rules" {
  description = "URL and header transformation rules"
  type = map(object({
    name        = string
    expression  = string
    priority    = optional(number)
    enabled     = optional(bool, true)
    transforms  = list(object({
      type      = string # url_rewrite, header_modify, query_string_modify
      action    = string # rewrite, set, remove, append
      target    = string # path, query, header_name
      value     = optional(string)
      preserve  = optional(bool, false)
    }))
  }))
  default = {}
}

variable "http_request_rules" {
  description = "HTTP request modification rules"
  type = map(object({
    name        = string
    expression  = string
    action      = string # block, challenge, redirect, rewrite
    priority    = optional(number)
    enabled     = optional(bool, true)
    action_parameters = optional(object({
      uri         = optional(string)
      status_code = optional(number)
      headers     = optional(map(string))
    }))
  }))
  default = {}
}

variable "http_response_rules" {
  description = "HTTP response modification rules"
  type = map(object({
    name        = string
    expression  = string
    priority    = optional(number)
    enabled     = optional(bool, true)
    headers     = optional(map(object({
      operation = string # set, add, remove
      value     = optional(string)
    })))
    cache_control = optional(object({
      edge_ttl    = optional(number)
      browser_ttl = optional(number)
      bypass      = optional(bool)
    }))
  }))
  default = {}
}

# Tags
variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}