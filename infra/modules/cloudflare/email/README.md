# Cloudflare Email Module

This module provides comprehensive email management including routing, security,
authentication, and advanced processing capabilities using Cloudflare Workers.

## Features

### Core Email Services

- **Email Routing**: Forward emails to different destinations with advanced
  rules
- **Email Security**: Comprehensive spam, phishing, and malware protection
- **Authentication**: SPF, DKIM, DMARC, and BIMI records
- **Area 1 Integration**: Advanced email security platform

### Advanced Email Processing

- **Email Parser**: Extract structured data from emails
- **Email Archiver**: Long-term email storage and indexing
- **Auto-Responder**: Automated email responses with templates
- **Threat Scanner**: Real-time malware and phishing detection
- **Attachment Scanner**: Scan attachments for malicious content
- **Security Tagger**: Add security classifications to emails
- **Email List Processor**: Manage mailing lists and distribution
- **Quarantine System**: Isolate suspicious emails with admin interface

### Advanced Routing Features

- **Time-Based Routing**: Route emails based on schedules
- **Regex Matching**: Advanced pattern matching for email addresses
- **Template-Based Rules**: Dynamic routing based on email content
- **Security Rules**: Automatic routing based on threat levels
- **Distribution Lists**: Managed email lists with subscriptions

## Usage

### Basic Email Routing

```hcl
module "email" {
  source = "./modules/cloudflare/email"

  zone_id    = module.zone.zone_id
  account_id = var.cloudflare_account_id
  domain     = var.primary_domain

  enable_email_routing = true

  # Catch-all for unmatched emails
  catch_all_email = "admin@example.com"

  # Email addresses to create
  email_addresses = {
    "support" = {
      email      = "support@example.com"
      forward_to = ["team@example.com"]
    }
    "info" = {
      email      = "info@example.com"
      forward_to = ["sales@example.com"]
    }
  }
}
```

### Advanced Configuration with Security

```hcl
module "email" {
  source = "./modules/cloudflare/email"

  zone_id    = module.zone.zone_id
  account_id = var.cloudflare_account_id
  domain     = var.primary_domain

  enable_email_routing = true
  enable_email_security = true
  enable_area1 = true

  # Advanced routing features
  enable_advanced_routing = true
  enable_time_based_routing = true
  enable_regex_matching = true

  # Email routing rules with advanced matchers
  email_routing_rules = {
    "support-urgent" = {
      type     = "forward"
      enabled  = true
      priority = 1

      matchers = {
        type = "all"
        conditions = [
          {
            field    = "to"
            operator = "equals"
            value    = "support@example.com"
          },
          {
            field    = "subject"
            operator = "matches"
            value    = "\\[URGENT\\]|\\[CRITICAL\\]"
          }
        ]
      }

      destinations = ["pager@example.com", "slack-webhook@example.com"]

      # Time-based routing
      schedule = {
        timezone = "America/New_York"
        business_hours = {
          start = "09:00"
          end   = "17:00"
          days  = ["monday", "tuesday", "wednesday", "thursday", "friday"]
        }
        after_hours_destination = "oncall@example.com"
      }
    }

    "sales-leads" = {
      type     = "worker"
      enabled  = true
      priority = 2

      matchers = {
        type = "any"
        conditions = [
          {
            field    = "from"
            operator = "matches"
            value    = "@(gmail|yahoo|hotmail)\\.com$"
          },
          {
            field    = "subject"
            operator = "contains"
            value    = "demo"
          }
        ]
      }

      worker_script = "email-lead-processor"
    }
  }

  # Security configuration
  email_security_settings = {
    spam_detection      = true
    phishing_detection  = true
    malware_scanning    = true
    attachment_scanning = true
    link_scanning       = true
    auto_quarantine     = true
    threat_intelligence = true

    trusted_domains = ["example.com", "partner.com"]
    trusted_ips     = ["10.0.0.0/8", "192.168.0.0/16"]
  }

  # Security rules
  email_security_rules = {
    "block-executables" = {
      name        = "Block Executable Attachments"
      action      = "block"
      enabled     = true
      priority    = 1

      conditions = [
        {
          field    = "attachment_extension"
          operator = "in"
          value    = ["exe", "bat", "scr", "com", "pif"]
        }
      ]
    }

    "quarantine-suspicious" = {
      name        = "Quarantine Suspicious Emails"
      action      = "quarantine"
      enabled     = true
      priority    = 2

      conditions = [
        {
          field    = "threat_score"
          operator = "greater_than"
          value    = "70"
        }
      ]
    }
  }

  # Email workers for processing
  email_workers = {
    "spam-filter" = {
      enabled = true
      script  = file("${path.module}/workers/spam-filter.js")
      routes  = ["*@example.com/*"]

      variables = {
        spam_threshold = "75"
        whitelist_domains = jsonencode(["partner.com", "vendor.com"])
      }

      kv_bindings = [
        {
          name         = "KV_EMAIL_DATA"
          namespace_id = cloudflare_workers_kv_namespace.email_data.id
        }
      ]
    }

    "auto-responder" = {
      enabled = true
      script  = file("${path.module}/workers/auto-responder.js")
      routes  = ["support@example.com/*", "info@example.com/*"]

      variables = {
        default_message = "Thank you for your email. We'll respond within 24 hours."
        business_hours  = jsonencode({
          enabled = true
          timezone = "America/New_York"
          start = "09:00"
          end = "17:00"
          days = ["monday", "tuesday", "wednesday", "thursday", "friday"]
        })
        rate_limit = "1h"
        exclude_domains = jsonencode(["internal.example.com"])
      }
    }

    "email-parser" = {
      enabled = true
      script  = file("${path.module}/workers/email-parser.js")
      routes  = ["*@example.com/*"]

      variables = {
        parse_attachments      = "true"
        extract_links          = "true"
        extract_phone_numbers  = "true"
        extract_dates          = "true"
        detect_language        = "true"
      }

      secrets = {
        PARSER_WEBHOOK_URL = "https://api.example.com/email-parsed"
      }
    }

    "email-archiver" = {
      enabled = true
      script  = file("${path.module}/workers/email-archiver.js")
      routes  = ["*@example.com/*"]

      variables = {
        archive_attachments = "true"
        compress_emails     = "true"
        retention_days      = "2555"  # 7 years
        index_content       = "true"
      }

      r2_bindings = [
        {
          name        = "R2_EMAIL_ARCHIVE"
          bucket_name = "email-archive-bucket"
        }
      ]
    }

    "threat-scanner" = {
      enabled = true
      script  = file("${path.module}/workers/threat-scanner.js")
      routes  = ["*@example.com/*"]

      variables = {
        scan_attachments   = "true"
        scan_links         = "true"
        phishing_detection = "true"
        malware_detection  = "true"
        block_threats      = "true"
        quarantine_threats = "true"
      }
    }

    "attachment-scanner" = {
      enabled = true
      script  = file("${path.module}/workers/attachment-scanner.js")
      routes  = ["*@example.com/*"]

      variables = {
        scan_for_malware    = "true"
        scan_for_viruses    = "true"
        check_file_types    = "true"
        check_file_size     = "true"
        max_file_size       = "10485760"  # 10MB
        allowed_extensions  = jsonencode(["pdf", "doc", "docx", "xls", "xlsx", "txt", "jpg", "png"])
        blocked_extensions  = jsonencode(["exe", "bat", "scr", "com", "pif", "vbs", "js"])
        quarantine_threats  = "true"
      }
    }

    "email-list-processor" = {
      enabled = true
      script  = file("${path.module}/workers/email-list-processor.js")
      routes  = ["*-list@example.com/*"]

      variables = {
        enable_subscriptions   = "true"
        enable_unsubscriptions = "true"
        enable_distribution    = "true"
        require_confirmation   = "true"
        max_subscribers        = "10000"
      }
    }

    "email-quarantine-worker" = {
      enabled = true
      script  = file("${path.module}/workers/email-quarantine-worker.js")
      routes  = ["quarantine.example.com/*"]

      variables = {
        auto_quarantine = "false"
        quarantine_days = "30"
        admin_emails    = jsonencode(["admin@example.com", "security@example.com"])
        notify_admins   = "true"
      }
    }

    "email-security-tagger" = {
      enabled = true
      script  = file("${path.module}/workers/email-security-tagger.js")
      routes  = ["*@example.com/*"]

      variables = {
        add_security_headers = "true"
        tag_spam            = "true"
        tag_phishing        = "true"
        tag_malware         = "true"
        score_threshold     = "50"
        use_ai             = "true"
      }
    }
  }

  # Email templates
  email_templates = {
    "welcome" = {
      subject = "Welcome to Our Service"
      html    = file("${path.root}/templates/welcome.html")
      text    = file("${path.root}/templates/welcome.txt")
    }

    "password-reset" = {
      subject = "Password Reset Request"
      html    = file("${path.root}/templates/password-reset.html")
      text    = file("${path.root}/templates/password-reset.txt")
    }
  }

  # Distribution lists
  email_distribution_lists = {
    "all-staff" = {
      name        = "All Staff"
      description = "Company-wide announcements"
      members     = ["alice@example.com", "bob@example.com", "charlie@example.com"]
      auto_subscribe = false
      moderated   = true
      max_members = 1000
    }

    "developers" = {
      name        = "Development Team"
      description = "Technical updates and discussions"
      members     = ["dev1@example.com", "dev2@example.com"]
      auto_subscribe = true
      moderated   = false
      max_members = 100
    }
  }

  # Email authentication
  spf_record = {
    enabled = true
    include = ["_spf.google.com", "_spf.salesforce.com"]
    a       = true
    mx      = true
    ip4     = ["192.168.1.100"]
    ip6     = ["2001:db8::1"]
  }

  dkim_records = {
    "google" = {
      selector = "google"
      public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
    }
    "mailgun" = {
      selector = "mailgun"
      public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
    }
  }

  dmarc_record = {
    enabled = true
    policy  = "quarantine"
    rua     = ["mailto:dmarc@example.com"]
    ruf     = ["mailto:dmarc-forensic@example.com"]
    sp      = "reject"
    pct     = 100
  }

  bimi_record = {
    enabled  = true
    logo_url = "https://example.com/logo.svg"
    vmc_url  = "https://example.com/vmc.pem"
  }
}
```

### Distribution Lists Configuration

```hcl
# Comprehensive distribution lists setup
email_distribution_lists = {
  "announcements" = {
    name            = "Company Announcements"
    description     = "Important company-wide updates"
    members         = ["all-staff@example.com"]
    auto_subscribe  = false
    moderated       = true
    max_members     = 5000

    subscription_settings = {
      double_opt_in = true
      welcome_email = true
      unsubscribe_url = "https://example.com/unsubscribe"
    }
  }

  "support-team" = {
    name            = "Support Team"
    description     = "Customer support coordination"
    members         = ["support1@example.com", "support2@example.com"]
    auto_subscribe  = true
    moderated       = false
    max_members     = 50

    routing_rules = {
      priority_keywords = ["urgent", "critical", "down"]
      escalation_email  = "manager@example.com"
    }
  }
}
```

### Email Security Rules

```hcl
# Advanced security rules configuration
email_security_rules = {
  "block-suspicious-attachments" = {
    name        = "Block Suspicious File Types"
    action      = "block"
    enabled     = true
    priority    = 1

    conditions = [
      {
        field    = "attachment_extension"
        operator = "in"
        value    = ["exe", "bat", "scr", "com", "pif", "vbs", "js", "jar"]
      }
    ]

    notification = {
      enabled = true
      template = "blocked-attachment"
      recipients = ["security@example.com"]
    }
  }

  "quarantine-external-phishing" = {
    name        = "Quarantine External Phishing Attempts"
    action      = "quarantine"
    enabled     = true
    priority    = 2

    conditions = [
      {
        field    = "sender_domain"
        operator = "not_in"
        value    = ["example.com", "trusted-partner.com"]
      },
      {
        field    = "threat_score"
        operator = "greater_than"
        value    = "60"
      }
    ]

    quarantine_settings = {
      retention_days = 30
      auto_release   = false
      notify_admins  = true
    }
  }

  "tag-internal-sensitive" = {
    name        = "Tag Internal Sensitive Emails"
    action      = "tag"
    enabled     = true
    priority    = 3

    conditions = [
      {
        field    = "sender_domain"
        operator = "equals"
        value    = "example.com"
      },
      {
        field    = "subject"
        operator = "matches"
        value    = "\\[CONFIDENTIAL\\]|\\[SENSITIVE\\]"
      }
    ]

    tag_settings = {
      add_header = "X-Sensitivity-Level: High"
      encrypt    = true
      dlp_scan   = true
    }
  }
}
```

### Template-Based Rules

```hcl
# Dynamic routing based on email content templates
email_template_rules = {
  "customer-support" = {
    name        = "Customer Support Routing"
    enabled     = true
    priority    = 1

    template_matchers = [
      {
        field    = "subject"
        template = "Order #{order_id} - {issue_type}"
        extract  = ["order_id", "issue_type"]
      }
    ]

    routing_logic = {
      # Route based on extracted issue_type
      "billing"    = ["billing@example.com"]
      "technical"  = ["tech-support@example.com"]
      "shipping"   = ["fulfillment@example.com"]
      "default"    = ["support@example.com"]
    }
  }

  "automated-alerts" = {
    name        = "System Alert Routing"
    enabled     = true
    priority    = 2

    template_matchers = [
      {
        field    = "from"
        template = "alerts@{service}.{environment}.example.com"
        extract  = ["service", "environment"]
      }
    ]

    routing_logic = {
      # Route based on service and environment
      "production" = ["oncall@example.com", "pager@example.com"]
      "staging"    = ["dev-team@example.com"]
      "default"    = ["monitoring@example.com"]
    }
  }
}
```

## Email Worker Scripts

The module includes several pre-built email processing workers:

### Security Workers

1. **spam-filter.js**: Bayesian spam filtering with machine learning
2. **threat-scanner.js**: Real-time malware and phishing detection
3. **attachment-scanner.js**: Scan attachments for viruses and malware
4. **security-tagger.js**: Add security classifications to emails

### Processing Workers

1. **email-parser.js**: Extract structured data from email content
2. **email-archiver.js**: Long-term email storage and indexing
3. **auto-responder.js**: Automated responses with business hours
4. **email-list-processor.js**: Mailing list management

### Management Workers

1. **email-quarantine-worker.js**: Email quarantine with admin interface
2. **email-routing-worker.js**: Advanced routing logic

## Email Authentication

### SPF (Sender Policy Framework)

```hcl
spf_record = {
  enabled = true
  include = ["_spf.google.com", "_spf.mailgun.org"]
  a       = true
  mx      = true
  ip4     = ["192.168.1.100"]
  ip6     = ["2001:db8::1"]
  redirect = "example.com"
  exp     = "spf-explanation.example.com"
}
```

### DKIM (DomainKeys Identified Mail)

```hcl
dkim_records = {
  "primary" = {
    selector   = "primary"
    public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
  }
  "backup" = {
    selector   = "backup"
    public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
  }
}
```

### DMARC (Domain-based Message Authentication)

```hcl
dmarc_record = {
  enabled = true
  policy  = "quarantine"  # none, quarantine, reject
  rua     = ["mailto:dmarc-aggregate@example.com"]
  ruf     = ["mailto:dmarc-forensic@example.com"]
  sp      = "reject"      # Subdomain policy
  pct     = 100           # Percentage of emails to apply policy
  ri      = 86400         # Report interval in seconds
  rf      = "afrf"        # Report format
  fo      = "1"           # Failure reporting options
}
```

### BIMI (Brand Indicators for Message Identification)

```hcl
bimi_record = {
  enabled  = true
  logo_url = "https://example.com/bimi-logo.svg"
  vmc_url  = "https://example.com/vmc-certificate.pem"
}
```

## Email Security Features

### Threat Detection

- **Spam Detection**: Bayesian filtering with machine learning
- **Phishing Detection**: URL analysis and content pattern matching
- **Malware Scanning**: Attachment scanning and content analysis
- **Link Scanning**: Real-time URL reputation checking
- **AI-Powered Analysis**: Advanced threat detection using AI models

### Quarantine System

- **Automatic Quarantine**: Based on threat scores and rules
- **Admin Interface**: Web-based quarantine management
- **Manual Review**: Admin approval for quarantined emails
- **Retention Policies**: Configurable retention periods

### Attachment Security

- **File Type Filtering**: Block dangerous file extensions
- **Size Limits**: Configurable attachment size limits
- **Virus Scanning**: Real-time malware detection
- **Signature Analysis**: Binary signature matching

## Monitoring and Alerting

### Email Metrics

- **Delivery Rates**: Track successful email delivery
- **Security Events**: Monitor threats and blocks
- **Processing Times**: Worker performance metrics
- **Storage Usage**: KV and R2 storage monitoring

### Alert Integration

- **Slack Notifications**: Real-time security alerts
- **PagerDuty Integration**: Critical incident alerting
- **Email Notifications**: Admin email alerts
- **Webhook Integration**: Custom alerting endpoints

## Best Practices

### Security

1. **Enable All Security Features**: Use comprehensive threat detection
2. **Regular Rule Updates**: Keep security rules current
3. **Monitor Quarantine**: Regular review of quarantined emails
4. **Backup Authentication**: Use multiple DKIM selectors
5. **Gradual DMARC Policy**: Start with "none", progress to "reject"

### Performance

1. **Worker Optimization**: Minimize processing time
2. **KV Storage**: Use appropriate TTL values
3. **Batch Processing**: Process multiple emails efficiently
4. **Caching Strategy**: Cache frequently accessed data
5. **Error Handling**: Implement robust error recovery

### Compliance

1. **Data Retention**: Follow legal requirements
2. **Privacy Protection**: Encrypt sensitive data
3. **Audit Logging**: Maintain detailed logs
4. **Access Controls**: Restrict admin access
5. **Regular Backups**: Backup email archives

## Troubleshooting

### Common Issues

1. **Email Not Routing**: Check DNS MX records
2. **Authentication Failures**: Verify SPF/DKIM/DMARC records
3. **Worker Errors**: Check worker logs and bindings
4. **Quarantine Issues**: Verify KV namespace permissions
5. **Performance Issues**: Optimize worker code and caching

### Debug Tools

1. **Email Routing Logs**: Check Cloudflare dashboard
2. **Worker Analytics**: Monitor worker performance
3. **DNS Propagation**: Verify DNS record propagation
4. **Authentication Reports**: Review DMARC reports
5. **Security Logs**: Check threat detection logs

## Requirements

- Terraform >= 1.5.0
- Cloudflare provider ~> 5.0
- Cloudflare Pro plan or higher for email routing
- Cloudflare Workers plan for email processing
- Area 1 Email Security subscription (optional)

## Outputs

| Name                     | Description                                |
| ------------------------ | ------------------------------------------ |
| email_routing_enabled    | Whether email routing is enabled           |
| email_routing_rules      | Configured email routing rules             |
| email_workers_status     | Status of email processing workers         |
| email_security_features  | Email security features configuration      |
| email_kv_namespaces      | KV namespaces for email functionality      |
| email_processing_summary | Complete email processing pipeline summary |

## License

This module is provided under the MIT License.
