# Cloudflare Monitoring Module

This module provides comprehensive monitoring and alerting capabilities for
Cloudflare resources including workers, zones, origins, and security events.

## Features

- **Worker Monitoring**: Error alerts, CPU usage alerts, usage limit alerts
- **HTTP Monitoring**: Latency and error rate alerts
- **Security Monitoring**: DDoS, WAF, and rate limit alerts
- **SSL Monitoring**: Certificate expiry alerts
- **Origin Monitoring**: Origin health and availability alerts
- **Custom Alerts**: Flexible custom alert configurations
- **Multiple Notification Channels**: Email, webhooks, Slack, PagerDuty,
  Discord, Teams
- **Monitoring Dashboard**: Real-time dashboard with health checks and metrics
- **Logpush Integration**: Export logs for analysis
- **Alert Aggregation**: Group and suppress duplicate alerts
- **Maintenance Windows**: Suppress alerts during maintenance

## Usage

### Basic Configuration

```hcl
module "monitoring" {
  source = "./modules/cloudflare/monitoring"

  account_id = var.cloudflare_account_id
  zone_id    = module.zone.zone_id

  environment = "production"

  # Email notifications
  enable_email_notifications = true
  notification_email        = "alerts@example.com"

  # Worker monitoring
  worker_alerts = {
    error_alerts = true
    cpu_alerts   = true
    cpu_threshold = 85
    usage_alerts = true
    usage_threshold = 80
  }

  # HTTP monitoring
  http_alerts = {
    enabled = true
    error_threshold = 100
    latency_threshold = 2000
  }
}
```

### Advanced Configuration with Multiple Channels

```hcl
module "monitoring" {
  source = "./modules/cloudflare/monitoring"

  account_id = var.cloudflare_account_id
  zone_id    = module.zone.zone_id

  environment = "production"

  # Email notifications
  enable_email_notifications = true
  notification_email        = "alerts@example.com"

  # Custom webhooks
  custom_webhooks = {
    "slack-critical" = {
      url    = "https://hooks.slack.com/services/xxx/yyy/zzz"
      secret = var.slack_webhook_secret
    }
    "pagerduty" = {
      url = "https://events.pagerduty.com/v2/enqueue"
    }
    "datadog" = {
      url = "https://http-intake.logs.datadoghq.com/v1/input/${var.datadog_api_key}"
    }
  }

  # Worker monitoring with webhook routing
  worker_alerts = {
    error_alerts        = true
    error_webhook_names = ["slack-critical", "pagerduty"]
    cpu_alerts          = true
    cpu_threshold       = 90
    cpu_webhook_names   = ["slack-critical"]
    usage_alerts        = true
    usage_threshold     = 85
    usage_webhook_names = ["slack-critical"]
    script_name_filter  = ["api-gateway", "auth-service"]
  }

  # HTTP monitoring
  http_alerts = {
    enabled           = true
    zone_ids          = [module.zone.zone_id]
    hostnames         = ["api.example.com", "app.example.com"]
    error_threshold   = 50
    latency_threshold = 1500
    webhook_names     = ["slack-critical", "datadog"]
  }

  # DDoS alerts
  ddos_alerts = {
    enabled       = true
    zone_ids      = [module.zone.zone_id]
    webhook_names = ["pagerduty", "slack-critical"]
  }

  # WAF alerts
  waf_alerts = {
    enabled       = true
    zone_ids      = [module.zone.zone_id]
    actions       = ["block", "challenge"]
    threshold     = 100
    webhook_names = ["slack-critical"]
  }

  # SSL certificate alerts
  ssl_alerts = {
    enabled            = true
    zone_ids           = [module.zone.zone_id]
    days_before_expiry = 30
    webhook_names      = ["slack-critical"]
  }

  # Rate limit alerts
  rate_limit_alerts = {
    enabled       = true
    zone_ids      = [module.zone.zone_id]
    threshold     = 1000
    webhook_names = ["slack-critical", "datadog"]
  }

  # Origin health alerts
  origin_alerts = {
    enabled              = true
    zone_ids             = [module.zone.zone_id]
    health_status_filter = ["unhealthy", "degraded"]
    webhook_names        = ["pagerduty", "slack-critical"]
  }

  # Custom alerts
  custom_alerts = {
    "high-404-rate" = {
      description   = "Alert on high 404 error rate"
      alert_type    = "http_alert"
      enabled       = true
      send_email    = true
      webhook_names = ["slack-critical"]
      filters = {
        zones = [module.zone.zone_id]
        status_code = 404
        threshold = 100
      }
    }

    "cache-hit-rate-low" = {
      description   = "Alert when cache hit rate is low"
      alert_type    = "analytics_alert"
      enabled       = true
      webhook_names = ["datadog"]
      filters = {
        zones = [module.zone.zone_id]
        metric = "cache_hit_ratio"
        operator = "less_than"
        threshold = 0.8
      }
    }
  }

  # Logpush for monitoring
  logpush_jobs = {
    "worker-traces" = {
      dataset = "workers_trace_events"
      destination = "s3://my-bucket/cloudflare-logs/workers?region=us-east-1"
      filter = "ScriptName IN ('api-gateway', 'auth-service')"
    }

    "http-requests" = {
      dataset = "http_requests"
      destination = "datadog://http-intake.logs.datadoghq.com/v1/input/${var.datadog_api_key}?ddsource=cloudflare"
      filter = "ClientRequestHost IN ('api.example.com')"
    }
  }

  # Enable monitoring dashboard
  enable_monitoring_dashboard   = true
  monitoring_dashboard_hostname = "monitoring.example.com/*"

  # Notification channels
  notification_channels = {
    slack = {
      enabled     = true
      webhook_url = var.slack_webhook_url
      channel     = "#cloudflare-alerts"
      username    = "CF Monitor"
    }

    pagerduty = {
      enabled         = true
      integration_key = var.pagerduty_integration_key
      severity_mapping = {
        critical = "critical"
        high     = "error"
        medium   = "warning"
        low      = "info"
      }
    }

    discord = {
      enabled     = true
      webhook_url = var.discord_webhook_url
    }
  }

  # Alert severity thresholds
  severity_thresholds = {
    critical = {
      error_rate_percent   = 50
      response_time_ms     = 5000
      cpu_usage_percent    = 95
      worker_usage_percent = 95
    }
    high = {
      error_rate_percent   = 25
      response_time_ms     = 3000
      cpu_usage_percent    = 85
      worker_usage_percent = 85
    }
  }

  # Maintenance windows
  maintenance_windows = [
    {
      name       = "Weekly Maintenance"
      start_time = "2024-01-01T02:00:00Z"
      end_time   = "2024-01-01T04:00:00Z"
      recurring  = "weekly"
      timezone   = "UTC"
    }
  ]
}
```

### Monitoring Dashboard

The monitoring dashboard provides real-time visibility into your Cloudflare
resources:

```hcl
enable_monitoring_dashboard   = true
monitoring_dashboard_hostname = "monitoring.example.com/*"
```

Access the dashboard at:

- **Main Dashboard**: `https://monitoring.example.com/`
- **Health Check API**: `https://monitoring.example.com/health`
- **Prometheus Metrics**: `https://monitoring.example.com/metrics`

### Integration Examples

#### Slack Integration

```hcl
custom_webhooks = {
  "slack-alerts" = {
    url = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
  }
}

# Route specific alerts to Slack
worker_alerts = {
  error_alerts        = true
  error_webhook_names = ["slack-alerts"]
}
```

#### PagerDuty Integration

```hcl
custom_webhooks = {
  "pagerduty" = {
    url = "https://events.pagerduty.com/v2/enqueue"
  }
}

# Critical alerts to PagerDuty
ddos_alerts = {
  enabled       = true
  webhook_names = ["pagerduty"]
}

origin_alerts = {
  enabled       = true
  webhook_names = ["pagerduty"]
}
```

#### Datadog Integration

```hcl
# Logpush to Datadog
logpush_jobs = {
  "all-logs" = {
    dataset = "http_requests"
    destination = "datadog://http-intake.logs.datadoghq.com/v1/input/${var.datadog_api_key}?ddsource=cloudflare&service=web"
  }
}

# Webhook for alerts
custom_webhooks = {
  "datadog-events" = {
    url = "https://api.datadoghq.com/api/v1/events?api_key=${var.datadog_api_key}"
  }
}
```

## Alert Types

### Worker Alerts

- **Error Alerts**: Triggered when worker errors exceed threshold
- **CPU Alerts**: Triggered when worker CPU usage exceeds threshold
- **Usage Alerts**: Triggered when approaching worker invocation limits

### HTTP Alerts

- **Error Rate**: Triggered when HTTP error rate exceeds threshold
- **Latency**: Triggered when response time exceeds threshold

### Security Alerts

- **DDoS**: Triggered during DDoS attacks
- **WAF**: Triggered by WAF rule matches
- **Rate Limit**: Triggered when rate limits are hit

### Infrastructure Alerts

- **SSL**: Triggered before certificate expiry
- **Origin Health**: Triggered when origin servers are unhealthy

## Best Practices

1. **Alert Fatigue**: Set appropriate thresholds to avoid alert fatigue
2. **Severity Levels**: Use severity thresholds to prioritize alerts
3. **Webhook Security**: Always use secrets for webhook authentication
4. **Maintenance Windows**: Configure maintenance windows to suppress alerts
5. **Log Retention**: Use logpush for long-term analysis
6. **Dashboard Access**: Secure dashboard with Cloudflare Access

## Requirements

- Terraform >= 1.5.0
- Cloudflare provider ~> 5.0
- Appropriate Cloudflare plan for notification features
- External services (Slack, PagerDuty, etc.) for integrations

## Outputs

| Name                     | Description                               |
| ------------------------ | ----------------------------------------- |
| email_webhook_id         | Email webhook integration ID              |
| custom_webhook_ids       | Custom webhook integration IDs            |
| worker_alerts            | Worker alert policy IDs                   |
| monitoring_dashboard_url | Dashboard URL                             |
| monitoring_summary       | Complete monitoring configuration summary |

## Notes

- Some alert types require specific Cloudflare plans
- Notification policies are limited based on plan type
- Logpush requires Business or Enterprise plan
- Dashboard worker counts against worker limits
