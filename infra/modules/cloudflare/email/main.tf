# Cloudflare Email Module

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# Enable Email Routing
resource "cloudflare_email_routing_settings" "this" {
  count = var.enable_email_routing ? 1 : 0

  zone_id = var.zone_id
  enabled = true
}

# Catch-all Address
resource "cloudflare_email_routing_catch_all" "this" {
  count = var.enable_email_routing && var.catch_all_email != "" ? 1 : 0

  zone_id = var.zone_id
  name    = "catch-all"
  enabled = true

  matcher {
    type = "all"
  }

  action {
    type  = "forward"
    value = [var.catch_all_email]
  }
}

# Email Routing Rules (Basic + Advanced)
resource "cloudflare_email_routing_rule" "this" {
  for_each = var.enable_email_routing ? var.email_routing_rules : {}

  zone_id  = var.zone_id
  name     = each.key
  enabled  = each.value.enabled
  priority = each.value.priority

  matcher {
    type  = each.value.matchers.type
    field = each.value.matchers.field
    value = each.value.matchers.value
  }

  dynamic "action" {
    for_each = each.value.type == "forward" ? [1] : []
    content {
      type  = "forward"
      value = each.value.forward_to
    }
  }

  dynamic "action" {
    for_each = each.value.type == "worker" ? [1] : []
    content {
      type  = "worker"
      value = [each.value.worker]
    }
  }

  dynamic "action" {
    for_each = each.value.type == "drop" ? [1] : []
    content {
      type = "drop"
    }
  }
}

# Template-based Email Routing Rules
locals {
  template_rules = flatten([
    for template_key, template in var.email_routing_templates : [
      for rule in template.rules : {
        key = "${template_key}-${rule.name}"
        rule = merge(rule, {
          enabled  = true
          priority = 500 # Medium priority for templates
        })
      }
    ]
  ])
}

resource "cloudflare_email_routing_rule" "templates" {
  for_each = var.enable_email_routing ? {
    for rule in local.template_rules : rule.key => rule.rule
  } : {}

  zone_id  = var.zone_id
  name     = each.key
  enabled  = each.value.enabled
  priority = each.value.priority

  matcher {
    type  = each.value.matchers.type
    field = each.value.matchers.field
    value = each.value.matchers.value
  }

  dynamic "action" {
    for_each = each.value.type == "forward" ? [1] : []
    content {
      type  = "forward"
      value = each.value.forward_to
    }
  }

  dynamic "action" {
    for_each = each.value.type == "worker" ? [1] : []
    content {
      type  = "worker"
      value = [each.value.worker]
    }
  }
}

# Email Security Rules Implementation
resource "cloudflare_email_routing_rule" "security" {
  for_each = var.enable_email_routing && var.enable_email_security ? var.email_security_rules : {}

  zone_id  = var.zone_id
  name     = "security-${each.key}"
  enabled  = each.value.enabled
  priority = each.value.priority != null ? each.value.priority : 100 # High priority for security

  matcher {
    type = "any" # Security rules typically use ANY matcher
    field = "from"
    value = ".*" # Match all for evaluation
  }

  dynamic "action" {
    for_each = each.value.action == "drop" ? [1] : []
    content {
      type = "drop"
    }
  }

  dynamic "action" {
    for_each = each.value.action == "quarantine" ? [1] : []
    content {
      type = "worker"
      value = ["email-quarantine-worker"]
    }
  }

  dynamic "action" {
    for_each = each.value.action == "tag" ? [1] : []
    content {
      type = "worker"
      value = ["email-security-tagger"]
    }
  }
}

# Email Distribution Lists
resource "cloudflare_email_routing_rule" "lists" {
  for_each = var.enable_email_routing ? var.email_lists : {}

  zone_id  = var.zone_id
  name     = "list-${each.key}"
  enabled  = true
  priority = 200 # Lists have medium-high priority

  matcher {
    type  = "literal"
    field = "to"
    value = "${each.key}@${var.domain}"
  }

  action {
    type  = "worker"
    value = ["email-list-processor"]
  }
}

# KV Namespaces for Email Workers
resource "cloudflare_workers_kv_namespace" "email_data" {
  count = var.enable_email_workers ? 1 : 0

  account_id = var.account_id
  title      = "email-data-${var.zone_id}"
}

resource "cloudflare_workers_kv_namespace" "email_quarantine" {
  count = var.enable_email_workers && var.enable_email_security ? 1 : 0

  account_id = var.account_id
  title      = "email-quarantine-${var.zone_id}"
}

resource "cloudflare_workers_kv_namespace" "email_lists_data" {
  count = length(var.email_lists) > 0 ? 1 : 0

  account_id = var.account_id
  title      = "email-lists-${var.zone_id}"
}

# Store email list configurations in KV
resource "cloudflare_workers_kv" "list_configs" {
  for_each = length(var.email_lists) > 0 ? var.email_lists : {}

  account_id   = var.account_id
  namespace_id = cloudflare_workers_kv_namespace.email_lists_data[0].id
  key          = "list:${each.key}"
  value = jsonencode({
    name         = each.key
    description  = each.value.description
    members      = each.value.members
    moderation   = each.value.moderation
    restrictions = each.value.restrictions
    auto_responses = each.value.auto_responses
  })
}

# Email Addresses
resource "cloudflare_email_routing_address" "this" {
  for_each = var.enable_email_routing ? var.email_addresses : {}

  account_id = var.account_id
  email      = each.value.email
}

resource "cloudflare_email_routing_rule" "addresses" {
  for_each = var.enable_email_routing ? var.email_addresses : {}

  zone_id  = var.zone_id
  name     = "${each.key}-forward"
  enabled  = each.value.enabled
  priority = 100

  matcher {
    type  = "literal"
    field = "to"
    value = each.value.email
  }

  action {
    type  = "forward"
    value = each.value.forward_to
  }

  depends_on = [cloudflare_email_routing_address.this]
}

# MX Records
resource "cloudflare_record" "mx" {
  for_each = var.enable_email_routing ? {
    for idx, mx in var.mx_records : "${mx.priority}-${mx.server}" => mx
  } : {}

  zone_id  = var.zone_id
  name     = "@"
  type     = "MX"
  content  = each.value.server
  priority = each.value.priority
  ttl      = 1
  proxied  = false
}

# Default MX records for Cloudflare Email Routing
resource "cloudflare_record" "default_mx" {
  for_each = var.enable_email_routing && length(var.mx_records) == 0 ? {
    "route1" = { priority = 60, server = "route1.mx.cloudflare.net" }
    "route2" = { priority = 73, server = "route2.mx.cloudflare.net" }
    "route3" = { priority = 76, server = "route3.mx.cloudflare.net" }
  } : {}

  zone_id  = var.zone_id
  name     = "@"
  type     = "MX"
  content  = each.value.server
  priority = each.value.priority
  ttl      = 1
  proxied  = false
}

# SPF Record
locals {
  spf_parts = compact([
    "v=spf1",
    var.spf_record.mx ? "mx" : "",
    var.spf_record.a ? "a" : "",
    length(var.spf_record.ip4) > 0 ? join(" ", [for ip in var.spf_record.ip4 : "ip4:${ip}"]) : "",
    length(var.spf_record.ip6) > 0 ? join(" ", [for ip in var.spf_record.ip6 : "ip6:${ip}"]) : "",
    length(var.spf_record.include) > 0 ? join(" ", [for inc in var.spf_record.include : "include:${inc}"]) : "",
    length(var.spf_record.exists) > 0 ? join(" ", [for ex in var.spf_record.exists : "exists:${ex}"]) : "",
    var.spf_record.redirect != null ? "redirect=${var.spf_record.redirect}" : "",
    var.spf_record.all
  ])

  spf_record_value = join(" ", local.spf_parts)
}

resource "cloudflare_record" "spf" {
  count = var.spf_record.enabled ? 1 : 0

  zone_id = var.zone_id
  name    = "@"
  type    = "TXT"
  content = local.spf_record_value
  ttl     = 1
  proxied = false
}

# DKIM Records
resource "cloudflare_record" "dkim" {
  for_each = {
    for k, v in var.dkim_records : k => v
    if v.enabled
  }

  zone_id = var.zone_id
  name    = "${each.value.selector}._domainkey"
  type    = "TXT"
  content = each.value.key
  ttl     = 1
  proxied = false
}

# DMARC Record
locals {
  dmarc_parts = compact([
    "v=DMARC1",
    "p=${var.dmarc_record.policy}",
    var.dmarc_record.subdomain_policy != null ? "sp=${var.dmarc_record.subdomain_policy}" : "",
    var.dmarc_record.percentage != 100 ? "pct=${var.dmarc_record.percentage}" : "",
    var.dmarc_record.rua_email != null ? "rua=mailto:${var.dmarc_record.rua_email}" : "",
    var.dmarc_record.ruf_email != null ? "ruf=mailto:${var.dmarc_record.ruf_email}" : "",
    "fo=${var.dmarc_record.fo}",
    "adkim=${var.dmarc_record.adkim}",
    "aspf=${var.dmarc_record.aspf}",
    var.dmarc_record.ri != 86400 ? "ri=${var.dmarc_record.ri}" : ""
  ])

  dmarc_record_value = join("; ", local.dmarc_parts)
}

resource "cloudflare_record" "dmarc" {
  count = var.dmarc_record.enabled ? 1 : 0

  zone_id = var.zone_id
  name    = "_dmarc"
  type    = "TXT"
  content = local.dmarc_record_value
  ttl     = 1
  proxied = false
}

# BIMI Record
resource "cloudflare_record" "bimi" {
  count = var.bimi_record.enabled && var.bimi_record.logo_url != "" ? 1 : 0

  zone_id = var.zone_id
  name    = "default._bimi"
  type    = "TXT"
  content = join("; ", compact([
    "v=BIMI1",
    "l=${var.bimi_record.logo_url}",
    var.bimi_record.certificate != null ? "a=${var.bimi_record.certificate}" : ""
  ]))
  ttl     = 1
  proxied = false
}

# Email Workers
resource "cloudflare_workers_script" "email" {
  for_each = var.email_workers

  account_id         = var.account_id
  script_name        = each.value.script_name
  content            = each.value.script_content != null ? each.value.script_content : file(each.value.script_path)
  compatibility_date = each.value.compatibility_date

  # Plain text bindings for environment variables
  dynamic "plain_text_binding" {
    for_each = each.value.environment_variables
    content {
      name = plain_text_binding.key
      text = plain_text_binding.value
    }
  }

  # Secret text bindings
  dynamic "secret_text_binding" {
    for_each = each.value.secrets
    content {
      name = secret_text_binding.key
      text = secret_text_binding.value
    }
  }
}

# Area 1 MX Records
resource "cloudflare_record" "area1_mx" {
  for_each = var.enable_area1 ? {
    for idx, mx in var.area1_settings.mx_servers : "${mx.priority}-${mx.server}" => mx
  } : {}

  zone_id  = var.zone_id
  name     = "@"
  type     = "MX"
  content  = each.value.server
  priority = each.value.priority
  ttl      = 1
  proxied  = false
}

# Email Security Settings (via API)
resource "cloudflare_zone_settings_override" "email_security" {
  count = var.enable_email_security ? 1 : 0

  zone_id = var.zone_id

  settings {
    # Basic email obfuscation
    email_obfuscation = "on"
  }
}

# Domain Verification Records
resource "cloudflare_record" "domain_verification" {
  zone_id = var.zone_id
  name    = "@"
  type    = "TXT"
  content = "v=spf1 include:_spf.mx.cloudflare.net ~all"
  ttl     = 1
  proxied = false

  lifecycle {
    ignore_changes = [content]
  }
}

# Email Templates (stored as data for workers)
resource "cloudflare_workers_kv_namespace" "email_templates" {
  count = length(var.email_templates) > 0 ? 1 : 0

  account_id = var.account_id
  title      = "email-templates-${var.zone_id}"
}

resource "cloudflare_workers_kv" "templates" {
  for_each = length(var.email_templates) > 0 ? var.email_templates : {}

  account_id   = var.account_id
  namespace_id = cloudflare_workers_kv_namespace.email_templates[0].id
  key          = each.key
  value = jsonencode({
    subject    = each.value.subject
    body_html  = each.value.body_html
    body_text  = each.value.body_text
    from_email = each.value.from_email
    from_name  = each.value.from_name
  })
}

###################################################
# Advanced Email Security Policies (migrated from legacy)
###################################################

# Email Security Settings - NOT AVAILABLE in Terraform Provider
# Note: cloudflare_email_security_settings resource is not available in the current Cloudflare Terraform provider.
# This feature would need to be configured manually through the Cloudflare dashboard or via API calls.

# Email Security Policies - NOT AVAILABLE in Terraform Provider
# Note: cloudflare_email_security_policy resources are not available in the current Cloudflare Terraform provider.
# These features would need to be configured manually through the Cloudflare dashboard or via API calls.

# Available email security resources are limited to:
# - cloudflare_email_security_impersonation_registry
# - cloudflare_email_security_trusted_domains
# - cloudflare_email_security_block_sender