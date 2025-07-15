# Media Module Outputs

# Cloudflare Images Outputs
output "images_enabled" {
  description = "Whether Cloudflare Images is enabled"
  value       = var.enable_images
}

output "images_delivery_url" {
  description = "Cloudflare Images delivery URL"
  value       = var.enable_images ? (var.images_delivery_url != "" ? var.images_delivery_url : "https://imagedelivery.net/${var.account_id}") : null
}

output "images_variants" {
  description = "Configured image variants"
  value       = var.enable_images ? var.images_variants : {}
}

output "images_upload_endpoint" {
  description = "Cloudflare Images upload endpoint"
  value       = var.enable_images ? "https://api.cloudflare.com/client/v4/accounts/${var.account_id}/images/v1" : null
}

# R2 Storage Outputs
output "r2_enabled" {
  description = "Whether R2 storage is enabled"
  value       = var.enable_r2
}

output "r2_buckets" {
  description = "R2 bucket details"
  value = var.enable_r2 ? {
    for k, v in cloudflare_r2_bucket.this : k => {
      id       = v.id
      name     = v.name
      location = v.location
      endpoint = "https://${v.name}.${var.account_id}.r2.cloudflarestorage.com"
      custom_domain = try(cloudflare_r2_custom_domain.this[k].domain, null)
      public_url = try(
        cloudflare_r2_custom_domain.this[k].domain != null ? "https://${cloudflare_r2_custom_domain.this[k].domain}" : 
        cloudflare_r2_managed_domain.this[k].enabled ? "https://${v.id}.r2.dev" : null,
        null
      )
    }
  } : {}
}

output "r2_access_keys" {
  description = "R2 access key IDs"
  value = var.enable_r2 ? {
    for k, v in cloudflare_api_token.r2_access : k => {
      id     = v.id
      name   = v.name
      status = v.status
    }
  } : {}
}

output "r2_access_secrets" {
  description = "R2 access key secrets"
  value = var.enable_r2 ? {
    for k, v in cloudflare_api_token.r2_access : k => v.value
  } : {}
  sensitive = true
}

# Stream Outputs
output "stream_enabled" {
  description = "Whether Cloudflare Stream is enabled"
  value       = var.enable_stream
}

output "stream_live_inputs" {
  description = "Stream live input details"
  value = var.enable_stream ? {
    for k, v in cloudflare_stream_live_input.this : k => {
      id          = v.id
      rtmps_url   = v.rtmps[0].url
      rtmps_key   = v.rtmps[0].stream_key
      srt_url     = v.srt[0].url
      srt_id      = v.srt[0].streamId
      webrtc_url  = v.webRTC[0].url
      status      = v.status
    }
  } : {}
  sensitive = true
}

# Media Workers Outputs
output "media_workers" {
  description = "Media processing workers"
  value = {
    for k, v in cloudflare_worker_script.media_processor : k => {
      id     = v.id
      name   = v.name
      routes = [for r in cloudflare_worker_route.media_processor : r.pattern if strcontains(r.id, k)]
    }
  }
}

# Image Processing Outputs
output "image_processing_enabled" {
  description = "Whether image processing is enabled"
  value       = var.enable_image_processing
}

output "image_processing_workers" {
  description = "Image processing worker details"
  value = var.enable_standard_image_workers ? {
    processor = {
      enabled = contains(keys(local.standard_image_workers), "image_processor")
      route   = var.domain != "" ? "${var.domain}${var.image_worker_routes.processor_route}" : null
      features = {
        ai_classification = var.image_processing_config.enable_ai_classification
        watermarking     = var.image_processing_config.enable_watermarking
        optimization     = var.image_processing_config.enable_image_optimization
      }
    }
    transformer = {
      enabled = contains(keys(local.standard_image_workers), "image_transformer")
      route   = var.domain != "" ? "${var.domain}${var.image_worker_routes.transformer_route}" : null
      features = {
        smart_cropping   = var.image_processing_config.enable_smart_cropping
        color_adjustment = var.image_processing_config.enable_color_adjustment
        face_detection   = var.image_processing_config.enable_face_detection
      }
    }
    nextjs_optimizer = {
      enabled = contains(keys(local.standard_image_workers), "nextjs_optimizer")
      route   = var.domain != "" ? "${var.domain}${var.image_worker_routes.optimizer_route}" : null
    }
    ai_enhancer = {
      enabled = contains(keys(local.standard_image_workers), "ai_enhancer")
      route   = var.domain != "" ? "${var.domain}${var.image_worker_routes.ai_enhance_route}" : null
      features = {
        background_removal = var.image_processing_config.enable_background_removal
        object_removal    = var.image_processing_config.enable_object_removal
      }
    }
    thumbnail_generator = {
      enabled = contains(keys(local.standard_image_workers), "thumbnail_generator")
      route   = var.domain != "" ? "${var.domain}${var.image_worker_routes.thumbnail_route}" : null
    }
  } : {}
}

output "image_kv_namespaces" {
  description = "KV namespaces for image processing"
  value = {
    metadata = var.enable_image_processing && var.image_worker_kv_config.enable_metadata_store ? {
      id   = cloudflare_workers_kv_namespace.image_metadata[0].id
      name = cloudflare_workers_kv_namespace.image_metadata[0].title
    } : null
    cache = var.enable_image_processing && var.image_worker_kv_config.enable_cache_store ? {
      id   = cloudflare_workers_kv_namespace.image_cache[0].id
      name = cloudflare_workers_kv_namespace.image_cache[0].title
    } : null
    ai_results = var.enable_image_processing && var.image_worker_kv_config.enable_ai_results_store && var.image_processing_config.enable_ai_classification ? {
      id   = cloudflare_workers_kv_namespace.ai_results[0].id
      name = cloudflare_workers_kv_namespace.ai_results[0].title
    } : null
  }
}

output "image_processing_presets" {
  description = "Available image processing presets"
  value       = var.image_processing_presets
}

# Logpush Outputs
output "media_logpush_jobs" {
  description = "Media logpush job configurations"
  value = var.enable_media_logpush ? {
    for k, v in cloudflare_logpush_job.media : k => {
      id          = v.id
      dataset     = v.dataset
      enabled     = v.enabled
      destination = v.destination_conf
    }
  } : {}
}

# Summary Output
output "media_summary" {
  description = "Summary of media services configuration"
  value = {
    images = {
      enabled      = var.enable_images
      delivery_url = var.enable_images ? (var.images_delivery_url != "" ? var.images_delivery_url : "imagedelivery.net") : null
      variants_count = var.enable_images ? length(var.images_variants) : 0
      require_signed_urls = var.enable_images ? var.images_access.require_signed_urls : false
    }
    r2 = {
      enabled      = var.enable_r2
      buckets_count = var.enable_r2 ? length(var.r2_buckets) : 0
      access_keys_count = var.enable_r2 ? length(var.r2_access_keys) : 0
    }
    stream = {
      enabled           = var.enable_stream
      live_inputs_count = var.enable_stream ? length(var.stream_live_inputs) : 0
      max_upload_gb     = var.enable_stream ? var.stream_settings.max_upload_size_gb : 0
    }
    workers = {
      count = length(merge(var.media_workers, local.standard_image_workers))
      names = keys(merge(var.media_workers, local.standard_image_workers))
      image_processing = {
        enabled = var.enable_standard_image_workers
        features = var.enable_image_processing ? {
          ai_classification    = var.image_processing_config.enable_ai_classification
          watermarking        = var.image_processing_config.enable_watermarking
          background_removal  = var.image_processing_config.enable_background_removal
          object_removal      = var.image_processing_config.enable_object_removal
          face_detection      = var.image_processing_config.enable_face_detection
          smart_cropping      = var.image_processing_config.enable_smart_cropping
          color_adjustment    = var.image_processing_config.enable_color_adjustment
        } : {}
      }
    }
    monitoring = {
      logpush_enabled = var.enable_media_logpush
      logpush_jobs    = var.enable_media_logpush ? length(var.media_logpush_configs) : 0
      analytics       = var.enable_media_analytics
    }
  }
}

# Helper Outputs for Integration
output "images_api_token_template" {
  description = "Template for creating Images API token"
  value = var.enable_images ? {
    permissions = ["Cloudflare Images:Edit"]
    resources = {
      "com.cloudflare.api.account.${var.account_id}" = "*"
    }
  } : null
}

output "r2_s3_compatible_endpoints" {
  description = "S3-compatible endpoints for R2 buckets"
  value = var.enable_r2 ? {
    for k, v in cloudflare_r2_bucket.this : k => {
      endpoint = "https://${var.account_id}.r2.cloudflarestorage.com"
      bucket   = v.name
      region   = "auto"
    }
  } : {}
}