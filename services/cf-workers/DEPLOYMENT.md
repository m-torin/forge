# Cloudflare Workers Deployment Guide

## Prerequisites

1. **Cloudflare Account** with Workers, R2, and KV access
2. **Terraform** v1.5.0+ installed
3. **pnpm** package manager
4. **Wrangler CLI** for local development
5. **Doppler** (optional, for production secrets)

## Environment Setup

### Development Environment

```bash
# 1. Navigate to development environment
cd infra/environments/development

# 2. Set required variables
export TF_VAR_cloudflare_api_token="your-api-token"
export TF_VAR_cloudflare_account_id="your-account-id"
export TF_VAR_upstash_email="your-email"
export TF_VAR_upstash_api_key="your-api-key"
export TF_VAR_vercel_api_token="your-token"
export TF_VAR_domain="your-domain.com"

# 3. Initialize and plan
terraform init
terraform plan

# 4. Apply infrastructure
terraform apply
```

### Production Environment

```bash
# 1. Navigate to production environment
cd infra/environments/production

# 2. Set Doppler token (recommended)
export TF_VAR_doppler_token="your-doppler-token"

# 3. Initialize and plan
terraform init
terraform plan

# 4. Apply infrastructure
terraform apply
```

## Worker Development

### Local Development

```bash
# Navigate to any worker directory
cd services/cf-workers/image-processor

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Deploy to Cloudflare
pnpm deploy
```

### Available Workers

1. **image-processor** (Port 8787)
   - Handles image upload and AI classification
   - Endpoints: `/process`, `/metadata/*`

2. **image-transformer** (Port 8788)
   - Handles image transformations and CDN-style URLs
   - Endpoints: `/cdn-cgi/image/*`, `/images/*`

3. **nextjs-image-optimizer** (Port 8789)
   - Provides Next.js Image component compatibility
   - Endpoints: `/api/_next/image`

## Configuration Verification

### Required Secrets

Ensure these secrets are configured in your environment:

- `CLOUDFLARE_API_TOKEN` - Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `IMAGE_SIGNING_KEY` - Secret key for URL signing
- `UPSTASH_EMAIL` - Upstash account email
- `UPSTASH_API_KEY` - Upstash API key
- `VERCEL_API_TOKEN` - Vercel API token

### Terraform Outputs

After deployment, check these outputs:

```bash
# Get all outputs
terraform output

# Get specific outputs
terraform output image_service_urls
terraform output image_metadata_kv
terraform output images_r2_bucket
```

## Testing

### Test Image Upload

```bash
# Test image processor
curl -X POST https://images.yourdomain.com/process \
  -F "file=@test-image.jpg" \
  -H "Content-Type: multipart/form-data"
```

### Test Image Transformation

```bash
# Test image transformer
curl "https://images.yourdomain.com/cdn-cgi/image/width=300,format=webp/images/path/to/image.jpg"
```

### Test Next.js Integration

```bash
# Test Next.js image optimizer
curl "https://images.yourdomain.com/api/_next/image?url=/images/test.jpg&w=300&q=80"
```

## Troubleshooting

### Common Issues

1. **Worker not responding**
   - Check if worker is deployed: `wrangler list`
   - Verify routes are configured in Cloudflare dashboard
   - Check worker logs: `wrangler tail`

2. **Bindings not working**
   - Verify bindings in `wrangler.toml`
   - Check if resources exist in Cloudflare dashboard
   - Ensure correct account ID and permissions

3. **Terraform errors**
   - Run `terraform validate` to check syntax
   - Check provider versions in `versions.tf`
   - Verify all required variables are set

### Debug Commands

```bash
# Check worker status
wrangler list

# View worker logs
wrangler tail image-processor

# Test worker locally
wrangler dev

# Validate Terraform
terraform validate

# Check Terraform plan
terraform plan -detailed-exitcode
```

## Monitoring

### Cloudflare Dashboard
- Monitor worker performance and errors
- Check R2 bucket usage and costs
- Review KV namespace operations

### Terraform State
- Keep state files secure and backed up
- Use remote state for production
- Monitor for drift with `terraform plan`

## Security Considerations

1. **Secrets Management**
   - Use Doppler or similar for production secrets
   - Never commit secrets to version control
   - Rotate secrets regularly

2. **Access Control**
   - Use least-privilege API tokens
   - Enable 2FA on all accounts
   - Monitor access logs

3. **Network Security**
   - Configure CORS appropriately
   - Use HTTPS for all endpoints
   - Implement rate limiting

## Cost Optimization

1. **R2 Storage**
   - Set up lifecycle policies for old images
   - Use appropriate storage classes
   - Monitor usage and costs

2. **Worker Usage**
   - Optimize worker code for performance
   - Use appropriate CPU time limits
   - Monitor request counts and costs

3. **KV Operations**
   - Minimize KV read/write operations
   - Use appropriate TTL values
   - Monitor operation counts
