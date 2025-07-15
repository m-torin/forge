# Environment Module Outputs

# Doppler status
output "doppler_enabled" {
  description = "Whether Doppler is enabled for secrets management"
  value       = var.enable_doppler
}

output "doppler_project" {
  description = "Doppler project name"
  value       = var.enable_doppler ? var.project_name : null
}

output "doppler_environment" {
  description = "Doppler environment/config"
  value       = var.enable_doppler ? var.environment : null
}

# Provider configurations
output "cloudflare_provider_config" {
  description = "Cloudflare provider configuration"
  value = {
    api_token  = local.cloudflare_secrets.api_token
    account_id = local.cloudflare_secrets.account_id
  }
  sensitive = true
}

output "upstash_provider_config" {
  description = "Upstash provider configuration"
  value = {
    email     = local.upstash_secrets.email
    api_key   = local.upstash_secrets.api_key
    team_name = local.upstash_secrets.team_name
  }
  sensitive = true
}

output "vercel_provider_config" {
  description = "Vercel provider configuration"
  value = {
    api_token = local.vercel_secrets.api_token
    org_id    = local.vercel_secrets.org_id
    team_id   = local.vercel_secrets.team_id
  }
  sensitive = true
}

# Individual secrets (for modules that need specific secrets)
output "cloudflare_api_token" {
  description = "Cloudflare API token"
  value       = local.cloudflare_secrets.api_token
  sensitive   = true
}

output "cloudflare_account_id" {
  description = "Cloudflare account ID"
  value       = local.cloudflare_secrets.account_id
  sensitive   = true
}

output "monitoring_webhooks" {
  description = "Monitoring webhook URLs"
  value = {
    slack_webhook_url         = local.monitoring_secrets.slack_webhook_url
    pagerduty_integration_key = local.monitoring_secrets.pagerduty_integration_key
    discord_webhook_url       = local.monitoring_secrets.discord_webhook_url
  }
  sensitive = true
}

output "monitoring_api_keys" {
  description = "Monitoring service API keys"
  value = {
    datadog_api_key = local.monitoring_secrets.datadog_api_key
    sentry_dsn      = local.monitoring_secrets.sentry_dsn
  }
  sensitive = true
}

output "integration_api_keys" {
  description = "Third-party integration API keys"
  value = {
    stripe_api_key        = local.integration_secrets.stripe_api_key
    stripe_webhook_secret = local.integration_secrets.stripe_webhook_secret
    github_token          = local.integration_secrets.github_token
    openai_api_key        = local.integration_secrets.openai_api_key
    resend_api_key        = local.integration_secrets.resend_api_key
    knock_api_key         = local.integration_secrets.knock_api_key
  }
  sensitive = true
}

# All secrets (for convenience)
output "all_secrets" {
  description = "All secrets combined"
  value       = local.all_secrets
  sensitive   = true
}

# Feature flags
output "feature_flags" {
  description = "Environment-specific feature flags"
  value       = local.feature_flags
}

# Environment configuration
output "environment_config" {
  description = "Environment-specific configuration"
  value = {
    environment  = var.environment
    allowed_ips  = var.environment_config.allowed_ips
    enable_debug = var.environment_config.enable_debug
    log_level    = var.environment_config.log_level
  }
}

# Secret rotation warnings
output "rotation_warnings" {
  description = "Secret rotation warnings"
  value       = local.rotation_warnings
}

# Environment tags
output "environment_tags" {
  description = "Tags for environment resources"
  value       = local.environment_tags
}

# Summary
output "environment_summary" {
  description = "Summary of environment configuration"
  value = {
    environment = var.environment
    secrets_source = var.enable_doppler ? "doppler" : "local"
    providers_configured = {
      cloudflare = local.cloudflare_secrets.api_token != ""
      upstash    = local.upstash_secrets.api_key != ""
      vercel     = local.vercel_secrets.api_token != ""
    }
    integrations_configured = {
      stripe  = local.integration_secrets.stripe_api_key != ""
      github  = local.integration_secrets.github_token != ""
      openai  = local.integration_secrets.openai_api_key != ""
      resend  = local.integration_secrets.resend_api_key != ""
      knock   = local.integration_secrets.knock_api_key != ""
    }
    monitoring_configured = {
      slack     = local.monitoring_secrets.slack_webhook_url != ""
      pagerduty = local.monitoring_secrets.pagerduty_integration_key != ""
      discord   = local.monitoring_secrets.discord_webhook_url != ""
      datadog   = local.monitoring_secrets.datadog_api_key != ""
      sentry    = local.monitoring_secrets.sentry_dsn != ""
    }
    features = local.feature_flags
  }
}