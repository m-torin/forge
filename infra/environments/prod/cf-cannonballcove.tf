# module "zone" {
#   source                = "cloudposse/zone/cloudflare"
#   version               = "1.0.1"
#   zone                  = var.zone_id_cannonballcove
#   cloudflare_account_id = var.cloudflare_account_id
# }

# locals {
#   cannonballcove_records = [
#     # -------------------------
#     # CNAME Records
#     # -------------------------
#     {
#       name    = "default._domainkey"
#       type    = "CNAME"
#       value   = "default._domainkey.dkim.au.dnssmarthost.net"
#       ttl     = 1
#       proxied = false
#     },

#     # -------------------------
#     # TXT Records
#     # -------------------------
#     {
#       name    = "@"
#       type    = "TXT"
#       value   = "v=spf1 +a +mx include:cannonballcove.com ~all"
#       ttl     = 1
#       proxied = false
#     },

#     # -------------------------
#     # MX Records
#     # -------------------------
#     {
#       name     = "@"
#       type     = "MX"
#       value    = "mx30.antispam.mailprotection.engine.com"
#       ttl      = 1
#       priority = 30
#       proxied  = false
#     },
#     {
#       name     = "@"
#       type     = "MX"
#       value    = "mx10.antispam.mailprotection.engine.com"
#       ttl      = 1
#       priority = 10
#       proxied  = false
#     },

#     # -------------------------
#     # A Records
#     # -------------------------
#     {
#       name    = "mail"
#       type    = "A"
#       value   = "35.208.141.30"
#       ttl     = 1
#       proxied = false
#     },
#     {
#       name    = "autodiscover"
#       type    = "A"
#       value   = "35.208.141.30"
#       ttl     = 1
#       proxied = false
#     },
#     {
#       name    = "cpanel"
#       type    = "A"
#       value   = "35.208.141.30"
#       ttl     = 1
#       proxied = false
#     },
#     {
#       name    = "mail2"
#       type    = "A"
#       value   = "35.208.141.30"
#       ttl     = 1
#       proxied = false
#     },
#     {
#       name    = "ftp"
#       type    = "A"
#       value   = "35.208.141.30"
#       ttl     = 1
#       proxied = false
#     },
#     {
#       name    = "@"
#       type    = "A"
#       value   = "35.208.141.30"
#       ttl     = 1
#       proxied = false
#     },
#     {
#       name    = "www"
#       type    = "A"
#       value   = "35.208.141.30"
#       ttl     = 1
#       proxied = false
#     },

#     # -------------------------
#     # TXT Records
#     # -------------------------
#     {
#       name    = "_dmarc"
#       type    = "TXT"
#       value   = "v=DMARC1; p=none; aspf=r; adkim=r;"
#       ttl     = 1
#       proxied = false
#     }
#   ]
# }

# resource "cloudflare_record" "cannonballcove_dns_records" {
#   for_each = { for rec in local.cannonballcove_records : "${rec.name}-${rec.type}" => rec }
#   zone_id  = module.zone.zone_id
#   name     = each.value.name
#   type     = each.value.type
#   value    = each.value.value
#   ttl      = each.value.ttl
#   priority = lookup(each.value, "priority", null)
#   proxied  = each.value.proxied
# }

# resource "cloudflare_page_rule" "www_redirect_cannonballcove" {
#   zone_id  = var.zone_id_cannonballcove
#   target   = "www.${var.domain_cannonballcove}/*"
#   priority = 1

#   actions {
#     forwarding_url {
#       url         = "https://${var.domain_cannonballcove}/$1"
#       status_code = 301
#     }
#   }
# }

# // Use an existing R2 bucket
# data "cloudflare_r2_bucket" "cannonballcove" {
#   account_id  = var.cloudflare_account_id
#   bucket_name = "cannonballcove"
# }

# // Configure CORS for the existing bucket
# resource "cloudflare_r2_bucket_cors" "cannonballcove_cors" {
#   account_id  = data.cloudflare_r2_bucket.cannonballcove.account_id
#   bucket_name = data.cloudflare_r2_bucket.cannonballcove.bucket_name

#   rules = [
#     {
#       allowed = {
#         methods = ["GET"]
#         origins = [
#           "http://localhost:3000",
#           "https://${var.domain_cannonballcove}",
#           "https://${var.domain_forge}"
#         ]
#       }
#       id              = "Allow Specific Origins"
#       expose_headers  = []       // Add headers if needed
#       max_age_seconds = 3600
#     }
#   ]
# }

# // Define lifecycle rules for the bucket
# resource "cloudflare_r2_bucket_lifecycle" "cannonballcove_lifecycle" {
#   account_id  = data.cloudflare_r2_bucket.cannonballcove.account_id
#   bucket_name = data.cloudflare_r2_bucket.cannonballcove.bucket_name

#   rules = [
#     {
#       id         = "Drop failed uploads"
#       conditions = {
#         prefix = "" // Applies to all objects
#       }
#       enabled = true
#       abort_multipart_uploads_transition = {
#         condition = {
#           max_age = 259200 // 3 days in seconds (3 * 24 * 3600)
#           type    = "Age"
#         }
#       }
#     },
#     {
#       id         = "Move images to infrequent access"
#       conditions = {
#         prefix = "w/"  // Adjust if images are stored under a different prefix
#       }
#       enabled = true
#       storage_class_transitions = [
#         {
#           condition = {
#             max_age = 31536000 // 1 year in seconds (365 * 24 * 3600)
#             type    = "Age"
#           }
#           storage_class = "InfrequentAccess"
#         }
#       ]
#     }
#   ]
# }

# // Configure the custom domain for public access
# resource "cloudflare_r2_custom_domain" "cannonballcove_custom_domain" {
#   account_id  = data.cloudflare_r2_bucket.cannonballcove.account_id
#   bucket_name = data.cloudflare_r2_bucket.cannonballcove.bucket_name
#   domain      = "media.${var.domain_forge}"
#   enabled     = true
#   zone_id     = module.zone_forge.zone_id
#   min_tls     = "1.2"
# }

# // Disable public access via Cloudflare’s managed domain (r2.dev)
# resource "cloudflare_r2_managed_domain" "cannonballcove_managed_domain" {
#   account_id  = data.cloudflare_r2_bucket.cannonballcove.account_id
#   bucket_name = data.cloudflare_r2_bucket.cannonballcove.bucket_name
#   enabled     = false
# }
