# Media Module Variables

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

variable "domain" {
  description = "Primary domain"
  type        = string
}

# Cloudflare Images
variable "enable_images" {
  description = "Enable Cloudflare Images"
  type        = bool
  default     = false
}

variable "images_delivery_url" {
  description = "Custom delivery URL for images"
  type        = string
  default     = ""
}

variable "images_variants" {
  description = "Image variants configuration"
  type = map(object({
    width   = optional(number)
    height  = optional(number)
    fit     = optional(string, "scale-down")
    quality = optional(number, 85)
    format  = optional(string, "auto")
    blur    = optional(number)
    sharpen = optional(number)
    metadata = optional(string, "none")
  }))
  default = {
    "thumbnail" = {
      width   = 150
      height  = 150
      fit     = "cover"
      quality = 80
    }
    "small" = {
      width   = 400
      quality = 85
    }
    "medium" = {
      width   = 800
      quality = 85
    }
    "large" = {
      width   = 1200
      quality = 90
    }
    "original" = {
      quality = 95
    }
  }
}

variable "images_access" {
  description = "Images access control"
  type = object({
    require_signed_urls = optional(bool, false)
    allowed_origins     = optional(list(string), [])
  })
  default = {}
}

variable "images_upload_settings" {
  description = "Images upload settings"
  type = object({
    max_size_mb        = optional(number, 10)
    allowed_formats    = optional(list(string), ["jpeg", "jpg", "png", "gif", "webp"])
    preserve_exif      = optional(bool, false)
    metadata_retention = optional(bool, false)
  })
  default = {}
}

# R2 Storage
variable "enable_r2" {
  description = "Enable R2 storage"
  type        = bool
  default     = false
}

variable "r2_buckets" {
  description = "R2 bucket configurations"
  type = map(object({
    location        = optional(string, "auto")
    storage_class   = optional(string, "Standard")
    enable_public   = optional(bool, false)
    custom_domain   = optional(string)
    cors_rules = optional(list(object({
      allowed_methods = list(string)
      allowed_origins = list(string)
      allowed_headers = optional(list(string), ["*"])
      expose_headers  = optional(list(string), [])
      max_age_seconds = optional(number, 3600)
    })), [])
    lifecycle_rules = optional(list(object({
      id      = string
      enabled = optional(bool, true)
      prefix  = optional(string, "")
      expiration_days = optional(number)
      noncurrent_version_expiration_days = optional(number)
      abort_incomplete_multipart_upload_days = optional(number)
      transition_to_ia_days = optional(number)
    })), [])
    object_lock = optional(object({
      enabled            = bool
      retention_mode     = optional(string, "GOVERNANCE")
      retention_days     = optional(number)
    }))
  }))
  default = {}
}

variable "r2_access_keys" {
  description = "Generate R2 access keys for buckets"
  type = map(object({
    bucket_names = list(string)
    permissions  = optional(list(string), ["read", "write"])
    ip_whitelist = optional(list(string), [])
  }))
  default = {}
}

# Stream (Video)
variable "enable_stream" {
  description = "Enable Cloudflare Stream for video"
  type        = bool
  default     = false
}

variable "stream_settings" {
  description = "Stream configuration"
  type = object({
    default_profile         = optional(string, "720p")
    require_signed_urls     = optional(bool, false)
    allowed_origins         = optional(list(string), [])
    max_duration_seconds    = optional(number, 21600) # 6 hours
    max_upload_size_gb      = optional(number, 5)
    webhook_url             = optional(string)
    watermark_profile_id    = optional(string)
    default_creator         = optional(string)
    default_thumbnail_timestamp_pct = optional(number, 50)
  })
  default = {}
}

variable "stream_live_inputs" {
  description = "Stream live input configurations"
  type = map(object({
    recording = optional(object({
      mode                = optional(string, "off")
      require_signed_urls = optional(bool, false)
      allowed_origins     = optional(list(string), [])
      timeout_seconds     = optional(number, 90)
    }))
    default_creator = optional(string)
  }))
  default = {}
}

# Media Processing Workers
variable "media_workers" {
  description = "Media processing worker configurations"
  type = map(object({
    script_name     = string
    script_content  = optional(string)
    script_path     = optional(string)
    routes          = list(string)
    compatibility_date = optional(string)
    environment_variables = optional(map(string), {})
    secrets         = optional(map(string), {})
    kv_namespaces   = optional(list(string), [])
    r2_buckets      = optional(list(string), [])
    ai_bindings     = optional(list(string), [])
    d1_databases    = optional(list(string), [])
  }))
  default = {}
}

# Image Processing Configuration
variable "enable_image_processing" {
  description = "Enable image processing workers"
  type        = bool
  default     = false
}

variable "image_processing_config" {
  description = "Image processing configuration"
  type = object({
    enable_ai_classification = optional(bool, false)
    ai_model                = optional(string, "@cf/microsoft/resnet-50")
    enable_watermarking     = optional(bool, false)
    watermark_text          = optional(string, "© Example.com")
    watermark_position      = optional(string, "bottom-right")
    watermark_opacity       = optional(number, 0.7)
    enable_face_detection   = optional(bool, false)
    enable_object_removal   = optional(bool, false)
    enable_background_removal = optional(bool, false)
    enable_image_optimization = optional(bool, true)
    optimization_quality    = optional(number, 85)
    enable_format_conversion = optional(bool, true)
    supported_formats       = optional(list(string), ["jpeg", "png", "webp", "avif"])
    enable_smart_cropping   = optional(bool, false)
    enable_color_adjustment = optional(bool, false)
    enable_image_compression = optional(bool, true)
    compression_level       = optional(string, "balanced") # "low", "balanced", "high"
  })
  default = {}
}

# Standard Image Processing Workers
variable "enable_standard_image_workers" {
  description = "Enable standard image processing workers"
  type        = bool
  default     = false
}

variable "image_worker_routes" {
  description = "Routes for image processing workers"
  type = object({
    processor_route   = optional(string, "/process/*")
    transformer_route = optional(string, "/cdn-cgi/image/*")
    optimizer_route   = optional(string, "/api/_next/image*")
    ai_enhance_route  = optional(string, "/ai/enhance/*")
    thumbnail_route   = optional(string, "/thumbnails/*")
  })
  default = {}
}

# Image Worker KV Namespaces
variable "image_worker_kv_config" {
  description = "KV namespace configuration for image workers"
  type = object({
    enable_metadata_store = optional(bool, true)
    enable_cache_store    = optional(bool, true)
    enable_settings_store = optional(bool, false)
    enable_ai_results_store = optional(bool, false)
    metadata_ttl_seconds  = optional(number, 86400)
    cache_ttl_seconds     = optional(number, 3600)
    ai_results_ttl_seconds = optional(number, 604800) # 7 days
  })
  default = {}
}

# Image Processing Presets
variable "image_processing_presets" {
  description = "Predefined image processing presets"
  type = map(object({
    description     = string
    operations      = list(string)
    output_format   = optional(string, "auto")
    quality         = optional(number, 85)
    max_width       = optional(number)
    max_height      = optional(number)
    fit             = optional(string, "contain")
    background      = optional(string, "transparent")
    sharpen         = optional(number)
    blur            = optional(number)
    rotate          = optional(number)
    flip            = optional(bool, false)
    grayscale       = optional(bool, false)
    sepia           = optional(bool, false)
  }))
  default = {
    social_media = {
      description = "Optimized for social media sharing"
      operations  = ["resize", "optimize"]
      max_width   = 1200
      max_height  = 630
      quality     = 85
      fit         = "cover"
    }
    thumbnail = {
      description = "Generate thumbnails"
      operations  = ["resize", "crop", "optimize"]
      max_width   = 300
      max_height  = 300
      quality     = 80
      fit         = "cover"
    }
    mobile = {
      description = "Optimized for mobile devices"
      operations  = ["resize", "optimize", "compress"]
      max_width   = 768
      quality     = 75
      fit         = "contain"
    }
  }
}

# Logpush for Media
variable "enable_media_logpush" {
  description = "Enable logpush for media services"
  type        = bool
  default     = false
}

variable "media_logpush_configs" {
  description = "Logpush configurations for media"
  type = map(object({
    dataset           = string
    destination_conf  = string
    enabled           = optional(bool, true)
    filter            = optional(string)
    frequency         = optional(string, "high")
    kind              = optional(string, "instant-logs")
    max_upload_bytes  = optional(number, 5000000)
    max_upload_interval_seconds = optional(number, 30)
    max_upload_records = optional(number, 100000)
    output_options = optional(object({
      field_names      = optional(list(string))
      output_type      = optional(string, "ndjson")
      sample_rate      = optional(number, 1)
      timestamp_format = optional(string, "unixnano")
    }))
  }))
  default = {}
}

# Analytics
variable "enable_media_analytics" {
  description = "Enable analytics for media services"
  type        = bool
  default     = true
}

# Tags
variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}