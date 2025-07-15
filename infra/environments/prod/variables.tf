# Production Environment Variables

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "letsfindmy-forge"
}

variable "primary_domain" {
  description = "Primary domain"
  type        = string
}

variable "additional_domains" {
  description = "Additional domains"
  type        = list(string)
  default     = []
}

variable "features" {
  description = "Feature flags"
  type = object({
    zone        = optional(bool, true)
    security    = optional(bool, true)
    performance = optional(bool, true)
    media       = optional(bool, true)
    email       = optional(bool, true)
    ai          = optional(bool, true)
    workers     = optional(bool, true)
    vercel      = optional(bool, true)
    upstash     = optional(bool, true)
  })
  default = {}
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}

variable "notification_email" {
  description = "Email for notifications"
  type        = string
  default     = ""
}

# Authentication Variables
variable "doppler_token" {
  description = "Doppler token"
  type        = string
  default     = ""
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  default     = ""
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
  default     = ""
}

variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  default     = ""
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team ID"
  type        = string
  default     = ""
}

variable "upstash_email" {
  description = "Upstash email"
  type        = string
  default     = ""
}

variable "upstash_api_key" {
  description = "Upstash API key"
  type        = string
  default     = ""
  sensitive   = true
}