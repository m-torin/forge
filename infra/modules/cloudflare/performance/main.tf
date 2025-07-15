# Cloudflare Performance Module

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# Zone Settings for Performance
resource "cloudflare_zone_settings_override" "performance" {
  zone_id = var.zone_id

  settings {
    # Caching
    cache_level       = var.cache_level
    browser_cache_ttl = var.browser_cache_ttl
    development_mode  = var.development_mode ? "on" : "off"
    
    # Compression
    brotli = var.enable_brotli ? "on" : "off"
    
    # Performance Features
    mirage                = var.enable_mirage ? "on" : "off"
    polish                = var.polish_settings.mode
    webp                  = var.polish_settings.webp ? "on" : "off"
    rocket_loader         = var.enable_rocket_loader ? "on" : "off"
    early_hints           = var.enable_early_hints ? "on" : "off"
    h2_prioritization     = var.enable_h2_prioritization ? "on" : "off"
    http3                 = var.enable_http3 ? "on" : "off"
    zero_rtt              = var.enable_0rtt ? "on" : "off"
    prefetch_preload      = var.prefetch_preload ? "on" : "off"
    
    # Minification
    minify {
      css  = var.minify.css ? "on" : "off"
      html = var.minify.html ? "on" : "off"
      js   = var.minify.js ? "on" : "off"
    }
  }
}

# Argo Smart Routing
resource "cloudflare_argo" "this" {
  count = var.enable_argo ? 1 : 0

  zone_id        = var.zone_id
  smart_routing  = "on"
  tiered_caching = var.enable_tiered_caching ? "on" : "off"
}

# Cache Rules
resource "cloudflare_ruleset" "cache_rules" {
  count = length(var.cache_rules) > 0 ? 1 : 0

  zone_id     = var.zone_id
  name        = "Cache Rules"
  description = "Custom cache rules for performance optimization"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  dynamic "rules" {
    for_each = var.cache_rules
    content {
      expression  = rules.value.expression
      description = rules.value.description
      action      = "set_cache_settings"
      action_parameters {
        edge_ttl {
          mode    = "override_origin"
          default = rules.value.edge_cache_ttl
        }
        browser_ttl {
          mode    = "override_origin"
          default = rules.value.browser_cache_ttl
        }
        cache = !rules.value.bypass_cache
        cache_key {
          ignore_query_strings_order = true
        }
      }
      enabled = true
    }
  }
}

# Health Checks
resource "cloudflare_healthcheck" "this" {
  for_each = var.enable_health_checks ? var.health_checks : {}

  zone_id     = var.zone_id
  name        = each.value.name
  description = each.value.description
  address     = each.value.address
  type        = each.value.type
  port        = each.value.port
  method      = each.value.method
  path        = each.value.path
  expected_codes = each.value.expected_codes
  expected_body  = each.value.expected_body
  follow_redirects = each.value.follow_redirects
  allow_insecure   = each.value.allow_insecure
  timeout          = each.value.timeout
  retries          = each.value.retries
  interval         = each.value.interval
  consecutive_fails    = each.value.consecutive_fails
  consecutive_successes = each.value.consecutive_successes
  check_regions    = each.value.check_regions
  
  dynamic "header" {
    for_each = each.value.header
    content {
      header = header.key
      values = header.value
    }
  }
}

# Load Balancer Pools
resource "cloudflare_load_balancer_pool" "this" {
  for_each = var.enable_load_balancing ? var.load_balancer_pools : {}

  account_id      = var.account_id
  name            = each.value.name
  description     = each.value.description
  enabled         = each.value.enabled
  minimum_origins = each.value.minimum_origins
  notification_email = each.value.notification_email
  
  dynamic "origins" {
    for_each = each.value.origins
    content {
      name    = origins.value.name
      address = origins.value.address
      enabled = origins.value.enabled
      weight  = origins.value.weight
      
      dynamic "header" {
        for_each = origins.value.header
        content {
          header = header.key
          values = header.value
        }
      }
    }
  }
  
  origin_steering {
    policy = each.value.origin_steering.policy
  }
}

# Load Balancers
resource "cloudflare_load_balancer" "this" {
  for_each = var.enable_load_balancing ? var.load_balancers : {}

  zone_id          = var.zone_id
  name             = each.value.name
  description      = each.value.description
  default_pool_ids = each.value.default_pool_ids
  fallback_pool_id = each.value.fallback_pool_id
  proxied          = each.value.proxied
  ttl              = each.value.ttl
  steering_policy  = each.value.steering_policy
  session_affinity = each.value.session_affinity
  session_affinity_ttl = each.value.session_affinity_ttl
  
  session_affinity_attributes {
    samesite       = each.value.session_affinity_attributes.samesite
    secure         = each.value.session_affinity_attributes.secure
    drain_duration = each.value.session_affinity_attributes.drain_duration
  }
  
  dynamic "rules" {
    for_each = each.value.rules
    content {
      name      = rules.value.name
      condition = rules.value.condition
      priority  = rules.value.priority
      disabled  = rules.value.disabled
      
      dynamic "fixed_response" {
        for_each = rules.value.fixed_response != null ? [rules.value.fixed_response] : []
        content {
          message_body = fixed_response.value.message_body
          status_code  = fixed_response.value.status_code
          content_type = fixed_response.value.content_type
        }
      }
      
      dynamic "overrides" {
        for_each = rules.value.overrides != null ? [rules.value.overrides] : []
        content {
          default_pools    = overrides.value.default_pools
          fallback_pool    = overrides.value.fallback_pool
          steering_policy  = overrides.value.steering_policy
          session_affinity = overrides.value.session_affinity
        }
      }
    }
  }
}

# Waiting Rooms
resource "cloudflare_waiting_room" "this" {
  for_each = var.enable_waiting_room ? var.waiting_rooms : {}

  zone_id                   = var.zone_id
  name                      = each.value.name
  host                      = each.value.host
  path                      = each.value.path
  total_active_users        = each.value.total_active_users
  new_users_per_minute      = each.value.new_users_per_minute
  custom_page_html          = each.value.custom_page_html
  default_template_language = each.value.default_template_language
  description               = each.value.description
  disable_session_renewal   = each.value.disable_session_renewal
  suspended                 = each.value.suspended
  queue_all                 = each.value.queue_all
  json_response_enabled     = each.value.json_response_enabled
  session_duration          = each.value.session_duration
  
  cookie_attributes {
    samesite = each.value.cookie_attributes.samesite
    secure   = each.value.cookie_attributes.secure
  }
}

# Web Analytics
resource "cloudflare_web_analytics_site" "this" {
  count = var.enable_web_analytics ? 1 : 0

  account_id   = var.account_id
  zone_tag     = var.zone_id
  auto_install = true
}

# Browser Insights (RUM)
resource "cloudflare_zone_settings_override" "browser_insights" {
  count = var.enable_browser_insights ? 1 : 0

  zone_id = var.zone_id

  settings {
    browser_check = "on"
  }
}

# Transform Rules for Performance Headers
resource "cloudflare_ruleset" "performance_headers" {
  zone_id     = var.zone_id
  name        = "Performance Headers"
  description = "Add performance-related headers"
  kind        = "zone"
  phase       = "http_response_headers_transform"

  # Add cache control headers for static assets
  rules {
    action = "rewrite"
    action_parameters {
      headers {
        name      = "Cache-Control"
        value     = "public, max-age=31536000, immutable"
        operation = "set"
      }
    }
    expression  = "(http.request.uri.path.extension in {\"js\" \"css\" \"jpg\" \"jpeg\" \"png\" \"gif\" \"ico\" \"woff\" \"woff2\"})"
    description = "Long cache for static assets"
    enabled     = true
  }

  # Add timing headers
  rules {
    action = "rewrite"
    action_parameters {
      headers {
        name      = "Timing-Allow-Origin"
        value     = "*"
        operation = "set"
      }
    }
    expression  = "true"
    description = "Allow timing measurements"
    enabled     = true
  }
}