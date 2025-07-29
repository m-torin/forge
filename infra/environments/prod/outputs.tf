# Production Environment Outputs

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "primary_domain" {
  description = "Primary domain"
  value       = var.primary_domain
}

output "all_domains" {
  description = "All configured domains"
  value       = module.shared.all_domains
}

# Cloudflare Outputs
output "cloudflare_zone" {
  description = "Cloudflare zone information"
  value = module.shared.features.zone ? {
    id           = module.zone[0].zone_id
    name         = module.zone[0].zone_name
    name_servers = module.zone[0].name_servers
    dnssec       = module.zone[0].dnssec_status
  } : null
}

output "cloudflare_security" {
  description = "Cloudflare security status"
  value = module.shared.features.security && module.shared.features.zone ? {
    ssl_mode               = module.security[0].ssl_mode
    waf_enabled            = module.security[0].waf_enabled
    rate_limiting_enabled  = module.security[0].rate_limiting_enabled
    turnstile_enabled      = module.security[0].turnstile_widgets != {}
    bot_management_enabled = module.security[0].bot_management_enabled
  } : null
}

output "cloudflare_performance" {
  description = "Cloudflare performance status"
  value = module.shared.features.performance && module.shared.features.zone ? {
    cache_level          = module.performance[0].cache_level
    argo_enabled         = module.performance[0].argo_enabled
    tiered_caching       = module.performance[0].tiered_caching_enabled
    performance_features = module.performance[0].performance_features
  } : null
}

# Vercel Outputs
output "vercel_project" {
  description = "Vercel project information"
  value = module.shared.features.vercel ? {
    name        = module.vercel[0].project_name
    domains     = module.vercel[0].domains
    environment = module.vercel[0].environment
  } : null
}

# Upstash Outputs
output "upstash_redis" {
  description = "Upstash Redis information"
  value = module.shared.features.upstash ? {
    endpoint = module.upstash[0].redis_endpoint
    port     = module.upstash[0].redis_port
  } : null
  sensitive = true
}

# Summary Output
output "infrastructure_summary" {
  description = "Infrastructure deployment summary"
  value = {
    environment = var.environment
    domain      = var.primary_domain
    features    = module.shared.features
    providers = {
      cloudflare = module.shared.features.zone
      vercel     = module.shared.features.vercel
      upstash    = module.shared.features.upstash
    }
  }
}