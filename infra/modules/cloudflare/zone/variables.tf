# Zone Module Variables

variable "domain" {
  description = "The domain name for the Cloudflare zone"
  type        = string
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "plan" {
  description = "Cloudflare plan type for the zone"
  type        = string
  default     = "free"
  validation {
    condition     = contains(["free", "pro", "business", "enterprise"], var.plan)
    error_message = "Plan must be one of: free, pro, business, enterprise"
  }
}

variable "type" {
  description = "Zone type"
  type        = string
  default     = "full"
  validation {
    condition     = contains(["full", "partial", "secondary"], var.type)
    error_message = "Type must be one of: full, partial, secondary"
  }
}

variable "jump_start" {
  description = "Whether to scan for DNS records on creation"
  type        = bool
  default     = true
}

variable "paused" {
  description = "Whether this zone is paused"
  type        = bool
  default     = false
}

variable "dns_records" {
  description = "Map of DNS records to create"
  type = map(object({
    type    = string
    value   = string
    ttl     = optional(number, 1)
    proxied = optional(bool, false)
    priority = optional(number)
    data    = optional(map(string))
  }))
  default = {}
}

variable "page_rules" {
  description = "Map of page rules to create"
  type = map(object({
    target   = string
    priority = number
    actions  = map(any)
    status   = optional(string, "active")
  }))
  default = {}
}

variable "settings" {
  description = "Zone settings to apply"
  type = object({
    always_online            = optional(string)
    always_use_https         = optional(string)
    automatic_https_rewrites = optional(string)
    brotli                   = optional(string)
    browser_cache_ttl        = optional(number)
    browser_check            = optional(string)
    cache_level              = optional(string)
    challenge_ttl            = optional(number)
    ciphers                  = optional(list(string))
    cname_flattening         = optional(string)
    development_mode         = optional(string)
    early_hints              = optional(string)
    email_obfuscation        = optional(string)
    filter_logs_to_cloudflare = optional(string)
    h2_prioritization        = optional(string)
    hotlink_protection       = optional(string)
    http2                    = optional(string)
    http3                    = optional(string)
    image_resizing           = optional(string)
    ip_geolocation           = optional(string)
    ipv6                     = optional(string)
    max_upload               = optional(number)
    min_tls_version          = optional(string)
    mirage                   = optional(string)
    opportunistic_encryption = optional(string)
    opportunistic_onion      = optional(string)
    orange_to_orange         = optional(string)
    origin_error_page_pass_thru = optional(string)
    origin_max_http_version  = optional(string)
    polish                   = optional(string)
    prefetch_preload         = optional(string)
    privacy_pass             = optional(string)
    proxy_read_timeout       = optional(string)
    pseudo_ipv4              = optional(string)
    response_buffering       = optional(string)
    rocket_loader            = optional(string)
    security_level           = optional(string)
    server_side_exclude      = optional(string)
    sort_query_string_for_cache = optional(string)
    ssl                      = optional(string)
    tls_1_2_only             = optional(string)
    tls_1_3                  = optional(string)
    tls_client_auth          = optional(string)
    true_client_ip_header    = optional(string)
    universal_ssl            = optional(string)
    visitor_ip               = optional(string)
    waf                      = optional(string)
    webp                     = optional(string)
    websockets               = optional(string)
    zero_rtt                 = optional(string)
  })
  default = {}
}

variable "enable_dnssec" {
  description = "Enable DNSSEC for the zone"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}