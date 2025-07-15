# Vercel Module

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.1"
    }
  }
}

# Vercel Project
resource "vercel_project" "this" {
  name      = var.project_name
  framework = var.framework
  team_id   = var.team_id != "" ? var.team_id : null

  # Git Repository
  dynamic "git_repository" {
    for_each = var.git_repository != null ? [var.git_repository] : []
    content {
      type   = git_repository.value.type
      repo   = git_repository.value.repo
      branch = git_repository.value.branch
    }
  }

  # Build & Development Settings
  build_command    = var.build_command != "" ? var.build_command : null
  output_directory = var.output_directory != "" ? var.output_directory : null
  install_command  = var.install_command != "" ? var.install_command : null
  dev_command      = var.dev_command != "" ? var.dev_command : null
  root_directory   = var.root_directory != "" ? var.root_directory : null

  # Environment Variables
  dynamic "environment" {
    for_each = merge(var.environment_variables, var.build_env)
    content {
      target = ["production", "preview", "development"]
      key    = environment.key
      value  = environment.value
    }
  }

  # Sensitive Environment Variables
  dynamic "environment" {
    for_each = var.sensitive_environment_variables
    content {
      target = ["production", "preview", "development"]
      key    = environment.key
      value  = environment.value
      sensitive = true
    }
  }

  # Node.js Version
  environment {
    target = ["production", "preview", "development"]
    key    = "NODE_VERSION"
    value  = var.node_version
  }

  # Serverless Functions Configuration
  serverless_function_region = var.functions.region
  
  # Security
  public_source = var.public_source

  # Auto-assign custom domains
  auto_assign_custom_domains = var.auto_assign_custom_domains

  # Preview URL suffix
  preview_deployment_suffix = var.preview_deployment_suffix != "" ? var.preview_deployment_suffix : null
}

# Project Domains
resource "vercel_project_domain" "this" {
  for_each = toset(var.domains)

  project_id = vercel_project.this.id
  domain     = each.value
  team_id    = var.team_id != "" ? var.team_id : null
}

# Deployment Protection
resource "vercel_deployment_protection" "this" {
  count = var.deployment_protection.enabled ? 1 : 0

  project_id = vercel_project.this.id
  team_id    = var.team_id != "" ? var.team_id : null
  
  type = var.deployment_protection.authentication_type
  
  # Trusted IPs
  dynamic "trusted_ips" {
    for_each = var.deployment_protection.trusted_ips
    content {
      ip = trusted_ips.value
    }
  }
}

# Password Protection
resource "vercel_password_protection" "this" {
  count = var.password_protection.enabled && var.password_protection.password != null ? 1 : 0

  project_id      = vercel_project.this.id
  team_id         = var.team_id != "" ? var.team_id : null
  password        = var.password_protection.password
  deployment_type = var.password_protection.deployment_type
}

# Edge Config
resource "vercel_edge_config" "this" {
  count = var.edge_config.enabled ? 1 : 0

  name    = "${var.project_name}-edge-config"
  team_id = var.team_id != "" ? var.team_id : null
}

resource "vercel_edge_config_item" "this" {
  for_each = var.edge_config.enabled ? var.edge_config.items : {}

  edge_config_id = vercel_edge_config.this[0].id
  team_id        = var.team_id != "" ? var.team_id : null
  key            = each.key
  value          = jsonencode(each.value)
}

# Edge Config Token
resource "vercel_edge_config_token" "this" {
  count = var.edge_config.enabled ? 1 : 0

  edge_config_id = vercel_edge_config.this[0].id
  team_id        = var.team_id != "" ? var.team_id : null
  label          = "${var.project_name}-token"
}

# Project Environment Variable for Edge Config
resource "vercel_project_environment_variable" "edge_config" {
  count = var.edge_config.enabled ? 1 : 0

  project_id = vercel_project.this.id
  team_id    = var.team_id != "" ? var.team_id : null
  key        = "EDGE_CONFIG"
  value      = vercel_edge_config.this[0].id
  target     = ["production", "preview", "development"]
}

# Vercel Functions Configuration
resource "vercel_project_function_settings" "this" {
  count = length(var.functions.include_files) > 0 || length(var.functions.exclude_files) > 0 ? 1 : 0

  project_id = vercel_project.this.id
  team_id    = var.team_id != "" ? var.team_id : null
  
  include_files = var.functions.include_files
  exclude_files = var.functions.exclude_files
  max_duration  = var.functions.max_duration
  memory        = var.functions.memory
}

# Headers Configuration (via vercel.json)
locals {
  vercel_config = {
    headers = length(var.headers) > 0 ? var.headers : null
    redirects = length(var.redirects) > 0 ? var.redirects : null
    rewrites = length(var.rewrites) > 0 ? var.rewrites : null
    functions = {
      "api/*" = {
        maxDuration = var.functions.max_duration
        memory      = var.functions.memory
      }
    }
    crons = length(var.crons) > 0 ? var.crons : null
  }
  
  # Security headers to apply
  security_headers = var.security_headers != {} ? concat([
    {
      source = "/(.*)"
      headers = concat(
        var.security_headers.x_frame_options != null ? [{
          key   = "X-Frame-Options"
          value = var.security_headers.x_frame_options
        }] : [],
        var.security_headers.x_content_type_options != null ? [{
          key   = "X-Content-Type-Options"
          value = var.security_headers.x_content_type_options
        }] : [],
        var.security_headers.x_xss_protection != null ? [{
          key   = "X-XSS-Protection"
          value = var.security_headers.x_xss_protection
        }] : [],
        var.security_headers.referrer_policy != null ? [{
          key   = "Referrer-Policy"
          value = var.security_headers.referrer_policy
        }] : [],
        var.security_headers.permissions_policy != null ? [{
          key   = "Permissions-Policy"
          value = var.security_headers.permissions_policy
        }] : [],
        var.security_headers.content_security_policy != null ? [{
          key   = "Content-Security-Policy"
          value = var.security_headers.content_security_policy
        }] : []
      )
    }
  ], var.headers) : var.headers
}

# Generate vercel.json file
resource "local_file" "vercel_json" {
  count = length(var.headers) > 0 || length(var.redirects) > 0 || length(var.rewrites) > 0 || length(var.crons) > 0 ? 1 : 0

  content = jsonencode({
    headers   = local.security_headers
    redirects = var.redirects
    rewrites  = var.rewrites
    functions = local.vercel_config.functions
    crons     = var.crons
  })
  
  filename = "${path.root}/vercel.json"
  
  lifecycle {
    ignore_changes = [content]
  }
}

# Analytics Configuration
resource "vercel_project_analytics" "this" {
  count = var.analytics.enabled ? 1 : 0

  project_id  = vercel_project.this.id
  team_id     = var.team_id != "" ? var.team_id : null
  audiences   = var.analytics.audiences
  web_vitals  = var.analytics.web_vitals
}

# Speed Insights
resource "vercel_project_environment_variable" "speed_insights" {
  count = var.speed_insights ? 1 : 0

  project_id = vercel_project.this.id
  team_id    = var.team_id != "" ? var.team_id : null
  key        = "NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS"
  value      = "true"
  target     = ["production", "preview"]
}