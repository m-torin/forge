# Deployment Guide for Workers App

This guide follows Upstash's official Next.js deployment recommendations.

## Pre-Deployment Checklist

- [ ] Remove or conditionally exclude local development settings
- [ ] Ensure all environment variables are configured
- [ ] Test workflows locally with production-like settings
- [ ] Review security implementations

## Environment Variables

### Required for Production

```env
# QStash Authentication
QSTASH_TOKEN=your_production_token

# Redis for State Management
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Next.js
NEXT_PUBLIC_APP_URL=https://your-production-url.com
```

### Optional Security Variables

```env
# For signature verification
QSTASH_CURRENT_SIGNING_KEY=sig_xxxxxx
QSTASH_NEXT_SIGNING_KEY=sig_xxxxxx

# For additional security
TRUSTED_IPS=ip1,ip2,ip3
```

### Variables to REMOVE in Production

- `QSTASH_URL` - Only used for local development
- `UPSTASH_WORKFLOW_URL` - Only used with local tunnels

## Deployment Steps

### Option 1: Deploy with Vercel (Recommended)

1. **Via Vercel Dashboard**

   ```bash
   # Push to GitHub first
   git push origin main
   ```

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

2. **Via Vercel CLI**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod

   # Set environment variables
   vercel env add QSTASH_TOKEN production
   vercel env add UPSTASH_REDIS_REST_URL production
   vercel env add UPSTASH_REDIS_REST_TOKEN production
   ```

### Option 2: Deploy with Other Platforms

#### Cloudflare Pages

```bash
# Install Wrangler
npm i -g wrangler

# Deploy
wrangler pages deploy ./apps/workers/.next
```

#### AWS Amplify

```bash
# Install Amplify CLI
npm i -g @aws-amplify/cli

# Initialize and deploy
amplify init
amplify push
```

## Post-Deployment Verification

### 1. Test Basic Workflow

```bash
curl -X POST https://your-app.vercel.app/api/workflow \
  -H "Content-Type: application/json"

# Expected: {"workflowRunId":"wfr_xxxxxx"}
```

### 2. Test Example Workflows

```bash
# Simple workflow
curl -X POST https://your-app.vercel.app/api/workflow/examples/simple \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Test"}'
```

### 3. Check QStash Dashboard

- Go to [console.upstash.com/qstash](https://console.upstash.com/qstash)
- Navigate to "Workflows" tab
- Verify your workflow runs appear
- Check step execution logs

## Production Configuration

### Function Timeouts

Vercel has different timeout limits based on plan:

- Hobby: 10 seconds
- Pro: 60 seconds
- Enterprise: 300 seconds

For workflows, you typically need Pro or Enterprise.

### Security Headers

The middleware automatically adds security headers:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

### Monitoring & Alerts

1. **Upstash Console**

   - Monitor workflow execution
   - View detailed step logs
   - Track failures

2. **Vercel Analytics**

   - Function execution metrics
   - Error rates
   - Performance monitoring

3. **Custom Alerts**
   ```typescript
   // In your workflow
   failureFunction: async ({ context, failStatus }) => {
     // Send alert to Slack, email, etc.
     await sendAlert({
       workflowId: context.workflowRunId,
       error: failStatus,
     });
   };
   ```

## Troubleshooting

### Common Issues

1. **"Workflow not found" errors**

   - Verify QSTASH_TOKEN is set correctly
   - Check function logs in Vercel

2. **Timeouts**

   - Increase function timeout in vercel.json
   - Use context.call for long-running operations

3. **Signature verification failures**
   - Ensure signing keys are set correctly
   - Check if requests are coming from QStash

### Debug Commands

```bash
# View Vercel logs
vercel logs --prod

# Check environment variables
vercel env ls production

# Redeploy
vercel --prod --force
```

## Best Practices

1. **Use Production QStash**: Never use local QStash server in production
2. **Monitor Costs**: Track QStash usage in Upstash console
3. **Set Alerts**: Configure failure notifications
4. **Version Control**: Tag releases for easy rollbacks
5. **Test Thoroughly**: Run integration tests before deploying

## Rollback Procedure

If issues arise:

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]

# Or redeploy previous commit
git checkout [previous-commit]
vercel --prod
```
