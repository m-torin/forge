# Production Environment Outputs

output "environment" {
  description = "Environment name"
  value       = "production"
}

output "doppler_enabled" {
  description = "Whether Doppler is enabled"
  value       = module.environment.doppler_enabled
}

output "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  value       = module.zone.zone_id
}

output "cloudflare_zone_name" {
  description = "Cloudflare zone name"
  value       = module.zone.zone_name
}

output "worker_urls" {
  description = "Worker URLs"
  value = {
    api_gateway = "https://api.${var.domain}"
  }
}

output "d1_database_ids" {
  description = "D1 database IDs"
  value       = module.workers.d1_database_ids
}

output "upstash_redis_url" {
  description = "Upstash Redis URL"
  value       = module.upstash.redis_rest_url
  sensitive   = true
}

output "monitoring_dashboard_url" {
  description = "Monitoring dashboard URL"
  value       = module.monitoring.monitoring_dashboard_url
}

output "feature_flags" {
  description = "Active feature flags"
  value       = module.environment.feature_flags
}

output "secret_rotation_warnings" {
  description = "Secret rotation warnings"
  value       = module.environment.rotation_warnings
}

output "deployment_summary" {
  description = "Deployment summary"
  value = {
    environment = "production"
    domain      = var.domain
    
    secrets_source = module.environment.environment_summary.secrets_source
    
    services_enabled = {
      cloudflare_waf        = module.security.waf_enabled
      cloudflare_ddos       = module.security.ddos_protection_enabled
      cloudflare_workers    = length(module.workers.worker_scripts) > 0
      cloudflare_d1         = module.workers.d1_enabled
      cloudflare_monitoring = module.monitoring.monitoring_summary.alerts
      upstash_redis        = module.upstash.redis_enabled
      upstash_qstash       = module.upstash.qstash_enabled
      vercel_deployment    = true
    }
    
    monitoring = {
      slack_configured     = module.environment.environment_summary.monitoring_configured.slack
      pagerduty_configured = module.environment.environment_summary.monitoring_configured.pagerduty
      datadog_configured   = module.environment.environment_summary.monitoring_configured.datadog
    }
    
    integrations = module.environment.environment_summary.integrations_configured
    
    features = module.environment.feature_flags
  }
}