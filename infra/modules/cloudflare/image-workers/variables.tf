# Image Workers Module Variables

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

variable "domain" {
  description = "Base domain for image services"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "signing_key" {
  description = "Secret key for signing image URLs"
  type        = string
  sensitive   = true
}

variable "r2_location" {
  description = "R2 bucket location"
  type        = string
  default     = "auto"
}
