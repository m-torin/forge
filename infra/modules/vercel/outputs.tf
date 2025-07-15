# Vercel Module Outputs

output "project_id" {
  description = "Vercel project ID"
  value       = vercel_project.this.id
}

output "project_name" {
  description = "Vercel project name"
  value       = vercel_project.this.name
}

output "domains" {
  description = "Domains assigned to the project"
  value       = var.domains
}

output "deployment_url" {
  description = "Default deployment URL"
  value       = "https://${vercel_project.this.name}.vercel.app"
}

output "preview_url_pattern" {
  description = "Preview deployment URL pattern"
  value       = var.preview_deployment_suffix != "" ? "https://${vercel_project.this.name}-*-${var.preview_deployment_suffix}.vercel.app" : "https://${vercel_project.this.name}-*.vercel.app"
}

output "environment" {
  description = "Deployment environment"
  value       = var.environment
}

output "framework" {
  description = "Project framework"
  value       = var.framework
}

output "git_repository" {
  description = "Git repository configuration"
  value       = var.git_repository
}

output "node_version" {
  description = "Node.js version"
  value       = var.node_version
}

output "serverless_function_region" {
  description = "Serverless function region"
  value       = var.functions.region
}

output "edge_config_id" {
  description = "Edge Config ID"
  value       = var.edge_config.enabled ? vercel_edge_config.this[0].id : null
}

output "edge_config_token" {
  description = "Edge Config connection string"
  value       = var.edge_config.enabled ? vercel_edge_config_token.this[0].token : null
  sensitive   = true
}

output "deployment_protection_enabled" {
  description = "Whether deployment protection is enabled"
  value       = var.deployment_protection.enabled
}

output "password_protection_enabled" {
  description = "Whether password protection is enabled"
  value       = var.password_protection.enabled
}

output "analytics_enabled" {
  description = "Whether analytics is enabled"
  value       = var.analytics.enabled
}

output "speed_insights_enabled" {
  description = "Whether Speed Insights is enabled"
  value       = var.speed_insights
}

output "environment_variables" {
  description = "Non-sensitive environment variable keys"
  value       = keys(var.environment_variables)
}

output "build_settings" {
  description = "Build configuration"
  value = {
    build_command    = var.build_command
    output_directory = var.output_directory
    install_command  = var.install_command
    dev_command      = var.dev_command
    root_directory   = var.root_directory
  }
}

output "function_settings" {
  description = "Serverless function settings"
  value = {
    region       = var.functions.region
    max_duration = var.functions.max_duration
    memory       = var.functions.memory
  }
}

output "security_headers_enabled" {
  description = "Whether security headers are configured"
  value       = var.security_headers != {}
}

output "cron_jobs" {
  description = "Configured cron jobs"
  value = [
    for cron in var.crons : {
      path     = cron.path
      schedule = cron.schedule
    }
  ]
}

output "vercel_config_required" {
  description = "Whether a vercel.json file is required"
  value       = length(var.headers) > 0 || length(var.redirects) > 0 || length(var.rewrites) > 0 || length(var.crons) > 0 || var.security_headers != {}
}

output "project_summary" {
  description = "Summary of Vercel project configuration"
  value = {
    id           = vercel_project.this.id
    name         = var.project_name
    framework    = var.framework
    domains      = var.domains
    environment  = var.environment
    features = {
      edge_config           = var.edge_config.enabled
      deployment_protection = var.deployment_protection.enabled
      password_protection   = var.password_protection.enabled
      analytics             = var.analytics.enabled
      speed_insights        = var.speed_insights
      cron_jobs             = length(var.crons)
    }
    git = var.git_repository != null ? {
      type   = var.git_repository.type
      repo   = var.git_repository.repo
      branch = var.git_repository.branch
    } : null
  }
}