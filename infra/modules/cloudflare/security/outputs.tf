# Security Module Outputs

output "ssl_mode" {
  description = "Current SSL/TLS mode"
  value       = var.ssl_mode
}

output "minimum_tls_version" {
  description = "Minimum TLS version configured"
  value       = var.minimum_tls_version
}

output "waf_enabled" {
  description = "Whether WAF is enabled"
  value       = var.enable_waf
}

output "waf_custom_rules" {
  description = "Custom WAF rules created"
  value = var.enable_waf ? {
    for k, v in var.firewall_rules : k => {
      expression = v.expression
      action     = v.action
    }
  } : {}
}

output "rate_limiting_enabled" {
  description = "Whether rate limiting is enabled"
  value       = var.enable_rate_limiting
}

output "rate_limit_rules" {
  description = "Rate limiting rules configured"
  value = var.enable_rate_limiting ? {
    for k, v in var.rate_limit_rules : k => {
      threshold  = v.threshold
      period     = v.period
      expression = v.expression
    }
  } : {}
}

output "turnstile_widgets" {
  description = "Turnstile widget configurations"
  value = var.enable_turnstile ? {
    for k, v in cloudflare_turnstile_widget.this : k => {
      id       = v.id
      sitekey  = v.sitekey
      domains  = v.domains
      mode     = v.mode
    }
  } : {}
  sensitive = true
}

output "authenticated_origin_pulls_enabled" {
  description = "Whether authenticated origin pulls are enabled"
  value       = var.enable_authenticated_origin_pulls
}

output "security_headers_configured" {
  description = "Security headers that have been configured"
  value = {
    for k, v in var.security_headers : k => v.name
  }
}

output "csp_enabled" {
  description = "Whether Content Security Policy is enabled"
  value       = var.content_security_policy.enabled
}

output "csp_report_only" {
  description = "Whether CSP is in report-only mode"
  value       = var.content_security_policy.enabled ? var.content_security_policy.report_only : null
}

output "page_shield_enabled" {
  description = "Whether Page Shield is enabled"
  value       = var.enable_page_shield
}

output "bot_management_enabled" {
  description = "Whether bot management is enabled"
  value       = var.enable_bot_management
}

output "bot_fight_mode_enabled" {
  description = "Whether Super Bot Fight Mode is enabled"
  value       = var.bot_fight_mode
}

output "ip_access_rules" {
  description = "IP access rules configured"
  value = {
    for k, v in cloudflare_access_rule.ip : k => {
      target = v.configuration[0].value
      mode   = v.mode
    }
  }
}

output "user_agent_rules" {
  description = "User agent rules configured"
  value = {
    for k, v in cloudflare_access_rule.user_agent : k => {
      target = v.configuration[0].value
      mode   = v.mode
    }
  }
}

output "zone_lockdown_rules" {
  description = "Zone lockdown rules configured"
  value = {
    for k, v in cloudflare_zone_lockdown.this : k => {
      urls   = v.urls
      paused = v.paused
    }
  }
}

output "custom_error_pages" {
  description = "Custom error pages configured"
  value = {
    for k, v in cloudflare_custom_pages.this : k => {
      type = v.type
      url  = v.url
    }
  }
}

output "casb_enabled" {
  description = "Whether CASB is enabled"
  value       = var.enable_casb
}

output "casb_integrations" {
  description = "CASB integrations enabled"
  value = var.enable_casb ? {
    microsoft_365    = var.casb_integrations.enable_microsoft_365
    google_workspace = var.casb_integrations.enable_google_workspace
    slack           = var.casb_integrations.enable_slack
    github          = var.casb_integrations.enable_github
    salesforce      = var.casb_integrations.enable_salesforce
    box             = var.casb_integrations.enable_box
    dropbox         = var.casb_integrations.enable_dropbox
  } : {}
}

output "casb_policies" {
  description = "CASB policies configured"
  value = var.enable_casb ? {
    for k, v in var.casb_policies : k => {
      name     = v.name
      type     = v.type
      severity = v.severity
      actions  = v.actions
    }
  } : {}
}

output "leaked_credentials_enabled" {
  description = "Whether leaked credentials detection is enabled"
  value       = var.enable_leaked_credentials
}

output "leaked_credentials_settings" {
  description = "Leaked credentials detection settings"
  value = var.enable_leaked_credentials ? {
    detection_mode  = var.leaked_credentials_settings.detection_mode
    action         = var.leaked_credentials_settings.action
    auto_rotate    = var.leaked_credentials_settings.auto_rotate
    check_frequency = var.leaked_credentials_settings.check_frequency
  } : {}
}

output "rules_engine_enabled" {
  description = "Whether advanced rules engine is enabled"
  value       = var.enable_rules_engine
}

output "transform_rules" {
  description = "Transform rules configured"
  value = var.enable_rules_engine ? {
    for k, v in var.transform_rules : k => {
      name       = v.name
      expression = v.expression
      enabled    = v.enabled
    }
  } : {}
}

output "http_request_rules" {
  description = "HTTP request rules configured"
  value = var.enable_rules_engine ? {
    for k, v in var.http_request_rules : k => {
      name       = v.name
      expression = v.expression
      action     = v.action
      enabled    = v.enabled
    }
  } : {}
}

output "http_response_rules" {
  description = "HTTP response rules configured"
  value = var.enable_rules_engine ? {
    for k, v in var.http_response_rules : k => {
      name       = v.name
      expression = v.expression
      enabled    = v.enabled
    }
  } : {}
}

output "security_summary" {
  description = "Summary of security features enabled"
  value = {
    ssl_mode                    = var.ssl_mode
    minimum_tls_version         = var.minimum_tls_version
    hsts_enabled                = var.enable_hsts
    waf_enabled                 = var.enable_waf
    waf_sensitivity             = var.enable_waf ? var.waf_sensitivity : "n/a"
    rate_limiting_enabled       = var.enable_rate_limiting
    bot_management_enabled      = var.enable_bot_management
    bot_fight_mode_enabled      = var.bot_fight_mode
    turnstile_enabled           = var.enable_turnstile
    authenticated_origin_pulls  = var.enable_authenticated_origin_pulls
    page_shield_enabled         = var.enable_page_shield
    csp_enabled                 = var.content_security_policy.enabled
    casb_enabled                = var.enable_casb
    leaked_credentials_enabled  = var.enable_leaked_credentials
    rules_engine_enabled        = var.enable_rules_engine
  }
}