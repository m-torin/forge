# Cloudflare Media Module

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# Cloudflare Images
resource "cloudflare_images" "this" {
  count = var.enable_images ? 1 : 0

  account_id = var.account_id
  
  variants = {
    for name, config in var.images_variants : name => {
      width    = config.width
      height   = config.height
      fit      = config.fit
      quality  = config.quality
      format   = config.format
      blur     = config.blur
      sharpen  = config.sharpen
      metadata = config.metadata
    }
  }
  
  # Delivery URL configuration
  delivery_url = var.images_delivery_url != "" ? var.images_delivery_url : null
  
  # Access control
  require_signed_urls = var.images_access.require_signed_urls
  allowed_origins     = var.images_access.allowed_origins
}

# Images upload policy
resource "cloudflare_ruleset" "images_upload_policy" {
  count = var.enable_images ? 1 : 0

  account_id  = var.account_id
  name        = "Images Upload Policy"
  description = "Control image upload settings"
  kind        = "custom"
  phase       = "http_request_upload"

  rules {
    action = "block"
    expression = join(" or ", [
      for fmt in setsubtract(
        ["jpeg", "jpg", "png", "gif", "webp", "avif", "svg"],
        var.images_upload_settings.allowed_formats
      ) : "http.request.body.type eq \"image/${fmt}\""
    ])
    description = "Block disallowed image formats"
    enabled     = length(var.images_upload_settings.allowed_formats) > 0
  }

  rules {
    action      = "block"
    expression  = "http.request.body.size > ${var.images_upload_settings.max_size_mb * 1024 * 1024}"
    description = "Block uploads larger than ${var.images_upload_settings.max_size_mb}MB"
    enabled     = true
  }
}

# R2 Buckets
resource "cloudflare_r2_bucket" "this" {
  for_each = var.enable_r2 ? var.r2_buckets : {}

  account_id = var.account_id
  name       = each.key
  location   = each.value.location
}

# R2 CORS Configuration
resource "cloudflare_r2_bucket_cors" "this" {
  for_each = var.enable_r2 ? {
    for k, v in var.r2_buckets : k => v
    if length(v.cors_rules) > 0
  } : {}

  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.this[each.key].name

  dynamic "rules" {
    for_each = each.value.cors_rules
    content {
      allowed = {
        methods = rules.value.allowed_methods
        origins = rules.value.allowed_origins
        headers = rules.value.allowed_headers
      }
      expose_headers  = rules.value.expose_headers
      max_age_seconds = rules.value.max_age_seconds
    }
  }
}

# R2 Lifecycle Rules
resource "cloudflare_r2_bucket_lifecycle" "this" {
  for_each = var.enable_r2 ? {
    for k, v in var.r2_buckets : k => v
    if length(v.lifecycle_rules) > 0
  } : {}

  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.this[each.key].name

  dynamic "rules" {
    for_each = each.value.lifecycle_rules
    content {
      id      = rules.value.id
      enabled = rules.value.enabled
      
      conditions {
        prefix = rules.value.prefix
      }
      
      dynamic "expiration" {
        for_each = rules.value.expiration_days != null ? [1] : []
        content {
          condition = {
            max_age = rules.value.expiration_days * 86400
            type    = "Age"
          }
        }
      }
      
      dynamic "noncurrent_version_expiration" {
        for_each = rules.value.noncurrent_version_expiration_days != null ? [1] : []
        content {
          condition = {
            max_age = rules.value.noncurrent_version_expiration_days * 86400
            type    = "Age"
          }
        }
      }
      
      dynamic "abort_multipart_uploads_transition" {
        for_each = rules.value.abort_incomplete_multipart_upload_days != null ? [1] : []
        content {
          condition = {
            max_age = rules.value.abort_incomplete_multipart_upload_days * 86400
            type    = "Age"
          }
        }
      }
      
      dynamic "storage_class_transitions" {
        for_each = rules.value.transition_to_ia_days != null ? [1] : []
        content {
          condition = {
            max_age = rules.value.transition_to_ia_days * 86400
            type    = "Age"
          }
          storage_class = "InfrequentAccess"
        }
      }
    }
  }
}

# R2 Custom Domains
resource "cloudflare_r2_custom_domain" "this" {
  for_each = var.enable_r2 ? {
    for k, v in var.r2_buckets : k => v
    if v.custom_domain != null && v.enable_public
  } : {}

  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.this[each.key].name
  domain      = each.value.custom_domain
  zone_id     = var.zone_id
  enabled     = true
  min_tls     = "1.2"
}

# R2 Managed Domain (disable for buckets with custom domains)
resource "cloudflare_r2_managed_domain" "this" {
  for_each = var.enable_r2 ? var.r2_buckets : {}

  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.this[each.key].name
  enabled     = each.value.custom_domain == null && each.value.enable_public
}

# R2 Access Keys
resource "cloudflare_api_token" "r2_access" {
  for_each = var.enable_r2 ? var.r2_access_keys : {}

  name = "${each.key}-r2-access"
  
  dynamic "policy" {
    for_each = each.value.bucket_names
    content {
      permission_groups = [
        for perm in each.value.permissions : 
        data.cloudflare_api_token_permission_groups.all.r2["${perm}_bucket"]
      ]
      resources = {
        "com.cloudflare.edge.r2.bucket.${var.account_id}_default_${policy.value}" = "*"
      }
    }
  }
  
  condition {
    request_ip {
      in = each.value.ip_whitelist
    }
  }
}

# KV Namespaces for Image Workers
resource "cloudflare_workers_kv_namespace" "image_metadata" {
  count = var.enable_image_processing && var.image_worker_kv_config.enable_metadata_store ? 1 : 0

  account_id = var.account_id
  title      = "image-metadata"
}

resource "cloudflare_workers_kv_namespace" "image_cache" {
  count = var.enable_image_processing && var.image_worker_kv_config.enable_cache_store ? 1 : 0

  account_id = var.account_id
  title      = "image-cache"
}

resource "cloudflare_workers_kv_namespace" "ai_results" {
  count = var.enable_image_processing && var.image_worker_kv_config.enable_ai_results_store && var.image_processing_config.enable_ai_classification ? 1 : 0

  account_id = var.account_id
  title      = "ai-results"
}

# Standard Image Processing Workers
locals {
  standard_image_workers = var.enable_standard_image_workers ? {
    image_processor = {
      script_name = "image-processor"
      script_content = templatefile("${path.module}/workers/image-processor.js", {
        enable_ai_classification = var.image_processing_config.enable_ai_classification
        ai_model                = var.image_processing_config.ai_model
        enable_watermarking     = var.image_processing_config.enable_watermarking
        watermark_text          = var.image_processing_config.watermark_text
        watermark_position      = var.image_processing_config.watermark_position
        watermark_opacity       = var.image_processing_config.watermark_opacity
        optimization_quality    = var.image_processing_config.optimization_quality
        supported_formats       = jsonencode(var.image_processing_config.supported_formats)
        compression_level       = var.image_processing_config.compression_level
      })
      routes = ["${var.domain}${var.image_worker_routes.processor_route}"]
      environment_variables = {
        ENABLE_OPTIMIZATION = tostring(var.image_processing_config.enable_image_optimization)
        ENABLE_COMPRESSION  = tostring(var.image_processing_config.enable_image_compression)
      }
      kv_namespaces = compact([
        var.image_worker_kv_config.enable_metadata_store ? cloudflare_workers_kv_namespace.image_metadata[0].id : "",
        var.image_worker_kv_config.enable_ai_results_store && var.image_processing_config.enable_ai_classification ? cloudflare_workers_kv_namespace.ai_results[0].id : ""
      ])
      r2_buckets = var.enable_r2 ? [for k, v in cloudflare_r2_bucket.this : v.name] : []
      ai_bindings = var.image_processing_config.enable_ai_classification ? ["@cf/microsoft/resnet-50"] : []
    }

    image_transformer = {
      script_name = "image-transformer"
      script_content = templatefile("${path.module}/workers/image-transformer.js", {
        enable_smart_cropping   = var.image_processing_config.enable_smart_cropping
        enable_color_adjustment = var.image_processing_config.enable_color_adjustment
        enable_face_detection   = var.image_processing_config.enable_face_detection
        presets                = jsonencode(var.image_processing_presets)
      })
      routes = ["${var.domain}${var.image_worker_routes.transformer_route}"]
      environment_variables = {
        DEFAULT_QUALITY = tostring(var.image_processing_config.optimization_quality)
        CACHE_TTL      = tostring(var.image_worker_kv_config.cache_ttl_seconds)
      }
      kv_namespaces = compact([
        var.image_worker_kv_config.enable_cache_store ? cloudflare_workers_kv_namespace.image_cache[0].id : ""
      ])
      r2_buckets = var.enable_r2 ? [for k, v in cloudflare_r2_bucket.this : v.name] : []
    }

    nextjs_optimizer = {
      script_name = "nextjs-image-optimizer"
      script_content = templatefile("${path.module}/workers/nextjs-optimizer.js", {
        optimization_quality = var.image_processing_config.optimization_quality
        supported_formats   = jsonencode(var.image_processing_config.supported_formats)
      })
      routes = ["${var.domain}${var.image_worker_routes.optimizer_route}"]
      environment_variables = {
        NEXTJS_COMPATIBLE = "true"
      }
      kv_namespaces = compact([
        var.image_worker_kv_config.enable_cache_store ? cloudflare_workers_kv_namespace.image_cache[0].id : ""
      ])
      r2_buckets = var.enable_r2 ? [for k, v in cloudflare_r2_bucket.this : v.name] : []
    }

    ai_enhancer = {
      script_name = "ai-image-enhancer"
      script_content = templatefile("${path.module}/workers/ai-enhancer.js", {
        enable_background_removal = var.image_processing_config.enable_background_removal
        enable_object_removal    = var.image_processing_config.enable_object_removal
        ai_model                = var.image_processing_config.ai_model
      })
      routes = ["${var.domain}${var.image_worker_routes.ai_enhance_route}"]
      environment_variables = {
        AI_ENABLED = "true"
      }
      kv_namespaces = compact([
        var.image_worker_kv_config.enable_ai_results_store ? cloudflare_workers_kv_namespace.ai_results[0].id : ""
      ])
      r2_buckets = var.enable_r2 ? [for k, v in cloudflare_r2_bucket.this : v.name] : []
      ai_bindings = ["@cf/microsoft/resnet-50", "@cf/bytedance/stable-diffusion-xl-lightning"]
    }

    thumbnail_generator = {
      script_name = "thumbnail-generator"
      script_content = templatefile("${path.module}/workers/thumbnail-generator.js", {
        thumbnail_preset = jsonencode(var.image_processing_presets["thumbnail"])
      })
      routes = ["${var.domain}${var.image_worker_routes.thumbnail_route}"]
      environment_variables = {
        DEFAULT_SIZE = "300x300"
      }
      kv_namespaces = compact([
        var.image_worker_kv_config.enable_cache_store ? cloudflare_workers_kv_namespace.image_cache[0].id : ""
      ])
      r2_buckets = var.enable_r2 ? [for k, v in cloudflare_r2_bucket.this : v.name] : []
    }
  } : {}
}

# Media Processing Workers (Custom + Standard)
resource "cloudflare_worker_script" "media_processor" {
  for_each = merge(var.media_workers, local.standard_image_workers)

  account_id         = var.account_id
  name               = each.value.script_name
  content            = each.value.script_content != null ? each.value.script_content : file(each.value.script_path)
  compatibility_date = lookup(each.value, "compatibility_date", "2024-01-01")
  module             = true
  
  # Plain text bindings for environment variables
  dynamic "plain_text_binding" {
    for_each = lookup(each.value, "environment_variables", {})
    content {
      name = plain_text_binding.key
      text = plain_text_binding.value
    }
  }
  
  # Secret text bindings
  dynamic "secret_text_binding" {
    for_each = lookup(each.value, "secrets", {})
    content {
      name = secret_text_binding.key
      text = secret_text_binding.value
    }
  }
  
  # KV namespace bindings
  dynamic "kv_namespace_binding" {
    for_each = lookup(each.value, "kv_namespaces", [])
    content {
      name         = "KV_${upper(replace(kv_namespace_binding.value, "-", "_"))}"
      namespace_id = kv_namespace_binding.value
    }
  }
  
  # R2 bucket bindings
  dynamic "r2_bucket_binding" {
    for_each = lookup(each.value, "r2_buckets", [])
    content {
      name        = "R2_${upper(replace(r2_bucket_binding.value, "-", "_"))}"
      bucket_name = r2_bucket_binding.value
    }
  }
  
  # AI bindings
  dynamic "ai_binding" {
    for_each = lookup(each.value, "ai_bindings", [])
    content {
      name    = "AI"
      binding = ai_binding.value
    }
  }
  
  # D1 database bindings
  dynamic "d1_database_binding" {
    for_each = lookup(each.value, "d1_databases", [])
    content {
      name        = "D1_${upper(replace(d1_database_binding.value, "-", "_"))}"
      database_id = d1_database_binding.value
    }
  }
}

# Worker Routes
resource "cloudflare_worker_route" "media_processor" {
  for_each = {
    for item in flatten([
      for worker_key, worker in var.media_workers : [
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

# Stream Configuration
resource "cloudflare_stream" "settings" {
  count = var.enable_stream ? 1 : 0

  account_id = var.account_id
  
  default_profile         = var.stream_settings.default_profile
  require_signed_urls     = var.stream_settings.require_signed_urls
  allowed_origins         = var.stream_settings.allowed_origins
  max_duration_seconds    = var.stream_settings.max_duration_seconds
  max_upload_size_gb      = var.stream_settings.max_upload_size_gb * 1073741824 # Convert to bytes
  webhook_url             = var.stream_settings.webhook_url
  watermark_profile_id    = var.stream_settings.watermark_profile_id
  default_creator         = var.stream_settings.default_creator
}

# Stream Live Inputs
resource "cloudflare_stream_live_input" "this" {
  for_each = var.enable_stream ? var.stream_live_inputs : {}

  account_id = var.account_id
  name       = each.key
  
  recording {
    mode                = each.value.recording.mode
    require_signed_urls = each.value.recording.require_signed_urls
    allowed_origins     = each.value.recording.allowed_origins
    timeout_seconds     = each.value.recording.timeout_seconds
  }
  
  default_creator = each.value.default_creator
}

# Logpush Jobs for Media
resource "cloudflare_logpush_job" "media" {
  for_each = var.enable_media_logpush ? var.media_logpush_configs : {}

  account_id       = var.account_id
  dataset          = each.value.dataset
  destination_conf = each.value.destination_conf
  enabled          = each.value.enabled
  filter           = each.value.filter
  frequency        = each.value.frequency
  kind             = each.value.kind
  max_upload_bytes = each.value.max_upload_bytes
  max_upload_interval_seconds = each.value.max_upload_interval_seconds
  max_upload_records = each.value.max_upload_records
  name             = each.key
  
  dynamic "output_options" {
    for_each = each.value.output_options != null ? [each.value.output_options] : []
    content {
      field_names      = output_options.value.field_names
      output_type      = output_options.value.output_type
      sample_rate      = output_options.value.sample_rate
      timestamp_format = output_options.value.timestamp_format
    }
  }
}

# Data source for API token permissions
data "cloudflare_api_token_permission_groups" "all" {}

# DNS records for media services
resource "cloudflare_record" "images_cname" {
  count = var.enable_images && var.images_delivery_url != "" ? 1 : 0

  zone_id = var.zone_id
  name    = replace(var.images_delivery_url, ".${var.domain}", "")
  type    = "CNAME"
  content = "imagedelivery.net"
  proxied = true
}