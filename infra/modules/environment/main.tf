# Environment Module - Doppler Integration

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    doppler = {
      source  = "DopplerHQ/doppler"
      version = "~> 1.2"
    }
  }
}

# Doppler provider configuration
provider "doppler" {
  doppler_token = var.doppler_token != "" ? var.doppler_token : null
}

# Fetch secrets from Doppler
data "doppler_secrets" "all" {
  count = var.enable_doppler ? 1 : 0
  
  project = var.project_name
  config  = var.environment
}

# Extract specific secrets for each service
locals {
  # Parse Doppler secrets if enabled
  doppler_secrets = var.enable_doppler ? data.doppler_secrets.all[0].map : {}
  
  # Cloudflare secrets
  cloudflare_secrets = {
    api_token  = var.enable_doppler ? lookup(local.doppler_secrets, "CLOUDFLARE_API_TOKEN", var.fallback_secrets.cloudflare_api_token) : var.fallback_secrets.cloudflare_api_token
    account_id = var.enable_doppler ? lookup(local.doppler_secrets, "CLOUDFLARE_ACCOUNT_ID", var.fallback_secrets.cloudflare_account_id) : var.fallback_secrets.cloudflare_account_id
  }
  
  # Upstash secrets
  upstash_secrets = {
    email     = var.enable_doppler ? lookup(local.doppler_secrets, "UPSTASH_EMAIL", var.fallback_secrets.upstash_email) : var.fallback_secrets.upstash_email
    api_key   = var.enable_doppler ? lookup(local.doppler_secrets, "UPSTASH_API_KEY", var.fallback_secrets.upstash_api_key) : var.fallback_secrets.upstash_api_key
    team_name = var.enable_doppler ? lookup(local.doppler_secrets, "UPSTASH_TEAM_NAME", var.fallback_secrets.upstash_team_name) : var.fallback_secrets.upstash_team_name
  }
  
  # Vercel secrets
  vercel_secrets = {
    api_token = var.enable_doppler ? lookup(local.doppler_secrets, "VERCEL_API_TOKEN", var.fallback_secrets.vercel_api_token) : var.fallback_secrets.vercel_api_token
    org_id    = var.enable_doppler ? lookup(local.doppler_secrets, "VERCEL_ORG_ID", var.fallback_secrets.vercel_org_id) : var.fallback_secrets.vercel_org_id
    team_id   = var.enable_doppler ? lookup(local.doppler_secrets, "VERCEL_TEAM_ID", var.fallback_secrets.vercel_team_id) : var.fallback_secrets.vercel_team_id
  }
  
  # Monitoring secrets
  monitoring_secrets = {
    slack_webhook_url        = var.enable_doppler ? lookup(local.doppler_secrets, "SLACK_WEBHOOK_URL", var.fallback_secrets.slack_webhook_url) : var.fallback_secrets.slack_webhook_url
    pagerduty_integration_key = var.enable_doppler ? lookup(local.doppler_secrets, "PAGERDUTY_INTEGRATION_KEY", var.fallback_secrets.pagerduty_integration_key) : var.fallback_secrets.pagerduty_integration_key
    discord_webhook_url      = var.enable_doppler ? lookup(local.doppler_secrets, "DISCORD_WEBHOOK_URL", var.fallback_secrets.discord_webhook_url) : var.fallback_secrets.discord_webhook_url
    datadog_api_key          = var.enable_doppler ? lookup(local.doppler_secrets, "DATADOG_API_KEY", var.fallback_secrets.datadog_api_key) : var.fallback_secrets.datadog_api_key
    sentry_dsn               = var.enable_doppler ? lookup(local.doppler_secrets, "SENTRY_DSN", var.fallback_secrets.sentry_dsn) : var.fallback_secrets.sentry_dsn
  }
  
  # Integration secrets
  integration_secrets = {
    stripe_api_key        = var.enable_doppler ? lookup(local.doppler_secrets, "STRIPE_API_KEY", var.fallback_secrets.stripe_api_key) : var.fallback_secrets.stripe_api_key
    stripe_webhook_secret = var.enable_doppler ? lookup(local.doppler_secrets, "STRIPE_WEBHOOK_SECRET", var.fallback_secrets.stripe_webhook_secret) : var.fallback_secrets.stripe_webhook_secret
    github_token          = var.enable_doppler ? lookup(local.doppler_secrets, "GITHUB_TOKEN", var.fallback_secrets.github_token) : var.fallback_secrets.github_token
    openai_api_key        = var.enable_doppler ? lookup(local.doppler_secrets, "OPENAI_API_KEY", var.fallback_secrets.openai_api_key) : var.fallback_secrets.openai_api_key
    resend_api_key        = var.enable_doppler ? lookup(local.doppler_secrets, "RESEND_API_KEY", var.fallback_secrets.resend_api_key) : var.fallback_secrets.resend_api_key
    knock_api_key         = var.enable_doppler ? lookup(local.doppler_secrets, "KNOCK_API_KEY", var.fallback_secrets.knock_api_key) : var.fallback_secrets.knock_api_key
  }
  
  # All secrets combined for easy access
  all_secrets = merge(
    local.cloudflare_secrets,
    local.upstash_secrets,
    local.vercel_secrets,
    local.monitoring_secrets,
    local.integration_secrets
  )
  
  # Environment-specific feature flags
  feature_flags = merge({
    debug_mode = var.environment == "development"
    rate_limiting = var.environment == "production"
    monitoring = var.environment != "development"
    analytics = var.environment == "production"
    maintenance_mode = false
  }, var.environment_config.features)
}

# Secret rotation check (creates output warnings)
locals {
  current_time = timestamp()
  
  # This is a placeholder - in real implementation, you'd track last rotation dates
  rotation_warnings = var.enable_secret_rotation ? [
    for secret, days in var.secret_rotation_days : {
      secret = secret
      message = "Consider rotating ${secret} (recommended every ${days} days)"
    }
  ] : []
}

# Environment validation
resource "terraform_data" "environment_validation" {
  lifecycle {
    precondition {
      condition = var.enable_doppler || (
        var.fallback_secrets.cloudflare_api_token != "" &&
        var.fallback_secrets.cloudflare_account_id != ""
      )
      error_message = "Either Doppler must be enabled or Cloudflare fallback secrets must be provided"
    }
  }
}

# Tags with environment info
locals {
  environment_tags = merge(var.tags, {
    Environment    = var.environment
    ManagedBy     = "terraform"
    SecretsSource = var.enable_doppler ? "doppler" : "local"
    LastUpdated   = formatdate("YYYY-MM-DD", timestamp())
  })
}