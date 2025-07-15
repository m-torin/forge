# Shared Local Values

locals {
  # Environment suffix for resource naming
  env_suffix = var.environment == "prod" ? "" : "-${var.environment}"
  
  # Common resource name prefix
  name_prefix = "${var.project_name}${local.env_suffix}"
  
  # Default tags
  default_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    CreatedAt   = timestamp()
  }
  
  # Merged tags
  tags = merge(local.default_tags, var.tags)
  
  # Doppler configuration
  use_doppler = var.doppler_token != ""
  
  # Domain configuration
  all_domains = concat([var.primary_domain], var.additional_domains)
  
  # Environment-specific settings
  env_config = {
    dev = {
      ssl_mode            = "flexible"
      min_tls_version     = "1.2"
      cache_level         = "basic"
      waf_sensitivity     = "low"
      rate_limit_enabled  = false
    }
    staging = {
      ssl_mode            = "full"
      min_tls_version     = "1.2"
      cache_level         = "standard"
      waf_sensitivity     = "medium"
      rate_limit_enabled  = true
    }
    prod = {
      ssl_mode            = "full_strict"
      min_tls_version     = "1.2"
      cache_level         = "aggressive"
      waf_sensitivity     = "high"
      rate_limit_enabled  = true
    }
  }
  
  # Get current environment config
  current_env_config = local.env_config[var.environment]
}