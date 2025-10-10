# Cloudflare Workers Module

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# KV Namespaces
resource "cloudflare_workers_kv_namespace" "this" {
  for_each = var.kv_namespaces

  account_id = var.account_id
  title      = each.value.title
}

# D1 Databases
resource "cloudflare_d1_database" "this" {
  for_each = var.d1_databases

  account_id = var.account_id
  name       = each.value.name
}

# KV namespace for D1 backup metadata
resource "cloudflare_workers_kv_namespace" "d1_backup_metadata" {
  for_each = {
    for k, v in var.d1_databases : k => v
    if v.enable_backups
  }

  account_id = var.account_id
  title      = "${each.value.name}-backup-metadata"
}

# D1 Migrations Worker
resource "cloudflare_workers_script" "d1_migrations" {
  for_each = {
    for k, v in var.d1_databases : k => v
    if v.enable_migrations
  }

  account_id  = var.account_id
  script_name = "${each.value.name}-migrations"

  content = <<-EOT
    export default {
      async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Simple authentication check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response('Unauthorized', { status: 401 });
        }

        if (url.pathname === '/migrate') {
          try {
            // Get current schema version
            const version = await env.DB.prepare(
              "SELECT version FROM migrations ORDER BY version DESC LIMIT 1"
            ).first();

            const currentVersion = version?.version || 0;

            // Apply pending migrations
            // In production, migrations would be loaded from files
            const migrations = env.MIGRATIONS || [];
            let applied = 0;

            for (const migration of migrations) {
              if (migration.version > currentVersion) {
                await env.DB.batch(migration.statements);
                await env.DB.prepare(
                  "INSERT INTO migrations (version, applied_at) VALUES (?, ?)"
                ).bind(migration.version, new Date().toISOString()).run();
                applied++;
              }
            }

            return new Response(JSON.stringify({
              status: 'success',
              currentVersion: currentVersion + applied,
              migrationsApplied: applied
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (error) {
            return new Response(JSON.stringify({
              status: 'error',
              message: error.message
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        if (url.pathname === '/status') {
          try {
            const tables = await env.DB.prepare(
              "SELECT name FROM sqlite_master WHERE type='table'"
            ).all();

            return new Response(JSON.stringify({
              status: 'success',
              database: '${each.value.name}',
              tables: tables.results.map(t => t.name)
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (error) {
            return new Response(JSON.stringify({
              status: 'error',
              message: error.message
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        return new Response('D1 Migrations Manager', { status: 200 });
      }
    };
  EOT

  module = true

  d1_database_binding {
    name        = "DB"
    database_id = cloudflare_d1_database.this[each.key].id
  }
}

# D1 Backup Worker
resource "cloudflare_workers_script" "d1_backup" {
  for_each = {
    for k, v in var.d1_databases : k => v
    if v.enable_backups
  }

  account_id  = var.account_id
  script_name = "${each.value.name}-backup"

  content = <<-EOT
    export default {
      async scheduled(event, env, ctx) {
        const timestamp = new Date().toISOString();
        const backupName = `backup-${timestamp.replace(/[:.]/g, '-')}`;

        try {
          // Get database schema
          const schema = await env.DB.prepare(
            "SELECT sql FROM sqlite_master WHERE sql IS NOT NULL"
          ).all();

          // Get table names
          const tables = await env.DB.prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
          ).all();

          // Export data from each table
          const backupData = {};
          for (const table of tables.results) {
            const data = await env.DB.prepare(`SELECT * FROM ${table.name}`).all();
            backupData[table.name] = data.results;
          }

          // Store backup metadata
          const metadata = {
            timestamp: timestamp,
            database: '${each.value.name}',
            schema: schema.results,
            tables: tables.results.map(t => t.name),
            rowCounts: Object.fromEntries(
              Object.entries(backupData).map(([table, data]) => [table, data.length])
            ),
            retention_days: ${each.value.backup_retention_days}
          };

          await env.BACKUP_METADATA.put(backupName, JSON.stringify(metadata), {
            metadata: { created: timestamp }
          });

          // In production, you would upload the actual data to R2 or another storage service
          console.log(`Backup completed: ${backupName}`);

          // Clean up old backups
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - ${each.value.backup_retention_days});

          const keys = await env.BACKUP_METADATA.list();
          for (const key of keys.keys) {
            if (key.metadata && key.metadata.created < cutoffDate.toISOString()) {
              await env.BACKUP_METADATA.delete(key.name);
            }
          }

          return new Response(`Backup completed: ${backupName}`, { status: 200 });
        } catch (error) {
          console.error('Backup error:', error);
          return new Response(`Backup failed: ${error.message}`, { status: 500 });
        }
      },

      async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === '/list') {
          const backups = await env.BACKUP_METADATA.list();
          return new Response(JSON.stringify({
            backups: backups.keys.map(k => ({
              name: k.name,
              created: k.metadata?.created
            }))
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (url.pathname.startsWith('/restore/')) {
          const backupName = url.pathname.split('/')[2];
          const metadata = await env.BACKUP_METADATA.get(backupName, { type: 'json' });

          if (!metadata) {
            return new Response('Backup not found', { status: 404 });
          }

          return new Response(JSON.stringify(metadata), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response('D1 Backup Manager', { status: 200 });
      }
    };
  EOT

  module = true

  d1_database_binding {
    name        = "DB"
    database_id = cloudflare_d1_database.this[each.key].id
  }

  kv_namespace_binding {
    name         = "BACKUP_METADATA"
    namespace_id = cloudflare_workers_kv_namespace.d1_backup_metadata[each.key].id
  }
}

# D1 Admin Interface Worker
resource "cloudflare_workers_script" "d1_admin" {
  for_each = {
    for k, v in var.d1_databases : k => v
    if v.enable_admin_interface
  }

  account_id  = var.account_id
  script_name = "${each.value.name}-admin"

  content = <<-EOT
    const ALLOWED_EMAILS = ${jsonencode(each.value.admin_allowed_emails)};

    export default {
      async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Simple email-based authentication
        const email = request.headers.get('X-User-Email');
        if (!email || !ALLOWED_EMAILS.includes(email)) {
          return new Response('Unauthorized', { status: 401 });
        }

        // Query executor
        if (url.pathname === '/query' && request.method === 'POST') {
          try {
            const { query } = await request.json();

            // Basic SQL injection prevention (in production, use proper parameterized queries)
            const readOnlyKeywords = ['select', 'show', 'describe', 'explain'];
            const isReadOnly = readOnlyKeywords.some(keyword =>
              query.toLowerCase().trim().startsWith(keyword)
            );

            if (!isReadOnly && !request.headers.get('X-Allow-Write')) {
              return new Response('Write operations require X-Allow-Write header', {
                status: 403
              });
            }

            const result = await env.DB.prepare(query).all();

            return new Response(JSON.stringify({
              status: 'success',
              results: result.results,
              meta: result.meta
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (error) {
            return new Response(JSON.stringify({
              status: 'error',
              message: error.message
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        // Schema explorer
        if (url.pathname === '/schema') {
          try {
            const tables = await env.DB.prepare(
              "SELECT name, sql FROM sqlite_master WHERE type='table'"
            ).all();

            const schema = {};
            for (const table of tables.results) {
              const columns = await env.DB.prepare(
                `PRAGMA table_info(${table.name})`
              ).all();
              schema[table.name] = {
                sql: table.sql,
                columns: columns.results
              };
            }

            return new Response(JSON.stringify({
              database: '${each.value.name}',
              schema: schema
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (error) {
            return new Response(JSON.stringify({
              status: 'error',
              message: error.message
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        // Basic admin UI
        if (url.pathname === '/') {
          return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>D1 Admin - ${each.value.name}</title>
              <style>
                body { font-family: sans-serif; margin: 20px; }
                textarea { width: 100%; height: 200px; }
                pre { background: #f0f0f0; padding: 10px; overflow: auto; }
                .error { color: red; }
                .success { color: green; }
              </style>
            </head>
            <body>
              <h1>D1 Database Admin - ${each.value.name}</h1>
              <h2>Query Editor</h2>
              <textarea id="query" placeholder="Enter SQL query..."></textarea>
              <br>
              <button onclick="executeQuery()">Execute Query</button>
              <label><input type="checkbox" id="allowWrite"> Allow Write Operations</label>
              <div id="results"></div>

              <h2>Database Schema</h2>
              <button onclick="loadSchema()">Load Schema</button>
              <div id="schema"></div>

              <script>
                async function executeQuery() {
                  const query = document.getElementById('query').value;
                  const allowWrite = document.getElementById('allowWrite').checked;
                  const headers = {
                    'Content-Type': 'application/json',
                    'X-User-Email': '${each.value.admin_allowed_emails[0]}' // In production, get from auth
                  };
                  if (allowWrite) headers['X-Allow-Write'] = 'true';

                  const response = await fetch('/query', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ query })
                  });

                  const result = await response.json();
                  const resultsDiv = document.getElementById('results');

                  if (result.status === 'error') {
                    resultsDiv.innerHTML = '<div class="error">Error: ' + result.message + '</div>';
                  } else {
                    resultsDiv.innerHTML = '<div class="success">Success!</div><pre>' +
                      JSON.stringify(result.results, null, 2) + '</pre>';
                  }
                }

                async function loadSchema() {
                  const response = await fetch('/schema', {
                    headers: {
                      'X-User-Email': '${each.value.admin_allowed_emails[0]}'
                    }
                  });

                  const schema = await response.json();
                  document.getElementById('schema').innerHTML = '<pre>' +
                    JSON.stringify(schema, null, 2) + '</pre>';
                }
              </script>
            </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        }

        return new Response('Not found', { status: 404 });
      }
    };
  EOT

  module = true

  d1_database_binding {
    name        = "DB"
    database_id = cloudflare_d1_database.this[each.key].id
  }
}

# Cron triggers for backups
resource "cloudflare_workers_cron_trigger" "d1_backup_schedule" {
  for_each = {
    for k, v in var.d1_databases : k => v
    if v.enable_backups
  }

  account_id  = var.account_id
  script_name = cloudflare_workers_script.d1_backup[each.key].script_name
  schedules   = [each.value.backup_schedule]
}

# Routes for D1 admin interfaces
resource "cloudflare_workers_route" "d1_admin_routes" {
  for_each = {
    for k, v in var.d1_databases : k => v
    if v.enable_admin_interface
  }

  zone_id     = var.zone_id
  pattern     = "${each.value.name}-admin.${data.cloudflare_zone.current.name}/*"
  script_name = cloudflare_workers_script.d1_admin[each.key].script_name
}

# Routes for D1 migrations
resource "cloudflare_workers_route" "d1_migrations_routes" {
  for_each = {
    for k, v in var.d1_databases : k => v
    if v.enable_migrations
  }

  zone_id     = var.zone_id
  pattern     = "${each.value.name}-migrations.${data.cloudflare_zone.current.name}/*"
  script_name = cloudflare_workers_script.d1_migrations[each.key].script_name
}

# Data source to get zone name
data "cloudflare_zone" "current" {
  zone_id = var.zone_id
}

# Queues
resource "cloudflare_queue" "this" {
  for_each = var.queues

  account_id = var.account_id
  name       = each.value.name
}

# Queue Consumers
resource "cloudflare_queue_consumer" "this" {
  for_each = {
    for item in flatten([
      for queue_key, queue in var.queues : [
        for idx, consumer in queue.consumers : {
          key             = "${queue_key}-${idx}"
          queue_id        = cloudflare_queue.this[queue_key].id
          consumer        = consumer
        }
      ]
    ]) : item.key => item
  }

  account_id = var.account_id
  queue_id   = each.value.queue_id

  script_name       = each.value.consumer.script_name
  batch_size        = each.value.consumer.batch_size
  max_batch_timeout = each.value.consumer.max_batch_timeout
  max_retries       = each.value.consumer.max_retries
  dead_letter_queue = each.value.consumer.dead_letter_queue
}

# Analytics Engine Datasets
resource "cloudflare_workers_analytics_engine_dataset" "this" {
  for_each = var.analytics_engine_datasets

  account_id = var.account_id
  name       = each.value.name
}

# Image Processing Worker Scripts
resource "cloudflare_workers_script" "image_workers" {
  for_each = var.image_workers

  account_id  = var.account_id
  script_name = each.value.script_name

  # Script content
  content = each.value.script_content != null ? each.value.script_content : (
    each.value.script_path != null ? file(each.value.script_path) : ""
  )

  compatibility_date  = each.value.compatibility_date

  # Usage model
  usage_model = each.value.usage_model
  logpush     = each.value.logpush

  # Plain text bindings (environment variables)
  dynamic "plain_text_binding" {
    for_each = merge(each.value.environment_variables, each.value.plain_text_bindings)
    content {
      name = plain_text_binding.key
      text = plain_text_binding.value
    }
  }

  # Secret text bindings
  dynamic "secret_text_binding" {
    for_each = merge(each.value.secrets, var.worker_secrets)
    content {
      name = secret_text_binding.key
      text = secret_text_binding.value
    }
  }

  # KV namespace bindings
  dynamic "kv_namespace_binding" {
    for_each = each.value.kv_namespaces
    content {
      name         = kv_namespace_binding.key
      namespace_id = kv_namespace_binding.value.namespace_id != "" ? kv_namespace_binding.value.namespace_id : (
        contains(keys(cloudflare_workers_kv_namespace.this), kv_namespace_binding.value.namespace_id) ?
        cloudflare_workers_kv_namespace.this[kv_namespace_binding.value.namespace_id].id :
        kv_namespace_binding.value.namespace_id
      )
    }
  }

  # Durable Object bindings
  dynamic "durable_object_namespace_binding" {
    for_each = each.value.durable_objects
    content {
      name        = durable_object_namespace_binding.key
      class_name  = durable_object_namespace_binding.value.class_name
      script_name = durable_object_namespace_binding.value.script_name
    }
  }

  # R2 bucket bindings
  dynamic "r2_bucket_binding" {
    for_each = each.value.r2_buckets
    content {
      name        = r2_bucket_binding.key
      bucket_name = r2_bucket_binding.value.bucket_name
    }
  }

  # D1 database bindings
  dynamic "d1_database_binding" {
    for_each = each.value.d1_databases
    content {
      name        = d1_database_binding.key
      database_id = d1_database_binding.value.database_id != "" ? d1_database_binding.value.database_id : (
        contains(keys(cloudflare_d1_database.this), d1_database_binding.value.database_id) ?
        cloudflare_d1_database.this[d1_database_binding.value.database_id].id :
        d1_database_binding.value.database_id
      )
    }
  }

  # Queue bindings
  dynamic "queue_binding" {
    for_each = each.value.queues
    content {
      binding = queue_binding.key
      queue   = queue_binding.value.queue_name
    }
  }

  # Service bindings
  dynamic "service_binding" {
    for_each = each.value.service_bindings
    content {
      name        = service_binding.key
      service     = service_binding.value.service
      environment = service_binding.value.environment
    }
  }

  # Analytics Engine bindings
  dynamic "analytics_engine_binding" {
    for_each = each.value.analytics_engine_datasets
    content {
      name    = analytics_engine_binding.key
      dataset = analytics_engine_binding.value.dataset != "" ? analytics_engine_binding.value.dataset : (
        contains(keys(cloudflare_workers_analytics_engine_dataset.this), analytics_engine_binding.value.dataset) ?
        cloudflare_workers_analytics_engine_dataset.this[analytics_engine_binding.value.dataset].name :
        analytics_engine_binding.value.dataset
      )
    }
  }

  # Dispatch namespace bindings
  dynamic "dispatch_namespace_binding" {
    for_each = each.value.dispatch_namespaces
    content {
      name      = dispatch_namespace_binding.key
      namespace = dispatch_namespace_binding.value.namespace
    }
  }

  # WebAssembly modules
  dynamic "webassembly_binding" {
    for_each = each.value.wasm_modules
    content {
      name   = webassembly_binding.key
      module = filebase64(webassembly_binding.value.path)
    }
  }

  # JSON bindings
  dynamic "json_string_binding" {
    for_each = each.value.json_bindings
    content {
      name = json_string_binding.key
      json = jsonencode(json_string_binding.value)
    }
  }
}

# Worker Routes
resource "cloudflare_workers_route" "script_routes" {
  for_each = {
    for item in flatten([
      for worker_key, worker in var.workers : [
        for idx, route in worker.routes : {
          key         = "${worker_key}-${idx}"
          pattern     = route.pattern
          zone_id     = coalesce(route.zone_id, var.zone_id)
          script_name = worker.script_name
        }
      ]
    ]) : item.key => item
  }

  zone_id     = each.value.zone_id
  pattern     = each.value.pattern
  script_name = each.value.script_name
}

# Additional Worker Routes
resource "cloudflare_workers_route" "additional" {
  for_each = var.worker_routes

  zone_id     = coalesce(each.value.zone_id, var.zone_id)
  pattern     = each.value.pattern
  script_name = each.value.script_name
}

# Custom Domains for Workers
resource "cloudflare_workers_custom_domain" "this" {
  for_each = {
    for item in flatten([
      for worker_key, worker in var.workers : [
        for domain in worker.custom_domains : {
          key         = "${worker_key}-${domain}"
          domain      = domain
          script_name = worker.script_name
        }
      ]
    ]) : item.key => item
  }

  account_id  = var.account_id
  hostname    = each.value.domain
  service     = each.value.script_name
  zone_id     = var.zone_id
}

# Cron Triggers
resource "cloudflare_workers_cron_trigger" "this" {
  for_each = {
    for item in flatten([
      for trigger_key, trigger in var.cron_triggers : [
        for schedule in trigger.schedules : {
          key         = "${trigger_key}-${replace(schedule, " ", "-")}"
          script_name = trigger.script_name
          schedule    = schedule
        }
      ]
    ]) : item.key => item
  }

  account_id  = var.account_id
  script_name = each.value.script_name
  schedules   = [each.value.schedule]
}

# Durable Object Namespaces
resource "cloudflare_durable_object_namespace" "this" {
  for_each = var.durable_objects

  account_id  = var.account_id
  name        = each.value.name
  script_name = each.value.script_name
  class_name  = each.value.class_name
  environment = each.value.environment
}

# Durable Object Migrations
resource "cloudflare_durable_object_migration" "this" {
  for_each = {
    for item in flatten([
      for ns_key, ns in var.durable_objects : [
        for idx, migration in ns.migrations : {
          key          = "${ns_key}-${idx}"
          namespace_id = cloudflare_durable_object_namespace.this[ns_key].id
          migration    = migration
        }
      ]
    ]) : item.key => item
  }

  account_id   = var.account_id
  namespace_id = each.value.namespace_id

  tag             = each.value.migration.tag
  new_classes     = each.value.migration.new_classes
  deleted_classes = each.value.migration.deleted_classes

  dynamic "renamed_classes" {
    for_each = each.value.migration.renamed_classes != null ? each.value.migration.renamed_classes : []
    content {
      from = renamed_classes.value.from
      to   = renamed_classes.value.to
    }
  }
}

# Workers Subdomain
resource "cloudflare_workers_subdomain" "this" {
  count = var.workers_subdomain.enabled ? 1 : 0

  account_id = var.account_id
  subdomain  = var.workers_subdomain.name
}

# Logpush Jobs for Workers
resource "cloudflare_logpush_job" "workers" {
  for_each = var.logpush_jobs

  account_id          = var.account_id
  dataset             = each.value.dataset
  destination_conf    = each.value.destination_conf
  enabled             = each.value.enabled
  filter              = each.value.filter
  frequency           = each.value.frequency
  name                = each.key
  ownership_challenge = each.value.ownership_challenge
}

# Tail Workers (for log streaming)
locals {
  tail_workers = {
    for item in flatten([
      for worker_key, worker in var.workers : [
        for consumer in worker.tail_consumers : {
          producer = worker.script_name
          consumer = consumer
        }
      ]
    ]) : "${item.producer}-${item.consumer}" => item
  }
}

resource "cloudflare_workers_tail" "this" {
  for_each = local.tail_workers

  account_id = var.account_id
  script     = each.value.producer
  consumer   = each.value.consumer
}