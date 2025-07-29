# Development Environment Configuration

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

# Environment configuration without Doppler for local development
module "environment" {
  source = "../../modules/environment"

  environment    = "development"
  enable_doppler = false  # Use local secrets for development
  
  # Provide fallback secrets for local development
  fallback_secrets = {
    cloudflare_api_token  = var.cloudflare_api_token
    cloudflare_account_id = var.cloudflare_account_id
    upstash_email        = var.upstash_email
    upstash_api_key      = var.upstash_api_key
    vercel_api_token     = var.vercel_api_token
    # Other secrets can be empty for development
  }
  
  # Development-specific configuration
  environment_config = {
    allowed_ips  = ["127.0.0.1/32", "::1/128"]  # localhost only
    enable_debug = true
    log_level    = "debug"
    features = {
      rate_limiting    = false  # Disabled for easier testing
      analytics        = false  # No analytics in dev
      monitoring       = false  # No monitoring in dev
      maintenance_mode = false
      debug_mode       = true
    }
  }
  
  # Disable secret rotation warnings in development
  enable_secret_rotation = false
  
  tags = {
    Environment = "development"
    ManagedBy   = "terraform"
    Purpose     = "local-testing"
  }
}

# Configure providers
provider "cloudflare" {
  api_token = module.environment.cloudflare_api_token
}

provider "upstash" {
  email   = module.environment.upstash_provider_config.email
  api_key = module.environment.upstash_provider_config.api_key
}

provider "vercel" {
  api_token = module.environment.vercel_provider_config.api_token
}

# Minimal Cloudflare configuration for development
module "zone" {
  source = "../../modules/cloudflare/zone"
  
  domain     = "${var.dev_subdomain}.${var.domain}"
  account_id = module.environment.cloudflare_account_id
  plan       = "free"  # Use free plan for development
  
  tags = module.environment.environment_tags
}

# Basic security for development
module "security" {
  source = "../../modules/cloudflare/security"
  
  zone_id    = module.zone.zone_id
  account_id = module.environment.cloudflare_account_id
  
  # Minimal security for development
  enable_waf              = false
  enable_ddos_protection  = false
  enable_rate_limiting    = false
  enable_bot_management   = false
  
  tags = module.environment.environment_tags
}

# Development workers
module "workers" {
  source = "../../modules/cloudflare/workers"
  
  account_id = module.environment.cloudflare_account_id
  
  # Simple test worker
  workers = {
    test_api = {
      script_name = "test-api-dev"
      content     = file("${path.module}/workers/test-api.js")
      
      environment_variables = {
        ENVIRONMENT = "development"
        DEBUG       = "true"
      }
      
      routes = [
        "api-dev.${var.domain}/*"
      ]
    }
  }
  
  # D1 for development
  enable_d1 = true
  d1_databases = {
    dev = {
      name             = "forge-development"
      enable_migrations = true
      migrations_path  = "${path.module}/migrations"
      enable_backups   = false  # No backups in dev
    }
  }
  
  tags = module.environment.environment_tags
}

# Minimal Upstash for development
module "upstash" {
  source = "../../modules/upstash"
  
  name_prefix = "forge-dev"
  environment = "development"
  
  # Just Redis for development
  enable_redis = true
  redis_config = {
    region    = "us-east-1"
    multizone = false  # Single zone for dev
    eviction  = true
  }
  
  # Disable other services
  enable_kafka     = false
  enable_qstash    = false
  enable_ratelimit = false
  enable_vector    = false
  
  tags = module.environment.environment_tags
}

# Vercel preview deployment
module "vercel" {
  source = "../../modules/vercel"
  
  project_name = "forge-web-dev"
  environment  = "development"
  
  # Development domain
  domains = [
    "${var.dev_subdomain}.${var.domain}"
  ]
  
  # Development environment variables
  environment_variables = {
    NEXT_PUBLIC_API_URL     = "https://api-dev.${var.domain}"
    NEXT_PUBLIC_ENVIRONMENT = "development"
    NEXT_PUBLIC_DEBUG       = "true"
  }
  
  # Minimal sensitive variables for dev
  environment_variables_sensitive = {
    DATABASE_URL = module.workers.d1_connection_strings["dev"]
    REDIS_URL    = module.upstash.redis_connection_string
  }
  
  # Development build settings
  build_command    = "pnpm build"
  output_directory = ".next"
  install_command  = "pnpm install"
  
  # No protection in development
  production_deployment_protection = false
  password_protection_password     = null
  
  tags = module.environment.environment_tags
}