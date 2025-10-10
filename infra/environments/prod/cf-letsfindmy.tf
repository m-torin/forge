#
# Zone setup
#
data "cloudflare_zone" "forge" {
  zone_id = var.zone_id_forge
}

#
# Zone settings - replacing zone_settings_override with individual settings
#
locals {
  zone_settings = {
    always_use_https = "on"
    min_tls_version  = "1.2"
    development_mode = "off"
    # bot_fight_mode   = "on"
    # block_ai_bots    = "on"
  }
}

resource "cloudflare_zone_setting" "lfm_settings" {
  for_each = local.zone_settings
  zone_id  = var.zone_id_forge
  setting_id     = each.key
  value    = each.value
}
