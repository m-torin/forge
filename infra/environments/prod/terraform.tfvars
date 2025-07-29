# Production Environment Configuration

environment    = "prod"
primary_domain = "letsfindmy.com"

additional_domains = [
  "www.letsfindmy.com",
  "api.letsfindmy.com",
  "media.letsfindmy.com"
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