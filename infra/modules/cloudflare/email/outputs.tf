# Email Module Outputs

output "email_routing_enabled" {
  description = "Whether email routing is enabled"
  value       = var.enable_email_routing
}

output "email_routing_status" {
  description = "Email routing status"
  value       = var.enable_email_routing ? cloudflare_email_routing_settings.this[0].enabled : false
}

output "catch_all_configured" {
  description = "Whether catch-all email is configured"
  value       = var.enable_email_routing && var.catch_all_email != ""
}

output "email_routing_rules" {
  description = "Configured email routing rules"
  value = var.enable_email_routing ? {
    for k, v in cloudflare_email_routing_rule.this : k => {
      name     = v.name
      enabled  = v.enabled
      priority = v.priority
      type     = var.email_routing_rules[k].type
    }
  } : {}
}

output "email_addresses" {
  description = "Configured email addresses"
  value = var.enable_email_routing ? {
    for k, v in var.email_addresses : k => {
      email      = v.email
      forward_to = v.forward_to
      enabled    = v.enabled
    }
  } : {}
}

output "mx_records" {
  description = "MX records configured"
  value = concat(
    [for r in cloudflare_record.mx : {
      priority = r.priority
      server   = r.content
    }],
    [for r in cloudflare_record.default_mx : {
      priority = r.priority
      server   = r.content
    }],
    var.enable_area1 ? [for r in cloudflare_record.area1_mx : {
      priority = r.priority
      server   = r.content
    }] : []
  )
}

output "spf_record" {
  description = "SPF record value"
  value       = var.spf_record.enabled ? local.spf_record_value : null
}

output "dkim_records" {
  description = "DKIM selectors configured"
  value = {
    for k, v in cloudflare_record.dkim : k => {
      selector = var.dkim_records[k].selector
      name     = v.name
    }
  }
}

output "dmarc_record" {
  description = "DMARC record value"
  value       = var.dmarc_record.enabled ? local.dmarc_record_value : null
}

output "dmarc_policy" {
  description = "DMARC policy configured"
  value       = var.dmarc_record.enabled ? var.dmarc_record.policy : null
}

output "bimi_configured" {
  description = "Whether BIMI is configured"
  value       = var.bimi_record.enabled && var.bimi_record.logo_url != ""
}

output "email_workers" {
  description = "Email worker scripts deployed"
  value = {
    for k, v in cloudflare_worker_script.email : k => {
      id   = v.id
      name = v.name
    }
  }
}

output "email_security_enabled" {
  description = "Whether email security is enabled"
  value       = var.enable_email_security
}

output "area1_enabled" {
  description = "Whether Area 1 Email Security is enabled"
  value       = var.enable_area1
}

output "email_templates_namespace" {
  description = "KV namespace for email templates"
  value       = length(var.email_templates) > 0 ? cloudflare_workers_kv_namespace.email_templates[0].id : null
}

output "email_configuration_summary" {
  description = "Summary of email configuration"
  value = {
    routing = {
      enabled            = var.enable_email_routing
      catch_all          = var.catch_all_email != ""
      rules              = length(var.email_routing_rules)
      addresses          = length(var.email_addresses)
      advanced_routing   = var.enable_advanced_routing
      time_based_routing = var.enable_time_based_routing
      regex_matching     = var.enable_regex_matching
    }
    authentication = {
      spf   = var.spf_record.enabled
      dkim  = length(var.dkim_records)
      dmarc = var.dmarc_record.enabled
      bimi  = var.bimi_record.enabled
    }
    security = {
      email_security  = var.enable_email_security
      area1           = var.enable_area1
      trusted_domains = length(var.email_security_settings.trusted_domains)
      trusted_ips     = length(var.email_security_settings.trusted_ips)
      security_rules  = length(var.email_security_rules)
    }
    workers = {
      count = length(var.email_workers)
      names = keys(var.email_workers)
      spam_filter       = contains(keys(var.email_workers), "spam-filter")
      auto_responder    = contains(keys(var.email_workers), "auto-responder")
      email_parser      = contains(keys(var.email_workers), "email-parser")
      email_archiver    = contains(keys(var.email_workers), "email-archiver")
      threat_scanner    = contains(keys(var.email_workers), "threat-scanner")
      attachment_scanner = contains(keys(var.email_workers), "attachment-scanner")
      list_processor    = contains(keys(var.email_workers), "email-list-processor")
      quarantine_worker = contains(keys(var.email_workers), "email-quarantine-worker")
      security_tagger   = contains(keys(var.email_workers), "email-security-tagger")
    }
    templates = {
      count = length(var.email_templates)
      names = keys(var.email_templates)
    }
    distribution_lists = {
      count = length(var.email_distribution_lists)
      names = keys(var.email_distribution_lists)
    }
  }
}

output "email_dns_records" {
  description = "All email-related DNS records"
  value = {
    mx = concat(
      [for r in cloudflare_record.mx : "${r.priority} ${r.content}"],
      [for r in cloudflare_record.default_mx : "${r.priority} ${r.content}"],
      var.enable_area1 ? [for r in cloudflare_record.area1_mx : "${r.priority} ${r.content}"] : []
    )
    txt = compact([
      var.spf_record.enabled ? "SPF: ${local.spf_record_value}" : "",
      var.dmarc_record.enabled ? "DMARC: ${local.dmarc_record_value}" : ""
    ])
    dkim = [for k, v in cloudflare_record.dkim : "${v.name}: ${substr(v.content, 0, 50)}..."]
  }
}

output "email_verification_status" {
  description = "Email domain verification status"
  value = {
    mx_configured    = length(cloudflare_record.mx) > 0 || length(cloudflare_record.default_mx) > 0
    spf_configured   = var.spf_record.enabled
    dkim_configured  = length(cloudflare_record.dkim) > 0
    dmarc_configured = var.dmarc_record.enabled
  }
}

output "email_kv_namespaces" {
  description = "KV namespaces for email functionality"
  value = {
    templates    = length(var.email_templates) > 0 ? cloudflare_workers_kv_namespace.email_templates[0].id : null
    data         = var.enable_email_routing ? cloudflare_workers_kv_namespace.email_data[0].id : null
    security     = var.enable_email_security ? cloudflare_workers_kv_namespace.email_security[0].id : null
    quarantine   = var.enable_email_security ? cloudflare_workers_kv_namespace.email_quarantine[0].id : null
    lists        = length(var.email_distribution_lists) > 0 ? cloudflare_workers_kv_namespace.email_lists[0].id : null
    index        = var.enable_email_routing ? cloudflare_workers_kv_namespace.email_index[0].id : null
  }
}

output "email_routing_rules_advanced" {
  description = "Advanced email routing rules configuration"
  value = var.enable_advanced_routing ? {
    template_rules = length(var.email_template_rules)
    security_rules = length(var.email_security_rules)
    time_based_rules = var.enable_time_based_routing ? length([
      for rule in var.email_routing_rules : rule
      if lookup(rule, "schedule", null) != null
    ]) : 0
    regex_rules = var.enable_regex_matching ? length([
      for rule in var.email_routing_rules : rule
      if lookup(rule.matchers, "operator", "equals") == "matches"
    ]) : 0
  } : null
}

output "email_distribution_lists" {
  description = "Email distribution lists configured"
  value = {
    for k, v in var.email_distribution_lists : k => {
      name            = v.name
      description     = v.description
      members         = length(v.members)
      auto_subscribe  = v.auto_subscribe
      moderated       = v.moderated
      max_members     = v.max_members
    }
  }
}

output "email_workers_status" {
  description = "Status of email processing workers"
  value = {
    for worker_name, worker_config in var.email_workers : worker_name => {
      enabled     = worker_config.enabled
      routes      = length(worker_config.routes)
      kv_bindings = length(worker_config.kv_bindings)
      variables   = length(worker_config.variables)
      secrets     = length(worker_config.secrets)
    }
  }
}

output "email_security_features" {
  description = "Email security features status"
  value = var.enable_email_security ? {
    spam_detection    = var.email_security_settings.spam_detection
    phishing_detection = var.email_security_settings.phishing_detection
    malware_scanning  = var.email_security_settings.malware_scanning
    attachment_scanning = var.email_security_settings.attachment_scanning
    link_scanning     = var.email_security_settings.link_scanning
    auto_quarantine   = var.email_security_settings.auto_quarantine
    threat_intelligence = var.email_security_settings.threat_intelligence
    rules_count       = length(var.email_security_rules)
  } : null
}

output "email_processing_summary" {
  description = "Complete email processing pipeline summary"
  value = {
    routing = {
      enabled       = var.enable_email_routing
      rules         = length(var.email_routing_rules)
      addresses     = length(var.email_addresses)
      catch_all     = var.catch_all_email != ""
      advanced      = var.enable_advanced_routing
    }
    security = {
      enabled       = var.enable_email_security
      area1         = var.enable_area1
      workers       = length([for k, v in var.email_workers : k if contains(["spam-filter", "threat-scanner", "attachment-scanner", "security-tagger"], k)])
      quarantine    = var.enable_email_security
    }
    processing = {
      parser        = contains(keys(var.email_workers), "email-parser")
      archiver      = contains(keys(var.email_workers), "email-archiver")
      auto_responder = contains(keys(var.email_workers), "auto-responder")
      list_processor = contains(keys(var.email_workers), "email-list-processor")
    }
    storage = {
      templates_kv  = length(var.email_templates) > 0
      data_kv       = var.enable_email_routing
      security_kv   = var.enable_email_security
      quarantine_kv = var.enable_email_security
      lists_kv      = length(var.email_distribution_lists) > 0
    }
    authentication = {
      spf_record   = var.spf_record.enabled
      dkim_records = length(var.dkim_records)
      dmarc_record = var.dmarc_record.enabled
      bimi_record  = var.bimi_record.enabled
    }
  }
}