
#
# Page Rules for SSL Off on .well-known paths
#
locals {
  page_rules = [
    {
      target   = "${var.domain_forge}/.well-known/*"
      priority = 1
      status   = "active"
      actions  = {
        ssl = "off"
      }
    },
    {
      target   = "*.${var.domain_forge}/.well-known/*"
      priority = 2
      status   = "active"
      actions  = {
        ssl = "off"
      }
    },
    {
      target   = "www.${var.domain_forge}/*"
      priority = 3
      status   = "active"
      actions  = {
        forwarding_url = {
          url         = "https://${var.domain_forge}/$1"
          status_code = 301
        }
      }
    }
  ]
}

resource "cloudflare_page_rule" "lfm_page_rules" {
  for_each = { for idx, rule in local.page_rules : idx => rule }
  zone_id  = var.zone_id_forge
  target   = each.value.target
  priority = each.value.priority
  status   = each.value.status
  actions  = each.value.actions
}

#
# DNSSEC (without multi_signer which is no longer supported)
#
resource "cloudflare_zone_dnssec" "dnssec" {
  zone_id = var.zone_id_forge
  status  = "active"
}