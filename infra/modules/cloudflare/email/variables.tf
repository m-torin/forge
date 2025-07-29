# Email Module Variables

variable "zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "domain" {
  description = "Primary domain"
  type        = string
}

# Email Routing
variable "enable_email_routing" {
  description = "Enable email routing"
  type        = bool
  default     = false
}

variable "catch_all_email" {
  description = "Catch-all email address for unmatched emails"
  type        = string
  default     = ""
}

variable "email_routing_rules" {
  description = "Email routing rules"
  type = map(object({
    type     = string # forward, worker, drop
    enabled  = optional(bool, true)
    priority = optional(number)
    
    # Matchers - now supports multiple conditions
    matchers = object({
      type     = string # all, any
      field    = optional(string, "to") # to, from, cc, subject, headers, body, size
      value    = optional(string)
      operator = optional(string, "equals") # equals, contains, matches (regex), greater_than, less_than
      
      # Additional matcher conditions
      conditions = optional(list(object({
        field    = string
        operator = string
        value    = string
      })), [])
    })
    
    # Actions
    forward_to = optional(list(string), []) # For forward type
    worker     = optional(string)           # For worker type
    
    # Advanced options
    add_headers = optional(map(string), {})
    remove_headers = optional(list(string), [])
    rewrite_subject = optional(string)
    auto_reply = optional(object({
      enabled  = bool
      template = string
      once_per = optional(string, "24h") # Rate limit auto-replies
    }))
    
    # Time-based rules
    schedule = optional(object({
      timezone   = optional(string, "UTC")
      days       = optional(list(string), ["all"]) # mon, tue, wed, thu, fri, sat, sun, weekday, weekend, all
      start_time = optional(string) # HH:MM format
      end_time   = optional(string) # HH:MM format
    }))
  }))
  default = {}
}

# Advanced Email Routing Templates
variable "email_routing_templates" {
  description = "Predefined email routing rule templates"
  type = map(object({
    description = string
    rules       = list(object({
      name     = string
      type     = string
      matchers = object({
        type     = string
        field    = string
        value    = string
        operator = optional(string, "equals")
      })
      forward_to      = optional(list(string), [])
      worker          = optional(string)
      add_headers     = optional(map(string), {})
      rewrite_subject = optional(string)
    }))
  }))
  default = {
    support_ticket_system = {
      description = "Route support emails to ticketing system"
      rules = [
        {
          name = "support-emails"
          type = "worker"
          matchers = {
            type     = "any"
            field    = "to"
            value    = "support@"
            operator = "contains"
          }
          worker = "support-ticket-processor"
          add_headers = {
            "X-Ticket-Priority" = "normal"
          }
        }
      ]
    }
    newsletter_management = {
      description = "Handle newsletter subscriptions and unsubscribes"
      rules = [
        {
          name = "subscribe"
          type = "worker"
          matchers = {
            type     = "all"
            field    = "subject"
            value    = "subscribe"
            operator = "contains"
          }
          worker = "newsletter-subscriber"
        },
        {
          name = "unsubscribe"
          type = "worker"
          matchers = {
            type     = "all"
            field    = "subject"
            value    = "unsubscribe"
            operator = "contains"
          }
          worker = "newsletter-unsubscriber"
        }
      ]
    }
  }
}

# Email Processing Workers Configuration
variable "enable_email_workers" {
  description = "Enable standard email processing workers"
  type        = bool
  default     = false
}

variable "email_worker_config" {
  description = "Configuration for email processing workers"
  type = object({
    enable_spam_filter      = optional(bool, true)
    enable_auto_responder   = optional(bool, false)
    enable_email_parser     = optional(bool, false)
    enable_email_archiver   = optional(bool, false)
    enable_threat_scanner   = optional(bool, true)
    enable_attachment_scanner = optional(bool, true)
    
    spam_filter_config = optional(object({
      threshold        = optional(number, 5.0)
      quarantine_score = optional(number, 7.0)
      reject_score     = optional(number, 10.0)
      custom_rules     = optional(map(number), {}) # rule_name = score
    }))
    
    auto_responder_config = optional(object({
      default_message  = optional(string, "Thank you for your email. We'll respond within 24 hours.")
      business_hours   = optional(bool, true)
      exclude_domains  = optional(list(string), ["noreply", "no-reply", "donotreply"])
      rate_limit       = optional(string, "1h") # One auto-reply per sender per hour
    }))
    
    parser_config = optional(object({
      extract_attachments = optional(bool, true)
      parse_headers      = optional(bool, true)
      extract_links      = optional(bool, true)
      classify_content   = optional(bool, true)
    }))
    
    archiver_config = optional(object({
      storage_bucket    = optional(string)
      retention_days    = optional(number, 365)
      compress          = optional(bool, true)
      encryption_key    = optional(string)
    }))
  })
  default = {}
}

# Email Security Rules
variable "email_security_rules" {
  description = "Advanced email security rules"
  type = map(object({
    enabled     = optional(bool, true)
    action      = string # quarantine, reject, tag, forward
    priority    = optional(number)
    
    conditions = object({
      spf_fail         = optional(bool, false)
      dkim_fail        = optional(bool, false)
      dmarc_fail       = optional(bool, false)
      spam_score_above = optional(number)
      virus_detected   = optional(bool, false)
      phishing_detected = optional(bool, false)
      
      sender_patterns = optional(list(string), []) # Regex patterns
      subject_patterns = optional(list(string), []) # Regex patterns
      body_patterns    = optional(list(string), []) # Regex patterns
      attachment_types = optional(list(string), []) # File extensions
    })
    
    exceptions = optional(object({
      trusted_senders = optional(list(string), [])
      trusted_domains = optional(list(string), [])
    }))
  }))
  default = {}
}

# Email Lists and Groups
variable "email_lists" {
  description = "Email distribution lists"
  type = map(object({
    description = optional(string)
    members     = list(string)
    
    moderation = optional(object({
      enabled    = bool
      moderators = list(string)
      auto_approve_members = optional(bool, true)
    }))
    
    restrictions = optional(object({
      allowed_senders  = optional(list(string), []) # Empty = anyone can send
      blocked_senders  = optional(list(string), [])
      member_only      = optional(bool, false)
      max_message_size = optional(number, 10485760) # 10MB default
    }))
    
    auto_responses = optional(object({
      welcome_message    = optional(string)
      goodbye_message    = optional(string)
      bounce_message     = optional(string)
    }))
  }))
  default = {}
}

variable "email_addresses" {
  description = "Email addresses to create"
  type = map(object({
    email      = string
    forward_to = list(string)
    enabled    = optional(bool, true)
  }))
  default = {}
}

# Email Security
variable "enable_email_security" {
  description = "Enable Cloudflare Email Security"
  type        = bool
  default     = false
}

variable "email_security_settings" {
  description = "Email security configuration"
  type = object({
    # Threat Detection
    malicious_url_detection = optional(bool, true)
    malware_detection       = optional(bool, true)
    spam_detection          = optional(bool, true)
    phishing_detection      = optional(bool, true)
    
    # Actions
    quarantine_malicious = optional(bool, true)
    mark_spam_headers    = optional(bool, true)
    reject_invalid_spf   = optional(bool, false)
    reject_invalid_dkim  = optional(bool, false)
    reject_invalid_dmarc = optional(bool, false)
    
    # Trusted senders
    trusted_domains     = optional(list(string), [])
    trusted_ips         = optional(list(string), [])
    bypass_for_trusted  = optional(bool, true)
  })
  default = {}
}

# SPF, DKIM, DMARC
variable "spf_record" {
  description = "SPF record configuration"
  type = object({
    enabled     = optional(bool, true)
    include     = optional(list(string), [])
    ip4         = optional(list(string), [])
    ip6         = optional(list(string), [])
    all         = optional(string, "~all") # ~all (softfail), -all (fail), +all (pass)
    mx          = optional(bool, true)
    a           = optional(bool, false)
    exists      = optional(list(string), [])
    redirect    = optional(string)
  })
  default = {}
}

variable "dkim_records" {
  description = "DKIM records to create"
  type = map(object({
    selector = string
    key      = string
    enabled  = optional(bool, true)
  }))
  default = {}
}

variable "dmarc_record" {
  description = "DMARC record configuration"
  type = object({
    enabled         = optional(bool, true)
    policy          = optional(string, "quarantine") # none, quarantine, reject
    subdomain_policy = optional(string)              # none, quarantine, reject
    percentage      = optional(number, 100)
    rua_email       = optional(string)               # Aggregate reports email
    ruf_email       = optional(string)               # Forensic reports email
    fo              = optional(string, "1")          # Failure reporting options
    adkim           = optional(string, "r")          # DKIM alignment mode (r=relaxed, s=strict)
    aspf            = optional(string, "r")          # SPF alignment mode (r=relaxed, s=strict)
    ri              = optional(number, 86400)        # Reporting interval in seconds
  })
  default = {}
}

# BIMI (Brand Indicators for Message Identification)
variable "bimi_record" {
  description = "BIMI record configuration"
  type = object({
    enabled       = optional(bool, false)
    logo_url      = string
    certificate   = optional(string)
  })
  default = {
    enabled  = false
    logo_url = ""
  }
}

# MX Records
variable "mx_records" {
  description = "MX records configuration"
  type = list(object({
    priority = number
    server   = string
  }))
  default = []
}

# Email Workers
variable "email_workers" {
  description = "Email worker configurations"
  type = map(object({
    script_name        = string
    script_content     = optional(string)
    script_path        = optional(string)
    compatibility_date = optional(string)
    environment_variables = optional(map(string), {})
    secrets            = optional(map(string), {})
  }))
  default = {}
}

# Area 1 Email Security
variable "enable_area1" {
  description = "Enable Area 1 Email Security integration"
  type        = bool
  default     = false
}

variable "area1_settings" {
  description = "Area 1 configuration"
  type = object({
    mx_servers = optional(list(object({
      priority = number
      server   = string
    })), [])
    
    disposition_actions = optional(object({
      malicious   = optional(string, "quarantine")
      suspicious  = optional(string, "tag")
      spoof       = optional(string, "quarantine")
      spam        = optional(string, "tag")
      bulk        = optional(string, "deliver")
    }))
    
    connector_settings = optional(object({
      upstream_server   = string
      upstream_port     = optional(number, 25)
      use_tls          = optional(bool, true)
      validate_cert    = optional(bool, true)
    }))
  })
  default = {}
}

# Email Templates
variable "email_templates" {
  description = "Email notification templates"
  type = map(object({
    subject     = string
    body_html   = string
    body_text   = string
    from_email  = string
    from_name   = string
  }))
  default = {}
}

# Notification Settings
variable "email_notifications" {
  description = "Email notification settings"
  type = object({
    admin_email        = string
    security_alerts    = optional(bool, true)
    bounce_notifications = optional(bool, true)
    weekly_reports     = optional(bool, false)
  })
  default = {
    admin_email = ""
  }
}

# Tags
variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

###################################################
# Advanced Email Security Policies (migrated from legacy)
###################################################

variable "enable_advanced_security_policies" {
  description = "Enable advanced email security policies with domain and IP filtering"
  type        = bool
  default     = false
}

variable "custom_domain_policies" {
  description = "Custom email security policies for specific domains"
  type = map(object({
    enabled     = optional(bool, true)
    priority    = optional(number, 5000)
    domains     = list(string)
    action_type = string # allow, deny, quarantine, tag
    action_value = optional(string, "trusted")
  }))
  default = {}
}

variable "custom_ip_policies" {
  description = "Custom email security policies for specific IP ranges"
  type = map(object({
    enabled     = optional(bool, true)
    priority    = optional(number, 6000)
    ip_ranges   = list(string)
    action_type = string # allow, deny, quarantine, tag
    action_value = optional(string, "trusted")
  }))
  default = {}
}

variable "enable_content_scanning" {
  description = "Enable advanced content scanning for phishing, spam, and suspicious attachments"
  type        = bool
  default     = false
}

variable "enable_bulk_email_handling" {
  description = "Enable bulk email handling policy"
  type        = bool
  default     = false
}

variable "bulk_email_action" {
  description = "Action to take for bulk emails"
  type        = string
  default     = "tag"
  validation {
    condition     = contains(["allow", "deny", "quarantine", "tag"], var.bulk_email_action)
    error_message = "Bulk email action must be one of: allow, deny, quarantine, tag"
  }
}

variable "enable_spoofing_protection" {
  description = "Enable spoof detection policy"
  type        = bool
  default     = false
}

variable "spoofing_action" {
  description = "Action to take for spoofed emails"
  type        = string
  default     = "quarantine"
  validation {
    condition     = contains(["allow", "deny", "quarantine", "tag"], var.spoofing_action)
    error_message = "Spoofing action must be one of: allow, deny, quarantine, tag"
  }
}