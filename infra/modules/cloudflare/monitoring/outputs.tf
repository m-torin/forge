# Monitoring Module Outputs

output "email_webhook_id" {
  description = "Email webhook integration ID"
  value       = var.enable_email_notifications ? cloudflare_notification_policy_webhooks.email[0].id : null
}

output "custom_webhook_ids" {
  description = "Custom webhook integration IDs"
  value = {
    for k, v in cloudflare_notification_policy_webhooks.custom : k => v.id
  }
}

output "worker_alerts" {
  description = "Worker alert policy IDs"
  value = {
    error_alert = var.worker_alerts.error_alerts ? cloudflare_notification_policy.worker_errors[0].id : null
    cpu_alert   = var.worker_alerts.cpu_alerts ? cloudflare_notification_policy.worker_cpu[0].id : null
    usage_alert = var.worker_alerts.usage_alerts ? cloudflare_notification_policy.worker_usage[0].id : null
  }
}

output "http_alert_id" {
  description = "HTTP alert policy ID"
  value       = var.http_alerts.enabled ? cloudflare_notification_policy.http_alerts[0].id : null
}

output "ddos_alert_id" {
  description = "DDoS alert policy ID"
  value       = var.ddos_alerts.enabled ? cloudflare_notification_policy.ddos_alerts[0].id : null
}

output "waf_alert_id" {
  description = "WAF alert policy ID"
  value       = var.waf_alerts.enabled ? cloudflare_notification_policy.waf_alerts[0].id : null
}

output "ssl_alert_id" {
  description = "SSL certificate alert policy ID"
  value       = var.ssl_alerts.enabled ? cloudflare_notification_policy.ssl_alerts[0].id : null
}

output "rate_limit_alert_id" {
  description = "Rate limit alert policy ID"
  value       = var.rate_limit_alerts.enabled ? cloudflare_notification_policy.rate_limit_alerts[0].id : null
}

output "origin_health_alert_id" {
  description = "Origin health alert policy ID"
  value       = var.origin_alerts.enabled ? cloudflare_notification_policy.origin_health_alerts[0].id : null
}

output "custom_alert_ids" {
  description = "Custom alert policy IDs"
  value = {
    for k, v in cloudflare_notification_policy.custom : k => v.id
  }
}

output "logpush_job_ids" {
  description = "Logpush job IDs"
  value = {
    for k, v in cloudflare_logpush_job.monitoring : k => v.id
  }
}

output "monitoring_dashboard_url" {
  description = "Monitoring dashboard URL"
  value       = var.enable_monitoring_dashboard && var.zone_id != "" ? "https://${replace(var.monitoring_dashboard_hostname, "/*", "")}" : null
}

output "monitoring_dashboard_worker" {
  description = "Monitoring dashboard worker details"
  value = var.enable_monitoring_dashboard ? {
    name         = cloudflare_workers_script.monitoring_dashboard[0].name
    health_endpoint = "${var.enable_monitoring_dashboard && var.zone_id != "" ? "https://${replace(var.monitoring_dashboard_hostname, "/*", "")}" : ""}/health"
    metrics_endpoint = "${var.enable_monitoring_dashboard && var.zone_id != "" ? "https://${replace(var.monitoring_dashboard_hostname, "/*", "")}" : ""}/metrics"
  } : null
}

output "metrics_kv_namespace_id" {
  description = "KV namespace ID for metrics storage"
  value       = var.enable_monitoring_dashboard ? cloudflare_workers_kv_namespace.metrics[0].id : null
}

output "webhook_secret" {
  description = "Generated webhook secret (sensitive)"
  value       = random_password.webhook_secret.result
  sensitive   = true
}

output "monitoring_summary" {
  description = "Summary of monitoring configuration"
  value = {
    environment = var.environment
    alerts = {
      worker_alerts_enabled     = var.worker_alerts.error_alerts || var.worker_alerts.cpu_alerts || var.worker_alerts.usage_alerts
      http_alerts_enabled       = var.http_alerts.enabled
      ddos_alerts_enabled       = var.ddos_alerts.enabled
      waf_alerts_enabled        = var.waf_alerts.enabled
      ssl_alerts_enabled        = var.ssl_alerts.enabled
      rate_limit_alerts_enabled = var.rate_limit_alerts.enabled
      origin_alerts_enabled     = var.origin_alerts.enabled
      custom_alerts_count       = length(var.custom_alerts)
    }
    notifications = {
      email_enabled         = var.enable_email_notifications
      email_address         = var.enable_email_notifications ? var.notification_email : null
      custom_webhooks_count = length(var.custom_webhooks)
    }
    dashboard = {
      enabled = var.enable_monitoring_dashboard
      url     = var.enable_monitoring_dashboard && var.zone_id != "" ? "https://${replace(var.monitoring_dashboard_hostname, "/*", "")}" : null
    }
    logpush = {
      jobs_count = length(var.logpush_jobs)
      datasets   = [for job in var.logpush_jobs : job.dataset]
    }
  }
}

output "alert_endpoints" {
  description = "Alert notification endpoints"
  value = {
    email = var.enable_email_notifications ? {
      type    = "email"
      address = var.notification_email
    } : null
    
    webhooks = {
      for k, v in var.custom_webhooks : k => {
        type = "webhook"
        url  = v.url
      }
    }
    
    slack = var.notification_channels.slack.enabled ? {
      type    = "slack"
      channel = var.notification_channels.slack.channel
    } : null
    
    pagerduty = var.notification_channels.pagerduty.enabled ? {
      type = "pagerduty"
    } : null
  }
}