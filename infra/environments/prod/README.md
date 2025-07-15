# Production Environment

This directory contains the Terraform configuration for the production
environment.

## Prerequisites

1. **Terraform**: Version 1.5.0 or higher
2. **AWS Credentials**: For S3 backend state storage
3. **API Tokens**: Either via Doppler or environment variables
   - Cloudflare API token
   - Vercel API token (if using Vercel)
   - Upstash credentials (if using Upstash)

## State Management

Production uses S3 backend for state storage with DynamoDB for state locking:

```hcl
backend "s3" {
  bucket         = "letsfindmy-forge-terraform-state"
  key            = "prod/terraform.tfstate"
  region         = "us-east-1"
  encrypt        = true
  dynamodb_table = "terraform-state-lock"
}
```

## Usage

### With Doppler (Recommended)

```bash
# Export Doppler token
export TF_VAR_doppler_token="dp.st.prod.xxxxxxxxxx"

# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply
```

### Without Doppler

```bash
# Export required credentials
export TF_VAR_cloudflare_api_token="cf_xxxxxxxxxx"
export TF_VAR_cloudflare_account_id="xxxxxxxxxx"
export TF_VAR_vercel_api_token="xxxxxxxxxx"
export TF_VAR_upstash_email="user@example.com"
export TF_VAR_upstash_api_key="xxxxxxxxxx"

# Initialize and apply
terraform init
terraform plan
terraform apply
```

## Configuration

The production environment uses:

- **SSL Mode**: Full (Strict)
- **Minimum TLS**: 1.2
- **Cache Level**: Aggressive
- **WAF Sensitivity**: High
- **Rate Limiting**: Enabled
- **All Features**: Enabled by default

## Features

All features are enabled in production:

- Cloudflare Zone management
- Security (WAF, DDoS, Bot Management)
- Performance (Argo, Polish, Caching)
- Media (Images, R2 Storage)
- Email routing
- AI capabilities
- Edge Workers
- Vercel integration
- Upstash Redis

## Customization

Override default settings in `terraform.tfvars`:

```hcl
primary_domain = "yourdomain.com"

features = {
  ai      = false  # Disable AI features
  workers = false  # Disable Workers
}

notification_email = "alerts@yourdomain.com"
```

## Outputs

Key outputs available after deployment:

- `cloudflare_zone`: Zone ID, name servers, DNSSEC status
- `cloudflare_security`: Security feature status
- `cloudflare_performance`: Performance optimization status
- `vercel_project`: Vercel project details
- `upstash_redis`: Redis connection details
- `infrastructure_summary`: Complete deployment summary

## Monitoring

After deployment, monitor:

1. Cloudflare Analytics Dashboard
2. Web Analytics (if enabled)
3. Security Events
4. Origin Health Checks
5. Cache Performance

## Troubleshooting

Common issues:

1. **State Lock**: If state is locked, check DynamoDB table
2. **API Limits**: Cloudflare has API rate limits
3. **Plan Changes**: Some Cloudflare features require specific plans
4. **DNS Propagation**: Allow time for DNS changes to propagate
