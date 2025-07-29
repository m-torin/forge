# Shared Variables

# Authentication
variable "doppler_token" {
  description = "Doppler token for secret management"
  type        = string
  default     = ""
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token (used if Doppler not configured)"
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
  description = "Upstash account email"
  type        = string
  default     = ""
}

variable "upstash_api_key" {
  description = "Upstash API key"
  type        = string
  default     = ""
  sensitive   = true
}

# Environment
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "letsfindmy-forge"
}

# Domains
variable "primary_domain" {
  description = "Primary domain for the environment"
  type        = string
}

variable "additional_domains" {
  description = "Additional domains to configure"
  type        = list(string)
  default     = []
}

# Feature Flags
variable "features" {
  description = "Feature flags for enabling/disabling modules"
  type = object({
    # Cloudflare Features
    zone         = optional(bool, true)
    security     = optional(bool, true)
    performance  = optional(bool, true)
    media        = optional(bool, false)
    email        = optional(bool, false)
    ai           = optional(bool, false)
    workers      = optional(bool, false)
    
    # External Services
    vercel       = optional(bool, false)
    upstash      = optional(bool, false)
  })
  default = {}
}

# Common Tags
variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# Notification Settings
variable "notification_email" {
  description = "Email for notifications"
  type        = string
  default     = ""
}

variable "alert_webhooks" {
  description = "Webhook URLs for alerts"
  type        = list(string)
  default     = []
}