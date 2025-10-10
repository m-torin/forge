# Development Environment Variables

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "upstash_email" {
  description = "Upstash email"
  type        = string
}

variable "upstash_api_key" {
  description = "Upstash API key"
  type        = string
  sensitive   = true
}

variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "dev_subdomain" {
  description = "Development subdomain"
  type        = string
  default     = "dev"
}

variable "domain" {
  description = "Base domain"
  type        = string
}
