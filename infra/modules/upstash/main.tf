# Upstash Module

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    upstash = {
      source  = "upstash/upstash"
      version = "~> 1.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

# Redis Database
resource "upstash_redis_database" "this" {
  count = var.enable_redis ? 1 : 0

  database_name = coalesce(var.redis_config.name, "${var.name_prefix}-redis")
  region        = var.redis_config.region
  multizone     = var.redis_config.multizone
  eviction      = var.redis_config.eviction
  auto_scale    = var.redis_config.auto_scale
  tls           = var.redis_config.tls
  persistence   = var.redis_config.persistence
  
  # Size limits
  max_request_size = var.redis_config.max_request_size
  max_memory_size  = var.redis_config.max_memory_size
  max_entry_size   = var.redis_config.max_entry_size
  max_daily_bandwidth = var.redis_config.max_daily_bandwidth
  max_commands_per_second = var.redis_config.max_commands_per_second
}

# Redis ACL Users
resource "random_password" "redis_user" {
  for_each = var.enable_redis ? var.redis_users : {}
  
  length  = 32
  special = true
}

resource "upstash_redis_database_user" "this" {
  for_each = var.enable_redis ? var.redis_users : {}

  database_id = upstash_redis_database.this[0].database_id
  username    = each.key
  
  # Commands
  commands = each.value.commands
  
  # Keys
  keys = each.value.keys
  
  # Channels
  channels = each.value.channels
  
  # Password
  passwords = length(each.value.passwords) > 0 ? each.value.passwords : [random_password.redis_user[each.key].result]
  
  # No password option
  no_pass = each.value.no_pass
}

# Kafka Cluster
resource "upstash_kafka_cluster" "this" {
  count = var.enable_kafka ? 1 : 0

  cluster_name = coalesce(var.kafka_config.name, "${var.name_prefix}-kafka")
  region       = var.kafka_config.region
  multizone    = var.kafka_config.multizone
  
  # Limits
  max_retention_size = var.kafka_config.max_retention_size
  max_retention_time = var.kafka_config.max_retention_time
  max_message_size   = var.kafka_config.max_message_size
  max_partitions     = var.kafka_config.max_partitions
  max_topics         = var.kafka_config.max_topics
}

# Kafka Topics
resource "upstash_kafka_topic" "this" {
  for_each = var.enable_kafka ? var.kafka_topics : {}

  cluster_id = upstash_kafka_cluster.this[0].cluster_id
  topic_name = each.key
  
  partitions       = each.value.partitions
  retention_time   = each.value.retention_time
  retention_size   = each.value.retention_size
  max_message_size = each.value.max_message_size
  cleanup_policy   = each.value.cleanup_policy
}

# Kafka Credentials
resource "upstash_kafka_credential" "producer" {
  count = var.enable_kafka ? 1 : 0

  cluster_id      = upstash_kafka_cluster.this[0].cluster_id
  credential_name = "${var.name_prefix}-producer"
  topic           = "*"
  permissions     = "PRODUCE"
}

resource "upstash_kafka_credential" "consumer" {
  count = var.enable_kafka ? 1 : 0

  cluster_id      = upstash_kafka_cluster.this[0].cluster_id
  credential_name = "${var.name_prefix}-consumer"
  topic           = "*"
  permissions     = "CONSUME"
}

# QStash Topics
resource "upstash_qstash_topic_v2" "this" {
  for_each = var.enable_qstash && var.qstash_config.enable_topics ? var.qstash_topics : {}

  name = "${var.name_prefix}-${each.key}"
  
  dynamic "endpoints" {
    for_each = each.value.endpoints
    content {
      url = endpoints.value.url
      
      dynamic "headers" {
        for_each = endpoints.value.headers
        content {
          key   = headers.key
          value = headers.value
        }
      }
      
      retry_count     = endpoints.value.retry != null ? endpoints.value.retry.count : 3
      retry_delay     = endpoints.value.retry != null ? endpoints.value.retry.delay : "10s"
      retry_max_delay = endpoints.value.retry != null ? endpoints.value.retry.max_delay : "1h"
    }
  }
}

# QStash Scheduled Jobs
resource "upstash_qstash_schedule_v2" "this" {
  for_each = var.enable_qstash && var.qstash_config.enable_schedules ? var.qstash_schedules : {}

  destination = each.value.destination
  cron        = each.value.cron
  body        = each.value.body
  
  dynamic "headers" {
    for_each = each.value.headers
    content {
      key   = headers.key
      value = headers.value
    }
  }
  
  callback         = each.value.callback
  failure_callback = each.value.failure_callback
  
  retry_count = each.value.retry != null ? each.value.retry.count : 3
  retry_delay = each.value.retry != null ? each.value.retry.delay : "60s"
  
  delay      = each.value.delay
  not_before = each.value.not_before
}

# QStash URL Groups for fanout messaging
resource "upstash_qstash_url_group" "this" {
  for_each = var.enable_qstash ? var.qstash_url_groups : {}

  name = "${var.name_prefix}-${each.key}"
  
  dynamic "endpoints" {
    for_each = each.value.endpoints
    content {
      url = endpoints.value.url
      
      dynamic "headers" {
        for_each = endpoints.value.headers
        content {
          key   = headers.key
          value = headers.value
        }
      }
    }
  }
}

# QStash Dead Letter Queue configuration
locals {
  qstash_dlq_enabled = var.enable_qstash && var.qstash_config.enable_dlq && var.qstash_dlq_config.enabled
  
  # DLQ topic for failed messages
  dlq_topic_name = local.qstash_dlq_enabled ? "${var.name_prefix}-dlq" : null
}

resource "upstash_qstash_topic_v2" "dlq" {
  count = local.qstash_dlq_enabled ? 1 : 0

  name = local.dlq_topic_name
  
  endpoints {
    url = var.qstash_dlq_config.webhook_url != null ? var.qstash_dlq_config.webhook_url : "https://webhook.site/dlq-placeholder"
    
    headers {
      key   = "X-DLQ-Topic"
      value = local.dlq_topic_name
    }
    
    retry_count = 0  # No retries for DLQ
  }
}

# QStash signing keys for webhook verification
resource "upstash_qstash_signing_key" "this" {
  count = var.enable_qstash ? 1 : 0
}

# Generate API tokens for different use cases
resource "upstash_qstash_token" "publisher" {
  count = var.enable_qstash ? 1 : 0

  name = "${var.name_prefix}-publisher"
}

resource "upstash_qstash_token" "consumer" {
  count = var.enable_qstash ? 1 : 0

  name = "${var.name_prefix}-consumer"
}

# Rate Limiting (uses Redis)
locals {
  ratelimit_database_id = var.enable_ratelimit ? (
    var.ratelimit_config.database_id != null ? var.ratelimit_config.database_id : (
      var.enable_redis ? upstash_redis_database.this[0].database_id : null
    )
  ) : null
}

# Generate rate limit keys
resource "random_id" "ratelimit_keys" {
  for_each = var.enable_ratelimit ? var.rate_limit_rules : {}
  
  byte_length = 8
  prefix      = each.value.key_prefix != null ? each.value.key_prefix : each.key
}

# Vector Database
resource "upstash_vector_index" "this" {
  count = var.enable_vector ? 1 : 0

  name      = coalesce(var.vector_config.name, "${var.name_prefix}-vector")
  region    = var.vector_config.region
  dimension = var.vector_config.dimension
  metric    = var.vector_config.metric
  type      = var.vector_config.reserved_price
}

# Additional Vector Indexes
resource "upstash_vector_index" "additional" {
  for_each = var.enable_vector ? var.vector_indexes : {}

  name      = "${var.name_prefix}-${each.key}"
  region    = var.vector_config.region
  dimension = each.value.dimension
  metric    = each.value.metric
  type      = var.vector_config.reserved_price
  
  # Metadata configuration
  dynamic "metadata_config" {
    for_each = each.value.metadata_config != null ? [each.value.metadata_config] : []
    content {
      indexed = metadata_config.value.indexed
    }
  }
}

# Monitoring Alert Configuration (as data for external monitoring)
locals {
  monitoring_config = var.enable_monitoring ? {
    redis = var.enable_redis ? {
      database_id = upstash_redis_database.this[0].database_id
      endpoint    = upstash_redis_database.this[0].endpoint
      thresholds  = var.monitoring_config.alert_thresholds
    } : null
    
    kafka = var.enable_kafka ? {
      cluster_id = upstash_kafka_cluster.this[0].cluster_id
      endpoint   = upstash_kafka_cluster.this[0].rest_endpoint
      thresholds = var.monitoring_config.alert_thresholds
    } : null
    
    vector = var.enable_vector ? {
      index_id = upstash_vector_index.this[0].id
      endpoint = upstash_vector_index.this[0].endpoint
    } : null
    
    notifications = {
      emails = var.monitoring_config.email_alerts
      slack  = var.monitoring_config.slack_webhook
    }
  } : null
}

# Team Management
data "upstash_team" "this" {
  count = var.team_id != "" ? 1 : 0
  
  team_id = var.team_id
}

# Resource tagging (stored as outputs for reference)
locals {
  resource_tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "upstash"
  })
}