# Vercel Module Variables

variable "project_name" {
  description = "Name of the Vercel project"
  type        = string
}

variable "team_id" {
  description = "Vercel team ID"
  type        = string
  default     = ""
}

variable "framework" {
  description = "Project framework"
  type        = string
  default     = "nextjs"
  validation {
    condition = contains([
      "nextjs", "react", "vue", "angular", "svelte", "gatsby",
      "nuxtjs", "preact", "ember", "astro", "remix", "solidstart"
    ], var.framework)
    error_message = "Framework must be a supported Vercel framework"
  }
}

variable "git_repository" {
  description = "Git repository configuration"
  type = object({
    type   = string # github, gitlab, bitbucket
    repo   = string # owner/repo format
    branch = optional(string, "main")
  })
  default = null
}

variable "domains" {
  description = "Custom domains to assign to the project"
  type        = list(string)
  default     = []
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["production", "preview", "development"], var.environment)
    error_message = "Environment must be one of: production, preview, development"
  }
}

variable "environment_variables" {
  description = "Environment variables for the project"
  type        = map(string)
  default     = {}
}

variable "sensitive_environment_variables" {
  description = "Sensitive environment variables (will be encrypted)"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "build_command" {
  description = "Custom build command"
  type        = string
  default     = ""
}

variable "output_directory" {
  description = "Output directory for the build"
  type        = string
  default     = ""
}

variable "install_command" {
  description = "Custom install command"
  type        = string
  default     = ""
}

variable "dev_command" {
  description = "Development server command"
  type        = string
  default     = ""
}

variable "root_directory" {
  description = "Root directory of the project in the repository"
  type        = string
  default     = ""
}

variable "node_version" {
  description = "Node.js version"
  type        = string
  default     = "18.x"
}

variable "functions" {
  description = "Serverless function configuration"
  type = object({
    include_files = optional(list(string), [])
    exclude_files = optional(list(string), [])
    region        = optional(string, "iad1") # Default to US East
    max_duration  = optional(number, 10)     # Seconds
    memory        = optional(number, 1024)   # MB
  })
  default = {}
}

variable "headers" {
  description = "Custom headers configuration"
  type = list(object({
    source  = string
    headers = list(object({
      key   = string
      value = string
    }))
  }))
  default = []
}

variable "redirects" {
  description = "Redirect rules"
  type = list(object({
    source        = string
    destination   = string
    permanent     = optional(bool, false)
    statusCode    = optional(number)
  }))
  default = []
}

variable "rewrites" {
  description = "Rewrite rules"
  type = list(object({
    source      = string
    destination = string
  }))
  default = []
}

variable "deployment_protection" {
  description = "Deployment protection settings"
  type = object({
    enabled               = optional(bool, false)
    trusted_ips          = optional(list(string), [])
    protected_branches   = optional(list(string), ["main", "master"])
    authentication_type  = optional(string, "vercel") # vercel, oauth, password
  })
  default = {}
}

variable "preview_deployment_suffix" {
  description = "Suffix for preview deployments"
  type        = string
  default     = ""
}

variable "auto_assign_custom_domains" {
  description = "Automatically assign custom domains to production deployments"
  type        = bool
  default     = true
}

variable "public_source" {
  description = "Make source code publicly accessible"
  type        = bool
  default     = false
}

variable "build_env" {
  description = "Build-time environment variables"
  type        = map(string)
  default     = {}
}

variable "edge_config" {
  description = "Edge Config store configuration"
  type = object({
    enabled = optional(bool, false)
    items   = optional(map(any), {})
  })
  default = {}
}

variable "crons" {
  description = "Cron job configurations"
  type = list(object({
    path     = string
    schedule = string # Cron expression
  }))
  default = []
}

variable "analytics" {
  description = "Analytics configuration"
  type = object({
    enabled  = optional(bool, true)
    audiences = optional(bool, false)
    web_vitals = optional(bool, true)
  })
  default = {}
}

variable "speed_insights" {
  description = "Enable Speed Insights"
  type        = bool
  default     = true
}

variable "password_protection" {
  description = "Password protection for deployments"
  type = object({
    enabled              = optional(bool, false)
    password             = optional(string)
    deployment_type      = optional(string, "all") # all, preview, production
  })
  default = {}
  sensitive = true
}

variable "security_headers" {
  description = "Security headers to apply"
  type = object({
    x_frame_options         = optional(string, "DENY")
    x_content_type_options  = optional(string, "nosniff")
    x_xss_protection        = optional(string, "1; mode=block")
    referrer_policy         = optional(string, "strict-origin-when-cross-origin")
    permissions_policy      = optional(string)
    content_security_policy = optional(string)
  })
  default = {}
}

variable "tags" {
  description = "Tags to apply to the project"
  type        = map(string)
  default     = {}
}