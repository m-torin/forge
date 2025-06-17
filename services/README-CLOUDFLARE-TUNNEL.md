# Cloudflare Tunnel Setup Guide

This guide shows how to run each service through Cloudflare Tunnel and proxy them to subdomains,
making them accessible on the internet with your custom domain.

## 📋 Prerequisites

1. **Cloudflare Account** with a domain configured
2. **Cloudflare Tunnel** (formerly Argo Tunnel) set up
3. **cloudflared CLI** installed locally
4. **Services running** (either locally or on Railway)

## 🚀 Quick Setup

### 1. Install Cloudflared

```bash
# macOS
brew install cloudflared

# Linux
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Windows
winget install --id Cloudflare.cloudflared
```

### 2. Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This opens your browser to authenticate and downloads credentials.

### 3. Create a Tunnel

```bash
cloudflared tunnel create services-tunnel
```

Note the tunnel UUID for later use.

## 🌐 Service Subdomain Configuration

### Service-to-Subdomain Mapping

| Service          | Subdomain                      | Local Port | Railway URL                     |
| ---------------- | ------------------------------ | ---------- | ------------------------------- |
| **OpenGrep**     | `opengrep.your-domain.com`     | 3000       | `your-opengrep.railway.app`     |
| **TryComp**      | `trycomp.your-domain.com`      | 3000       | `your-trycomp.railway.app`      |
| **Camoufox**     | `camoufox.your-domain.com`     | 3000       | `your-camoufox.railway.app`     |
| **Firecrawl**    | `firecrawl.your-domain.com`    | 3002       | `your-firecrawl.railway.app`    |
| **Monitoring**   | `grafana.your-domain.com`      | 3000       | `your-monitoring.railway.app`   |
| **NextFaster**   | `nextfaster.your-domain.com`   | 3000       | `your-nextfaster.railway.app`   |
| **Postiz**       | `postiz.your-domain.com`       | 3000       | `your-postiz.railway.app`       |
| **Browserless**  | `browserless.your-domain.com`  | 3000       | `your-browserless.railway.app`  |
| **ActivePieces** | `activepieces.your-domain.com` | 80         | `your-activepieces.railway.app` |
| **Dub**          | `dub.your-domain.com`          | 3000       | `your-dub.railway.app`          |

## 📝 Configuration Methods

### Method 1: YAML Configuration File (Recommended)

Create `/Users/torin/.cloudflared/config.yml`:

```yaml
tunnel: services-tunnel
credentials-file: /Users/torin/.cloudflared/[tunnel-uuid].json

ingress:
  # Custom Services
  - hostname: opengrep.your-domain.com
    service: http://localhost:3000
    # Alternative: Railway proxy
    # service: https://your-opengrep.railway.app

  - hostname: trycomp.your-domain.com
    service: http://localhost:3000
    # Alternative: Railway proxy
    # service: https://your-trycomp.railway.app

  - hostname: camoufox.your-domain.com
    service: http://localhost:3000
    # Alternative: Railway proxy
    # service: https://your-camoufox.railway.app

  - hostname: firecrawl.your-domain.com
    service: http://localhost:3002
    # Alternative: Railway proxy
    # service: https://your-firecrawl.railway.app

  # Monitoring Stack
  - hostname: grafana.your-domain.com
    service: http://localhost:3000
    # Alternative: Railway proxy
    # service: https://your-monitoring.railway.app

  - hostname: prometheus.your-domain.com
    service: http://localhost:9090
    # Alternative: Use monitoring service with /prometheus path
    # service: https://your-monitoring.railway.app/prometheus

  - hostname: loki.your-domain.com
    service: http://localhost:3100
    # Alternative: Use monitoring service with /loki path
    # service: https://your-monitoring.railway.app/loki

  # Open Source Services
  - hostname: nextfaster.your-domain.com
    service: http://localhost:3000
    # Alternative: Railway proxy
    # service: https://your-nextfaster.railway.app

  - hostname: postiz.your-domain.com
    service: http://localhost:3000
    # Alternative: Railway proxy
    # service: https://your-postiz.railway.app

  - hostname: browserless.your-domain.com
    service: http://localhost:3000
    # Alternative: Railway proxy
    # service: https://your-browserless.railway.app

  - hostname: activepieces.your-domain.com
    service: http://localhost:80
    # Alternative: Railway proxy
    # service: https://your-activepieces.railway.app

  - hostname: dub.your-domain.com
    service: http://localhost:3000
    # Alternative: Railway proxy
    # service: https://your-dub.railway.app

  # Catch-all (required)
  - service: http_status:404

# Optional: Additional configuration
warp-routing:
  enabled: true

originRequest:
  connectTimeout: 30s
  tlsTimeout: 30s
  tcpKeepAlive: 30s
  noHappyEyeballs: false
  keepAliveTimeout: 90s
  keepAliveConnections: 100
```

### Method 2: Individual Tunnel Commands

For testing or one-off setups:

```bash
# OpenGrep
cloudflared tunnel --hostname opengrep.your-domain.com --url http://localhost:3000

# TryComp
cloudflared tunnel --hostname trycomp.your-domain.com --url http://localhost:3000

# Camoufox
cloudflared tunnel --hostname camoufox.your-domain.com --url http://localhost:3000

# Firecrawl
cloudflared tunnel --hostname firecrawl.your-domain.com --url http://localhost:3002

# Monitoring (Grafana)
cloudflared tunnel --hostname grafana.your-domain.com --url http://localhost:3000

# NextFaster
cloudflared tunnel --hostname nextfaster.your-domain.com --url http://localhost:3000

# Postiz
cloudflared tunnel --hostname postiz.your-domain.com --url http://localhost:3000

# Browserless
cloudflared tunnel --hostname browserless.your-domain.com --url http://localhost:3000

# ActivePieces
cloudflared tunnel --hostname activepieces.your-domain.com --url http://localhost:80

# Dub
cloudflared tunnel --hostname dub.your-domain.com --url http://localhost:3000
```

## 🔧 DNS Configuration

### Automatic DNS (Recommended)

Cloudflare Tunnel can automatically manage DNS records:

```bash
# Route traffic for all subdomains
cloudflared tunnel route dns services-tunnel opengrep.your-domain.com
cloudflared tunnel route dns services-tunnel trycomp.your-domain.com
cloudflared tunnel route dns services-tunnel camoufox.your-domain.com
cloudflared tunnel route dns services-tunnel firecrawl.your-domain.com
cloudflared tunnel route dns services-tunnel grafana.your-domain.com
cloudflared tunnel route dns services-tunnel prometheus.your-domain.com
cloudflared tunnel route dns services-tunnel loki.your-domain.com
cloudflared tunnel route dns services-tunnel nextfaster.your-domain.com
cloudflared tunnel route dns services-tunnel postiz.your-domain.com
cloudflared tunnel route dns services-tunnel browserless.your-domain.com
cloudflared tunnel route dns services-tunnel activepieces.your-domain.com
cloudflared tunnel route dns services-tunnel dub.your-domain.com
```

### Manual DNS Configuration

In Cloudflare Dashboard → DNS → Records:

| Type  | Name         | Content                        | Proxy |
| ----- | ------------ | ------------------------------ | ----- |
| CNAME | opengrep     | [tunnel-uuid].cfargotunnel.com | ✅    |
| CNAME | trycomp      | [tunnel-uuid].cfargotunnel.com | ✅    |
| CNAME | camoufox     | [tunnel-uuid].cfargotunnel.com | ✅    |
| CNAME | firecrawl    | [tunnel-uuid].cfargotunnel.com | ✅    |
| CNAME | grafana      | [tunnel-uuid].cfargotunnel.com | ✅    |
| CNAME | prometheus   | [tunnel-uuid].cfargotunnel.com | ✅    |
| CNAME | loki         | [tunnel-uuid].cfargotunnel.com | ✅    |
| CNAME | nextfaster   | [tunnel-uuid].cfargotunnel.com | ✅    |
| CNAME | postiz       | [tunnel-uuid].cfargotunnel.com | ✅    |
| CNAME | browserless  | [tunnel-uuid].cfargotunnel.com | ✅    |
| CNAME | activepieces | [tunnel-uuid].cfargotunnel.com | ✅    |
| CNAME | dub          | [tunnel-uuid].cfargotunnel.com | ✅    |

## 🚀 Running the Tunnel

### Start the Tunnel

```bash
# Using config file (recommended)
cloudflared tunnel run services-tunnel

# Or start as daemon
cloudflared tunnel --config /Users/torin/.cloudflared/config.yml run services-tunnel
```

### Run as System Service

#### macOS (launchd)

Create `/Library/LaunchDaemons/com.cloudflare.cloudflared.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cloudflare.cloudflared</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/cloudflared</string>
        <string>tunnel</string>
        <string>--config</string>
        <string>/Users/torin/.cloudflared/config.yml</string>
        <string>run</string>
        <string>services-tunnel</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

```bash
sudo launchctl load /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
sudo launchctl start com.cloudflare.cloudflared
```

#### Linux (systemd)

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## 🔧 Advanced Configuration

### Load Balancing

For high availability across multiple Railway deployments:

```yaml
ingress:
  - hostname: opengrep.your-domain.com
    service: http_status:200
    originRequest:
      bastionMode: true
      proxyType: socks

  # Load balance between local and Railway
  - hostname: trycomp.your-domain.com
    service: http://localhost:3000
    originRequest:
      httpHostHeader: trycomp.your-domain.com
      connectTimeout: 10s
      tlsTimeout: 10s
      # Fallback to Railway if local fails
      fallbackOrigin: https://your-trycomp.railway.app
```

### Security Headers

Add security headers through Cloudflare:

```yaml
ingress:
  - hostname: opengrep.your-domain.com
    service: http://localhost:3000
    originRequest:
      httpHostHeader: opengrep.your-domain.com
      originServerName: opengrep.your-domain.com
      # Custom headers
      caPool: /path/to/ca-pool.pem
      noTLSVerify: false
```

### Path-based Routing

Route different paths to different services:

```yaml
ingress:
  # Monitoring stack on single domain
  - hostname: monitoring.your-domain.com
    path: /grafana/*
    service: http://localhost:3000

  - hostname: monitoring.your-domain.com
    path: /prometheus/*
    service: http://localhost:9090

  - hostname: monitoring.your-domain.com
    path: /loki/*
    service: http://localhost:3100

  # Default monitoring path to Grafana
  - hostname: monitoring.your-domain.com
    service: http://localhost:3000
```

## 🔄 Deployment Strategies

### Strategy 1: Local Development

For development and testing:

- Run services locally on their assigned ports
- Point Cloudflare Tunnel to `localhost` URLs
- Easy debugging and rapid iteration

### Strategy 2: Railway Proxy

For production or when services are already deployed:

- Point Cloudflare Tunnel to Railway URLs
- Leverage Railway's infrastructure and scaling
- Simplifies local setup

### Strategy 3: Hybrid Approach

Mix local and Railway services:

- Development services → localhost
- Production services → Railway
- Staging/testing → Railway with different subdomains

## 📊 Monitoring & Health Checks

### Health Check Configuration

```yaml
ingress:
  - hostname: opengrep.your-domain.com
    service: http://localhost:3000
    originRequest:
      # Health check path
      httpHostHeader: opengrep.your-domain.com
      connectTimeout: 30s
      tlsTimeout: 30s
      # Custom health check
      proxyType: http
```

### Monitoring Tunnel Status

```bash
# Check tunnel status
cloudflared tunnel info services-tunnel

# View tunnel metrics
cloudflared tunnel list

# Real-time logs
cloudflared tunnel run services-tunnel --loglevel debug
```

## 🔒 Security Considerations

### Access Control

Use Cloudflare Access for authentication:

```yaml
ingress:
  - hostname: grafana.your-domain.com
    service: http://localhost:3000
    originRequest:
      # Requires Cloudflare Access
      accessApplication: grafana-access-app
```

### Rate Limiting

Configure in Cloudflare Dashboard:

- **OpenGrep**: 100 requests/minute (analysis intensive)
- **TryComp**: 50 requests/minute (AI API calls)
- **Monitoring**: 1000 requests/minute (dashboard access)
- **Others**: 200 requests/minute (standard web apps)

### SSL/TLS Configuration

```yaml
originRequest:
  # Force HTTPS to origin
  originServerName: your-service.com
  tlsTimeout: 30s
  # Custom CA if needed
  caPool: /path/to/custom-ca.pem
  # Disable for development only
  noTLSVerify: false
```

## 🧪 Testing & Validation

### Test Individual Services

```bash
# Test connectivity
curl -H "Host: opengrep.your-domain.com" http://localhost:3000/health

# Test through tunnel
curl https://opengrep.your-domain.com/health

# Test with headers
curl -H "User-Agent: CloudflareTunnelTest" https://trycomp.your-domain.com/api/health
```

### Validate DNS Propagation

```bash
# Check DNS resolution
dig opengrep.your-domain.com
nslookup trycomp.your-domain.com

# Test from different locations
# Use online tools like whatsmydns.net
```

## 🚨 Troubleshooting

### Common Issues

1. **Tunnel Connection Failed**

   ```bash
   # Check tunnel status
   cloudflared tunnel info services-tunnel

   # Restart tunnel
   cloudflared tunnel run services-tunnel --loglevel debug
   ```

2. **DNS Not Resolving**

   ```bash
   # Check DNS records
   cloudflared tunnel route dns services-tunnel opengrep.your-domain.com

   # Wait for propagation (5-10 minutes)
   ```

3. **Service Not Accessible**

   ```bash
   # Verify service is running locally
   curl http://localhost:3000/health

   # Check tunnel logs
   cloudflared tunnel run services-tunnel --loglevel debug
   ```

4. **SSL/Certificate Issues**

   ```bash
   # Check certificate
   openssl s_client -connect opengrep.your-domain.com:443

   # Verify Cloudflare proxy is enabled
   ```

### Debug Commands

```bash
# Tunnel diagnostics
cloudflared tunnel list
cloudflared tunnel info services-tunnel

# Network connectivity
ping opengrep.your-domain.com
traceroute trycomp.your-domain.com

# DNS resolution
nslookup camoufox.your-domain.com
dig firecrawl.your-domain.com
```

## 📋 Service-Specific Notes

### OpenGrep

- High CPU usage during analysis
- Consider rate limiting
- Health check: `/health`

### TryComp

- AI API calls can be slow
- Increase timeout settings
- Health check: `/api/health`

### Camoufox

- Browser automation requires more resources
- May need increased memory limits
- Health check: `/health`

### Monitoring (Grafana)

- Multiple services on different ports
- Consider path-based routing
- Health check: `/api/health`

### Railway Services

- Already have their own SSL
- Can proxy directly to Railway URLs
- Built-in health checks

## 🔄 Alternative: Railway Custom Domains

For comparison, Railway also supports custom domains:

```bash
# Add custom domain in Railway dashboard
# Point DNS to Railway's edge network
# Automatic SSL certificate provisioning
```

**Cloudflare Tunnel Advantages:**

- More control over routing
- Better DDoS protection
- Advanced security features
- Works with local development
- Single point of configuration

**Railway Custom Domains Advantages:**

- Simpler setup
- Integrated with Railway platform
- Automatic scaling
- Built-in monitoring

## 🎯 Next Steps

1. **Choose your strategy** (local, Railway proxy, or hybrid)
2. **Set up DNS records** for your chosen subdomains
3. **Configure the tunnel** with your service mappings
4. **Test each service** individually
5. **Set up monitoring** and health checks
6. **Configure security** (Access, rate limiting)
7. **Document your setup** for team members

## 📞 Support Resources

- **Cloudflare Tunnel Docs**:
  https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Railway Custom Domains**: https://docs.railway.app/guides/public-networking#custom-domains
- **DNS Propagation Checker**: https://www.whatsmydns.net/
- **SSL Checker**: https://www.ssllabs.com/ssltest/

---

**Ready to go live?** Start with the monitoring service to track all other deployments! 🚀
