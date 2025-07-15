# Zone Module Outputs

output "zone_id" {
  description = "The ID of the Cloudflare zone"
  value       = cloudflare_zone.this.id
}

output "zone_name" {
  description = "The name of the Cloudflare zone"
  value       = cloudflare_zone.this.zone
}

output "zone_status" {
  description = "Status of the Cloudflare zone"
  value       = cloudflare_zone.this.status
}

output "zone_type" {
  description = "Type of the Cloudflare zone"
  value       = cloudflare_zone.this.type
}

output "name_servers" {
  description = "Cloudflare name servers assigned to this zone"
  value       = cloudflare_zone.this.name_servers
}

output "verification_key" {
  description = "Verification key for the zone"
  value       = cloudflare_zone.this.verification_key
  sensitive   = true
}

output "dns_records" {
  description = "Map of created DNS records"
  value = {
    for k, v in cloudflare_record.this : k => {
      id       = v.id
      hostname = v.hostname
      type     = v.type
      value    = v.content != null ? v.content : v.value
      proxied  = v.proxied
      ttl      = v.ttl
    }
  }
}

output "page_rules" {
  description = "Map of created page rules"
  value = {
    for k, v in cloudflare_page_rule.this : k => {
      id       = v.id
      target   = v.target
      priority = v.priority
      status   = v.status
    }
  }
}

output "dnssec_status" {
  description = "DNSSEC status for the zone"
  value       = var.enable_dnssec ? cloudflare_zone_dnssec.this[0].status : "disabled"
}

output "dnssec_ds_record" {
  description = "DS record for DNSSEC (if enabled)"
  value       = var.enable_dnssec ? cloudflare_zone_dnssec.this[0].ds : null
  sensitive   = true
}