# Production Environment Main Configuration

# Import shared configuration
module "shared" {
  source = "../shared"
  
  environment           = var.environment
  project_name          = var.project_name
  primary_domain        = var.primary_domain
  additional_domains    = var.additional_domains
  features              = var.features
  tags                  = var.tags
  notification_email    = var.notification_email
  
  # Authentication
  doppler_token         = var.doppler_token
  cloudflare_api_token  = var.cloudflare_api_token
  cloudflare_account_id = var.cloudflare_account_id
  vercel_api_token      = var.vercel_api_token
  vercel_team_id        = var.vercel_team_id
  upstash_email         = var.upstash_email
  upstash_api_key       = var.upstash_api_key
}

# Doppler Secrets (if enabled)
data "doppler_secrets" "this" {
  count = module.shared.use_doppler ? 1 : 0
}

# Provider Configuration
provider "cloudflare" {
  api_token = module.shared.use_doppler ? data.doppler_secrets.this[0].map.CLOUDFLARE_API_TOKEN : var.cloudflare_api_token
}

provider "vercel" {
  api_token = module.shared.use_doppler ? data.doppler_secrets.this[0].map.VERCEL_API_TOKEN : var.vercel_api_token
  team      = var.vercel_team_id
}

provider "upstash" {
  email   = module.shared.use_doppler ? data.doppler_secrets.this[0].map.UPSTASH_EMAIL : var.upstash_email
  api_key = module.shared.use_doppler ? data.doppler_secrets.this[0].map.UPSTASH_API_KEY : var.upstash_api_key
}

# Local values
locals {
  cloudflare_account_id = module.shared.use_doppler ? data.doppler_secrets.this[0].map.CLOUDFLARE_ACCOUNT_ID : var.cloudflare_account_id
}

# Cloudflare Zone Module
module "zone" {
  source = "../../modules/cloudflare/zone"
  count  = module.shared.features.zone ? 1 : 0

  domain     = var.primary_domain
  account_id = local.cloudflare_account_id
  plan       = "pro" # Production uses Pro plan
  
  dns_records = {
    # Root domain
    "@" = {
      type    = "A"
      value   = "76.76.21.21" # Vercel IP
      proxied = true
    }
    
    # WWW subdomain
    "www" = {
      type    = "CNAME"
      value   = var.primary_domain
      proxied = true
    }
    
    # API subdomain
    "api" = {
      type    = "CNAME"
      value   = "cname.vercel-dns.com"
      proxied = false
    }
    
    # Media subdomain (for Cloudflare Images/R2)
    "media" = {
      type    = "CNAME"
      value   = var.primary_domain
      proxied = true
    }
    
    # Email records (if email module enabled)
    "mx-10" = {
      type     = "MX"
      value    = "mx1.forwardemail.net"
      priority = 10
    }
    "mx-20" = {
      type     = "MX"
      value    = "mx2.forwardemail.net"
      priority = 20
    }
    
    # SPF record
    "spf" = {
      type  = "TXT"
      value = "v=spf1 include:_spf.forwardemail.net ~all"
    }
    
    # DMARC record
    "dmarc" = {
      type  = "TXT"
      value = "v=DMARC1; p=quarantine; rua=mailto:dmarc@${var.primary_domain}"
    }
  }
  
  page_rules = {
    # Redirect www to root
    "www-redirect" = {
      target   = "www.${var.primary_domain}/*"
      priority = 1
      actions = {
        forwarding_url = {
          url         = "https://${var.primary_domain}/$1"
          status_code = 301
        }
      }
    }
  }
  
  settings = {
    ssl                      = "full_strict"
    always_use_https         = "on"
    min_tls_version          = "1.2"
    automatic_https_rewrites = "on"
    opportunistic_encryption = "on"
    brotli                   = "on"
    websockets               = "on"
    http3                    = "on"
    zero_rtt                 = "on"
  }
  
  enable_dnssec = true
  tags          = module.shared.tags
}

# Cloudflare Security Module
module "security" {
  source = "../../modules/cloudflare/security"
  count  = module.shared.features.security && module.shared.features.zone ? 1 : 0

  zone_id    = module.zone[0].zone_id
  account_id = local.cloudflare_account_id
  
  # SSL/TLS
  ssl_mode            = module.shared.env_config.ssl_mode
  minimum_tls_version = module.shared.env_config.min_tls_version
  enable_hsts         = true
  
  # WAF
  enable_waf      = true
  waf_sensitivity = module.shared.env_config.waf_sensitivity
  waf_action_mode = "challenge"
  
  # Bot Management
  enable_bot_management = true
  bot_fight_mode        = true
  
  # Rate Limiting
  enable_rate_limiting = module.shared.env_config.rate_limit_enabled
  rate_limit_rules = {
    "api-limit" = {
      threshold   = 1000
      period      = 60
      action      = "challenge"
      expression  = "http.request.uri.path contains \"/api/\""
      description = "API rate limiting"
    }
    "login-limit" = {
      threshold   = 5
      period      = 300
      action      = "block"
      expression  = "http.request.uri.path eq \"/login\" and http.request.method eq \"POST\""
      description = "Login attempt limiting"
    }
  }
  
  # Turnstile
  enable_turnstile = true
  turnstile_widgets = {
    "production" = {
      mode    = "non-interactive"
      domains = module.shared.all_domains
    }
  }
  
  # Content Security Policy
  content_security_policy = {
    enabled       = true
    report_only   = false
    nonce_enabled = true
    directives = {
      "default-src"     = ["'self'"]
      "script-src"      = ["'self'", "'nonce-%{nonce}%'", "https://vercel.live"]
      "style-src"       = ["'self'", "'nonce-%{nonce}%'", "https://fonts.googleapis.com"]
      "font-src"        = ["'self'", "https://fonts.gstatic.com"]
      "img-src"         = ["'self'", "data:", "https:", "blob:"]
      "connect-src"     = ["'self'", "https://vitals.vercel-insights.com", "wss://*.pusher.com"]
      "frame-ancestors" = ["'none'"]
      "report-uri"      = ["https://csp.${var.primary_domain}/report"]
    }
  }
  
  # Additional Security Features
  enable_page_shield                = true
  enable_leaked_credentials         = true
  enable_authenticated_origin_pulls = true
  
  tags = module.shared.tags
}

# Cloudflare Performance Module
module "performance" {
  source = "../../modules/cloudflare/performance"
  count  = module.shared.features.performance && module.shared.features.zone ? 1 : 0

  zone_id    = module.zone[0].zone_id
  account_id = local.cloudflare_account_id
  
  # Caching
  cache_level       = module.shared.env_config.cache_level
  browser_cache_ttl = 14400
  
  cache_rules = {
    "static-long" = {
      expression        = "http.request.uri.path.extension in {\"js\" \"css\" \"woff\" \"woff2\" \"ttf\" \"otf\"}"
      edge_cache_ttl    = 2592000  # 30 days
      browser_cache_ttl = 2592000
      description       = "Long cache for immutable assets"
    }
    "images" = {
      expression        = "http.request.uri.path.extension in {\"jpg\" \"jpeg\" \"png\" \"gif\" \"webp\" \"avif\" \"svg\" \"ico\"}"
      edge_cache_ttl    = 604800   # 7 days
      browser_cache_ttl = 86400    # 1 day
      description       = "Cache images"
    }
    "api-get" = {
      expression        = "http.request.uri.path contains \"/api/\" and http.request.method eq \"GET\""
      edge_cache_ttl    = 300      # 5 minutes
      browser_cache_ttl = 0
      description       = "Short cache for GET API requests"
    }
  }
  
  # Performance Features
  enable_argo           = true
  enable_tiered_caching = true
  enable_polish         = true
  polish_settings = {
    mode = "lossless"
    webp = true
    avif = true
  }
  enable_mirage         = true
  enable_rocket_loader  = true
  enable_early_hints    = true
  
  # Health Checks
  enable_health_checks = true
  health_checks = {
    "vercel-origin" = {
      name           = "Vercel Origin Health"
      address        = "cname.vercel-dns.com"
      check_regions  = ["WNAM", "ENAM", "WEU", "EEU", "SEAS"]
      expected_codes = ["200", "301", "302"]
      path           = "/api/health"
      interval       = 60
    }
  }
  
  # Analytics
  enable_web_analytics    = true
  enable_browser_insights = true
  
  tags = module.shared.tags
}

# Vercel Module (if enabled)
module "vercel" {
  source = "../../modules/vercel"
  count  = module.shared.features.vercel ? 1 : 0

  project_name = module.shared.name_prefix
  domains      = module.shared.all_domains
  environment  = var.environment
  
  environment_variables = {
    NODE_ENV                    = "production"
    NEXT_PUBLIC_API_URL         = "https://api.${var.primary_domain}"
    NEXT_PUBLIC_ENVIRONMENT     = "production"
    NEXT_PUBLIC_CLOUDFLARE_ZONE = module.shared.features.zone ? module.zone[0].zone_id : ""
  }
  
  tags = module.shared.tags
}

# Upstash Module (if enabled)
module "upstash" {
  source = "../../modules/upstash"
  count  = module.shared.features.upstash ? 1 : 0

  name_prefix = module.shared.name_prefix
  environment = var.environment
  
  # Redis configuration
  enable_redis = true
  redis_config = {
    region      = "us-east-1"
    multizone   = true
    eviction    = true
    tls         = true
  }
  
  # Rate limiting configuration
  enable_ratelimit = true
  
  tags = module.shared.tags
}