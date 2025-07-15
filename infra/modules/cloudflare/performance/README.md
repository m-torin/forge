# Cloudflare Performance Module

This module provides comprehensive performance optimization features for
Cloudflare zones including caching, compression, protocol optimization, and load
balancing.

## Features

- **Caching**: Advanced cache configuration with custom rules
- **Argo Smart Routing**: Intelligent routing for 30% faster performance
- **Tiered Caching**: Reduce origin load with Cloudflare's tiered cache
- **Image Optimization**: Polish and Mirage for automatic image optimization
- **Compression**: Brotli and gzip compression
- **Protocol Optimization**: HTTP/3, 0-RTT, Early Hints
- **Load Balancing**: Multi-origin load balancing with health checks
- **Waiting Room**: Virtual queue for traffic spikes
- **Analytics**: Web Analytics and Browser Insights

## Usage

```hcl
module "performance" {
  source = "./modules/cloudflare/performance"

  zone_id    = module.zone.zone_id
  account_id = var.cloudflare_account_id

  # Basic Caching
  cache_level       = "aggressive"
  browser_cache_ttl = 14400  # 4 hours

  # Custom Cache Rules
  cache_rules = {
    "static-assets" = {
      expression        = "http.request.uri.path.extension in {\"js\" \"css\" \"jpg\" \"png\"}"
      edge_cache_ttl    = 86400   # 24 hours
      browser_cache_ttl = 604800  # 7 days
      description       = "Long cache for static assets"
    }
    "api-cache" = {
      expression        = "http.request.uri.path contains \"/api/\" and http.request.method eq \"GET\""
      edge_cache_ttl    = 300    # 5 minutes
      browser_cache_ttl = 0      # No browser cache
      description       = "Short cache for API responses"
    }
    "no-cache-admin" = {
      expression    = "http.request.uri.path contains \"/admin/\""
      bypass_cache  = true
      description   = "Bypass cache for admin pages"
    }
  }

  # Performance Features
  enable_argo           = true
  enable_tiered_caching = true
  enable_polish         = true
  polish_settings = {
    mode = "lossy"
    webp = true
    avif = true
  }
  enable_mirage         = true
  enable_rocket_loader  = true
  enable_early_hints    = true
  enable_http3          = true
  enable_0rtt           = true

  # Compression and Minification
  enable_brotli = true
  minify = {
    css  = true
    html = true
    js   = true
  }

  # Health Checks
  enable_health_checks = true
  health_checks = {
    "primary-origin" = {
      name           = "Primary Origin Health Check"
      address        = "origin1.example.com"
      check_regions  = ["WNAM", "ENAM", "WEU", "EEU"]
      expected_codes = ["200", "301"]
      interval       = 60
      timeout        = 5
      retries        = 2
    }
    "secondary-origin" = {
      name           = "Secondary Origin Health Check"
      address        = "origin2.example.com"
      check_regions  = ["WNAM", "ENAM", "WEU", "EEU"]
      expected_codes = ["200", "301"]
      interval       = 60
    }
  }

  # Load Balancing
  enable_load_balancing = true
  load_balancer_pools = {
    "primary-pool" = {
      name = "Primary Origin Pool"
      origins = [
        {
          name    = "origin1"
          address = "origin1.example.com"
          weight  = 0.7
          header = {
            "Host" = ["origin1.example.com"]
          }
        },
        {
          name    = "origin2"
          address = "origin2.example.com"
          weight  = 0.3
          header = {
            "Host" = ["origin2.example.com"]
          }
        }
      ]
      origin_steering = {
        policy = "weight"
      }
    }
  }

  load_balancers = {
    "main-lb" = {
      name             = "Main Load Balancer"
      default_pool_ids = [module.performance.load_balancer_pools["primary-pool"].id]
      fallback_pool_id = module.performance.load_balancer_pools["primary-pool"].id
      proxied          = true
      steering_policy  = "dynamic_latency"
      session_affinity = "cookie"
      session_affinity_ttl = 82800  # 23 hours

      rules = [
        {
          name      = "Mobile Traffic"
          condition = "http.user_agent contains \"Mobile\""
          overrides = {
            steering_policy = "geo"
          }
        }
      ]
    }
  }

  # Waiting Room
  enable_waiting_room = true
  waiting_rooms = {
    "main-queue" = {
      name                 = "Main Site Queue"
      host                 = "example.com"
      path                 = "/"
      total_active_users   = 2000
      new_users_per_minute = 200
      session_duration     = 5
      custom_page_html     = file("waiting-room.html")
      queue_all           = false  # Only queue when at capacity
    }
  }

  # Analytics
  enable_web_analytics    = true
  enable_browser_insights = true
}
```

## Cache Rules Best Practices

1. **Static Assets**: Long edge and browser cache
2. **Dynamic Content**: Short edge cache, no browser cache
3. **API Responses**: Cache GET requests only
4. **User-Specific**: Bypass cache entirely
5. **Admin Areas**: Never cache

## Performance Optimization Tips

1. **Enable Argo**: 30% average performance improvement
2. **Use Polish**: Automatic image optimization without quality loss
3. **Enable HTTP/3**: Faster connection establishment
4. **Implement Early Hints**: Preload critical resources
5. **Configure Health Checks**: Ensure origin availability

## Load Balancing Strategies

- **Round Robin**: Equal distribution
- **Weight**: Percentage-based distribution
- **Geo**: Route by geographic location
- **Dynamic Latency**: Route to fastest origin
- **Random**: Random distribution

## Requirements

- Terraform >= 1.5.0
- Cloudflare provider ~> 5.0
- Appropriate Cloudflare plan for advanced features

## Inputs

See `variables.tf` for all available inputs.

## Outputs

| Name                 | Description                         |
| -------------------- | ----------------------------------- |
| cache_level          | Current cache level setting         |
| performance_features | Map of enabled performance features |
| load_balancers       | Load balancer configurations        |
| web_analytics_token  | Web Analytics site token            |
| performance_summary  | Comprehensive performance status    |

## Notes

- Argo requires a paid Cloudflare plan
- Load Balancing requires Business or Enterprise plan
- Waiting Room requires Business or Enterprise plan
- Some features may increase bandwidth costs
