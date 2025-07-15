# Cloudflare Media Module

This module provides comprehensive media handling capabilities including
Cloudflare Images, R2 storage, Stream video, and advanced AI-powered image
processing workers.

## Features

- **Cloudflare Images**: Image transformation and optimization service
- **R2 Storage**: S3-compatible object storage
- **Stream**: Video upload, storage, and delivery
- **Media Workers**: Edge-based media processing
- **Advanced Image Processing**:
  - AI-powered image classification and enhancement
  - Automatic watermarking with customizable placement
  - Background removal and object removal
  - Smart cropping with face detection
  - Next.js Image component compatibility
  - Thumbnail generation with presets
  - Format conversion (JPEG, PNG, WebP, AVIF)
  - Real-time image optimization
- **Logpush**: Media service logging and analytics

## Usage

### Basic Configuration

```hcl
module "media" {
  source = "./modules/cloudflare/media"

  account_id = var.cloudflare_account_id
  zone_id    = module.zone.zone_id
  domain     = var.primary_domain

  # Enable Cloudflare Images
  enable_images = true
  images_delivery_url = "images.example.com"

  # Enable R2 Storage
  enable_r2 = true
  r2_buckets = {
    "media-assets" = {
      location      = "auto"
      enable_public = true
      custom_domain = "media.example.com"
    }
  }
}
```

### Advanced Configuration

```hcl
module "media" {
  source = "./modules/cloudflare/media"

  account_id = var.cloudflare_account_id
  zone_id    = module.zone.zone_id
  domain     = var.primary_domain

  # Cloudflare Images with custom variants
  enable_images = true
  images_delivery_url = "images.example.com"

  images_variants = {
    "thumbnail" = {
      width   = 200
      height  = 200
      fit     = "cover"
      quality = 80
    }
    "hero" = {
      width   = 1920
      height  = 1080
      fit     = "scale-down"
      quality = 90
    }
    "mobile" = {
      width   = 640
      quality = 85
      format  = "auto"
    }
  }

  images_access = {
    require_signed_urls = true
    allowed_origins     = ["https://example.com"]
  }

  images_upload_settings = {
    max_size_mb     = 20
    allowed_formats = ["jpeg", "png", "webp"]
    preserve_exif   = false
  }

  # R2 Storage with lifecycle rules
  enable_r2 = true
  r2_buckets = {
    "user-uploads" = {
      location      = "enam"
      enable_public = false

      cors_rules = [{
        allowed_methods = ["GET", "PUT", "POST"]
        allowed_origins = ["https://example.com", "https://app.example.com"]
        allowed_headers = ["*"]
        max_age_seconds = 3600
      }]

      lifecycle_rules = [{
        id      = "cleanup-temp"
        prefix  = "temp/"
        expiration_days = 7
      }, {
        id      = "archive-old"
        prefix  = "archive/"
        transition_to_ia_days = 90
      }, {
        id      = "abort-multipart"
        abort_incomplete_multipart_upload_days = 1
      }]
    }

    "public-assets" = {
      location      = "auto"
      enable_public = true
      custom_domain = "assets.example.com"

      lifecycle_rules = [{
        id      = "transition-old-assets"
        transition_to_ia_days = 180
      }]
    }
  }

  # R2 Access Keys
  r2_access_keys = {
    "app-backend" = {
      bucket_names = ["user-uploads", "public-assets"]
      permissions  = ["read", "write"]
      ip_whitelist = ["192.0.2.0/24"]
    }
    "cdn-read" = {
      bucket_names = ["public-assets"]
      permissions  = ["read"]
    }
  }

  # Cloudflare Stream
  enable_stream = true
  stream_settings = {
    default_profile     = "1080p"
    require_signed_urls = true
    allowed_origins     = ["https://example.com"]
    max_duration_seconds = 7200  # 2 hours
    max_upload_size_gb  = 10
    webhook_url         = "https://api.example.com/webhooks/stream"
  }

  stream_live_inputs = {
    "main-channel" = {
      recording = {
        mode                = "automatic"
        require_signed_urls = true
        timeout_seconds     = 30
      }
    }
  }

  # Enable advanced image processing
  enable_image_processing = true
  enable_standard_image_workers = true

  image_processing_config = {
    enable_ai_classification  = true
    ai_model                 = "@cf/microsoft/resnet-50"
    enable_watermarking      = true
    watermark_text           = "© 2024 Example.com"
    watermark_position       = "bottom-right"
    watermark_opacity        = 0.7
    enable_face_detection    = true
    enable_background_removal = true
    enable_object_removal    = true
    enable_smart_cropping    = true
    enable_color_adjustment  = true
    optimization_quality     = 85
    supported_formats        = ["jpeg", "png", "webp", "avif"]
  }

  # Configure image worker routes
  image_worker_routes = {
    processor_route   = "/process/*"
    transformer_route = "/cdn-cgi/image/*"
    optimizer_route   = "/api/_next/image*"
    ai_enhance_route  = "/ai/enhance/*"
    thumbnail_route   = "/thumbnails/*"
  }

  # Image processing presets
  image_processing_presets = {
    social_media = {
      description = "Optimized for social media sharing"
      operations  = ["resize", "optimize"]
      max_width   = 1200
      max_height  = 630
      quality     = 85
      fit         = "cover"
    }
    product_gallery = {
      description = "E-commerce product images"
      operations  = ["resize", "optimize", "sharpen"]
      max_width   = 2000
      quality     = 90
      background  = "white"
    }
  }

  # Custom media workers (in addition to standard workers)
  media_workers = {
    "video-transcoder" = {
      script_name = "video-transcoder"
      script_path = "${path.module}/workers/video-transcoder.js"
      routes      = ["example.com/videos/process/*"]
      secrets = {
        STREAM_API_KEY = var.stream_api_key
      }
    }
  }

  # Logpush for monitoring
  enable_media_logpush = true
  media_logpush_configs = {
    "images-logs" = {
      dataset          = "cloudflare_images"
      destination_conf = "s3://logs-bucket/cloudflare/images?region=us-east-1"
      filter           = "ClientRequestPath contains '/images/'"
    }
    "r2-logs" = {
      dataset          = "r2_logs"
      destination_conf = "s3://logs-bucket/cloudflare/r2?region=us-east-1"
      frequency        = "low"
    }
  }
}
```

## Image Variants

Predefined variants optimize images for different use cases:

| Variant   | Purpose           | Default Settings                |
| --------- | ----------------- | ------------------------------- |
| thumbnail | Small previews    | 150x150, cover fit, 80% quality |
| small     | Mobile/list views | 400px width, 85% quality        |
| medium    | Standard display  | 800px width, 85% quality        |
| large     | Desktop/hero      | 1200px width, 90% quality       |
| original  | Full quality      | 95% quality                     |

## R2 Storage Classes

- **Standard**: Frequently accessed data
- **Infrequent Access**: Data accessed less than once a month

## Stream Video Profiles

- **720p**: Standard definition
- **1080p**: Full HD
- **1440p**: 2K resolution
- **2160p**: 4K resolution

## Image Processing Examples

### Basic Image Optimization

```bash
# Optimize and compress an image
curl https://example.com/process/image.jpg?op=optimize &
quality=85 &
format=webp

# Add watermark to an image
curl https://example.com/process/image.jpg?op=watermark

# AI-powered image classification
curl https://example.com/process/image.jpg?op=classify
```

### Advanced Transformations

```bash
# Smart crop with face detection
curl https://example.com/cdn-cgi/image/w=400,h=400,fit=cover,smartcrop=1/image.jpg

# Apply preset transformations
curl https://example.com/cdn-cgi/image/preset=social_media/image.jpg

# Generate thumbnail
curl https://example.com/thumbnails/image.jpg?size=300x300 &
fit=cover
```

### AI Enhancement

```bash
# Remove background
curl https://example.com/ai/enhance/remove-background/image.jpg

# Upscale image
curl https://example.com/ai/enhance/upscale/image.jpg

# Style transfer
curl https://example.com/ai/enhance/style-transfer/image.jpg?style=artistic

# Generate alt text for accessibility
curl https://example.com/ai/enhance/generate-alt/image.jpg
```

### Next.js Image Optimization

```jsx
import Image from "next/image";

// Automatically optimized through the Next.js worker
<Image
  src="/images/hero.jpg"
  width={1200}
  height={600}
  alt="Hero image"
  priority
/>;
```

## Security Considerations

1. **Signed URLs**: Enable for sensitive content
2. **CORS**: Configure allowed origins carefully
3. **IP Restrictions**: Use for API access keys
4. **Upload Limits**: Set appropriate size limits
5. **Format Restrictions**: Allow only safe formats

## Cost Optimization

1. **Lifecycle Rules**: Automatically delete or archive old content
2. **Storage Classes**: Use Infrequent Access for archives
3. **Image Variants**: Create only needed variants
4. **Stream Profiles**: Limit to required resolutions
5. **Bandwidth**: Use caching and CDN features

## Monitoring

- Enable logpush for detailed analytics
- Monitor storage usage and costs
- Track image transformation metrics
- Review Stream analytics

## Requirements

- Terraform >= 1.5.0
- Cloudflare provider ~> 5.0
- Appropriate Cloudflare plan:
  - Images: Requires paid plan
  - R2: Pay-as-you-go
  - Stream: Requires Stream subscription
  - Workers: Included in all plans (usage-based pricing)
  - AI Workers: Requires Workers AI subscription

## Outputs

| Name                     | Description                                  |
| ------------------------ | -------------------------------------------- |
| images_delivery_url      | URL for image delivery                       |
| r2_buckets               | R2 bucket details and endpoints              |
| r2_access_secrets        | R2 access key secrets (sensitive)            |
| stream_live_inputs       | Stream live input configurations             |
| image_processing_enabled | Whether image processing is enabled          |
| image_processing_workers | Details of image processing workers          |
| image_kv_namespaces      | KV namespaces for image metadata and caching |
| image_processing_presets | Available processing presets                 |
| media_summary            | Complete media services summary              |
