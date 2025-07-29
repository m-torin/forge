# Cloudflare Workers Module

This module provides comprehensive management of Cloudflare Workers and
associated services including KV, D1, Queues, Durable Objects, and more.

## Features

- **Worker Scripts**: Deploy and manage Worker scripts with full binding support
- **KV Storage**: Key-value storage at the edge
- **D1 Database**: SQLite at the edge
- **Queues**: Message queuing for async processing
- **Durable Objects**: Stateful Workers with consistent storage
- **Analytics Engine**: Custom analytics datasets
- **Service Bindings**: Worker-to-worker communication
- **Cron Triggers**: Scheduled worker execution
- **Custom Domains**: Workers on custom domains

## Usage

### Basic Worker

```hcl
module "workers" {
  source = "./modules/cloudflare/workers"

  account_id = var.cloudflare_account_id
  zone_id    = module.zone.zone_id

  workers = {
    "api-gateway" = {
      script_name    = "api-gateway"
      script_content = file("${path.module}/workers/api-gateway.js")

      routes = [
        {
          pattern = "api.example.com/*"
        }
      ]

      environment_variables = {
        API_VERSION = "v1"
        LOG_LEVEL   = "info"
      }
    }
  }
}
```

### Complete Worker Platform

```hcl
module "workers" {
  source = "./modules/cloudflare/workers"

  account_id = var.cloudflare_account_id
  zone_id    = module.zone.zone_id

  # Enable Workers subdomain
  workers_subdomain = {
    enabled = true
    name    = "myapp"
  }

  # KV Namespaces
  kv_namespaces = {
    "cache" = {
      title = "API Cache"
    }
    "config" = {
      title = "Configuration Store"
    }
    "sessions" = {
      title = "User Sessions"
    }
  }

  # D1 Databases
  d1_databases = {
    "app" = {
      name = "application-db"
    }
    "analytics" = {
      name = "analytics-db"
    }
  }

  # Queues
  queues = {
    "tasks" = {
      name = "task-queue"
      consumers = [
        {
          script_name       = "task-processor"
          batch_size        = 100
          max_batch_timeout = 30
          max_retries       = 3
          dead_letter_queue = "task-dlq"
        }
      ]
    }
    "task-dlq" = {
      name = "task-dead-letter-queue"
    }
  }

  # Analytics Engine Datasets
  analytics_engine_datasets = {
    "api-metrics" = {
      name = "api_metrics"
    }
  }

  # Workers
  workers = {
    "api-gateway" = {
      script_name        = "api-gateway"
      script_path        = "${path.module}/workers/api-gateway.js"
      module_type        = "esm"
      compatibility_date = "2024-01-01"
      usage_model        = "bundled"

      routes = [
        {
          pattern = "api.example.com/*"
        },
        {
          pattern = "*/api/v1/*"
        }
      ]

      custom_domains = ["api.example.com"]

      environment_variables = {
        API_VERSION     = "v1"
        ENVIRONMENT     = "production"
        LOG_LEVEL       = "info"
        MAX_CACHE_AGE   = "3600"
      }

      secrets = {
        JWT_SECRET      = var.jwt_secret
        DATABASE_URL    = var.database_url
        EXTERNAL_API_KEY = var.external_api_key
      }

      kv_namespaces = {
        "CACHE" = {
          namespace_id = "cache"
        }
        "CONFIG" = {
          namespace_id = "config"
        }
      }

      d1_databases = {
        "DB" = {
          database_id = "app"
        }
      }

      queues = {
        "TASK_QUEUE" = {
          queue_name = "tasks"
        }
      }

      analytics_engine_datasets = {
        "METRICS" = {
          dataset = "api-metrics"
        }
      }

      rate_limiting = {
        enabled             = true
        requests_per_minute = 1000
      }
    }

    "task-processor" = {
      script_name = "task-processor"
      script_content = file("${path.module}/workers/task-processor.js")

      environment_variables = {
        BATCH_SIZE = "100"
        TIMEOUT    = "300"
      }

      d1_databases = {
        "DB" = {
          database_id = "app"
        }
      }

      kv_namespaces = {
        "CACHE" = {
          namespace_id = "cache"
        }
      }
    }

    "websocket-handler" = {
      script_name = "websocket-handler"
      script_path = "${path.module}/workers/websocket.js"
      usage_model = "unbound"  # For WebSocket connections

      routes = [
        {
          pattern = "ws.example.com/*"
        }
      ]

      durable_objects = {
        "ROOM" = {
          class_name  = "ChatRoom"
          script_name = "websocket-handler"
        }
      }
    }

    "cron-worker" = {
      script_name = "cron-worker"
      script_path = "${path.module}/workers/cron.js"

      kv_namespaces = {
        "STATE" = {
          namespace_id = "config"
        }
      }

      d1_databases = {
        "ANALYTICS" = {
          database_id = "analytics"
        }
      }
    }

    "edge-renderer" = {
      script_name = "edge-renderer"
      script_path = "${path.module}/workers/renderer.js"

      routes = [
        {
          pattern = "example.com/*"
        }
      ]

      r2_buckets = {
        "ASSETS" = {
          bucket_name = "static-assets"
        }
      }

      service_bindings = {
        "API" = {
          service = "api-gateway"
        }
      }

      wasm_modules = {
        "IMAGE_PROCESSOR" = {
          path = "${path.module}/wasm/image-processor.wasm"
        }
      }
    }
  }

  # Durable Objects
  durable_objects = {
    "chat-room" = {
      name        = "chat-room-namespace"
      class_name  = "ChatRoom"
      script_name = "websocket-handler"

      migrations = [
        {
          tag = "v1"
          new_classes = ["ChatRoom"]
        }
      ]
    }
  }

  # Cron Triggers
  cron_triggers = {
    "hourly-cleanup" = {
      script_name = "cron-worker"
      schedules   = ["0 * * * *"]  # Every hour
    }
    "daily-report" = {
      script_name = "cron-worker"
      schedules   = ["0 0 * * *"]  # Daily at midnight
    }
  }

  # Logpush Jobs
  logpush_jobs = {
    "worker-traces" = {
      dataset          = "workers_trace_events"
      destination_conf = "s3://logs-bucket/workers?region=us-east-1"
      enabled          = true
      filter           = "ScriptName IN ('api-gateway', 'task-processor')"
    }
  }

  # Global Secrets
  worker_secrets = {
    GLOBAL_API_KEY = var.global_api_key
    SENTRY_DSN     = var.sentry_dsn
  }
}
```

### Worker Examples

#### API Gateway Worker

```javascript
// api-gateway.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Check cache
    const cacheKey = `api:${url.pathname}`;
    const cached = await env.CACHE.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT"
        }
      });
    }

    // Rate limiting
    const clientIp = request.headers.get("CF-Connecting-IP");
    const rateLimitKey = `rate:${clientIp}`;
    const count = parseInt((await env.CACHE.get(rateLimitKey)) || "0");

    if (count > 100) {
      return new Response("Rate limit exceeded", { status: 429 });
    }

    await env.CACHE.put(rateLimitKey, (count + 1).toString(), {
      expirationTtl: 60
    });

    // Process request
    const result = await processRequest(request, env);

    // Cache result
    await env.CACHE.put(cacheKey, JSON.stringify(result), {
      expirationTtl: parseInt(env.MAX_CACHE_AGE)
    });

    // Log metrics
    env.METRICS.writeDataPoint({
      blobs: [url.pathname, request.method],
      doubles: [Date.now() - startTime],
      indexes: [clientIp]
    });

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS"
      }
    });
  }
};
```

#### D1 Database Worker

```javascript
// d1-worker.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/users") {
      const users = await env.DB.prepare("SELECT * FROM users LIMIT 100").all();

      return new Response(JSON.stringify(users), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.pathname.startsWith("/user/")) {
      const userId = url.pathname.split("/")[2];
      const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?")
        .bind(userId)
        .first();

      if (!user) {
        return new Response("Not found", { status: 404 });
      }

      return new Response(JSON.stringify(user), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
```

### D1 Database with Enhanced Features

Configure a D1 database with migrations, backups, and admin interface:

```hcl
d1_databases = {
  "app-db" = {
    name                    = "application-database"
    enable_migrations       = true
    migrations_path         = "./migrations"
    enable_backups         = true
    backup_schedule        = "0 2 * * *"  # Daily at 2 AM UTC
    backup_retention_days  = 7
    enable_admin_interface = true
    admin_allowed_emails   = ["admin@example.com", "developer@example.com"]
  }
}

workers = {
  "api-with-d1" = {
    script_name = "api-service"
    script_path = "./workers/api.js"

    routes = [
      {
        pattern = "api.example.com/*"
      }
    ]

    d1_databases = {
      "DB" = {
        database_id = "app-db"
      }
    }

    environment_variables = {
      ENVIRONMENT = "production"
    }
  }
}
```

This configuration creates:

- A D1 database with automated daily backups
- A migrations endpoint at `https://application-database-migrations.example.com`
- An admin interface at `https://application-database-admin.example.com`
- Backup retention for 7 days with automatic cleanup

#### Database Migrations Example

Create a `migrations` directory with numbered SQL files:

```sql
-- migrations/001_create_users.sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

```sql
-- migrations/002_add_user_status.sql
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
```

Apply migrations via the migrations endpoint:

```bash
curl -X POST https://application-database-migrations.example.com/migrate \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN"
```

#### Using the Admin Interface

Access the admin interface to:

- Execute SQL queries
- Explore database schema
- View table structures
- Export data

```bash
# Check database status
curl https://application-database-admin.example.com/schema \
  -H "X-User-Email: admin@example.com"

# Execute a query
curl -X POST https://application-database-admin.example.com/query \
  -H "X-User-Email: admin@example.com" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) as total FROM users"}'
```

#### Durable Object Worker

```javascript
// websocket.js
export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/websocket") {
      const upgradeHeader = request.headers.get("Upgrade");
      if (upgradeHeader !== "websocket") {
        return new Response("Expected websocket", { status: 426 });
      }

      const [client, server] = Object.values(new WebSocketPair());
      await this.handleSession(server);

      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }

    return new Response("Not found", { status: 404 });
  }

  async handleSession(webSocket) {
    webSocket.accept();
    this.sessions.push(webSocket);

    webSocket.addEventListener("message", async (msg) => {
      const data = JSON.parse(msg.data);

      // Broadcast to all sessions
      for (const session of this.sessions) {
        if (session.readyState === 1) {
          session.send(
            JSON.stringify({
              ...data,
              timestamp: Date.now()
            })
          );
        }
      }
    });

    webSocket.addEventListener("close", () => {
      this.sessions = this.sessions.filter((s) => s !== webSocket);
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const roomId = env.ROOM.idFromName("main");
    const room = env.ROOM.get(roomId);
    return room.fetch(request);
  }
};
```

## Storage Options

### KV (Key-Value)

- Simple key-value storage
- Eventually consistent globally
- 25MB max value size
- Good for caching and configuration

### D1 (Database)

- SQLite at the edge
- ACID compliant
- SQL queries
- Good for relational data
- **Enhanced Features**:
  - Database migrations support
  - Automated backups with retention
  - Admin interface for query execution
  - Schema exploration tools

### R2 (Object Storage)

- S3-compatible API
- No egress fees
- Large file storage
- Good for assets and media

### Durable Objects

- Strongly consistent storage
- Single-threaded execution
- WebSocket support
- Good for real-time collaboration

### Queues

- Message queuing
- Batch processing
- Dead letter queues
- Good for async tasks

## Best Practices

1. **Code Organization**: Use ES modules for better tree-shaking
2. **Error Handling**: Always handle errors gracefully
3. **Rate Limiting**: Implement rate limiting for public APIs
4. **Caching**: Use KV for caching frequently accessed data
5. **Monitoring**: Enable logpush for production debugging

## Requirements

- Terraform >= 1.5.0
- Cloudflare provider ~> 5.0
- Workers Paid plan for some features
- D1 and Queues require specific plan types

## Outputs

| Name            | Description                 |
| --------------- | --------------------------- |
| workers         | Deployed worker details     |
| kv_namespaces   | KV namespace IDs            |
| d1_databases    | D1 database IDs             |
| worker_urls     | Worker access URLs          |
| workers_summary | Complete deployment summary |
