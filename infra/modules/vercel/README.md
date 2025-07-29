# Vercel Module

This module manages Vercel projects, deployments, and associated configurations.

## Features

- **Project Management**: Create and configure Vercel projects
- **Domain Management**: Assign custom domains
- **Environment Variables**: Manage build and runtime variables
- **Edge Config**: Edge-side key-value storage
- **Deployment Protection**: IP restrictions and authentication
- **Analytics**: Web analytics and Speed Insights
- **Security**: Headers, password protection
- **Serverless Functions**: Configure function settings
- **Cron Jobs**: Scheduled function execution

## Usage

### Basic Configuration

```hcl
module "vercel" {
  source = "./modules/vercel"

  project_name = "my-nextjs-app"
  framework    = "nextjs"
  team_id      = var.vercel_team_id

  domains = [
    "example.com",
    "www.example.com"
  ]

  environment_variables = {
    NEXT_PUBLIC_API_URL = "https://api.example.com"
    NEXT_PUBLIC_APP_NAME = "My App"
  }
}
```

### Complete Configuration

```hcl
module "vercel" {
  source = "./modules/vercel"

  project_name = "my-nextjs-app"
  framework    = "nextjs"
  team_id      = var.vercel_team_id
  environment  = "production"

  # Git Integration
  git_repository = {
    type   = "github"
    repo   = "myorg/myrepo"
    branch = "main"
  }

  # Custom Domains
  domains = [
    "example.com",
    "www.example.com",
    "app.example.com"
  ]

  # Build Configuration
  build_command    = "pnpm build"
  output_directory = ".next"
  install_command  = "pnpm install"
  dev_command      = "pnpm dev"
  root_directory   = "apps/web"
  node_version     = "20.x"

  # Environment Variables
  environment_variables = {
    NEXT_PUBLIC_API_URL         = "https://api.example.com"
    NEXT_PUBLIC_APP_NAME        = "My App"
    NEXT_PUBLIC_ENVIRONMENT     = "production"
    NEXT_PUBLIC_ANALYTICS_ID    = "UA-123456789"
  }

  sensitive_environment_variables = {
    DATABASE_URL     = var.database_url
    STRIPE_SECRET    = var.stripe_secret_key
    JWT_SECRET       = var.jwt_secret
    API_SECRET_KEY   = var.api_secret_key
  }

  build_env = {
    SENTRY_AUTH_TOKEN = var.sentry_auth_token
    ANALYZE           = "false"
  }

  # Serverless Functions
  functions = {
    include_files = ["api/**/*.ts"]
    exclude_files = ["api/**/*.test.ts"]
    region        = "iad1"      # US East
    max_duration  = 30          # seconds
    memory        = 1024        # MB
  }

  # Edge Config
  edge_config = {
    enabled = true
    items = {
      feature_flags = {
        new_ui          = true
        beta_features   = false
        maintenance_mode = false
      }
      rate_limits = {
        api_requests_per_minute = 100
        uploads_per_day         = 50
      }
      config = {
        cdn_url = "https://cdn.example.com"
        support_email = "support@example.com"
      }
    }
  }

  # Headers
  headers = [
    {
      source = "/(.*)"
      headers = [
        {
          key   = "X-DNS-Prefetch-Control"
          value = "on"
        },
        {
          key   = "X-Robots-Tag"
          value = "index, follow"
        }
      ]
    },
    {
      source = "/api/(.*)"
      headers = [
        {
          key   = "Cache-Control"
          value = "no-store, max-age=0"
        }
      ]
    }
  ]

  # Redirects
  redirects = [
    {
      source      = "/old-page"
      destination = "/new-page"
      permanent   = true
    },
    {
      source      = "/blog/:slug"
      destination = "/articles/:slug"
      permanent   = false
    }
  ]

  # Rewrites
  rewrites = [
    {
      source      = "/api/v1/:path*"
      destination = "https://api.example.com/v1/:path*"
    },
    {
      source      = "/docs"
      destination = "https://docs.example.com"
    }
  ]

  # Security Headers
  security_headers = {
    x_frame_options         = "DENY"
    x_content_type_options  = "nosniff"
    x_xss_protection        = "1; mode=block"
    referrer_policy         = "strict-origin-when-cross-origin"
    permissions_policy      = "camera=(), microphone=(), geolocation=()"
    content_security_policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  }

  # Deployment Protection
  deployment_protection = {
    enabled              = true
    authentication_type  = "vercel"
    trusted_ips         = ["192.0.2.0/24", "203.0.113.0/24"]
    protected_branches  = ["main", "production"]
  }

  # Password Protection (for staging)
  password_protection = {
    enabled         = true
    password        = var.staging_password
    deployment_type = "preview"
  }

  # Cron Jobs
  crons = [
    {
      path     = "/api/cron/daily-report"
      schedule = "0 0 * * *"  # Daily at midnight
    },
    {
      path     = "/api/cron/cleanup"
      schedule = "0 */6 * * *"  # Every 6 hours
    }
  ]

  # Analytics
  analytics = {
    enabled    = true
    audiences  = true
    web_vitals = true
  }

  speed_insights = true

  # Other Settings
  auto_assign_custom_domains = true
  public_source              = false
  preview_deployment_suffix  = "preview"

  tags = {
    Environment = "production"
    Team        = "engineering"
  }
}
```

### Environment-Specific Deployments

```hcl
# Production
module "vercel_prod" {
  source = "./modules/vercel"

  project_name = "myapp"
  environment  = "production"

  domains = ["myapp.com", "www.myapp.com"]

  environment_variables = {
    NEXT_PUBLIC_API_URL = "https://api.myapp.com"
    NEXT_PUBLIC_ENV     = "production"
  }
}

# Staging
module "vercel_staging" {
  source = "./modules/vercel"

  project_name = "myapp-staging"
  environment  = "preview"

  domains = ["staging.myapp.com"]

  environment_variables = {
    NEXT_PUBLIC_API_URL = "https://api-staging.myapp.com"
    NEXT_PUBLIC_ENV     = "staging"
  }

  password_protection = {
    enabled  = true
    password = var.staging_password
  }
}
```

## Serverless Function Regions

Available regions:

- `iad1` - US East (Washington D.C.)
- `sfo1` - US West (San Francisco)
- `cle1` - US East (Cleveland)
- `pdx1` - US West (Portland)
- `fra1` - Europe (Frankfurt)
- `lhr1` - Europe (London)
- `cdg1` - Europe (Paris)
- `arn1` - Europe (Stockholm)
- `gru1` - South America (São Paulo)
- `hnd1` - Asia Pacific (Tokyo)
- `sin1` - Asia Pacific (Singapore)
- `syd1` - Asia Pacific (Sydney)

## Edge Config

Edge Config provides low-latency data storage at the edge:

```javascript
// In your application
import { get } from "@vercel/edge-config";

export async function getFeatureFlag(flag) {
  const flags = await get("feature_flags");
  return flags?.[flag] ?? false;
}
```

## Cron Job Syntax

Uses standard cron expressions:

- `* * * * *` - Every minute
- `0 * * * *` - Every hour
- `0 0 * * *` - Daily at midnight
- `0 0 * * 0` - Weekly on Sunday
- `0 0 1 * *` - Monthly on the 1st

## Security Best Practices

1. **Environment Variables**: Use `sensitive_environment_variables` for secrets
2. **Deployment Protection**: Enable for production environments
3. **Security Headers**: Apply comprehensive security headers
4. **Password Protection**: Use for preview/staging deployments
5. **IP Restrictions**: Limit access to known IPs when possible

## Requirements

- Terraform >= 1.5.0
- Vercel provider ~> 1.1
- Vercel account with appropriate permissions
- Team ID for team projects

## Outputs

| Name            | Description                            |
| --------------- | -------------------------------------- |
| project_id      | Vercel project ID                      |
| deployment_url  | Default deployment URL                 |
| domains         | Assigned custom domains                |
| edge_config_id  | Edge Config ID                         |
| project_summary | Complete project configuration summary |
