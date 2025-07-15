# Shared Outputs

output "environment" {
  description = "Current environment"
  value       = var.environment
}

output "name_prefix" {
  description = "Resource name prefix"
  value       = local.name_prefix
}

output "env_suffix" {
  description = "Environment suffix for resource naming"
  value       = local.env_suffix
}

output "tags" {
  description = "Common tags for resources"
  value       = local.tags
}

output "use_doppler" {
  description = "Whether Doppler is being used for secrets"
  value       = local.use_doppler
}

output "all_domains" {
  description = "All domains configured"
  value       = local.all_domains
}

output "env_config" {
  description = "Environment-specific configuration"
  value       = local.current_env_config
}

output "features" {
  description = "Enabled features"
  value       = var.features
}