# Cloudflare AI Module - Simplified (AI Gateway and Vectorize not available in Terraform provider)

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# AI-Powered Workers (using standard workers_script resource)
resource "cloudflare_workers_script" "ai" {
  for_each = var.ai_workers

  account_id         = var.account_id
  script_name        = each.value.script_name
  content            = each.value.script_content != null ? each.value.script_content : file(each.value.script_path)
  compatibility_date = each.value.compatibility_date

  # Environment variables
  dynamic "plain_text_binding" {
    for_each = each.value.environment_variables
    content {
      name = plain_text_binding.key
      text = plain_text_binding.value
    }
  }

  # Secrets
  dynamic "secret_text_binding" {
    for_each = each.value.secrets
    content {
      name = secret_text_binding.key
      text = secret_text_binding.value
    }
  }

  # KV namespace bindings
  dynamic "kv_namespace_binding" {
    for_each = toset(each.value.kv_namespaces)
    content {
      name         = kv_namespace_binding.value
      namespace_id = kv_namespace_binding.value
    }
  }

  # R2 bucket bindings
  dynamic "r2_bucket_binding" {
    for_each = toset(each.value.r2_buckets)
    content {
      name        = r2_bucket_binding.value
      bucket_name = r2_bucket_binding.value
    }
  }
}

# Worker Routes for AI Workers
resource "cloudflare_workers_route" "ai" {
  for_each = {
    for item in flatten([
      for worker_key, worker in var.ai_workers : [
        for idx, route in worker.routes : {
          key   = "${worker_key}-${idx}"
          route = route
          script_name = worker.script_name
        }
      ]
    ]) : item.key => item
  }

  zone_id     = var.zone_id
  pattern     = each.value.route
  script_name = each.value.script_name
}

# KV Namespaces for AI caching
resource "cloudflare_workers_kv_namespace" "ai_cache" {
  for_each = length(var.ai_workers) > 0 ? {
    "prompts"    = "AI Prompt Cache"
    "responses"  = "AI Response Cache"
    "embeddings" = "AI Embeddings Cache"
  } : {}

  account_id = var.account_id
  title      = each.value
}

# AI Analytics Dataset (using standard logpush)
resource "cloudflare_logpush_job" "ai_analytics" {
  count = var.enable_ai_analytics && var.ai_analytics_config.logpush_destination != null ? 1 : 0

  account_id       = var.account_id
  name             = "ai-analytics-${var.zone_id}"
  dataset          = var.ai_analytics_config.logpush_dataset
  destination_conf = var.ai_analytics_config.logpush_destination
  enabled          = true

  # Fields to include
  output_options {
    field_names = [
      "Timestamp",
      "Provider",
      "Model",
      "RequestID",
      "TokensUsed",
      "Cost",
      "Latency",
      "CacheHit",
      "StatusCode",
      "ErrorMessage"
    ]
    output_type      = "ndjson"
    timestamp_format = "unixnano"
  }

  filter = var.ai_analytics_config.track_costs ? "" : "Cost > 0"
}

# Cost monitoring rules
resource "cloudflare_notification_policy" "ai_cost_alerts" {
  count = var.ai_cost_controls.monthly_budget != null || var.ai_cost_controls.daily_budget != null ? 1 : 0

  account_id  = var.account_id
  name        = "AI Cost Alerts"
  description = "Alerts for AI usage costs"
  enabled     = true
  alert_type  = "billing_usage_alert"

  filters {
    services = ["workers_ai"]

    # Budget thresholds
    usage_trigger {
      operator  = "greater_than"
      value     = var.ai_cost_controls.monthly_budget * (var.ai_cost_controls.alert_threshold_pct / 100)
      time_unit = "month"
    }
  }
}

# Compliance configuration (stored as data for reference)
locals {
  compliance_config = var.ai_compliance.content_filtering != null || var.ai_compliance.audit_logging != null ? {
    data_residency = var.ai_compliance.data_residency
    pii_detection  = var.ai_compliance.pii_detection
    pii_redaction  = var.ai_compliance.pii_redaction

    content_filtering = var.ai_compliance.content_filtering
    audit_logging     = var.ai_compliance.audit_logging

    # Store configuration for workers to reference
    config_json = jsonencode({
      compliance = var.ai_compliance
      cost_controls = var.ai_cost_controls
    })
  } : null
}

# Store compliance config in KV for workers
resource "cloudflare_workers_kv" "compliance_config" {
  count = local.compliance_config != null ? 1 : 0

  account_id   = var.account_id
  namespace_id = cloudflare_workers_kv_namespace.ai_cache["prompts"].id
  key_name     = "compliance-config"
  value        = local.compliance_config.config_json
}