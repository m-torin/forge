# Cloudflare Monitoring Module

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

# Generate webhook secret
resource "random_password" "webhook_secret" {
  length  = 32
  special = false
}

# Email Webhook Integration
resource "cloudflare_notification_policy_webhooks" "email" {
  count = var.enable_email_notifications ? 1 : 0

  account_id = var.account_id
  name       = "${var.environment}-email-webhook"
  url        = "https://email-webhook.cfapi.net/v1/email?to=${urlencode(var.notification_email)}"
  secret     = random_password.webhook_secret.result
}

# Custom Webhooks
resource "cloudflare_notification_policy_webhooks" "custom" {
  for_each = var.custom_webhooks

  account_id = var.account_id
  name       = each.key
  url        = each.value.url
  secret     = coalesce(each.value.secret, random_password.webhook_secret.result)
}

# Worker Error Alerts
resource "cloudflare_notification_policy" "worker_errors" {
  count = var.worker_alerts.error_alerts ? 1 : 0

  account_id  = var.account_id
  name        = "${var.environment}-worker-error-alerts"
  description = "Alert on worker errors"
  enabled     = true
  alert_type  = "workers_error_alert"

  dynamic "email_integration" {
    for_each = var.enable_email_notifications ? [1] : []
    content {
      id = cloudflare_notification_policy_webhooks.email[0].id
    }
  }

  dynamic "webhooks_integration" {
    for_each = var.worker_alerts.error_webhook_names
    content {
      id = cloudflare_notification_policy_webhooks.custom[webhooks_integration.value].id
    }
  }

  filters {
    event_source = ["worker"]
    status       = ["error"]
    script_name  = var.worker_alerts.script_name_filter
  }
}

# Worker CPU Alerts
resource "cloudflare_notification_policy" "worker_cpu" {
  count = var.worker_alerts.cpu_alerts ? 1 : 0

  account_id  = var.account_id
  name        = "${var.environment}-worker-cpu-alerts"
  description = "Alert on high worker CPU usage"
  enabled     = true
  alert_type  = "workers_cpu_alert"

  dynamic "email_integration" {
    for_each = var.enable_email_notifications ? [1] : []
    content {
      id = cloudflare_notification_policy_webhooks.email[0].id
    }
  }

  dynamic "webhooks_integration" {
    for_each = var.worker_alerts.cpu_webhook_names
    content {
      id = cloudflare_notification_policy_webhooks.custom[webhooks_integration.value].id
    }
  }

  filters {
    threshold = var.worker_alerts.cpu_threshold
  }
}

# Worker Usage Alerts
resource "cloudflare_notification_policy" "worker_usage" {
  count = var.worker_alerts.usage_alerts ? 1 : 0

  account_id  = var.account_id
  name        = "${var.environment}-worker-usage-alerts"
  description = "Alert when approaching worker usage limits"
  enabled     = true
  alert_type  = "workers_usage_alert"

  dynamic "email_integration" {
    for_each = var.enable_email_notifications ? [1] : []
    content {
      id = cloudflare_notification_policy_webhooks.email[0].id
    }
  }

  dynamic "webhooks_integration" {
    for_each = var.worker_alerts.usage_webhook_names
    content {
      id = cloudflare_notification_policy_webhooks.custom[webhooks_integration.value].id
    }
  }

  filters {
    usage_threshold = var.worker_alerts.usage_threshold
  }
}

# HTTP Alerts (Latency, Errors)
resource "cloudflare_notification_policy" "http_alerts" {
  count = var.http_alerts.enabled ? 1 : 0

  account_id  = var.account_id
  name        = "${var.environment}-http-alerts"
  description = "Alert on HTTP issues"
  enabled     = true
  alert_type  = "http_alert"

  dynamic "email_integration" {
    for_each = var.enable_email_notifications ? [1] : []
    content {
      id = cloudflare_notification_policy_webhooks.email[0].id
    }
  }

  dynamic "webhooks_integration" {
    for_each = var.http_alerts.webhook_names
    content {
      id = cloudflare_notification_policy_webhooks.custom[webhooks_integration.value].id
    }
  }

  filters {
    zones            = var.http_alerts.zone_ids
    hosts            = var.http_alerts.hostnames
    error_threshold  = var.http_alerts.error_threshold
    latency_threshold = var.http_alerts.latency_threshold
  }
}

# DDoS Alerts
resource "cloudflare_notification_policy" "ddos_alerts" {
  count = var.ddos_alerts.enabled ? 1 : 0

  account_id  = var.account_id
  name        = "${var.environment}-ddos-alerts"
  description = "Alert on DDoS attacks"
  enabled     = true
  alert_type  = "ddos_attack_alert"

  dynamic "email_integration" {
    for_each = var.enable_email_notifications ? [1] : []
    content {
      id = cloudflare_notification_policy_webhooks.email[0].id
    }
  }

  dynamic "webhooks_integration" {
    for_each = var.ddos_alerts.webhook_names
    content {
      id = cloudflare_notification_policy_webhooks.custom[webhooks_integration.value].id
    }
  }

  filters {
    zones = var.ddos_alerts.zone_ids
  }
}

# WAF Alerts
resource "cloudflare_notification_policy" "waf_alerts" {
  count = var.waf_alerts.enabled ? 1 : 0

  account_id  = var.account_id
  name        = "${var.environment}-waf-alerts"
  description = "Alert on WAF events"
  enabled     = true
  alert_type  = "waf_alert"

  dynamic "email_integration" {
    for_each = var.enable_email_notifications ? [1] : []
    content {
      id = cloudflare_notification_policy_webhooks.email[0].id
    }
  }

  dynamic "webhooks_integration" {
    for_each = var.waf_alerts.webhook_names
    content {
      id = cloudflare_notification_policy_webhooks.custom[webhooks_integration.value].id
    }
  }

  filters {
    zones           = var.waf_alerts.zone_ids
    action          = var.waf_alerts.actions
    rule_id         = var.waf_alerts.rule_ids
    threshold       = var.waf_alerts.threshold
  }
}

# SSL Certificate Alerts
resource "cloudflare_notification_policy" "ssl_alerts" {
  count = var.ssl_alerts.enabled ? 1 : 0

  account_id  = var.account_id
  name        = "${var.environment}-ssl-alerts"
  description = "Alert on SSL certificate issues"
  enabled     = true
  alert_type  = "ssl_certificate_alert"

  dynamic "email_integration" {
    for_each = var.enable_email_notifications ? [1] : []
    content {
      id = cloudflare_notification_policy_webhooks.email[0].id
    }
  }

  dynamic "webhooks_integration" {
    for_each = var.ssl_alerts.webhook_names
    content {
      id = cloudflare_notification_policy_webhooks.custom[webhooks_integration.value].id
    }
  }

  filters {
    zones = var.ssl_alerts.zone_ids
    days_before_expiry = var.ssl_alerts.days_before_expiry
  }
}

# Rate Limit Alerts
resource "cloudflare_notification_policy" "rate_limit_alerts" {
  count = var.rate_limit_alerts.enabled ? 1 : 0

  account_id  = var.account_id
  name        = "${var.environment}-rate-limit-alerts"
  description = "Alert on rate limit triggers"
  enabled     = true
  alert_type  = "rate_limit_alert"

  dynamic "email_integration" {
    for_each = var.enable_email_notifications ? [1] : []
    content {
      id = cloudflare_notification_policy_webhooks.email[0].id
    }
  }

  dynamic "webhooks_integration" {
    for_each = var.rate_limit_alerts.webhook_names
    content {
      id = cloudflare_notification_policy_webhooks.custom[webhooks_integration.value].id
    }
  }

  filters {
    zones     = var.rate_limit_alerts.zone_ids
    threshold = var.rate_limit_alerts.threshold
  }
}

# Origin Health Alerts
resource "cloudflare_notification_policy" "origin_health_alerts" {
  count = var.origin_alerts.enabled ? 1 : 0

  account_id  = var.account_id
  name        = "${var.environment}-origin-health-alerts"
  description = "Alert on origin server issues"
  enabled     = true
  alert_type  = "origin_health_alert"

  dynamic "email_integration" {
    for_each = var.enable_email_notifications ? [1] : []
    content {
      id = cloudflare_notification_policy_webhooks.email[0].id
    }
  }

  dynamic "webhooks_integration" {
    for_each = var.origin_alerts.webhook_names
    content {
      id = cloudflare_notification_policy_webhooks.custom[webhooks_integration.value].id
    }
  }

  filters {
    zones          = var.origin_alerts.zone_ids
    health_status  = var.origin_alerts.health_status_filter
  }
}

# Custom Alert Rules
resource "cloudflare_notification_policy" "custom" {
  for_each = var.custom_alerts

  account_id  = var.account_id
  name        = each.key
  description = each.value.description
  enabled     = each.value.enabled
  alert_type  = each.value.alert_type

  dynamic "email_integration" {
    for_each = var.enable_email_notifications && each.value.send_email ? [1] : []
    content {
      id = cloudflare_notification_policy_webhooks.email[0].id
    }
  }

  dynamic "webhooks_integration" {
    for_each = each.value.webhook_names
    content {
      id = cloudflare_notification_policy_webhooks.custom[webhooks_integration.value].id
    }
  }

  filters = each.value.filters
}

# Logpush Jobs for Analysis
resource "cloudflare_logpush_job" "monitoring" {
  for_each = var.logpush_jobs

  account_id          = var.account_id
  dataset             = each.value.dataset
  destination_conf    = each.value.destination
  enabled             = each.value.enabled
  filter              = each.value.filter
  frequency           = each.value.frequency
  name                = each.key
  ownership_challenge = each.value.ownership_challenge
}

# Monitoring Dashboard Worker
resource "cloudflare_workers_script" "monitoring_dashboard" {
  count = var.enable_monitoring_dashboard ? 1 : 0

  account_id = var.account_id
  name       = "${var.environment}-monitoring-dashboard"

  content = <<-EOT
    export default {
      async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === '/health') {
          // Aggregate health status from various sources
          const health = {
            timestamp: new Date().toISOString(),
            environment: '${var.environment}',
            status: 'healthy',
            checks: []
          };

          // Check worker health
          try {
            const workerStats = await env.METRICS.get('worker-stats', { type: 'json' });
            health.checks.push({
              name: 'workers',
              status: workerStats?.errors < 10 ? 'healthy' : 'degraded',
              details: workerStats
            });
          } catch (e) {
            health.checks.push({
              name: 'workers',
              status: 'error',
              error: e.message
            });
          }

          return new Response(JSON.stringify(health, null, 2), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (url.pathname === '/metrics') {
          // Return Prometheus-style metrics
          const metrics = [
            '# HELP worker_requests_total Total number of worker requests',
            '# TYPE worker_requests_total counter',
            'worker_requests_total{environment="${var.environment}"} 12345',
            '',
            '# HELP worker_errors_total Total number of worker errors',
            '# TYPE worker_errors_total counter',
            'worker_errors_total{environment="${var.environment}"} 42',
            '',
            '# HELP response_time_milliseconds Response time in milliseconds',
            '# TYPE response_time_milliseconds histogram',
            'response_time_milliseconds_bucket{le="100"} 8000',
            'response_time_milliseconds_bucket{le="500"} 9500',
            'response_time_milliseconds_bucket{le="1000"} 9900',
            'response_time_milliseconds_bucket{le="+Inf"} 10000',
            'response_time_milliseconds_sum 1234567',
            'response_time_milliseconds_count 10000'
          ].join('
');

          return new Response(metrics, {
            headers: { 'Content-Type': 'text/plain; version=0.0.4' }
          });
        }

        // Dashboard UI
        if (url.pathname === '/') {
          const html = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Monitoring Dashboard - ${var.environment}</title>
              <style>
                body { font-family: sans-serif; margin: 20px; background: #f5f5f5; }
                .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .metric { display: inline-block; margin: 10px 20px 10px 0; }
                .metric-value { font-size: 2em; font-weight: bold; }
                .metric-label { color: #666; }
                .status-healthy { color: #4caf50; }
                .status-degraded { color: #ff9800; }
                .status-error { color: #f44336; }
                pre { background: #f0f0f0; padding: 10px; border-radius: 4px; overflow: auto; }
              </style>
            </head>
            <body>
              <h1>Monitoring Dashboard - ${var.environment}</h1>

              <div class="card">
                <h2>System Health</h2>
                <div id="health-status">Loading...</div>
              </div>

              <div class="card">
                <h2>Key Metrics</h2>
                <div class="metric">
                  <div class="metric-value" id="requests-total">-</div>
                  <div class="metric-label">Total Requests</div>
                </div>
                <div class="metric">
                  <div class="metric-value" id="errors-total">-</div>
                  <div class="metric-label">Total Errors</div>
                </div>
                <div class="metric">
                  <div class="metric-value" id="avg-response-time">-</div>
                  <div class="metric-label">Avg Response Time (ms)</div>
                </div>
              </div>

              <div class="card">
                <h2>Recent Alerts</h2>
                <div id="recent-alerts">Loading...</div>
              </div>

              <script>
                async function loadHealth() {
                  const response = await fetch('/health');
                  const health = await response.json();

                  const statusEl = document.getElementById('health-status');
                  statusEl.innerHTML = '<pre>' + JSON.stringify(health, null, 2) + '</pre>';
                }

                async function loadMetrics() {
                  const response = await fetch('/metrics');
                  const text = await response.text();

                  // Parse Prometheus metrics
                  const lines = text.split('\
');
                  const metrics = {};

                  lines.forEach(line => {
                    const match = line.match(/^(\\w+)({[^}]*})?\\s+([\\d.]+)$/);
                    if (match) {
                      metrics[match[1]] = parseFloat(match[3]);
                    }
                  });

                  document.getElementById('requests-total').textContent =
                    metrics.worker_requests_total?.toLocaleString() || '-';
                  document.getElementById('errors-total').textContent =
                    metrics.worker_errors_total?.toLocaleString() || '-';
                  document.getElementById('avg-response-time').textContent =
                    Math.round(metrics.response_time_milliseconds_sum / metrics.response_time_milliseconds_count) || '-';
                }

                // Load data on page load
                loadHealth();
                loadMetrics();

                // Refresh every 30 seconds
                setInterval(() => {
                  loadHealth();
                  loadMetrics();
                }, 30000);
              </script>
            </body>
            </html>
          `;

          return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
          });
        }

        return new Response('Not found', { status: 404 });
      }
    };
  EOT

  module = true

  # KV namespace for metrics storage
  dynamic "kv_namespace_binding" {
    for_each = var.enable_monitoring_dashboard ? [1] : []
    content {
      name         = "METRICS"
      namespace_id = cloudflare_workers_kv_namespace.metrics[0].id
    }
  }
}

# KV namespace for metrics
resource "cloudflare_workers_kv_namespace" "metrics" {
  count = var.enable_monitoring_dashboard ? 1 : 0

  account_id = var.account_id
  title      = "${var.environment}-monitoring-metrics"
}

# Route for monitoring dashboard
resource "cloudflare_worker_route" "monitoring_dashboard" {
  count = var.enable_monitoring_dashboard && var.zone_id != "" ? 1 : 0

  zone_id     = var.zone_id
  pattern     = var.monitoring_dashboard_hostname
  script_name = cloudflare_workers_script.monitoring_dashboard[0].name
}