
#
# DNS RECORDS
#
locals {
  vercel_cname = "cname.vercel-dns.com"

  records = [
    # A Records
    {
      name    = "@"
      type    = "A"
      content = "76.76.21.21"
      ttl     = 1
      proxied = true
    },

    # CNAME Records
    {
      name    = "cms"
      type    = "CNAME"
      content = "iotcw3g1.up.railway.app"
      ttl     = 1
      proxied = false
    },
    {
      name    = "jrapi"
      type    = "CNAME"
      content = local.vercel_cname
      ttl     = 3600
      proxied = false
    },
    {
      name    = "forge"
      type    = "CNAME"
      content = local.vercel_cname
      ttl     = 1
      proxied = true
    },
    {
      name    = "n8n"
      type    = "CNAME"
      content = "4h6dzkyo.up.railway.app"
      ttl     = 1
      proxied = true
    },
    {
      name    = "preview"
      type    = "CNAME"
      content = local.vercel_cname
      ttl     = 1
      proxied = true
    },
    {
      name    = "www"
      type    = "CNAME"
      content = var.domain_forge
      ttl     = 1
      proxied = true
    },

    # MX Records
    {
      name     = "@"
      type     = "MX"
      content  = "aspmx.l.google.com"
      ttl      = 1
      priority = 1
    },
    {
      name     = "@"
      type     = "MX"
      content  = "alt1.aspmx.l.google.com"
      ttl      = 1
      priority = 5
    },
    {
      name     = "@"
      type     = "MX"
      content  = "alt2.aspmx.l.google.com"
      ttl      = 1
      priority = 5
    },
    {
      name     = "@"
      type     = "MX"
      content  = "alt3.aspmx.l.google.com"
      ttl      = 1
      priority = 10
    },
    {
      name     = "@"
      type     = "MX"
      content  = "alt4.aspmx.l.google.com"
      ttl      = 1
      priority = 10
    },

    # TXT Records
    {
      name    = "_dmarc"
      type    = "TXT"
      content = "\"v=DMARC1;  p=none; rua=mailto:8dbfeb0c9b3a4e758a079270c1d22db2@dmarc-reports.cloudflare.net\""
      ttl     = 1
    },
    {
      name    = "@"
      type    = "TXT"
      content = "\"google-site-verification=LF03CEHsy7f7qz4zV31bGTTdQHzdF1II8gJOmE83VOU\""
      ttl     = 3600
    },
    {
      name    = "@"
      type    = "TXT"
      content = "\"v=spf1 include:_spf.google.com ~all\""
      ttl     = 1
    },
    {
      name    = "resend._domainkey.updates"
      type    = "TXT"
      content = "\"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCtl7npptgQuCstuSvkkawuG7oB9rMDXUHknpp95nHKWBy6pPUXFR9BAoCoJh4d4BSZqN3FAAboiV1bi2AWDbdK86hrz/15dal87h60BYBYPOcGSqeQmSgUnuoGEFHf0c4hfqbbxnBTETDvUxpAEHbMLRVEeWfklKD6/o8WMgcoxQIDAQAB\""
      ttl     = 1
    },
    {
      name    = "_vercel"
      type    = "TXT"
      content = "\"vc-domain-verify=jrapi.forge.com,463c9338df51db3564a1,dc\""
      ttl     = 3600
    }
  ]
}

resource "cloudflare_dns_record" "lfm_dns_records" {
  for_each = { for idx, rec in local.records : "${rec.name}-${rec.type}-${idx}" => rec }
  zone_id  = var.zone_id_forge
  name     = each.value.name
  type     = each.value.type
  content  = each.value.content
  ttl      = each.value.ttl
  priority = lookup(each.value, "priority", null)
  proxied  = contains(["A", "CNAME"], each.value.type) ? lookup(each.value, "proxied", false) : false
}
