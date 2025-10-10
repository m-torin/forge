# Production Environment Configuration

environment    = "prod"
primary_domain = "forge.com"

additional_domains = [
  "www.forge.com",
  "api.forge.com",
  "media.forge.com"
]

features = {
  # Cloudflare Features
  zone        = true
  security    = true
  performance = true
  media       = true
  email       = true
  ai          = true
  workers     = true

  # External Services
  vercel      = true
  upstash     = true
}

tags = {
  Environment = "production"
  CostCenter  = "engineering"
  Owner       = "platform-team"
}