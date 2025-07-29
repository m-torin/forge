# AI Module Outputs

# AI Gateway Outputs
output "ai_gateway_enabled" {
  description = "Whether AI Gateway is enabled"
  value       = var.enable_ai_gateway
}

output "ai_gateway_id" {
  description = "AI Gateway ID"
  value       = var.enable_ai_gateway ? cloudflare_ai_gateway.this[0].id : null
}

output "ai_gateway_endpoint" {
  description = "AI Gateway endpoint URL"
  value       = var.enable_ai_gateway ? "https://gateway.ai.cloudflare.com/v1/${var.account_id}/${cloudflare_ai_gateway.this[0].id}" : null
}

output "ai_gateway_routes" {
  description = "AI Gateway routes configured"
  value = var.enable_ai_gateway ? {
    for k, v in cloudflare_ai_gateway_route.this : k => {
      pattern  = v.pattern
      target   = v.target
      provider = v.provider
      model    = v.model
    }
  } : {}
}

# Workers AI Outputs
output "workers_ai_enabled" {
  description = "Whether Workers AI is enabled"
  value       = var.enable_workers_ai
}

output "workers_ai_models" {
  description = "Workers AI models configured"
  value       = var.workers_ai_models
}

# Vectorize Outputs
output "vectorize_enabled" {
  description = "Whether Vectorize is enabled"
  value       = var.enable_vectorize
}

output "vectorize_indexes" {
  description = "Vectorize indexes created"
  value = var.enable_vectorize ? {
    for k, v in cloudflare_vectorize_index.this : k => {
      id         = v.id
      name       = v.name
      dimensions = v.dimensions
      metric     = v.metric
      endpoint   = "https://api.cloudflare.com/client/v4/accounts/${var.account_id}/vectorize/indexes/${v.id}"
    }
  } : {}
}

# AI Workers Outputs
output "ai_workers" {
  description = "AI-powered workers deployed"
  value = {
    for k, v in cloudflare_worker_script.ai : k => {
      id     = v.id
      name   = v.name
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
    gateway = {
      enabled         = var.enable_ai_gateway
      caching_enabled = var.enable_ai_gateway ? var.ai_gateway_config.enable_caching : false
      rate_limited    = var.enable_ai_gateway && var.ai_gateway_config.rate_limiting != null
      routes          = var.enable_ai_gateway ? length(var.ai_gateway_routes) : 0
    }
    workers_ai = {
      enabled = var.enable_workers_ai
      models  = length(var.workers_ai_models)
    }
    vectorize = {
      enabled = var.enable_vectorize
      indexes = var.enable_vectorize ? length(var.vectorize_indexes) : 0
    }
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
output "ai_gateway_curl_example" {
  description = "Example curl command for AI Gateway"
  value = var.enable_ai_gateway ? <<-EOT
    curl -X POST ${var.enable_ai_gateway ? "https://gateway.ai.cloudflare.com/v1/${var.account_id}/${cloudflare_ai_gateway.this[0].id}/openai/chat/completions" : ""} \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": "Hello!"}]
      }'
  EOT : null
}

output "workers_ai_example" {
  description = "Example Workers AI code"
  value = var.enable_workers_ai ? <<-JS
    export default {
      async fetch(request, env, ctx) {
        const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'What is Cloudflare?' }
          ]
        });
        
        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };
  JS : null
}

output "vectorize_example" {
  description = "Example Vectorize usage"
  value = var.enable_vectorize && length(var.vectorize_indexes) > 0 ? <<-JS
    export default {
      async fetch(request, env, ctx) {
        const text = "Cloudflare Workers is a serverless platform";
        
        // Generate embedding
        const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
          text: [text]
        });
        
        // Insert into Vectorize
        await env.VECTORIZE.insert([{
          id: "doc-1",
          values: embeddings.data[0],
          metadata: { text: text }
        }]);
        
        // Query similar vectors
        const results = await env.VECTORIZE.query(embeddings.data[0], {
          topK: 5,
          returnMetadata: true
        });
        
        return new Response(JSON.stringify(results));
      }
    };
  JS : null
}