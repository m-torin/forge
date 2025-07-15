# Environment Module

This module provides centralized environment configuration and secrets
management using Doppler, with fallback support for local secrets.

## Features

- **Doppler Integration**: Seamless integration with Doppler for centralized
  secrets management
- **Multi-Provider Support**: Manages secrets for Cloudflare, Upstash, Vercel,
  and more
- **Environment-Specific Configuration**: Different settings for development,
  staging, and production
- **Secret Rotation Reminders**: Configurable alerts for secret rotation
- **Fallback Support**: Works without Doppler using local secrets
- **Feature Flags**: Environment-specific feature toggles
- **Integration Support**: API keys for Stripe, GitHub, OpenAI, Resend, Knock
- **Monitoring Integration**: Webhook URLs and API keys for monitoring services

## Usage

### Basic Configuration with Doppler

```hcl
module "environment" {
  source = "./modules/environment"

  environment  = "production"
  project_name = "forge"

  # Doppler will be enabled by default
  doppler_token = var.doppler_token  # Or use DOPPLER_TOKEN env var
}

# Use the secrets in provider configuration
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
```

### Configuration without Doppler

```hcl
module "environment" {
  source = "./modules/environment"

  environment    = "development"
  enable_doppler = false

  # Provide fallback secrets
  fallback_secrets = {
    cloudflare_api_token  = var.cloudflare_api_token
    cloudflare_account_id = var.cloudflare_account_id
    upstash_email        = var.upstash_email
    upstash_api_key      = var.upstash_api_key
    vercel_api_token     = var.vercel_api_token
  }
}
```

### Advanced Configuration with All Features

```hcl
module "environment" {
  source = "./modules/environment"

  environment  = "production"
  project_name = "forge"

  enable_doppler = true
  doppler_token  = var.doppler_token

  # Configure which secrets to fetch from Doppler
  doppler_config = {
    cloudflare = {
      config_name = "cloudflare_prod"
      secrets = [
        "CLOUDFLARE_API_TOKEN",
        "CLOUDFLARE_ACCOUNT_ID",
        "CLOUDFLARE_ZONE_ID"
      ]
    }

    monitoring = {
      config_name = "monitoring_prod"
      secrets = [
        "SLACK_WEBHOOK_URL",
        "PAGERDUTY_INTEGRATION_KEY",
        "DATADOG_API_KEY",
        "SENTRY_DSN"
      ]
    }

    integrations = {
      config_name = "integrations_prod"
      secrets = [
        "STRIPE_API_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "GITHUB_TOKEN",
        "OPENAI_API_KEY"
      ]
    }
  }

  # Secret rotation configuration
  enable_secret_rotation = true
  secret_rotation_days = {
    api_tokens = 90   # Rotate API tokens every 90 days
    api_keys   = 180  # Rotate API keys every 180 days
    webhooks   = 365  # Rotate webhooks yearly
  }

  # Environment-specific configuration
  environment_config = {
    allowed_ips = ["10.0.0.0/8", "172.16.0.0/12"]
    enable_debug = false
    log_level = "info"
    features = {
      rate_limiting    = true
      analytics        = true
      maintenance_mode = false
      beta_features    = false
    }
  }

  tags = {
    Team       = "platform"
    CostCenter = "engineering"
  }
}

# Use monitoring webhooks
module "monitoring" {
  source = "./modules/cloudflare/monitoring"

  # ... other config ...

  notification_channels = {
    slack = {
      enabled     = true
      webhook_url = module.environment.monitoring_webhooks.slack_webhook_url
    }

    pagerduty = {
      enabled         = true
      integration_key = module.environment.monitoring_webhooks.pagerduty_integration_key
    }
  }
}

# Use integration API keys
resource "cloudflare_workers_secret" "stripe_key" {
  account_id  = module.environment.cloudflare_account_id
  name        = "STRIPE_API_KEY"
  script_name = "payment-processor"
  secret_text = module.environment.integration_api_keys.stripe_api_key
}
```

### Using Feature Flags

```hcl
# Access feature flags in your configuration
locals {
  enable_rate_limiting = module.environment.feature_flags.rate_limiting
  enable_analytics     = module.environment.feature_flags.analytics
  debug_mode          = module.environment.feature_flags.debug_mode
}

# Conditionally enable features
resource "cloudflare_rate_limit" "api" {
  count = local.enable_rate_limiting ? 1 : 0
  # ... configuration ...
}
```

### Multi-Environment Setup

```hcl
# development.tfvars
environment = "development"
enable_doppler = false
fallback_secrets = {
  cloudflare_api_token = "dev_token"
  # ... other dev secrets
}

# staging.tfvars
environment = "staging"
doppler_token = "dp.st.staging_token"

# production.tfvars
environment = "production"
doppler_token = "dp.st.production_token"
```

## Doppler Setup

1. **Create Doppler Project**:

   ```bash
   doppler projects create forge
   ```

2. **Create Environments**:

   ```bash
   doppler configs create --project forge --name development
   doppler configs create --project forge --name staging
   doppler configs create --project forge --name production
   ```

3. **Add Secrets**:

   ```bash
   doppler secrets set CLOUDFLARE_API_TOKEN --project forge --config production
   doppler secrets set CLOUDFLARE_ACCOUNT_ID --project forge --config production
   # ... add other secrets
   ```

4. **Generate Service Token**:
   ```bash
   doppler configs tokens create --project forge --config production --name terraform
   ```

## Secret Categories

### Provider Secrets

- **Cloudflare**: API token, Account ID
- **Upstash**: Email, API key, Team name
- **Vercel**: API token, Org ID, Team ID

### Monitoring Secrets

- **Slack**: Webhook URL
- **PagerDuty**: Integration key
- **Discord**: Webhook URL
- **Datadog**: API key
- **Sentry**: DSN

### Integration Secrets

- **Stripe**: API key, Webhook secret
- **GitHub**: Personal access token
- **OpenAI**: API key
- **Resend**: API key
- **Knock**: API key

## Best Practices

1. **Use Doppler for Production**: Always use Doppler for production
   environments
2. **Rotate Secrets Regularly**: Follow the rotation schedule recommendations
3. **Limit Access**: Use Doppler's access controls to limit who can view secrets
4. **Audit Trail**: Doppler provides audit logs for all secret access
5. **Environment Isolation**: Keep secrets separated by environment
6. **Fallback Values**: Always provide fallback values for local development

## Security Considerations

1. **Service Tokens**: Use environment-specific service tokens
2. **Token Scope**: Limit token permissions to read-only
3. **Secret Encryption**: All secrets are encrypted at rest and in transit
4. **Access Logs**: Monitor Doppler access logs regularly
5. **Terraform State**: Ensure Terraform state is encrypted

## Outputs

| Name                       | Description                       | Sensitive |
| -------------------------- | --------------------------------- | --------- |
| doppler_enabled            | Whether Doppler is enabled        | No        |
| cloudflare_provider_config | Cloudflare provider configuration | Yes       |
| upstash_provider_config    | Upstash provider configuration    | Yes       |
| vercel_provider_config     | Vercel provider configuration     | Yes       |
| monitoring_webhooks        | Monitoring webhook URLs           | Yes       |
| integration_api_keys       | Third-party API keys              | Yes       |
| feature_flags              | Environment feature flags         | No        |
| environment_summary        | Complete environment summary      | No        |

## Requirements

- Terraform >= 1.5.0
- Doppler provider ~> 1.2
- Doppler account and project (if using Doppler)
- Service token with read access to secrets
