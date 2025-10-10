# AI Module Outputs - Simplified (AI Gateway and Vectorize not available in Terraform provider)

# AI Workers Outputs
output "ai_workers" {
  description = "AI-powered workers deployed"
  value = {
    for k, v in cloudflare_worker_script.ai : k => {
      id     = v.id
      name   = v.script_name
      routes = [for r in cloudflare_worker_route.ai : r.pattern if strcontains(r.id, k)]
    }
  }
}

# KV Namespaces
output "ai_kv_namespaces" {
  description = "KV namespaces for AI caching"
  value = {
    for k, v in cloudflare_workers_kv_namespace.ai_cache : k => {
      id    = v.id
      title = v.title
    }
  }
}

# Analytics Outputs
output "ai_analytics_enabled" {
  description = "Whether AI analytics is enabled"
  value       = var.enable_ai_analytics
}

output "ai_analytics_logpush" {
  description = "AI analytics logpush job"
  value = var.enable_ai_analytics && var.ai_analytics_config.logpush_destination != null ? {
    id          = cloudflare_logpush_job.ai_analytics[0].id
    dataset     = cloudflare_logpush_job.ai_analytics[0].dataset
    destination = cloudflare_logpush_job.ai_analytics[0].destination_conf
  } : null
}

# Cost Control Outputs
output "ai_cost_controls" {
  description = "AI cost control configuration"
  value = {
    monthly_budget = var.ai_cost_controls.monthly_budget
    daily_budget   = var.ai_cost_controls.daily_budget
    alerts_enabled = var.ai_cost_controls.monthly_budget != null || var.ai_cost_controls.daily_budget != null
  }
}

# Compliance Outputs
output "ai_compliance_configured" {
  description = "Whether AI compliance is configured"
  value       = local.compliance_config != null
}

output "ai_compliance_settings" {
  description = "AI compliance settings"
  value = var.ai_compliance
}

# Summary Output
output "ai_summary" {
  description = "Summary of AI configuration"
  value = {
    workers = {
      count = length(var.ai_workers)
      names = keys(var.ai_workers)
    }
    analytics = {
      enabled = var.enable_ai_analytics
      logpush = var.enable_ai_analytics && var.ai_analytics_config.logpush_destination != null
    }
    compliance = {
      configured     = local.compliance_config != null
      pii_detection  = var.ai_compliance.pii_detection
      content_filter = var.ai_compliance.content_filtering != null && var.ai_compliance.content_filtering.enabled
    }
  }
}

# Integration Helpers
output "workers_ai_example" {
  description = "Example Workers AI code"
  value = length(var.ai_workers) > 0 ? <<-JS
    export default {
      async fetch(request, env, ctx) {
        // Example AI worker code
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + env.OPENAI_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: 'What is Cloudflare?' }
            ]
          })
        });

        return new Response(JSON.stringify(await response.json()), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };
  JS : null
}