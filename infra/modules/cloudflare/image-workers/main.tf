# Image Workers Module - Specific to the deployed Cloudflare Workers

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# KV Namespace for image metadata
resource "cloudflare_workers_kv_namespace" "image_metadata" {
  account_id = var.account_id
  title      = "image-metadata-${var.environment}"
}

# R2 Bucket for images
resource "cloudflare_r2_bucket" "images" {
  account_id = var.account_id
  name       = "images-${var.environment}"
  location   = var.r2_location
}

# Image Processor Worker
resource "cloudflare_workers_script" "image_processor" {
  account_id  = var.account_id
  script_name = "image-processor"
  content     = file("${path.module}/../../../services/cf-workers/image-processor/src/index.ts")
  compatibility_date = "2023-05-15"

  # KV namespace binding
  kv_namespace_binding {
    name         = "IMAGE_METADATA"
    namespace_id = cloudflare_workers_kv_namespace.image_metadata.id
  }

  # R2 bucket binding
  r2_bucket_binding {
    name        = "IMAGES"
    bucket_name = cloudflare_r2_bucket.images.name
  }

  # AI binding for image classification
  ai_binding {
    name = "AI"
  }

  # Secret for signing URLs
  secret_text_binding {
    name = "SIGNING_KEY"
    text = var.signing_key
  }
}

# Image Transformer Worker
resource "cloudflare_workers_script" "image_transformer" {
  account_id  = var.account_id
  script_name = "image-transformer"
  content     = file("${path.module}/../../../services/cf-workers/image-transformer/src/index.ts")
  compatibility_date = "2023-05-15"

  # KV namespace binding
  kv_namespace_binding {
    name         = "IMAGE_METADATA"
    namespace_id = cloudflare_workers_kv_namespace.image_metadata.id
  }

  # R2 bucket binding
  r2_bucket_binding {
    name        = "IMAGES"
    bucket_name = cloudflare_r2_bucket.images.name
  }

  # Secret for signing URLs
  secret_text_binding {
    name = "SIGNING_KEY"
    text = var.signing_key
  }
}

# Next.js Image Optimizer Worker
resource "cloudflare_workers_script" "nextjs_image_optimizer" {
  account_id  = var.account_id
  script_name = "nextjs-image-optimizer"
  content     = file("${path.module}/../../../services/cf-workers/nextjs-image-optimizer/src/index.ts")
  compatibility_date = "2023-05-15"

  # KV namespace binding
  kv_namespace_binding {
    name         = "IMAGE_METADATA"
    namespace_id = cloudflare_workers_kv_namespace.image_metadata.id
  }

  # R2 bucket binding
  r2_bucket_binding {
    name        = "IMAGES"
    bucket_name = cloudflare_r2_bucket.images.name
  }

  # Secret for signing URLs
  secret_text_binding {
    name = "SIGNING_KEY"
    text = var.signing_key
  }
}

# Worker Routes
resource "cloudflare_workers_route" "image_processor_routes" {
  for_each = toset([
    "images.${var.domain}/process",
    "images.${var.domain}/metadata/*"
  ])

  zone_id     = var.zone_id
  pattern     = each.value
  script_name = "image-processor"
}

resource "cloudflare_workers_route" "image_transformer_routes" {
  for_each = toset([
    "images.${var.domain}/cdn-cgi/image/*",
    "images.${var.domain}/images/*"
  ])

  zone_id     = var.zone_id
  pattern     = each.value
  script_name = "image-transformer"
}

resource "cloudflare_workers_route" "nextjs_image_optimizer_routes" {
  for_each = toset([
    "images.${var.domain}/api/_next/image"
  ])

  zone_id     = var.zone_id
  pattern     = each.value
  script_name = "nextjs-image-optimizer"
}
