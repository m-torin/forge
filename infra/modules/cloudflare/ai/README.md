# Cloudflare AI Module

This module provides comprehensive AI capabilities including AI Gateway, Workers
AI, and Vectorize for building AI-powered applications.

## Features

- **AI Gateway**: Unified API for multiple AI providers with caching and rate
  limiting
- **Workers AI**: Run AI models directly on Cloudflare's edge network
- **Vectorize**: Vector database for semantic search and RAG applications
- **Cost Controls**: Budget limits and monitoring
- **Compliance**: PII detection, content filtering, and audit logging
- **Analytics**: Usage tracking and cost analysis

## Usage

### Basic AI Gateway Configuration

```hcl
module "ai" {
  source = "./modules/cloudflare/ai"

  account_id = var.cloudflare_account_id
  zone_id    = module.zone.zone_id

  enable_ai_gateway = true

  ai_gateway_config = {
    name             = "my-ai-gateway"
    enable_caching   = true
    cache_ttl        = 3600  # 1 hour

    rate_limiting = {
      requests_per_minute = 100
      requests_per_hour   = 1000
      requests_per_day    = 10000
    }
  }

  ai_gateway_routes = {
    "openai-chat" = {
      pattern  = "/chat/*"
      target   = "https://api.openai.com"
      provider = "openai"
      model    = "gpt-3.5-turbo"
    }
  }
}
```

### Complete AI Platform Configuration

```hcl
module "ai" {
  source = "./modules/cloudflare/ai"

  account_id = var.cloudflare_account_id
  zone_id    = module.zone.zone_id

  # AI Gateway Configuration
  enable_ai_gateway = true

  ai_gateway_config = {
    name        = "enterprise-ai-gateway"
    description = "Enterprise AI Gateway with multi-provider support"

    # Caching
    enable_caching    = true
    cache_ttl         = 7200  # 2 hours
    cache_by_headers  = ["X-User-ID", "X-Session-ID"]

    # Rate Limiting
    rate_limiting = {
      requests_per_minute = 500
      requests_per_hour   = 10000
      requests_per_day    = 100000
    }

    # Logging
    enable_logging = true
    log_sampling   = 0.1  # Log 10% of requests

    # Cost Control
    max_cost_per_request = 0.50
    max_cost_per_day     = 1000

    # Request Settings
    request_timeout_ms = 60000  # 60 seconds
    max_retries        = 3

    # Providers
    allowed_providers = ["openai", "anthropic", "workers-ai", "hugging-face"]
    fallback_provider = "workers-ai"
  }

  # AI Gateway Routes
  ai_gateway_routes = {
    "chat-completions" = {
      pattern  = "/v1/chat/completions"
      target   = "https://api.openai.com"
      provider = "openai"

      cache_override = {
        enabled = true
        ttl     = 3600
      }
    }

    "embeddings" = {
      pattern  = "/v1/embeddings"
      target   = "https://api.openai.com"
      provider = "openai"
      model    = "text-embedding-ada-002"

      rate_limit_override = {
        requests_per_minute = 1000
      }
    }

    "anthropic-claude" = {
      pattern  = "/anthropic/*"
      target   = "https://api.anthropic.com"
      provider = "anthropic"

      request_transform = {
        headers = {
          "anthropic-version" = "2023-06-01"
        }
      }
    }

    "workers-ai-fallback" = {
      pattern  = "/workers-ai/*"
      target   = "https://api.cloudflare.com/client/v4/accounts/${var.account_id}/ai/run"
      provider = "workers-ai"
    }
  }

  # Workers AI Models
  enable_workers_ai = true

  workers_ai_models = {
    "llama-2-chat" = {
      model_id    = "@cf/meta/llama-2-7b-chat-int8"
      type        = "text-generation"
      description = "Llama 2 7B Chat model"

      max_tokens  = 2048
      temperature = 0.7
    }

    "code-llama" = {
      model_id = "@cf/meta/codellama-7b-instruct"
      type     = "text-generation"

      max_tokens  = 4096
      temperature = 0.2
    }

    "embeddings" = {
      model_id = "@cf/baai/bge-base-en-v1.5"
      type     = "text-embeddings"
    }

    "whisper" = {
      model_id = "@cf/openai/whisper"
      type     = "speech-to-text"
    }
  }

  # Vectorize Configuration
  enable_vectorize = true

  vectorize_indexes = {
    "knowledge-base" = {
      dimensions  = 1536  # OpenAI embeddings
      metric      = "cosine"
      description = "Company knowledge base vectors"

      metadata_schema = {
        "document_id" = {
          type       = "string"
          indexed    = true
          filterable = true
        }
        "category" = {
          type       = "string"
          indexed    = true
          filterable = true
        }
        "created_at" = {
          type       = "number"
          indexed    = true
          filterable = true
        }
        "author" = {
          type       = "string"
          filterable = true
        }
      }

      max_vectors = 1000000

      data_source = {
        type   = "r2"
        source = "knowledge-documents"
        prefix = "processed/"
      }
    }

    "user-preferences" = {
      dimensions = 384  # Sentence transformers
      metric     = "euclidean"

      metadata_schema = {
        "user_id" = {
          type       = "string"
          indexed    = true
          filterable = true
        }
        "preference_type" = {
          type       = "string"
          filterable = true
        }
      }
    }
  }

  # AI Workers
  ai_workers = {
    "rag-assistant" = {
      script_name = "rag-assistant"
      script_content = file("${path.module}/workers/rag-assistant.js")
      routes = [
        "api.example.com/ai/assistant/*",
        "api.example.com/ai/search/*"
      ]

      ai_binding = {
        name = "AI"
      }

      vectorize_bindings = {
        "KNOWLEDGE" = {
          index_name = "knowledge-base"
        }
      }

      environment_variables = {
        SIMILARITY_THRESHOLD = "0.7"
        MAX_RESULTS          = "10"
        SYSTEM_PROMPT        = "You are a helpful AI assistant with access to company knowledge."
      }

      kv_namespaces = ["assistant-cache", "user-sessions"]
    }

    "content-moderator" = {
      script_name = "content-moderator"
      script_path = "${path.module}/workers/moderator.js"
      routes = ["api.example.com/moderate/*"]

      ai_binding = {}

      environment_variables = {
        MODERATION_THRESHOLD = "0.8"
      }
    }
  }

  # Analytics Configuration
  enable_ai_analytics = true

  ai_analytics_config = {
    track_costs       = true
    track_latency     = true
    track_errors      = true
    track_model_usage = true

    logpush_destination = "s3://my-bucket/ai-logs?region=us-east-1"
    logpush_dataset     = "ai_gateway_logs"
  }

  # Cost Controls
  ai_cost_controls = {
    monthly_budget      = 10000
    daily_budget        = 500
    alert_threshold_pct = 80
    auto_disable        = false

    model_limits = {
      "gpt-4" = {
        max_requests_per_day = 1000
        max_cost_per_day     = 200
      }
      "gpt-3.5-turbo" = {
        max_requests_per_day = 10000
        max_cost_per_day     = 100
      }
    }
  }

  # Compliance Settings
  ai_compliance = {
    data_residency = "US"
    pii_detection  = true
    pii_redaction  = true

    content_filtering = {
      enabled            = true
      filter_hate_speech = true
      filter_violence    = true
      filter_sexual      = true
      filter_self_harm   = true
    }

    audit_logging = {
      enabled        = true
      log_prompts    = false  # Privacy consideration
      log_responses  = false
      retention_days = 90
    }
  }

  # Model Marketplace
  model_marketplace_access = {
    enabled          = true
    allowed_models   = ["stable-diffusion", "whisper", "bert-base"]
    blocked_models   = ["uncensored-*"]
    require_approval = true
  }
}
```

### RAG (Retrieval-Augmented Generation) Example

```javascript
// workers/rag-assistant.js
export default {
  async fetch(request, env, ctx) {
    const { query } = await request.json();

    // Generate embedding for the query
    const embedding = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: [query]
    });

    // Search for similar documents
    const results = await env.KNOWLEDGE.query(embedding.data[0], {
      topK: 5,
      returnMetadata: true,
      filter: { category: "documentation" }
    });

    // Build context from results
    const context = results.matches
      .map((match) => match.metadata.text)
      .join("

");

    // Generate response using context
    const response = await env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
      messages: [
        {
          role: "system",
          content: `${env.SYSTEM_PROMPT}

Context:
${context}`
        },
        {
          role: "user",
          content: query
        }
      ],
      max_tokens: 1000
    });

    return new Response(
      JSON.stringify({
        answer: response.response,
        sources: results.matches.map((m) => ({
          id: m.metadata.document_id,
          score: m.score
        }))
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
```

## AI Gateway Providers

Supported providers:

- **OpenAI**: GPT models, DALL-E, Whisper
- **Anthropic**: Claude models
- **Workers AI**: Cloudflare's edge AI models
- **Hugging Face**: Open source models
- **Azure OpenAI**: Enterprise Azure deployments
- **Google AI**: PaLM, Gemini models

## Workers AI Models

Available model categories:

- **Text Generation**: Llama 2, Code Llama, Mistral
- **Text Embeddings**: BGE, E5 models
- **Image Generation**: Stable Diffusion
- **Speech to Text**: Whisper
- **Text Classification**: BERT, DistilBERT
- **Translation**: M2M100

## Vectorize Use Cases

1. **Semantic Search**: Find similar documents
2. **Recommendation Systems**: User preferences
3. **RAG Applications**: Context retrieval
4. **Duplicate Detection**: Content deduplication
5. **Clustering**: Group similar items

## Cost Optimization

1. **Caching**: Enable for repeated queries
2. **Model Selection**: Use appropriate models for tasks
3. **Batch Processing**: Group similar requests
4. **Rate Limiting**: Prevent runaway costs
5. **Monitoring**: Track usage patterns

## Security & Compliance

1. **PII Detection**: Automatic scanning
2. **Content Filtering**: Block inappropriate content
3. **Audit Logging**: Track all AI usage
4. **Data Residency**: Region restrictions
5. **Access Control**: API key management

## Requirements

- Terraform >= 1.5.0
- Cloudflare provider ~> 5.0
- Appropriate Cloudflare plan for AI features
- API keys for external providers (if used)

## Outputs

| Name                | Description                       |
| ------------------- | --------------------------------- |
| ai_gateway_endpoint | AI Gateway API endpoint           |
| vectorize_indexes   | Vector database configurations    |
| ai_workers          | Deployed AI workers               |
| ai_summary          | Complete AI configuration summary |
