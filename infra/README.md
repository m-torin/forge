# Infrastructure as Code

This directory contains the Terraform infrastructure code for the LetsF

My Forge project. The infrastructure is organized in a modular,
environment-aware structure that supports multiple cloud providers and services.

## Directory Structure

```
infra/
├── modules/                    # Reusable Terraform modules
│   ├── cloudflare/            # Cloudflare service modules
│   │   ├── zone/              # DNS zones and records
│   │   ├── security/          # WAF, DDoS, rate limiting
│   │   ├── performance/       # Caching, optimization
│   │   ├── media/             # Images, R2 storage
│   │   ├── email/             # Email routing
│   │   ├── ai/                # AI Gateway, Vectorize
│   │   └── workers/           # Edge Workers
│   ├── vercel/                # Vercel deployments
│   └── upstash/               # Redis, rate limiting
├── environments/              # Environment configurations
│   ├── shared/                # Shared configuration
│   ├── dev/                   # Development
│   ├── staging/               # Staging
│   └── prod/                  # Production
└── legacy/                    # Previous infrastructure (archived)
```

## Quick Start

### Prerequisites

- Terraform >= 1.5.0
- AWS CLI (for state backend)
- API tokens for services you're using:
  - Cloudflare API token
  - Vercel API token (optional)
  - Upstash credentials (optional)
  - Doppler token (recommended for secrets)

### Deployment

1. **Choose an environment**:

   ```bash
   cd environments/prod
   ```

2. **Configure credentials** (using Doppler recommended):

   ```bash
   export TF_VAR_doppler_token="dp.st.prod.xxxxxxxxxx"
   ```

   Or use direct credentials:

   ```bash
   export TF_VAR_cloudflare_api_token="cf_xxxxxxxxxx"
   export TF_VAR_cloudflare_account_id="xxxxxxxxxx"
   ```

3. **Initialize Terraform**:

   ```bash
   terraform init
   ```

4. **Review the plan**:

   ```bash
   terraform plan
   ```

5. **Apply changes**:
   ```bash
   terraform apply
   ```

## Modules

### Cloudflare Modules

#### Zone Module

Manages DNS zones, records, and page rules.

```hcl
module "zone" {
  source = "./modules/cloudflare/zone"

  domain     = "example.com"
  account_id = var.cloudflare_account_id

  dns_records = {
    "@" = {
      type    = "A"
      value   = "192.0.2.1"
      proxied = true
    }
  }
}
```

#### Security Module

Comprehensive security features including WAF, DDoS protection, and rate
limiting.

```hcl
module "security" {
  source = "./modules/cloudflare/security"

  zone_id             = module.zone.zone_id
  account_id          = var.cloudflare_account_id
  enable_waf          = true
  enable_rate_limiting = true
}
```

#### Performance Module

Optimization features including caching, Argo, and load balancing.

```hcl
module "performance" {
  source = "./modules/cloudflare/performance"

  zone_id              = module.zone.zone_id
  account_id           = var.cloudflare_account_id
  enable_argo          = true
  enable_tiered_caching = true
}
```

### External Service Modules

- **Vercel**: Manages Vercel projects and deployments
- **Upstash**: Redis and rate limiting infrastructure

## Environments

### Development

- Basic security settings
- Flexible SSL
- Minimal caching
- Cost-optimized

### Staging

- Production-like configuration
- Full SSL
- Standard caching
- Testing ground for new features

### Production

- Maximum security
- Full Strict SSL
- Aggressive caching
- All performance features enabled
- High availability configuration

## Feature Flags

Control which modules are deployed using feature flags:

```hcl
features = {
  zone        = true   # DNS management
  security    = true   # Security features
  performance = true   # Performance optimization
  media       = false  # Images and R2
  email       = false  # Email routing
  ai          = false  # AI features
  workers     = false  # Edge Workers
  vercel      = true   # Vercel integration
  upstash     = true   # Redis/rate limiting
}
```

## State Management

### Local Development

Uses local state file (not recommended for team use).

### Production

Uses S3 backend with state locking:

```hcl
backend "s3" {
  bucket         = "your-terraform-state-bucket"
  key            = "prod/terraform.tfstate"
  region         = "us-east-1"
  encrypt        = true
  dynamodb_table = "terraform-state-lock"
}
```

## Security Best Practices

1. **Use Doppler** for secret management
2. **Enable MFA** for AWS state bucket access
3. **Restrict API tokens** to minimum required permissions
4. **Regular audits** of security settings
5. **Version pinning** for all providers

## Cost Optimization

1. **Feature flags**: Only enable what you need
2. **Environment-specific**: Use lower tiers in dev/staging
3. **Caching**: Reduce origin bandwidth
4. **Monitoring**: Track usage and costs

## Troubleshooting

### Common Issues

1. **State Lock Error**

   ```bash
   terraform force-unlock <lock-id>
   ```

2. **API Rate Limits**
   - Cloudflare: 1200 requests per 5 minutes
   - Add delays between large operations

3. **DNS Propagation**
   - Changes can take up to 48 hours
   - Use `dig` or `nslookup` to verify

4. **Provider Version Conflicts**
   ```bash
   terraform init -upgrade
   ```

### Debug Commands

```bash
# Detailed logging
export TF_LOG=DEBUG

# Validate configuration
terraform validate

# Format check
terraform fmt -check -recursive

# State inspection
terraform state list
terraform state show <resource>
```

## Contributing

1. Create feature branch
2. Make changes in appropriate module
3. Test in dev environment first
4. Update documentation
5. Submit PR with plan output

## Migration from Legacy

The `legacy/` directory contains the previous infrastructure code. To migrate:

1. Compare legacy and new configurations
2. Import existing resources:
   ```bash
   terraform import module.zone.cloudflare_zone.this <zone-id>
   ```
3. Verify no destructive changes in plan
4. Apply incrementally

## Resources

- [Cloudflare Provider Docs](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs)
- [Vercel Provider Docs](https://registry.terraform.io/providers/vercel/vercel/latest/docs)
- [Upstash Provider Docs](https://registry.terraform.io/providers/upstash/upstash/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

## License

See the main project LICENSE file.
