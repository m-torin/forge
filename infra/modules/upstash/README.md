# Upstash Module

This module provides Upstash services including Redis, Kafka, QStash, rate
limiting, and vector databases.

## Features

- **Redis**: Serverless Redis with global replication
- **Kafka**: Serverless Kafka for event streaming
- **QStash**: Message queue and task scheduling
  - Topics for pub/sub to multiple endpoints
  - Scheduled jobs with cron expressions
  - URL groups for fanout messaging
  - Dead letter queue for failed messages
  - Webhook signature verification
  - Automatic retries with exponential backoff
- **Rate Limiting**: Built on Redis for API protection
- **Vector Database**: For AI/ML embeddings and similarity search
- **Monitoring**: Alerts and metrics

## Usage

### Basic Redis Configuration

```hcl
module "upstash" {
  source = "./modules/upstash"

  name_prefix = "myapp"
  environment = "production"

  enable_redis = true
  redis_config = {
    region    = "us-east-1"
    multizone = true
    eviction  = true
  }
}
```

### Complete Configuration

```hcl
module "upstash" {
  source = "./modules/upstash"

  name_prefix = "myapp"
  environment = "production"
  team_id     = var.upstash_team_id

  # Redis Configuration
  enable_redis = true
  redis_config = {
    name       = "myapp-cache"
    region     = "us-east-1"
    multizone  = true
    eviction   = true
    auto_scale = true
    tls        = true
    persistence = true

    # Size limits
    max_memory_size  = 536870912  # 512MB
    max_entry_size   = 104857600  # 100MB
    max_request_size = 10485760   # 10MB
    max_daily_bandwidth = 107374182400  # 100GB
    max_commands_per_second = 5000
  }

  # Redis ACL Users
  redis_users = {
    "app-read" = {
      commands = ["+@read", "-@dangerous"]
      keys     = ["cache:*", "session:*"]
      channels = ["notifications"]
    }
    "app-write" = {
      commands = ["+@all", "-flushdb", "-flushall", "-config"]
      keys     = ["*"]
    }
    "analytics" = {
      commands = ["+@read", "+info", "+ping"]
      keys     = ["analytics:*", "metrics:*"]
      no_pass  = true  # For read-only analytics
    }
  }

  # Kafka Configuration
  enable_kafka = true
  kafka_config = {
    name       = "myapp-events"
    region     = "us-east-1"
    multizone  = true

    max_retention_size = 10737418240  # 10GB
    max_retention_time = 2592000000   # 30 days
    max_message_size   = 10485760     # 10MB
    max_partitions     = 1000
    max_topics         = 100
  }

  # Kafka Topics
  kafka_topics = {
    "user-events" = {
      partitions       = 10
      retention_time   = 604800000   # 7 days
      retention_size   = 1073741824  # 1GB per partition
      cleanup_policy   = "delete"
    }
    "order-events" = {
      partitions       = 20
      retention_time   = 2592000000  # 30 days
      retention_size   = 5368709120  # 5GB per partition
      cleanup_policy   = "delete"
    }
    "audit-log" = {
      partitions       = 5
      retention_time   = 31536000000 # 365 days
      cleanup_policy   = "compact"
    }
  }

  # QStash Configuration
  enable_qstash = true
  qstash_config = {
    enable_topics     = true
    enable_schedules  = true
    enable_dlq        = true
    retention_days    = 7
  }

  # QStash Topics
  qstash_topics = {
    "notifications" = {
      endpoints = [
        {
          url = "https://api.example.com/webhooks/email"
          headers = {
            "X-Service" = "email-service"
          }
          retry = {
            count = 5
            delay = "30s"
            max_delay = "1h"
          }
        },
        {
          url = "https://api.example.com/webhooks/sms"
          headers = {
            "X-Service" = "sms-service"
          }
        }
      ]
    }
    "analytics" = {
      endpoints = [
        {
          url = "https://analytics.example.com/ingest"
        }
      ]
    }
  }

  # QStash Scheduled Jobs
  qstash_schedules = {
    "daily-report" = {
      destination = "https://api.example.com/reports/daily"
      cron = "0 9 * * *"  # Daily at 9 AM
      headers = {
        "X-Report-Type" = "daily"
      }
    }
    "cleanup" = {
      destination = "https://api.example.com/cleanup"
      cron = "0 2 * * *"  # Daily at 2 AM
      body = jsonencode({
        retention_days = 30
        dry_run = false
      })
    }
  }

  # QStash URL Groups (fanout)
  qstash_url_groups = {
    "order-processing" = {
      endpoints = [
        { url = "https://inventory.example.com/update" },
        { url = "https://shipping.example.com/prepare" },
        { url = "https://billing.example.com/charge" },
        { url = "https://analytics.example.com/track" }
      ]
    }
  }

  # QStash DLQ Configuration
  qstash_dlq_config = {
    enabled = true
    max_receive_count = 3
    retention_days = 14
    webhook_url = "https://api.example.com/dlq/handler"
  }

  # Rate Limiting
  enable_ratelimit = true
  ratelimit_config = {
    algorithm = "sliding-window"
    # Uses Redis database if enabled
  }

  rate_limit_rules = {
    "api-default" = {
      limit  = 100
      window = "1m"
    }
    "api-authenticated" = {
      limit      = 1000
      window     = "1m"
      key_prefix = "auth"
    }
    "api-public" = {
      limit     = 10
      window    = "1m"
      anonymous = true
    }
    "uploads" = {
      limit  = 50
      window = "1h"
    }
    "expensive-operation" = {
      limit  = 5
      window = "5m"
    }
  }

  # Vector Database
  enable_vector = true
  vector_config = {
    name           = "myapp-embeddings"
    region         = "us-east-1"
    dimension      = 1536  # OpenAI embeddings
    metric         = "cosine"
    reserved_price = "pay-as-you-go"
  }

  vector_indexes = {
    "products" = {
      dimension = 384  # Sentence transformers
      metric    = "cosine"
      metadata_config = {
        indexed = ["category", "brand", "price"]
      }
    }
    "documents" = {
      dimension = 768  # BERT embeddings
      metric    = "dot-product"
    }
  }

  # Monitoring
  enable_monitoring = true
  monitoring_config = {
    email_alerts  = ["ops@example.com", "alerts@example.com"]
    slack_webhook = "https://hooks.slack.com/services/..."

    alert_thresholds = {
      cpu_percent         = 75
      memory_percent      = 80
      bandwidth_percent   = 85
      commands_per_second = 4500
    }
  }

  tags = {
    Environment = "production"
    Team        = "platform"
    CostCenter  = "engineering"
  }
}
```

### Rate Limiting Integration

```javascript
// Using @upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true
});

// In your API handler
const { success, limit, reset, remaining } = await ratelimit.limit(userId);

if (!success) {
  return new Response("Too Many Requests", { status: 429 });
}
```

### QStash Usage

```javascript
// Publishing messages
import { Client } from "@upstash/qstash";

const client = new Client({
  token: process.env.QSTASH_TOKEN
});

// Publish to a single endpoint
await client.publishJSON({
  url: "https://api.example.com/process",
  body: { orderId: "12345", action: "process" },
  retries: 3,
  delay: 10 // 10 seconds
});

// Publish to a topic (multiple endpoints)
await client.publishJSON({
  topic: "notifications",
  body: {
    userId: "user123",
    type: "order_shipped",
    orderId: "12345"
  }
});

// Publish to URL group (fanout)
await client.publishJSON({
  urlGroup: "order-processing",
  body: {
    orderId: "12345",
    customerId: "cust456",
    total: 99.99
  }
});

// Schedule a message
await client.schedules.create({
  destination: "https://api.example.com/reminder",
  cron: "0 9 * * MON-FRI",
  body: JSON.stringify({ type: "weekly_report" }),
  headers: {
    "Content-Type": "application/json"
  }
});

// Verify webhook signatures
import { Receiver } from "@upstash/qstash";

const receiver = new Receiver({
  signingKey: process.env.QSTASH_SIGNING_KEY
});

// In your webhook handler
export async function POST(request) {
  const signature = request.headers.get("upstash-signature");
  const body = await request.text();

  const isValid = await receiver.verify({
    signature,
    body
  });

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  // Process the message
  const data = JSON.parse(body);
  // ...
}
```

### Vector Database Usage

```javascript
import { Index } from '@upstash/vector';

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// Upsert vectors
await index.upsert([
  {
    id: 'product-1',
    vector: [0.1, 0.2, 0.3, ...], // 1536 dimensions
    metadata: { category: 'electronics', price: 99.99 }
  }
]);

// Query similar items
const results = await index.query({
  vector: [0.15, 0.25, 0.35, ...],
  topK: 10,
  includeMetadata: true,
  filter: 'category = "electronics" AND price < 200'
});
```

## Redis Regions

Available regions:

- `us-east-1` - N. Virginia
- `us-west-1` - N. California
- `us-west-2` - Oregon
- `us-central1` - Iowa
- `eu-west-1` - Ireland
- `eu-central-1` - Frankfurt
- `ap-southeast-1` - Singapore
- `ap-southeast-2` - Sydney
- `ap-northeast-1` - Tokyo
- `sa-east-1` - São Paulo

## Kafka Regions

Available regions:

- `us-east-1` - N. Virginia
- `eu-west-1` - Ireland
- `ap-northeast-1` - Tokyo

## Vector Metrics

- `cosine` - Cosine similarity (recommended for normalized vectors)
- `euclidean` - Euclidean distance
- `dot-product` - Dot product (for non-normalized vectors)

## Monitoring

The module outputs monitoring configuration that can be integrated with external
monitoring systems:

```hcl
# Use the monitoring config with your alerting system
output "upstash_alerts" {
  value = module.upstash.monitoring_config
}
```

## Cost Optimization

1. **Multi-zone**: Only enable for production
2. **Auto-scaling**: Monitor usage patterns first
3. **Persistence**: Disable for cache-only use cases
4. **Vector indexes**: Use appropriate dimensions
5. **Kafka retention**: Set based on actual needs

## Security Best Practices

1. **ACL Users**: Create specific users with minimal permissions
2. **TLS**: Always enabled by default
3. **IP Restrictions**: Configure in Upstash console
4. **Tokens**: Rotate regularly
5. **Monitoring**: Set up alerts for unusual activity

## Requirements

- Terraform >= 1.5.0
- Upstash provider ~> 1.0
- Upstash account with appropriate quotas

## Outputs

| Name                   | Description                            |
| ---------------------- | -------------------------------------- |
| redis_endpoint         | Redis connection endpoint              |
| redis_rest_url         | Redis REST API URL                     |
| kafka_rest_endpoint    | Kafka REST endpoint                    |
| vector_endpoint        | Vector database endpoint               |
| qstash_topics          | QStash topic configurations            |
| qstash_schedules       | QStash scheduled job configurations    |
| qstash_signing_key     | QStash webhook signing key (sensitive) |
| qstash_publisher_token | QStash publisher API token (sensitive) |
| redis_env_vars         | Environment variables for Redis        |
| kafka_env_vars         | Environment variables for Kafka        |
| qstash_env_vars        | Environment variables for QStash       |
| upstash_summary        | Complete resource summary              |
