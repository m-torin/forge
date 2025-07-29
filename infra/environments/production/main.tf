# Production Environment Configuration

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
    doppler = {
      source  = "DopplerHQ/doppler"
      version = "~> 1.2"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.1"
    }
    upstash = {
      source  = "upstash/upstash"
      version = "~> 1.0"
    }
  }
}

# Environment configuration with Doppler
module "environment" {
  source = "../../modules/environment"

  environment  = "production"
  project_name = "forge"
  
  # Doppler token should be provided via TF_VAR_doppler_token or DOPPLER_TOKEN
  doppler_token = var.doppler_token
  
  # Secret rotation settings
  enable_secret_rotation = true
  secret_rotation_days = {
    api_tokens = 90
    api_keys   = 180
    webhooks   = 365
  }
  
  # Production-specific configuration
  environment_config = {
    allowed_ips  = []  # No IP restrictions in production
    enable_debug = false
    log_level    = "warn"
    features = {
      rate_limiting    = true
      analytics        = true
      monitoring       = true
      maintenance_mode = false
    }
  }
  
  tags = {
    Environment = "production"
    ManagedBy   = "terraform"
    Team        = "platform"
  }
}

# Configure providers with secrets from environment module
provider "cloudflare" {
  api_token = module.environment.cloudflare_api_token
}

provider "upstash" {
  email   = module.environment.upstash_provider_config.email
  api_key = module.environment.upstash_provider_config.api_key
}

provider "vercel" {
  api_token = module.environment.vercel_provider_config.api_token
  team      = module.environment.vercel_provider_config.team_id
}

# Cloudflare Zone
module "zone" {
  source = "../../modules/cloudflare/zone"
  
  domain          = var.domain
  account_id      = module.environment.cloudflare_account_id
  plan            = "enterprise"
  enable_dnssec   = true
  
  tags = module.environment.environment_tags
}

# Security Module
module "security" {
  source = "../../modules/cloudflare/security"
  
  zone_id    = module.zone.zone_id
  account_id = module.environment.cloudflare_account_id
  
  # WAF Configuration
  enable_waf = true
  waf_sensitivity = "high"
  
  # DDoS Protection
  enable_ddos_protection = true
  ddos_sensitivity = "high"
  
  # Rate Limiting
  enable_rate_limiting = module.environment.feature_flags.rate_limiting
  rate_limit_rules = {
    api_limit = {
      threshold = 100
      period    = 60
      action    = "challenge"
    }
  }
  
  # Advanced features
  enable_bot_management = true
  enable_casb          = true
  enable_leaked_credentials = true
  
  tags = module.environment.environment_tags
}

# Workers Module
module "workers" {
  source = "../../modules/cloudflare/workers"
  
  account_id = module.environment.cloudflare_account_id
  
  # Workers configuration
  workers = {
    api_gateway = {
      script_name = "api-gateway"
      content     = file("${path.module}/workers/api-gateway.js")
      
      environment_variables = {
        ENVIRONMENT = "production"
        LOG_LEVEL   = module.environment.environment_config.log_level
      }
      
      secrets = {
        STRIPE_API_KEY = module.environment.integration_api_keys.stripe_api_key
        OPENAI_API_KEY = module.environment.integration_api_keys.openai_api_key
      }
      
      routes = [
        "api.${var.domain}/*"
      ]
    }
  }
  
  # D1 Databases
  enable_d1 = true
  d1_databases = {
    main = {
      name                  = "forge-production"
      enable_migrations     = true
      migrations_path       = "${path.module}/migrations"
      enable_backups        = true
      backup_schedule       = "0 2 * * *"
      backup_retention_days = 30
      enable_admin_interface = true
      admin_allowed_emails  = ["admin@${var.domain}"]
    }
  }
  
  tags = module.environment.environment_tags
}

# Monitoring Module
module "monitoring" {
  source = "../../modules/cloudflare/monitoring"
  
  account_id  = module.environment.cloudflare_account_id
  zone_id     = module.zone.zone_id
  environment = "production"
  
  # Enable monitoring based on feature flag
  enable_monitoring = module.environment.feature_flags.monitoring
  
  # Notification channels from environment module
  notification_channels = {
    slack = {
      enabled     = module.environment.monitoring_webhooks.slack_webhook_url != ""
      webhook_url = module.environment.monitoring_webhooks.slack_webhook_url
      channel     = "#alerts-production"
    }
    
    pagerduty = {
      enabled         = module.environment.monitoring_webhooks.pagerduty_integration_key != ""
      integration_key = module.environment.monitoring_webhooks.pagerduty_integration_key
      severity_mapping = {
        critical = "critical"
        high     = "error"
        medium   = "warning"
        low      = "info"
      }
    }
  }
  
  # Alert configuration
  worker_alerts = {
    error_alerts = true
    cpu_alerts   = true
    usage_alerts = true
  }
  
  http_alerts = {
    enabled = true
    error_threshold = 50
    latency_threshold = 2000
  }
  
  # Logpush to Datadog if configured
  logpush_jobs = module.environment.monitoring_api_keys.datadog_api_key != "" ? {
    http_requests = {
      dataset = "http_requests"
      destination = "datadog://http-intake.logs.datadoghq.com/v1/input/${module.environment.monitoring_api_keys.datadog_api_key}?ddsource=cloudflare&service=forge"
    }
  } : {}
  
  tags = module.environment.environment_tags
}

# Upstash Module
module "upstash" {
  source = "../../modules/upstash"
  
  name_prefix = "forge-prod"
  environment = "production"
  
  # Redis for caching and rate limiting
  enable_redis = true
  redis_config = {
    region    = "us-east-1"
    multizone = true
    eviction  = true
  }
  
  # QStash for job processing
  enable_qstash = true
  qstash_config = {
    enable_topics    = true
    enable_schedules = true
    enable_dlq       = true
  }
  
  # Rate limiting configuration
  enable_ratelimit = module.environment.feature_flags.rate_limiting
  rate_limit_rules = {
    api_default = {
      limit  = 1000
      window = "1m"
    }
    api_authenticated = {
      limit  = 5000
      window = "1m"
    }
  }
  
  tags = module.environment.environment_tags
}

# Vercel Module
module "vercel" {
  source = "../../modules/vercel"
  
  project_name = "forge-web"
  environment  = "production"
  
  # Domain configuration
  domains = [
    var.domain,
    "www.${var.domain}"
  ]
  
  # Environment variables
  environment_variables = {
    NEXT_PUBLIC_API_URL = "https://api.${var.domain}"
    NEXT_PUBLIC_ENVIRONMENT = "production"
  }
  
  # Sensitive environment variables
  environment_variables_sensitive = {
    DATABASE_URL     = module.workers.d1_connection_strings["main"]
    REDIS_URL        = module.upstash.redis_connection_string
    RESEND_API_KEY   = module.environment.integration_api_keys.resend_api_key
    KNOCK_API_KEY    = module.environment.integration_api_keys.knock_api_key
    SENTRY_DSN       = module.environment.monitoring_api_keys.sentry_dsn
  }
  
  # Build configuration
  build_command    = "pnpm build"
  output_directory = ".next"
  install_command  = "pnpm install"
  
  # Production settings
  production_deployment_protection = true
  password_protection_password     = null  # No password in production
  
  tags = module.environment.environment_tags
}