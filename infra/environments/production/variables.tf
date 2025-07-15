# Production Environment Variables

variable "doppler_token" {
  description = "Doppler service token for production environment"
  type        = string
  sensitive   = true
  default     = ""
}

variable "domain" {
  description = "Primary domain for the application"
  type        = string
  default     = "letsfindmy.com"
}

# Optional overrides for when not using Doppler
variable "cloudflare_api_token" {
  description = "Cloudflare API token (used if Doppler is not available)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID (used if Doppler is not available)"
  type        = string
  default     = ""
}

variable "upstash_email" {
  description = "Upstash email (used if Doppler is not available)"
  type        = string
  default     = ""
}

variable "upstash_api_key" {
  description = "Upstash API key (used if Doppler is not available)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "vercel_api_token" {
  description = "Vercel API token (used if Doppler is not available)"
  type        = string
  sensitive   = true
  default     = ""
}