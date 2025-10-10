# Image Workers Module Outputs

output "image_processor_script" {
  description = "Image processor worker script details"
  value = {
    id     = cloudflare_workers_script.image_processor.id
    name   = cloudflare_workers_script.image_processor.script_name
    routes = [for r in cloudflare_workers_route.image_processor_routes : r.pattern]
  }
}

output "image_transformer_script" {
  description = "Image transformer worker script details"
  value = {
    id     = cloudflare_workers_script.image_transformer.id
    name   = cloudflare_workers_script.image_transformer.script_name
    routes = [for r in cloudflare_workers_route.image_transformer_routes : r.pattern]
  }
}

output "nextjs_image_optimizer_script" {
  description = "Next.js image optimizer worker script details"
  value = {
    id     = cloudflare_workers_script.nextjs_image_optimizer.id
    name   = cloudflare_workers_script.nextjs_image_optimizer.script_name
    routes = [for r in cloudflare_workers_route.nextjs_image_optimizer_routes : r.pattern]
  }
}

output "image_metadata_kv" {
  description = "KV namespace for image metadata"
  value = {
    id    = cloudflare_workers_kv_namespace.image_metadata.id
    title = cloudflare_workers_kv_namespace.image_metadata.title
  }
}

output "images_r2_bucket" {
  description = "R2 bucket for images"
  value = {
    id   = cloudflare_r2_bucket.images.id
    name = cloudflare_r2_bucket.images.name
  }
}

output "image_service_urls" {
  description = "URLs for image services"
  value = {
    processor    = "https://images.${var.domain}/process"
    transformer  = "https://images.${var.domain}/cdn-cgi/image/"
    nextjs_api   = "https://images.${var.domain}/api/_next/image"
    direct_access = "https://images.${var.domain}/images/"
  }
}
