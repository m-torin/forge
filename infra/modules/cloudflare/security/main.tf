# Cloudflare Security Module

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# SSL/TLS Mode
resource "cloudflare_zone_settings_override" "ssl" {
  zone_id = var.zone_id

  settings {
    ssl                  = var.ssl_mode
    min_tls_version      = var.minimum_tls_version
    tls_1_3              = var.tls_1_3
    always_use_https     = var.ssl_mode != "off" ? "on" : "off"
    automatic_https_rewrites = var.ssl_mode != "off" ? "on" : "off"
  }
}

# Security Headers Transform Rule
resource "cloudflare_ruleset" "security_headers" {
  zone_id     = var.zone_id
  name        = "Security Headers"
  description = "Add security headers to responses"
  kind        = "zone"
  phase       = "http_response_headers_transform"

  dynamic "rules" {
    for_each = var.security_headers
    content {
      action = "rewrite"
      action_parameters {
        headers {
          name      = rules.value.name
          value     = rules.value.value
          operation = rules.value.operation
        }
      }
      expression  = "true"
      description = "Set ${rules.value.name} header"
      enabled     = true
    }
  }

  # HSTS Header with conditional settings
  dynamic "rules" {
    for_each = var.enable_hsts ? [1] : []
    content {
      action = "rewrite"
      action_parameters {
        headers {
          name      = "Strict-Transport-Security"
          value     = "max-age=${var.hsts_settings.max_age}${var.hsts_settings.include_subdomains ? "; includeSubDomains" : ""}${var.hsts_settings.preload ? "; preload" : ""}"
          operation = "set"
        }
      }
      expression  = "ssl"
      description = "Set HSTS header for HTTPS requests"
      enabled     = true
    }
  }
}

# Content Security Policy
resource "cloudflare_ruleset" "csp" {
  count = var.content_security_policy.enabled ? 1 : 0

  zone_id     = var.zone_id
  name        = "Content Security Policy"
  description = "Implement Content Security Policy"
  kind        = "zone"
  phase       = "http_response_headers_transform"

  rules {
    action = "rewrite"
    action_parameters {
      headers {
        name      = var.content_security_policy.report_only ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy"
        value     = local.csp_header_value
        operation = "set"
      }
    }
    expression  = "true"
    description = "Set CSP header"
    enabled     = true
  }
}

# WAF Custom Rules
resource "cloudflare_ruleset" "waf_custom" {
  count = var.enable_waf ? 1 : 0

  zone_id     = var.zone_id
  name        = "WAF Custom Rules"
  description = "Custom WAF rules"
  kind        = "zone"
  phase       = "http_request_firewall_custom"

  dynamic "rules" {
    for_each = var.firewall_rules
    content {
      action      = rules.value.action
      expression  = rules.value.expression
      description = rules.value.description
      enabled     = !rules.value.paused
    }
  }
}

# Rate Limiting Rules
resource "cloudflare_ruleset" "rate_limiting" {
  count = var.enable_rate_limiting ? 1 : 0

  zone_id     = var.zone_id
  name        = "Rate Limiting Rules"
  description = "Rate limiting configuration"
  kind        = "zone"
  phase       = "http_ratelimit"

  dynamic "rules" {
    for_each = var.rate_limit_rules
    content {
      action = "block"
      action_parameters {
        response {
          status_code = 429
          content     = "Too Many Requests"
          content_type = "text/plain"
        }
      }
      ratelimit {
        characteristics     = ["cf.colo.id", "ip.src"]
        period              = rules.value.period
        requests_per_period = rules.value.threshold
        mitigation_timeout  = rules.value.period * 2
      }
      expression  = rules.value.expression
      description = rules.value.description
      enabled     = true
    }
  }
}

# Bot Management Rules
resource "cloudflare_bot_management" "this" {
  count = var.enable_bot_management ? 1 : 0

  zone_id                    = var.zone_id
  enable_js                  = true
  fight_mode                 = var.bot_fight_mode
  optimize_wordpress         = false
  
  # Additional bot management settings would go here
}

# Turnstile Widgets
resource "cloudflare_turnstile_widget" "this" {
  for_each = var.enable_turnstile ? var.turnstile_widgets : {}

  account_id       = var.account_id
  name             = each.key
  mode             = each.value.mode
  domains          = each.value.domains
  bot_fight_mode   = each.value.bot_fight_mode
  clearance_level  = each.value.clearance_level
  region           = each.value.region
}

# Authenticated Origin Pulls
resource "cloudflare_authenticated_origin_pulls" "this" {
  count = var.enable_authenticated_origin_pulls ? 1 : 0

  zone_id = var.zone_id
  enabled = true
}

resource "cloudflare_authenticated_origin_pulls_certificate" "this" {
  count = var.enable_authenticated_origin_pulls && var.authenticated_origin_pulls_certificate != "" ? 1 : 0

  zone_id     = var.zone_id
  certificate = var.authenticated_origin_pulls_certificate
  private_key = var.authenticated_origin_pulls_certificate
  type        = "per-zone"
}

# IP Access Rules
resource "cloudflare_access_rule" "ip" {
  for_each = var.ip_access_rules

  zone_id = var.zone_id
  mode    = each.value.mode
  notes   = each.value.notes
  configuration {
    target = "ip"
    value  = each.value.target
  }
}

# User Agent Blocking Rules
resource "cloudflare_access_rule" "user_agent" {
  for_each = var.user_agent_rules

  zone_id = var.zone_id
  mode    = each.value.mode
  notes   = each.value.description
  configuration {
    target = "ua"
    value  = each.value.target
  }
}

# Zone Lockdown Rules
resource "cloudflare_zone_lockdown" "this" {
  for_each = var.zone_lockdown_rules

  zone_id     = var.zone_id
  description = each.value.description
  urls        = each.value.urls
  paused      = each.value.paused
  
  dynamic "configurations" {
    for_each = each.value.configurations
    content {
      target = configurations.value.target
      value  = configurations.value.value
    }
  }
}

# Page Shield Configuration
resource "cloudflare_page_shield" "this" {
  count = var.enable_page_shield ? 1 : 0

  zone_id = var.zone_id
  enabled = true
}

# Custom Error Pages
resource "cloudflare_custom_pages" "this" {
  for_each = var.custom_error_pages

  zone_id = var.zone_id
  type    = each.value.type
  url     = each.value.url
  state   = each.value.state
}

# Notification Policy
resource "cloudflare_notification_policy" "security_events" {
  count = var.security_notifications.enabled ? 1 : 0

  account_id  = var.account_id
  name        = "Security Event Notifications"
  description = "Notifications for security events"
  enabled     = true
  alert_type  = "security_events_alert"

  email_integration {
    id = var.security_notifications.email
  }

  dynamic "webhooks_integration" {
    for_each = var.security_notifications.webhooks
    content {
      id = webhooks_integration.value
    }
  }

  filters {
    zones = [var.zone_id]
  }
}

# Local values for complex configurations
locals {
  csp_directives = merge(
    {
      "default-src" = ["'self'"]
      "script-src"  = var.content_security_policy.nonce_enabled ? ["'self'", "'nonce-%{nonce}%'"] : ["'self'"]
      "style-src"   = var.content_security_policy.nonce_enabled ? ["'self'", "'nonce-%{nonce}%'"] : ["'self'"]
      "img-src"     = ["'self'", "data:", "https:"]
      "font-src"    = ["'self'"]
      "connect-src" = ["'self'"]
      "frame-ancestors" = ["'none'"]
      "base-uri"    = ["'self'"]
      "form-action" = ["'self'"]
    },
    var.content_security_policy.directives
  )

  csp_header_value = join("; ", [
    for directive, sources in local.csp_directives : "${directive} ${join(" ", sources)}"
  ])
}

# CASB (Cloud Access Security Broker) Configuration
resource "cloudflare_casb_profile" "this" {
  count = var.enable_casb ? 1 : 0

  account_id  = var.account_id
  name        = "CASB Security Profile"
  description = "Cloud Access Security Broker profile"

  # Microsoft 365 Integration
  dynamic "microsoft_365" {
    for_each = var.casb_integrations.enable_microsoft_365 ? [1] : []
    content {
      enabled = true
    }
  }

  # Google Workspace Integration
  dynamic "google_workspace" {
    for_each = var.casb_integrations.enable_google_workspace ? [1] : []
    content {
      enabled = true
    }
  }

  # Slack Integration
  dynamic "slack" {
    for_each = var.casb_integrations.enable_slack ? [1] : []
    content {
      enabled = true
    }
  }

  # GitHub Integration
  dynamic "github" {
    for_each = var.casb_integrations.enable_github ? [1] : []
    content {
      enabled = true
    }
  }

  # Settings
  logging_enabled    = var.casb_settings.enable_logging
  reporting_enabled  = var.casb_settings.enable_reporting
  scan_frequency     = var.casb_settings.scan_frequency
  dlp_enabled        = var.casb_settings.enable_dlp
  threat_detection   = var.casb_settings.enable_threat_detection
}

# CASB Policies
resource "cloudflare_casb_policy" "this" {
  for_each = var.enable_casb ? var.casb_policies : {}

  account_id  = var.account_id
  name        = each.value.name
  type        = each.value.type
  severity    = each.value.severity
  enabled     = each.value.enabled

  dynamic "rules" {
    for_each = each.value.rules
    content {
      field    = rules.value.field
      operator = rules.value.operator
      value    = rules.value.value
    }
  }

  actions = each.value.actions
}

# Leaked Credentials Detection
resource "cloudflare_leaked_credential_check" "this" {
  count = var.enable_leaked_credentials ? 1 : 0

  zone_id = var.zone_id
  enabled = true

  detection_mode     = var.leaked_credentials_settings.detection_mode
  action            = var.leaked_credentials_settings.action
  notification_email = var.leaked_credentials_settings.notification_email
  auto_rotate       = var.leaked_credentials_settings.auto_rotate
  check_frequency   = var.leaked_credentials_settings.check_frequency

  dynamic "password_policy" {
    for_each = var.leaked_credentials_settings.password_policy != null ? [var.leaked_credentials_settings.password_policy] : []
    content {
      min_length      = password_policy.value.min_length
      require_upper   = password_policy.value.require_upper
      require_lower   = password_policy.value.require_lower
      require_number  = password_policy.value.require_number
      require_special = password_policy.value.require_special
      max_age_days    = password_policy.value.max_age_days
    }
  }
}

# Bot Fight Mode
resource "cloudflare_bot_management" "super_bot_fight" {
  count = var.bot_fight_mode ? 1 : 0

  zone_id             = var.zone_id
  enable_js_detection = true
  fight_mode          = true
}

# Advanced Rules Engine - URI Normalization (Enhanced from Legacy)
resource "cloudflare_url_normalization_settings" "this" {
  count = var.enable_rules_engine && !var.uri_normalization.use_advanced_normalization ? 1 : 0

  zone_id               = var.zone_id
  type                  = "cloudflare"
  scope                 = "incoming"
  normalize_incoming_urls = {
    normalize_path    = var.uri_normalization.normalize_path
    normalize_slash   = var.uri_normalization.normalize_slash
    normalize_percent = var.uri_normalization.normalize_percent
  }
}

# Advanced URI Normalization with Granular Control (migrated from legacy)
resource "cloudflare_ruleset" "uri_normalization_advanced" {
  count = var.enable_rules_engine && var.uri_normalization.use_advanced_normalization ? 1 : 0

  zone_id     = var.zone_id
  name        = "URI Normalization Settings"
  description = "Configures how incoming URI paths are normalized with granular control"
  kind        = "zone"
  phase       = "http_request_transform"

  # Apply URI normalization settings
  rules {
    action      = "rewrite"
    description = "Apply URI normalization settings"
    expression  = "true"
    enabled     = true
    
    action_parameters {
      uri {
        path {
          expression = "http.request.uri.path"

          # Configure normalization settings
          normalization {
            # Main normalization toggle
            enable = var.uri_normalization.normalize_incoming_uri

            # Specific normalization settings
            leading_slashes            = var.uri_normalization.normalize_slashes
            trailing_slashes           = var.uri_normalization.normalize_slashes
            remove_dot_segments        = var.uri_normalization.normalize_path_dots
            collapse_adjacent_slashes  = var.uri_normalization.normalize_slashes
            uppercase_percent_encoding = var.uri_normalization.percent_encode_path
            lowercase_alpha            = var.uri_normalization.lowercase_path
          }
        }
      }
    }
  }
}

# Transform Rules
resource "cloudflare_ruleset" "transform_rules" {
  count = var.enable_rules_engine && length(var.transform_rules) > 0 ? 1 : 0

  zone_id     = var.zone_id
  name        = "Transform Rules"
  description = "URL and header transformation rules"
  kind        = "zone"
  phase       = "http_request_transform"

  dynamic "rules" {
    for_each = var.transform_rules
    content {
      action      = "rewrite"
      expression  = rules.value.expression
      description = rules.value.name
      enabled     = rules.value.enabled
      
      action_parameters {
        dynamic "uri" {
          for_each = [for t in rules.value.transforms : t if t.type == "url_rewrite"]
          content {
            path {
              value = uri.value.value
            }
            query {
              value = uri.value.preserve ? null : ""
            }
          }
        }

        dynamic "headers" {
          for_each = [for t in rules.value.transforms : t if t.type == "header_modify"]
          content {
            name      = headers.value.target
            operation = headers.value.action
            value     = headers.value.value
          }
        }
      }
    }
  }
}

# HTTP Request Rules
resource "cloudflare_ruleset" "http_request_rules" {
  count = var.enable_rules_engine && length(var.http_request_rules) > 0 ? 1 : 0

  zone_id     = var.zone_id
  name        = "HTTP Request Rules"
  description = "HTTP request modification rules"
  kind        = "zone"
  phase       = "http_request_firewall_custom"

  dynamic "rules" {
    for_each = var.http_request_rules
    content {
      action      = rules.value.action
      expression  = rules.value.expression
      description = rules.value.name
      enabled     = rules.value.enabled

      dynamic "action_parameters" {
        for_each = rules.value.action_parameters != null ? [rules.value.action_parameters] : []
        content {
          # Redirect parameters
          dynamic "uri" {
            for_each = action_parameters.value.uri != null ? [action_parameters.value.uri] : []
            content {
              path {
                value = uri.value
              }
            }
          }

          # Response parameters
          status_code = action_parameters.value.status_code

          # Headers
          dynamic "headers" {
            for_each = action_parameters.value.headers != null ? action_parameters.value.headers : {}
            content {
              name      = headers.key
              value     = headers.value
              operation = "set"
            }
          }
        }
      }
    }
  }
}

# HTTP Response Rules
resource "cloudflare_ruleset" "http_response_rules" {
  count = var.enable_rules_engine && length(var.http_response_rules) > 0 ? 1 : 0

  zone_id     = var.zone_id
  name        = "HTTP Response Rules"
  description = "HTTP response modification rules"
  kind        = "zone"
  phase       = "http_response_headers_transform"

  dynamic "rules" {
    for_each = var.http_response_rules
    content {
      action      = "rewrite"
      expression  = rules.value.expression
      description = rules.value.name
      enabled     = rules.value.enabled

      action_parameters {
        # Headers
        dynamic "headers" {
          for_each = rules.value.headers != null ? rules.value.headers : {}
          content {
            name      = headers.key
            operation = headers.value.operation
            value     = headers.value.value
          }
        }

        # Cache control
        dynamic "edge_ttl" {
          for_each = rules.value.cache_control != null && rules.value.cache_control.edge_ttl != null ? [rules.value.cache_control.edge_ttl] : []
          content {
            mode    = "override_origin"
            default = edge_ttl.value
          }
        }

        dynamic "browser_ttl" {
          for_each = rules.value.cache_control != null && rules.value.cache_control.browser_ttl != null ? [rules.value.cache_control.browser_ttl] : []
          content {
            mode    = "override_origin"
            default = browser_ttl.value
          }
        }
      }
    }
  }
}