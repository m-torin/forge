# Cloudflare Zone Module

This module manages Cloudflare zones, DNS records, and page rules.

## Features

- Zone creation and management
- DNS record management with support for all record types
- Page rule configuration
- Zone settings customization
- DNSSEC support
- Comprehensive outputs for integration with other modules

## Usage

```hcl
module "zone" {
  source = "./modules/cloudflare/zone"

  domain     = "example.com"
  account_id = var.cloudflare_account_id
  plan       = "pro"

  dns_records = {
    # A record for root domain
    "@" = {
      type    = "A"
      value   = "192.0.2.1"
      proxied = true
    }

    # CNAME for www
    "www" = {
      type    = "CNAME"
      value   = "example.com"
      proxied = true
    }

    # MX records for email
    "mx-10" = {
      type     = "MX"
      value    = "mail.example.com"
      priority = 10
    }

    # TXT record for SPF
    "spf" = {
      type  = "TXT"
      value = "v=spf1 include:_spf.example.com ~all"
    }
  }

  page_rules = {
    "www-redirect" = {
      target   = "www.example.com/*"
      priority = 1
      actions = {
        forwarding_url = {
          url         = "https://example.com/$1"
          status_code = 301
        }
      }
    }
  }

  settings = {
    ssl                      = "flexible"
    always_use_https         = "on"
    min_tls_version          = "1.2"
    automatic_https_rewrites = "on"
    brotli                   = "on"
  }

  enable_dnssec = true
}
```

## DNS Record Types

The module supports all Cloudflare DNS record types:

- A, AAAA
- CNAME
- MX
- TXT
- SRV
- CAA
- NS
- PTR
- CERT
- DNSKEY
- DS
- NAPTR
- SMIMEA
- SSHFP
- SVCB
- TLSA
- URI

## Page Rule Actions

Supported page rule actions include:

- URL forwarding
- Cache settings
- Security settings
- Performance optimizations
- Custom cache keys
- Header modifications

## Zone Settings

All Cloudflare zone settings can be configured through the `settings` variable.

## Requirements

- Terraform >= 1.5.0
- Cloudflare provider ~> 5.0

## Inputs

| Name          | Description                             | Type          | Default  | Required |
| ------------- | --------------------------------------- | ------------- | -------- | :------: |
| domain        | The domain name for the Cloudflare zone | `string`      | n/a      |   yes    |
| account_id    | Cloudflare account ID                   | `string`      | n/a      |   yes    |
| plan          | Cloudflare plan type                    | `string`      | `"free"` |    no    |
| type          | Zone type                               | `string`      | `"full"` |    no    |
| dns_records   | Map of DNS records to create            | `map(object)` | `{}`     |    no    |
| page_rules    | Map of page rules to create             | `map(object)` | `{}`     |    no    |
| settings      | Zone settings to apply                  | `object`      | `{}`     |    no    |
| enable_dnssec | Enable DNSSEC for the zone              | `bool`        | `false`  |    no    |

## Outputs

| Name          | Description                     |
| ------------- | ------------------------------- |
| zone_id       | The ID of the Cloudflare zone   |
| zone_name     | The name of the Cloudflare zone |
| zone_status   | Status of the Cloudflare zone   |
| name_servers  | Cloudflare name servers         |
| dns_records   | Map of created DNS records      |
| page_rules    | Map of created page rules       |
| dnssec_status | DNSSEC status for the zone      |
