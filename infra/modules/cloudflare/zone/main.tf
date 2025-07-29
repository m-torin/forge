# Cloudflare Zone Module

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# Create or import the zone
resource "cloudflare_zone" "this" {
  account_id = var.account_id
  zone       = var.domain
  plan       = var.plan
  type       = var.type
  jump_start = var.jump_start
  paused     = var.paused
}

# Apply zone settings
resource "cloudflare_zone_settings_override" "this" {
  zone_id = cloudflare_zone.this.id

  settings {
    always_online            = var.settings.always_online
    always_use_https         = var.settings.always_use_https
    automatic_https_rewrites = var.settings.automatic_https_rewrites
    brotli                   = var.settings.brotli
    browser_cache_ttl        = var.settings.browser_cache_ttl
    browser_check            = var.settings.browser_check
    cache_level              = var.settings.cache_level
    challenge_ttl            = var.settings.challenge_ttl
    ciphers                  = var.settings.ciphers
    cname_flattening         = var.settings.cname_flattening
    development_mode         = var.settings.development_mode
    early_hints              = var.settings.early_hints
    email_obfuscation        = var.settings.email_obfuscation
    filter_logs_to_cloudflare = var.settings.filter_logs_to_cloudflare
    h2_prioritization        = var.settings.h2_prioritization
    hotlink_protection       = var.settings.hotlink_protection
    http2                    = var.settings.http2
    http3                    = var.settings.http3
    image_resizing           = var.settings.image_resizing
    ip_geolocation           = var.settings.ip_geolocation
    ipv6                     = var.settings.ipv6
    max_upload               = var.settings.max_upload
    min_tls_version          = var.settings.min_tls_version
    mirage                   = var.settings.mirage
    opportunistic_encryption = var.settings.opportunistic_encryption
    opportunistic_onion      = var.settings.opportunistic_onion
    orange_to_orange         = var.settings.orange_to_orange
    origin_error_page_pass_thru = var.settings.origin_error_page_pass_thru
    origin_max_http_version  = var.settings.origin_max_http_version
    polish                   = var.settings.polish
    prefetch_preload         = var.settings.prefetch_preload
    privacy_pass             = var.settings.privacy_pass
    proxy_read_timeout       = var.settings.proxy_read_timeout
    pseudo_ipv4              = var.settings.pseudo_ipv4
    response_buffering       = var.settings.response_buffering
    rocket_loader            = var.settings.rocket_loader
    security_level           = var.settings.security_level
    server_side_exclude      = var.settings.server_side_exclude
    sort_query_string_for_cache = var.settings.sort_query_string_for_cache
    ssl                      = var.settings.ssl
    tls_1_2_only             = var.settings.tls_1_2_only
    tls_1_3                  = var.settings.tls_1_3
    tls_client_auth          = var.settings.tls_client_auth
    true_client_ip_header    = var.settings.true_client_ip_header
    universal_ssl            = var.settings.universal_ssl
    visitor_ip               = var.settings.visitor_ip
    waf                      = var.settings.waf
    webp                     = var.settings.webp
    websockets               = var.settings.websockets
    zero_rtt                 = var.settings.zero_rtt
  }
}

# Create DNS records
resource "cloudflare_record" "this" {
  for_each = var.dns_records

  zone_id  = cloudflare_zone.this.id
  name     = each.key
  type     = each.value.type
  content  = each.value.type == "MX" || each.value.type == "SRV" || each.value.type == "CAA" ? null : each.value.value
  value    = each.value.type == "MX" || each.value.type == "SRV" || each.value.type == "CAA" ? each.value.value : null
  ttl      = each.value.proxied ? 1 : each.value.ttl
  proxied  = each.value.type == "A" || each.value.type == "AAAA" || each.value.type == "CNAME" ? each.value.proxied : null
  priority = each.value.priority
  data     = each.value.data
}

# Create page rules
resource "cloudflare_page_rule" "this" {
  for_each = var.page_rules

  zone_id  = cloudflare_zone.this.id
  target   = each.value.target
  priority = each.value.priority
  status   = each.value.status

  actions {
    always_online               = lookup(each.value.actions, "always_online", null)
    always_use_https            = lookup(each.value.actions, "always_use_https", null)
    automatic_https_rewrites    = lookup(each.value.actions, "automatic_https_rewrites", null)
    browser_cache_ttl           = lookup(each.value.actions, "browser_cache_ttl", null)
    browser_check               = lookup(each.value.actions, "browser_check", null)
    bypass_cache_on_cookie      = lookup(each.value.actions, "bypass_cache_on_cookie", null)
    cache_by_device_type        = lookup(each.value.actions, "cache_by_device_type", null)
    cache_deception_armor       = lookup(each.value.actions, "cache_deception_armor", null)
    cache_level                 = lookup(each.value.actions, "cache_level", null)
    cache_key_fields {
      cookie {
        check_presence = lookup(each.value.actions, "cache_key_fields_cookie_check_presence", [])
        include        = lookup(each.value.actions, "cache_key_fields_cookie_include", [])
      }
      header {
        check_presence = lookup(each.value.actions, "cache_key_fields_header_check_presence", [])
        exclude        = lookup(each.value.actions, "cache_key_fields_header_exclude", [])
        include        = lookup(each.value.actions, "cache_key_fields_header_include", [])
      }
      host {
        resolved = lookup(each.value.actions, "cache_key_fields_host_resolved", true)
      }
      query_string {
        exclude = lookup(each.value.actions, "cache_key_fields_query_string_exclude", [])
        ignore  = lookup(each.value.actions, "cache_key_fields_query_string_ignore", false)
        include = lookup(each.value.actions, "cache_key_fields_query_string_include", [])
      }
      user {
        device_type = lookup(each.value.actions, "cache_key_fields_user_device_type", false)
        geo         = lookup(each.value.actions, "cache_key_fields_user_geo", false)
        lang        = lookup(each.value.actions, "cache_key_fields_user_lang", false)
      }
    }
    cache_on_cookie             = lookup(each.value.actions, "cache_on_cookie", null)
    cache_ttl_by_status         = lookup(each.value.actions, "cache_ttl_by_status", null)
    disable_apps                = lookup(each.value.actions, "disable_apps", null)
    disable_performance         = lookup(each.value.actions, "disable_performance", null)
    disable_railgun             = lookup(each.value.actions, "disable_railgun", null)
    disable_security            = lookup(each.value.actions, "disable_security", null)
    edge_cache_ttl              = lookup(each.value.actions, "edge_cache_ttl", null)
    email_obfuscation           = lookup(each.value.actions, "email_obfuscation", null)
    explicit_cache_control      = lookup(each.value.actions, "explicit_cache_control", null)
    forwarding_url {
      url         = lookup(each.value.actions, "forwarding_url", null) != null ? each.value.actions.forwarding_url.url : null
      status_code = lookup(each.value.actions, "forwarding_url", null) != null ? each.value.actions.forwarding_url.status_code : null
    }
    host_header_override        = lookup(each.value.actions, "host_header_override", null)
    ip_geolocation              = lookup(each.value.actions, "ip_geolocation", null)
    minify {
      css  = lookup(each.value.actions, "minify_css", null)
      html = lookup(each.value.actions, "minify_html", null)
      js   = lookup(each.value.actions, "minify_js", null)
    }
    mirage                      = lookup(each.value.actions, "mirage", null)
    opportunistic_encryption    = lookup(each.value.actions, "opportunistic_encryption", null)
    origin_error_page_pass_thru = lookup(each.value.actions, "origin_error_page_pass_thru", null)
    polish                      = lookup(each.value.actions, "polish", null)
    resolve_override            = lookup(each.value.actions, "resolve_override", null)
    respect_strong_etag         = lookup(each.value.actions, "respect_strong_etag", null)
    response_buffering          = lookup(each.value.actions, "response_buffering", null)
    rocket_loader               = lookup(each.value.actions, "rocket_loader", null)
    security_level              = lookup(each.value.actions, "security_level", null)
    server_side_exclude         = lookup(each.value.actions, "server_side_exclude", null)
    sort_query_string_for_cache = lookup(each.value.actions, "sort_query_string_for_cache", null)
    ssl                         = lookup(each.value.actions, "ssl", null)
    true_client_ip_header       = lookup(each.value.actions, "true_client_ip_header", null)
    waf                         = lookup(each.value.actions, "waf", null)
  }
}

# Enable DNSSEC if requested
resource "cloudflare_zone_dnssec" "this" {
  count   = var.enable_dnssec ? 1 : 0
  zone_id = cloudflare_zone.this.id
}