# Performance Module Outputs

output "cache_level" {
  description = "Current cache level setting"
  value       = var.cache_level
}

output "browser_cache_ttl" {
  description = "Browser cache TTL in seconds"
  value       = var.browser_cache_ttl
}

output "argo_enabled" {
  description = "Whether Argo Smart Routing is enabled"
  value       = var.enable_argo
}

output "tiered_caching_enabled" {
  description = "Whether Tiered Caching is enabled"
  value       = var.enable_tiered_caching
}

output "performance_features" {
  description = "Enabled performance features"
  value = {
    argo                = var.enable_argo
    tiered_caching      = var.enable_tiered_caching
    mirage              = var.enable_mirage
    polish              = var.polish_settings.mode != "off"
    rocket_loader       = var.enable_rocket_loader
    early_hints         = var.enable_early_hints
    h2_prioritization   = var.enable_h2_prioritization
    http3               = var.enable_http3
    zero_rtt            = var.enable_0rtt
    brotli              = var.enable_brotli
    gzip                = var.enable_gzip
    prefetch_preload    = var.prefetch_preload
  }
}

output "minification_settings" {
  description = "Minification settings"
  value = {
    css  = var.minify.css
    html = var.minify.html
    js   = var.minify.js
  }
}

output "cache_rules" {
  description = "Custom cache rules configured"
  value = {
    for k, v in var.cache_rules : k => {
      expression = v.expression
      edge_ttl   = v.edge_cache_ttl
      browser_ttl = v.browser_cache_ttl
      bypass     = v.bypass_cache
    }
  }
}

output "health_checks" {
  description = "Health check configurations"
  value = var.enable_health_checks ? {
    for k, v in cloudflare_healthcheck.this : k => {
      id              = v.id
      name            = v.name
      address         = v.address
      type            = v.type
      check_regions   = v.check_regions
      interval        = v.interval
    }
  } : {}
}

output "load_balancer_pools" {
  description = "Load balancer pools created"
  value = var.enable_load_balancing ? {
    for k, v in cloudflare_load_balancer_pool.this : k => {
      id              = v.id
      name            = v.name
      enabled         = v.enabled
      origins_count   = length(v.origins)
    }
  } : {}
}

output "load_balancers" {
  description = "Load balancers created"
  value = var.enable_load_balancing ? {
    for k, v in cloudflare_load_balancer.this : k => {
      id              = v.id
      name            = v.name
      steering_policy = v.steering_policy
      session_affinity = v.session_affinity
      proxied         = v.proxied
    }
  } : {}
}

output "waiting_rooms" {
  description = "Waiting rooms configured"
  value = var.enable_waiting_room ? {
    for k, v in cloudflare_waiting_room.this : k => {
      id                   = v.id
      name                 = v.name
      host                 = v.host
      path                 = v.path
      total_active_users   = v.total_active_users
      new_users_per_minute = v.new_users_per_minute
      suspended            = v.suspended
    }
  } : {}
}

output "web_analytics_enabled" {
  description = "Whether Web Analytics is enabled"
  value       = var.enable_web_analytics
}

output "web_analytics_token" {
  description = "Web Analytics site token"
  value       = var.enable_web_analytics ? cloudflare_web_analytics_site.this[0].site_token : null
  sensitive   = true
}

output "web_analytics_snippet" {
  description = "Web Analytics JavaScript snippet"
  value       = var.enable_web_analytics ? cloudflare_web_analytics_site.this[0].snippet : null
}

output "browser_insights_enabled" {
  description = "Whether Browser Insights (RUM) is enabled"
  value       = var.enable_browser_insights
}

output "performance_summary" {
  description = "Summary of performance optimizations"
  value = {
    caching = {
      level        = var.cache_level
      browser_ttl  = var.browser_cache_ttl
      rules_count  = length(var.cache_rules)
    }
    optimization = {
      argo              = var.enable_argo
      tiered_caching    = var.enable_tiered_caching
      image_optimization = var.enable_polish || var.enable_mirage
      js_optimization   = var.enable_rocket_loader
      minification      = var.minify.css || var.minify.html || var.minify.js
    }
    protocols = {
      http3    = var.enable_http3
      zero_rtt = var.enable_0rtt
      early_hints = var.enable_early_hints
    }
    monitoring = {
      health_checks    = var.enable_health_checks
      web_analytics    = var.enable_web_analytics
      browser_insights = var.enable_browser_insights
    }
    load_balancing = {
      enabled      = var.enable_load_balancing
      pools_count  = length(var.load_balancer_pools)
      lb_count     = length(var.load_balancers)
    }
    waiting_rooms = {
      enabled     = var.enable_waiting_room
      rooms_count = length(var.waiting_rooms)
    }
  }
}