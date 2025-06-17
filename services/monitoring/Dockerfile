# Monitoring Stack - Grafana, Prometheus, Loki, etc.
FROM alpine:3.20

# Install system dependencies
RUN apk add --no-cache \
    docker \
    docker-compose \
    nodejs \
    npm \
    curl \
    bash \
    supervisor \
    redis

# Install Node.js 22
RUN apk add --no-cache nodejs=~22 npm=~10

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code and configuration
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY docker-compose.yaml ./
COPY config/ ./config/

# Build TypeScript
RUN npm run build || echo "No build script found"

# Create configuration directories
RUN mkdir -p /app/monitoring-data \
    /app/config/prometheus \
    /app/config/grafana \
    /app/config/loki \
    /app/config/promtail \
    /app/config/alertmanager

# Create supervisor configuration for multi-service management
COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
user=root

[program:redis]
command=redis-server
autostart=true
autorestart=true
stderr_logfile=/var/log/redis.err.log
stdout_logfile=/var/log/redis.out.log

[program:prometheus]
command=docker run --rm --network host -v /app/config/prometheus:/etc/prometheus -v prometheus_data:/prometheus prom/prometheus:v2.54.1 --config.file=/etc/prometheus/prometheus.yml --storage.tsdb.path=/prometheus --web.enable-lifecycle
autostart=true
autorestart=true
stderr_logfile=/var/log/prometheus.err.log
stdout_logfile=/var/log/prometheus.out.log

[program:grafana]
command=docker run --rm --network host -v grafana_data:/var/lib/grafana -v /app/config/grafana:/etc/grafana grafana/grafana:11.4.0
autostart=true
autorestart=true
stderr_logfile=/var/log/grafana.err.log
stdout_logfile=/var/log/grafana.out.log
environment=GF_SECURITY_ADMIN_USER=admin,GF_SECURITY_ADMIN_PASSWORD=admin

[program:loki]
command=docker run --rm --network host -v loki_data:/loki -v /app/config/loki:/etc/loki grafana/loki:3.3.1 -config.file=/etc/loki/loki.yml
autostart=true
autorestart=true
stderr_logfile=/var/log/loki.err.log
stdout_logfile=/var/log/loki.out.log

[program:monitoring-api]
command=npm start
directory=/app
autostart=true
autorestart=true
stderr_logfile=/var/log/monitoring.err.log
stdout_logfile=/var/log/monitoring.out.log
user=root
EOF

# Create non-root user
RUN addgroup -g 1001 -S monitoring && \
    adduser -S monitoring -u 1001 -G monitoring

# Change ownership of app directory
RUN chown -R monitoring:monitoring /app

# Expose ports for all services
EXPOSE 3000 3100 9090 9080 9093 9100 8080

# Health check for Grafana
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start with supervisor to manage all services
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]