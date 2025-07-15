# Cloudflare Security Module

This module provides comprehensive security features for Cloudflare zones
including WAF, DDoS protection, bot management, rate limiting, and more.

## Features

- **SSL/TLS Configuration**: Flexible SSL modes and minimum TLS version
  enforcement
- **WAF (Web Application Firewall)**: Custom rules and sensitivity levels
- **DDoS Protection**: Advanced DDoS mitigation
- **Bot Management**: Bot detection and Super Bot Fight Mode
- **Rate Limiting**: Configurable rate limiting rules
- **Security Headers**: Automatic security header injection
- **Content Security Policy**: Full CSP support with nonce generation
- **Turnstile**: CAPTCHA alternative for bot protection
- **Authenticated Origin Pulls**: Secure origin authentication
- **Page Shield**: JavaScript dependency monitoring
- **CASB (Cloud Access Security Broker)**: Monitor and secure SaaS applications
- **Leaked Credentials Detection**: Detect and block compromised credentials
- **Advanced Rules Engine**: URL normalization, transform rules, HTTP
  request/response rules
- **IP Access Rules**: IP-based access control
- **Zone Lockdown**: Restrict access to specific URLs
- **Custom Error Pages**: Branded error pages

## Usage

```hcl
module "security" {
  source = "./modules/cloudflare/security"

  zone_id    = module.zone.zone_id
  account_id = var.cloudflare_account_id

  # SSL/TLS Configuration
  ssl_mode            = "full_strict"
  minimum_tls_version = "1.2"
  tls_1_3             = "on"
  enable_hsts         = true

  # WAF Configuration
  enable_waf      = true
  waf_sensitivity = "high"
  waf_action_mode = "challenge"

  # Custom Firewall Rules
  firewall_rules = {
    "block-bad-bots" = {
      expression  = "(cf.client.bot) and not (cf.verified_bot)"
      action      = "block"
      description = "Block unverified bots"
    }
    "challenge-suspicious" = {
      expression  = "(cf.threat_score > 30)"
      action      = "challenge"
      description = "Challenge high threat score requests"
    }
  }

  # Rate Limiting
  enable_rate_limiting = true
  rate_limit_rules = {
    "api-limit" = {
      threshold   = 100
      period      = 60
      action      = "block"
      expression  = "http.request.uri.path contains \"/api/\""
      description = "Limit API requests to 100/minute"
    }
  }

  # Bot Management
  enable_bot_management = true
  bot_fight_mode        = true

  # Turnstile CAPTCHA
  enable_turnstile = true
  turnstile_widgets = {
    "main-widget" = {
      mode    = "non-interactive"
      domains = ["example.com", "www.example.com"]
    }
  }

  # Content Security Policy
  content_security_policy = {
    enabled      = true
    report_only  = false
    nonce_enabled = true
    directives = {
      "script-src"  = ["'self'", "'nonce-%{nonce}%'", "https://trusted-cdn.com"]
      "style-src"   = ["'self'", "'nonce-%{nonce}%'", "https://fonts.googleapis.com"]
      "font-src"    = ["'self'", "https://fonts.gstatic.com"]
      "img-src"     = ["'self'", "data:", "https:"]
      "connect-src" = ["'self'", "https://api.example.com"]
    }
    report_uri = "https://example.com/csp-report"
  }

  # Security Headers
  security_headers = {
    "permissions-policy" = {
      name  = "Permissions-Policy"
      value = "geolocation=(), microphone=(), camera=()"
    }
  }

  # IP Access Rules
  ip_access_rules = {
    "office-ip" = {
      mode   = "whitelist"
      target = "192.0.2.0/24"
      notes  = "Office network"
    }
    "block-bad-ip" = {
      mode   = "block"
      target = "198.51.100.1"
      notes  = "Known malicious IP"
    }
  }

  # Zone Lockdown
  zone_lockdown_rules = {
    "admin-lockdown" = {
      urls = [
        "example.com/admin/*",
        "example.com/wp-admin/*"
      ]
      configurations = [
        {
          target = "ip"
          value  = "192.0.2.0/24"
        }
      ]
      description = "Restrict admin access to office IPs"
    }
  }

  # Custom Error Pages
  custom_error_pages = {
    "waf-block" = {
      type = "waf_block"
      url  = "https://example.com/errors/waf-blocked.html"
    }
    "rate-limit" = {
      type = "ratelimit_block"
      url  = "https://example.com/errors/rate-limited.html"
    }
  }

  # Enable additional security features
  enable_authenticated_origin_pulls = true
  enable_page_shield                = true
  enable_leaked_credentials         = true

  # CASB Configuration
  enable_casb = true
  casb_integrations = {
    enable_microsoft_365 = true
    enable_google_workspace = true
    enable_github = true
  }

  casb_policies = {
    "block-sensitive-data" = {
      name = "Block Sensitive Data Upload"
      type = "data_loss_prevention"
      rules = [
        {
          field    = "content"
          operator = "contains"
          value    = "ssn|credit_card|api_key"
        }
      ]
      actions  = ["block", "alert"]
      severity = "high"
    }
  }

  # Leaked Credentials
  leaked_credentials_settings = {
    detection_mode = "automatic"
    action = "challenge"
    notification_email = "security@example.com"
    auto_rotate = true
  }

  # Advanced Rules Engine
  enable_rules_engine = true

  uri_normalization = {
    normalize_path    = true
    normalize_slash   = true
    normalize_percent = true
  }

  transform_rules = {
    "rewrite-api-paths" = {
      name       = "Rewrite API Paths"
      expression = "starts_with(http.request.uri.path, \"/v1/\")"
      transforms = [
        {
          type   = "url_rewrite"
          action = "rewrite"
          target = "path"
          value  = "/api/v1"
        }
      ]
    }
  }

  http_request_rules = {
    "block-old-api" = {
      name       = "Block Old API Version"
      expression = "starts_with(http.request.uri.path, \"/api/v0/\")"
      action     = "block"
    }
  }

  http_response_rules = {
    "cache-static-assets" = {
      name       = "Cache Static Assets"
      expression = "http.request.uri.path.extension in {\"jpg\" \"png\" \"css\" \"js\"}"
      cache_control = {
        edge_ttl    = 86400
        browser_ttl = 3600
      }
    }
  }
}
```

### CASB (Cloud Access Security Broker)

CASB provides visibility and control over SaaS applications:

```hcl
enable_casb = true

casb_integrations = {
  enable_microsoft_365    = true
  enable_google_workspace = true
  enable_slack           = true
  enable_github          = true
  enable_salesforce      = true
}

casb_settings = {
  enable_logging        = true
  enable_reporting      = true
  report_recipients     = ["security@example.com"]
  scan_frequency       = "real_time"
  enable_dlp           = true
  enable_threat_detection = true
}

casb_policies = {
  "prevent-data-exfiltration" = {
    name = "Prevent Data Exfiltration"
    type = "data_loss_prevention"
    rules = [
      {
        field    = "file_size"
        operator = "greater_than"
        value    = "100MB"
      }
    ]
    actions = ["block", "alert"]
  }

  "detect-shadow-it" = {
    name = "Detect Shadow IT"
    type = "shadow_it"
    rules = [
      {
        field    = "app_category"
        operator = "equals"
        value    = "unauthorized"
      }
    ]
    actions = ["log", "alert"]
  }
}
```

### Leaked Credentials Detection

Automatically detect and respond to compromised credentials:

```hcl
enable_leaked_credentials = true

leaked_credentials_settings = {
  detection_mode     = "automatic"
  action            = "challenge"  # log, block, or challenge
  notification_email = "security@example.com"
  auto_rotate       = true
  check_frequency   = "real_time"

  password_policy = {
    min_length      = 12
    require_upper   = true
    require_lower   = true
    require_number  = true
    require_special = true
    max_age_days    = 90
  }
}
```

### Advanced Rules Engine

Transform and modify requests/responses with advanced rules:

```hcl
enable_rules_engine = true

# URI Normalization
uri_normalization = {
  normalize_path      = true
  normalize_slash     = true
  normalize_percent   = true
  remove_query_params = ["utm_source", "utm_medium"]
  sort_query_params   = true
}

# Transform Rules
transform_rules = {
  "api-versioning" = {
    name       = "API Version Rewrite"
    expression = "http.request.uri.path matches \"^/api/\""
    transforms = [
      {
        type   = "url_rewrite"
        action = "rewrite"
        target = "path"
        value  = "/v2/api"
      }
    ]
  }

  "add-security-headers" = {
    name       = "Add Security Headers"
    expression = "true"
    transforms = [
      {
        type   = "header_modify"
        action = "set"
        target = "X-Security-Policy"
        value  = "strict"
      }
    ]
  }
}

# HTTP Request Rules
http_request_rules = {
  "redirect-http-to-https" = {
    name       = "Force HTTPS"
    expression = "http.request.scheme eq \"http\""
    action     = "redirect"
    action_parameters = {
      uri         = "https://${http.host}${http.request.uri}"
      status_code = 301
    }
  }

  "block-bad-user-agents" = {
    name       = "Block Bad User Agents"
    expression = "http.user_agent contains \"badbot\""
    action     = "block"
  }
}

# HTTP Response Rules
http_response_rules = {
  "cache-control" = {
    name       = "Set Cache Headers"
    expression = "http.request.uri.path.extension in {\"jpg\" \"png\" \"css\" \"js\"}"
    cache_control = {
      edge_ttl    = 86400  # 24 hours
      browser_ttl = 3600   # 1 hour
    }
  }

  "security-headers" = {
    name       = "Add Security Headers"
    expression = "true"
    headers = {
      "X-Content-Type-Options" = {
        operation = "set"
        value     = "nosniff"
      }
      "X-Frame-Options" = {
        operation = "set"
        value     = "SAMEORIGIN"
      }
    }
  }
}
```

## Security Best Practices

1. **SSL/TLS**: Always use `full_strict` mode for maximum security
2. **Minimum TLS**: Set to 1.2 or higher, enable TLS 1.3
3. **HSTS**: Enable with includeSubDomains and preload
4. **WAF**: Start with medium sensitivity and adjust based on false positives
5. **Rate Limiting**: Implement progressive rate limits for different endpoints
6. **CSP**: Start in report-only mode, then enforce after testing
7. **Bot Management**: Use Super Bot Fight Mode for automated protection
8. **Turnstile**: Replace traditional CAPTCHAs with privacy-friendly alternative
9. **CASB**: Enable for all critical SaaS applications, implement DLP policies
10. **Leaked Credentials**: Enable automatic detection with challenge action
    initially
11. **Rules Engine**: Test transform rules in staging before production
    deployment
12. **URI Normalization**: Enable to prevent path-based bypass attacks

## Requirements

- Terraform >= 1.5.0
- Cloudflare provider ~> 5.0
- Appropriate Cloudflare plan for advanced features

## Inputs

See `variables.tf` for all available inputs.

## Outputs

| Name                       | Description                                     |
| -------------------------- | ----------------------------------------------- |
| ssl_mode                   | Current SSL/TLS mode                            |
| waf_enabled                | Whether WAF is enabled                          |
| rate_limit_rules           | Configured rate limiting rules                  |
| turnstile_widgets          | Turnstile widget configurations                 |
| casb_enabled               | Whether CASB is enabled                         |
| casb_integrations          | CASB integrations configured                    |
| casb_policies              | CASB policies configured                        |
| leaked_credentials_enabled | Whether leaked credentials detection is enabled |
| rules_engine_enabled       | Whether advanced rules engine is enabled        |
| transform_rules            | Transform rules configured                      |
| http_request_rules         | HTTP request rules configured                   |
| http_response_rules        | HTTP response rules configured                  |
| security_summary           | Summary of all security features                |

## Notes

- Some features require specific Cloudflare plans (Pro, Business, Enterprise)
- Bot Management and Page Shield require Enterprise plan
- CASB and Leaked Credentials Detection require Enterprise plan
- Advanced Rules Engine features require Business or Enterprise plan
- Rate limiting rules are limited based on plan type
- Transform rules are limited to 10 on Business, 25 on Enterprise
- HTTP request/response rules are limited by plan type
- Always test security rules in a staging environment first
