# Cloudflare AI Module

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# AI Gateway
resource "cloudflare_ai_gateway" "this" {
  count = var.enable_ai_gateway ? 1 : 0

  account_id  = var.account_id
  name        = coalesce(var.ai_gateway_config.name, "ai-gateway-${var.zone_id}")
  description = var.ai_gateway_config.description

  # Caching configuration
  cache_config {
    enabled          = var.ai_gateway_config.enable_caching
    ttl              = var.ai_gateway_config.cache_ttl
    cache_by_headers = var.ai_gateway_config.cache_by_headers
    cache_by_cookies = var.ai_gateway_config.cache_by_cookies
  }

  # Rate limiting
  dynamic "rate_limiting" {
    for_each = var.ai_gateway_config.rate_limiting != null ? [var.ai_gateway_config.rate_limiting] : []
    content {
      requests_per_minute = rate_limiting.value.requests_per_minute
      requests_per_hour   = rate_limiting.value.requests_per_hour
      requests_per_day    = rate_limiting.value.requests_per_day
    }
  }

  # Logging
  logging {
    enabled  = var.ai_gateway_config.enable_logging
    sampling = var.ai_gateway_config.log_sampling
  }

  # Cost controls
  dynamic "cost_controls" {
    for_each = var.ai_gateway_config.max_cost_per_request != null || var.ai_gateway_config.max_cost_per_day != null ? [1] : []
    content {
      max_cost_per_request = var.ai_gateway_config.max_cost_per_request
      max_cost_per_day     = var.ai_gateway_config.max_cost_per_day
    }
  }

  # Request settings
  request_timeout_ms = var.ai_gateway_config.request_timeout_ms
  max_retries        = var.ai_gateway_config.max_retries

  # Provider configuration
  allowed_providers = var.ai_gateway_config.allowed_providers
  fallback_provider = var.ai_gateway_config.fallback_provider
}

# AI Gateway Routes
resource "cloudflare_ai_gateway_route" "this" {
  for_each = var.enable_ai_gateway ? var.ai_gateway_routes : {}

  account_id = var.account_id
  gateway_id = cloudflare_ai_gateway.this[0].id
  pattern    = each.value.pattern
  target     = each.value.target
  provider   = each.value.provider
  model      = each.value.model

  # Rate limit override
  dynamic "rate_limit_override" {
    for_each = each.value.rate_limit_override != null ? [each.value.rate_limit_override] : []
    content {
      requests_per_minute = rate_limit_override.value.requests_per_minute
    }
  }

  # Cache override
  dynamic "cache_override" {
    for_each = each.value.cache_override != null ? [each.value.cache_override] : []
    content {
      enabled = cache_override.value.enabled
      ttl     = cache_override.value.ttl
    }
  }

  # Request transformation
  dynamic "request_transform" {
    for_each = each.value.request_transform != null ? [each.value.request_transform] : []
    content {
      headers = request_transform.value.headers
      body    = request_transform.value.body
    }
  }

  # Response transformation
  dynamic "response_transform" {
    for_each = each.value.response_transform != null ? [each.value.response_transform] : []
    content {
      headers = response_transform.value.headers
      body    = response_transform.value.body
    }
  }
}

# Vectorize Indexes
resource "cloudflare_vectorize_index" "this" {
  for_each = var.enable_vectorize ? var.vectorize_indexes : {}

  account_id  = var.account_id
  name        = each.key
  dimensions  = each.value.dimensions
  metric      = each.value.metric
  description = each.value.description

  # Metadata schema
  dynamic "metadata_schema" {
    for_each = each.value.metadata_schema != null ? each.value.metadata_schema : {}
    content {
      name       = metadata_schema.key
      type       = metadata_schema.value.type
      indexed    = metadata_schema.value.indexed
      filterable = metadata_schema.value.filterable
    }
  }

  # Capacity
  max_vectors = each.value.max_vectors

  # Data source configuration
  dynamic "data_source" {
    for_each = each.value.data_source != null ? [each.value.data_source] : []
    content {
      type   = data_source.value.type
      source = data_source.value.source
      prefix = data_source.value.prefix
    }
  }
}

# AI-Powered Workers
resource "cloudflare_worker_script" "ai" {
  for_each = var.ai_workers

  account_id         = var.account_id
  name               = each.value.script_name
  content            = each.value.script_content != null ? each.value.script_content : file(each.value.script_path)
  compatibility_date = each.value.compatibility_date

  # AI binding
  dynamic "ai_binding" {
    for_each = each.value.ai_binding != null ? [each.value.ai_binding] : []
    content {
      name = ai_binding.value.name
    }
  }

  # Vectorize bindings
  dynamic "vectorize_binding" {
    for_each = each.value.vectorize_bindings != null ? each.value.vectorize_bindings : {}
    content {
      name       = vectorize_binding.key
      index_name = vectorize_binding.value.index_name
    }
  }

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
resource "cloudflare_worker_route" "ai" {
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
  for_each = var.enable_ai_gateway || length(var.ai_workers) > 0 ? {
    "prompts"    = "AI Prompt Cache"
    "responses"  = "AI Response Cache"
    "embeddings" = "AI Embeddings Cache"
  } : {}

  account_id = var.account_id
  title      = each.value
}

# AI Analytics Dataset
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
      "GatewayID",
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
    services = ["ai_gateway", "workers_ai", "vectorize"]
    
    # Budget thresholds
    usage_trigger {
      operator  = "greater_than"
      value     = var.ai_cost_controls.monthly_budget * (var.ai_cost_controls.alert_threshold_pct / 100)
      time_unit = "month"
    }
  }

  # Notification channels would be configured here
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
  key          = "compliance-config"
  value        = local.compliance_config.config_json
}