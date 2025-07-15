# Upstash Module Outputs

# Redis Outputs
output "redis_enabled" {
  description = "Whether Redis is enabled"
  value       = var.enable_redis
}

output "redis_database_id" {
  description = "Redis database ID"
  value       = var.enable_redis ? upstash_redis_database.this[0].database_id : null
}

output "redis_endpoint" {
  description = "Redis endpoint URL"
  value       = var.enable_redis ? upstash_redis_database.this[0].endpoint : null
}

output "redis_rest_url" {
  description = "Redis REST API URL"
  value       = var.enable_redis ? upstash_redis_database.this[0].rest_url : null
}

output "redis_port" {
  description = "Redis port"
  value       = var.enable_redis ? upstash_redis_database.this[0].port : null
}

output "redis_password" {
  description = "Redis password"
  value       = var.enable_redis ? upstash_redis_database.this[0].password : null
  sensitive   = true
}

output "redis_rest_token" {
  description = "Redis REST API token"
  value       = var.enable_redis ? upstash_redis_database.this[0].rest_token : null
  sensitive   = true
}

output "redis_read_only_rest_token" {
  description = "Redis read-only REST API token"
  value       = var.enable_redis ? upstash_redis_database.this[0].read_only_rest_token : null
  sensitive   = true
}

output "redis_users" {
  description = "Redis ACL users"
  value = var.enable_redis ? {
    for k, v in upstash_redis_database_user.this : k => {
      username = v.username
      commands = v.commands
      keys     = v.keys
    }
  } : {}
}

output "redis_connection_string" {
  description = "Redis connection string"
  value       = var.enable_redis ? "rediss://default:${upstash_redis_database.this[0].password}@${upstash_redis_database.this[0].endpoint}:${upstash_redis_database.this[0].port}" : null
  sensitive   = true
}

# Kafka Outputs
output "kafka_enabled" {
  description = "Whether Kafka is enabled"
  value       = var.enable_kafka
}

output "kafka_cluster_id" {
  description = "Kafka cluster ID"
  value       = var.enable_kafka ? upstash_kafka_cluster.this[0].cluster_id : null
}

output "kafka_rest_endpoint" {
  description = "Kafka REST endpoint"
  value       = var.enable_kafka ? upstash_kafka_cluster.this[0].rest_endpoint : null
}

output "kafka_tcp_endpoint" {
  description = "Kafka TCP endpoint"
  value       = var.enable_kafka ? upstash_kafka_cluster.this[0].tcp_endpoint : null
}

output "kafka_topics" {
  description = "Kafka topics"
  value = var.enable_kafka ? {
    for k, v in upstash_kafka_topic.this : k => {
      id              = v.topic_id
      name            = v.topic_name
      partitions      = v.partitions
      retention_time  = v.retention_time
      retention_size  = v.retention_size
    }
  } : {}
}

output "kafka_producer_credentials" {
  description = "Kafka producer credentials"
  value = var.enable_kafka ? {
    username = upstash_kafka_credential.producer[0].username
    password = upstash_kafka_credential.producer[0].password
  } : null
  sensitive = true
}

output "kafka_consumer_credentials" {
  description = "Kafka consumer credentials"
  value = var.enable_kafka ? {
    username = upstash_kafka_credential.consumer[0].username
    password = upstash_kafka_credential.consumer[0].password
  } : null
  sensitive = true
}

# QStash Outputs
output "qstash_enabled" {
  description = "Whether QStash is enabled"
  value       = var.enable_qstash
}

output "qstash_topics" {
  description = "QStash topics"
  value = var.enable_qstash ? {
    for k, v in upstash_qstash_topic_v2.this : k => {
      name      = v.name
      endpoints = length(v.endpoints)
    }
  } : {}
}

output "qstash_schedules" {
  description = "QStash scheduled jobs"
  value = var.enable_qstash ? {
    for k, v in upstash_qstash_schedule_v2.this : k => {
      destination = v.destination
      cron        = v.cron
    }
  } : {}
}

output "qstash_url_groups" {
  description = "QStash URL groups"
  value = var.enable_qstash ? {
    for k, v in upstash_qstash_url_group.this : k => {
      name      = v.name
      endpoints = length(v.endpoints)
    }
  } : {}
}

output "qstash_dlq_topic" {
  description = "QStash dead letter queue topic"
  value = local.qstash_dlq_enabled ? {
    name = upstash_qstash_topic_v2.dlq[0].name
  } : null
}

output "qstash_signing_key" {
  description = "QStash signing key for webhook verification"
  value       = var.enable_qstash ? upstash_qstash_signing_key.this[0].signing_key : null
  sensitive   = true
}

output "qstash_signing_key_id" {
  description = "QStash signing key ID"
  value       = var.enable_qstash ? upstash_qstash_signing_key.this[0].signing_key_id : null
}

output "qstash_publisher_token" {
  description = "QStash publisher API token"
  value       = var.enable_qstash ? upstash_qstash_token.publisher[0].token : null
  sensitive   = true
}

output "qstash_consumer_token" {
  description = "QStash consumer API token"
  value       = var.enable_qstash ? upstash_qstash_token.consumer[0].token : null
  sensitive   = true
}

# Rate Limiting Outputs
output "ratelimit_enabled" {
  description = "Whether rate limiting is enabled"
  value       = var.enable_ratelimit
}

output "ratelimit_database_id" {
  description = "Database ID used for rate limiting"
  value       = local.ratelimit_database_id
}

output "ratelimit_rules" {
  description = "Rate limiting rules"
  value = var.enable_ratelimit ? {
    for k, v in var.rate_limit_rules : k => {
      limit      = v.limit
      window     = v.window
      key_prefix = random_id.ratelimit_keys[k].hex
    }
  } : {}
}

# Vector Database Outputs
output "vector_enabled" {
  description = "Whether Vector database is enabled"
  value       = var.enable_vector
}

output "vector_index" {
  description = "Primary vector index"
  value = var.enable_vector ? {
    id        = upstash_vector_index.this[0].id
    name      = upstash_vector_index.this[0].name
    endpoint  = upstash_vector_index.this[0].endpoint
    dimension = upstash_vector_index.this[0].dimension
    metric    = upstash_vector_index.this[0].metric
  } : null
}

output "vector_token" {
  description = "Vector database token"
  value       = var.enable_vector ? upstash_vector_index.this[0].token : null
  sensitive   = true
}

output "vector_read_only_token" {
  description = "Vector database read-only token"
  value       = var.enable_vector ? upstash_vector_index.this[0].read_only_token : null
  sensitive   = true
}

output "vector_additional_indexes" {
  description = "Additional vector indexes"
  value = var.enable_vector ? {
    for k, v in upstash_vector_index.additional : k => {
      id        = v.id
      name      = v.name
      endpoint  = v.endpoint
      dimension = v.dimension
      metric    = v.metric
    }
  } : {}
}

# Monitoring Outputs
output "monitoring_enabled" {
  description = "Whether monitoring is enabled"
  value       = var.enable_monitoring
}

output "monitoring_config" {
  description = "Monitoring configuration for external systems"
  value       = local.monitoring_config
}

# Summary Output
output "upstash_summary" {
  description = "Summary of Upstash resources"
  value = {
    environment = var.environment
    services = {
      redis = {
        enabled    = var.enable_redis
        multizone  = var.enable_redis ? var.redis_config.multizone : false
        region     = var.enable_redis ? var.redis_config.region : null
        users      = var.enable_redis ? length(var.redis_users) : 0
      }
      kafka = {
        enabled   = var.enable_kafka
        multizone = var.enable_kafka ? var.kafka_config.multizone : false
        region    = var.enable_kafka ? var.kafka_config.region : null
        topics    = var.enable_kafka ? length(var.kafka_topics) : 0
      }
      qstash = {
        enabled   = var.enable_qstash
        topics    = var.enable_qstash ? length(var.qstash_topics) : 0
        schedules = var.enable_qstash ? length(var.qstash_schedules) : 0
        url_groups = var.enable_qstash ? length(var.qstash_url_groups) : 0
        dlq_enabled = local.qstash_dlq_enabled
      }
      ratelimit = {
        enabled = var.enable_ratelimit
        rules   = var.enable_ratelimit ? length(var.rate_limit_rules) : 0
      }
      vector = {
        enabled   = var.enable_vector
        indexes   = var.enable_vector ? 1 + length(var.vector_indexes) : 0
        dimension = var.enable_vector ? var.vector_config.dimension : 0
      }
    }
    monitoring = {
      enabled = var.enable_monitoring
      alerts  = var.enable_monitoring ? length(var.monitoring_config.email_alerts) : 0
    }
  }
}

# Helper outputs for application configuration
output "redis_env_vars" {
  description = "Environment variables for Redis connection"
  value = var.enable_redis ? {
    UPSTASH_REDIS_REST_URL   = upstash_redis_database.this[0].rest_url
    UPSTASH_REDIS_REST_TOKEN = upstash_redis_database.this[0].rest_token
    REDIS_URL                = "rediss://default:${upstash_redis_database.this[0].password}@${upstash_redis_database.this[0].endpoint}:${upstash_redis_database.this[0].port}"
  } : {}
  sensitive = true
}

output "kafka_env_vars" {
  description = "Environment variables for Kafka connection"
  value = var.enable_kafka ? {
    UPSTASH_KAFKA_REST_URL      = upstash_kafka_cluster.this[0].rest_endpoint
    UPSTASH_KAFKA_REST_USERNAME = upstash_kafka_credential.producer[0].username
    UPSTASH_KAFKA_REST_PASSWORD = upstash_kafka_credential.producer[0].password
  } : {}
  sensitive = true
}

output "qstash_env_vars" {
  description = "Environment variables for QStash connection"
  value = var.enable_qstash ? {
    QSTASH_TOKEN       = upstash_qstash_token.publisher[0].token
    QSTASH_SIGNING_KEY = upstash_qstash_signing_key.this[0].signing_key
    QSTASH_URL         = "https://qstash.upstash.io"
  } : {}
  sensitive = true
}