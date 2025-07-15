# Workers Module Outputs

# Worker Scripts
output "workers" {
  description = "Deployed worker scripts"
  value = {
    for k, v in cloudflare_worker_script.this : k => {
      id          = v.id
      name        = v.name
      usage_model = v.usage_model
      routes = concat(
        [for r in cloudflare_worker_route.script_routes : r.pattern if strcontains(r.id, k)],
        [for r in cloudflare_worker_route.additional : r.pattern if r.script_name == v.name]
      )
      custom_domains = [for d in cloudflare_worker_domain.this : d.hostname if strcontains(d.id, k)]
      cron_schedules = [for c in cloudflare_worker_cron_trigger.this : c.schedules[0] if strcontains(c.id, v.name)]
    }
  }
}

# KV Namespaces
output "kv_namespaces" {
  description = "KV namespace details"
  value = {
    for k, v in cloudflare_workers_kv_namespace.this : k => {
      id    = v.id
      title = v.title
    }
  }
}

# D1 Databases
output "d1_databases" {
  description = "D1 database details"
  value = {
    for k, v in cloudflare_d1_database.this : k => {
      id                  = v.id
      name                = v.name
      migrations_enabled  = var.d1_databases[k].enable_migrations
      backups_enabled     = var.d1_databases[k].enable_backups
      admin_interface_enabled = var.d1_databases[k].enable_admin_interface
      migrations_worker   = var.d1_databases[k].enable_migrations ? cloudflare_workers_script.d1_migrations[k].name : null
      backup_worker       = var.d1_databases[k].enable_backups ? cloudflare_workers_script.d1_backup[k].name : null
      admin_worker        = var.d1_databases[k].enable_admin_interface ? cloudflare_workers_script.d1_admin[k].name : null
      admin_url           = var.d1_databases[k].enable_admin_interface ? "https://${v.name}-admin.${data.cloudflare_zone.current.name}" : null
      migrations_url      = var.d1_databases[k].enable_migrations ? "https://${v.name}-migrations.${data.cloudflare_zone.current.name}" : null
    }
  }
}

# Queues
output "queues" {
  description = "Queue details"
  value = {
    for k, v in cloudflare_queue.this : k => {
      id        = v.id
      name      = v.name
      consumers = [for c in cloudflare_queue_consumer.this : c.script_name if c.queue_id == v.id]
    }
  }
}

# Analytics Engine Datasets
output "analytics_engine_datasets" {
  description = "Analytics Engine dataset details"
  value = {
    for k, v in cloudflare_workers_analytics_engine_dataset.this : k => {
      id   = v.id
      name = v.name
    }
  }
}

# Durable Objects
output "durable_objects" {
  description = "Durable Object namespace details"
  value = {
    for k, v in cloudflare_durable_object_namespace.this : k => {
      id          = v.id
      name        = v.name
      class_name  = v.class_name
      script_name = v.script_name
    }
  }
}

# Workers Subdomain
output "workers_subdomain" {
  description = "Workers subdomain"
  value       = var.workers_subdomain.enabled ? cloudflare_workers_subdomain.this[0].subdomain : null
}

# Worker URLs
output "worker_urls" {
  description = "Worker access URLs"
  value = {
    for k, v in cloudflare_worker_script.this : k => {
      subdomain = var.workers_subdomain.enabled ? "https://${v.name}.${cloudflare_workers_subdomain.this[0].subdomain}.workers.dev" : null
      routes    = [for r in cloudflare_worker_route.script_routes : r.pattern if strcontains(r.id, k)]
      custom    = [for d in cloudflare_worker_domain.this : "https://${d.hostname}" if strcontains(d.id, k)]
    }
  }
}

# Logpush Jobs
output "logpush_jobs" {
  description = "Worker logpush job configurations"
  value = {
    for k, v in cloudflare_logpush_job.workers : k => {
      id          = v.id
      dataset     = v.dataset
      destination = v.destination_conf
      enabled     = v.enabled
    }
  }
}

# Worker Summary
output "workers_summary" {
  description = "Summary of workers configuration"
  value = {
    workers = {
      count = length(var.workers)
      names = keys(var.workers)
      routes_total = length(cloudflare_worker_route.script_routes) + length(cloudflare_worker_route.additional)
      custom_domains_total = length(cloudflare_worker_domain.this)
      cron_triggers_total = length(cloudflare_worker_cron_trigger.this)
    }
    storage = {
      kv_namespaces    = length(var.kv_namespaces)
      d1_databases     = length(var.d1_databases)
      durable_objects  = length(var.durable_objects)
    }
    queues = {
      total     = length(var.queues)
      consumers = length(cloudflare_queue_consumer.this)
    }
    analytics = {
      datasets      = length(var.analytics_engine_datasets)
      logpush_jobs  = length(var.logpush_jobs)
    }
    subdomain = {
      enabled = var.workers_subdomain.enabled
      name    = var.workers_subdomain.enabled ? cloudflare_workers_subdomain.this[0].subdomain : null
    }
  }
}

# Example Worker Code
output "example_worker_code" {
  description = "Example worker code snippets"
  value = {
    basic = <<-JS
      export default {
        async fetch(request, env, ctx) {
          return new Response("Hello Worker!", {
            headers: { "Content-Type": "text/plain" }
          });
        }
      };
    JS
    
    kv_example = <<-JS
      export default {
        async fetch(request, env, ctx) {
          const value = await env.KV_NAMESPACE.get("key");
          return new Response(value || "Not found");
        }
      };
    JS
    
    d1_example = <<-JS
      export default {
        async fetch(request, env, ctx) {
          const results = await env.DB.prepare(
            "SELECT * FROM users WHERE id = ?"
          ).bind(1).all();
          
          return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" }
          });
        }
      };
    JS
    
    queue_example = <<-JS
      export default {
        async fetch(request, env, ctx) {
          await env.QUEUE.send({
            message: "Process this",
            timestamp: Date.now()
          });
          return new Response("Queued");
        },
        
        async queue(batch, env, ctx) {
          for (const message of batch.messages) {
            console.log("Processing:", message.body);
            message.ack();
          }
        }
      };
    JS
    
    durable_object_example = <<-JS
      export class Counter {
        constructor(state, env) {
          this.state = state;
        }
        
        async fetch(request) {
          const count = (await this.state.storage.get("count")) || 0;
          const newCount = count + 1;
          await this.state.storage.put("count", newCount);
          return new Response(newCount.toString());
        }
      }
      
      export default {
        async fetch(request, env, ctx) {
          const id = env.COUNTER.idFromName("global");
          const obj = env.COUNTER.get(id);
          return obj.fetch(request);
        }
      };
    JS
  }
}

# Environment Variables Template
output "env_template" {
  description = "Template for worker environment variables"
  value = {
    for k, v in var.workers : k => {
      variables = keys(v.environment_variables)
      secrets   = keys(v.secrets)
      bindings  = {
        kv_namespaces    = keys(v.kv_namespaces)
        durable_objects  = keys(v.durable_objects)
        r2_buckets       = keys(v.r2_buckets)
        d1_databases     = keys(v.d1_databases)
        queues           = keys(v.queues)
        service_bindings = keys(v.service_bindings)
      }
    }
  }
}