# Enhanced Monitoring Service

Complete observability stack with **RUM (Real User Monitoring)**, **System Metrics**, and
**Synthetic Monitoring**.

## 🚀 What's Included

### ✅ **Core Stack** (Always Active)

- **Grafana** - Dashboards and visualization (port 3000)
- **Prometheus** - Metrics collection and storage (port 9090)
- **Loki** - Log aggregation (port 3100)
- **Promtail** - Log collection agent (port 9080)
- **AlertManager** - Alert handling (port 9093)

### ✅ **System Monitoring** (Always Active)

- **Node Exporter** - Host system metrics (port 9100)
- **cAdvisor** - Container metrics (port 8080)

### ✅ **Synthetic Monitoring** (Always Active)

- **Blackbox Exporter** - Endpoint monitoring (port 9115)

### ✅ **RUM & APM** (Always Active)

- **RUM Collector** - Real user monitoring (port 12347)
- **OpenTelemetry Collector** - Advanced telemetry (ports 4317, 4318, 8889)

### 🔧 **Optional Services** (Profile-based)

- **Postgres Exporter** - Database metrics (port 9187)
- **Redis Exporter** - Redis metrics (port 9121)
- **Synthetic Monitoring Agent** - Advanced synthetic checks (port 4031)
- **Pyroscope** - Continuous profiling (port 4040)

## 🎯 Key Features Added

### 1. **Real User Monitoring (RUM)**

- **Frontend Performance**: Page load times, Core Web Vitals
- **User Experience**: Error tracking, user sessions
- **Browser Analytics**: Device, browser, location data
- **Custom Events**: Business metric tracking

### 2. **System Metrics** (Node Exporter)

- **CPU Usage**: Per-core utilization, load averages
- **Memory**: Usage, swap, buffers/cache
- **Disk I/O**: Read/write operations, latency
- **Network**: Interface statistics, connections
- **Filesystem**: Usage, inodes

### 3. **Synthetic Monitoring** (Blackbox Exporter)

- **Health Checks**: All service endpoints
- **Performance Tests**: Response time monitoring
- **SSL Certificate**: Expiry monitoring
- **API Availability**: POST/GET endpoint checks
- **DNS Resolution**: Domain name checks

## 🚀 Quick Start

### Basic Stack (Core + System + Synthetic + RUM)

```bash
cd services/monitoring
docker-compose up -d
```

### With Database Monitoring

```bash
docker-compose --profile postgres up -d
```

### With Redis Monitoring

```bash
docker-compose --profile redis up -d
```

### With Advanced Synthetic Monitoring

```bash
docker-compose --profile synthetic up -d
```

### With Performance Profiling

```bash
docker-compose --profile profiling up -d
```

### Full Stack (Everything)

```bash
docker-compose --profile postgres --profile redis --profile synthetic --profile profiling --profile otel up -d
```

## 📊 Dashboards & Metrics

### **System Metrics Dashboard**

- CPU utilization across all cores
- Memory usage (RAM, swap, buffers)
- Disk I/O and filesystem usage
- Network interface statistics
- Container resource usage

### **Service Health Dashboard**

- Uptime monitoring for all services
- Response time trends
- Error rate tracking
- SSL certificate expiry alerts
- Service dependency mapping

### **RUM Dashboard**

- Page load performance
- User session analytics
- Error tracking and debugging
- Geographic user distribution
- Device and browser analytics

### **Performance Dashboard**

- Application response times
- Database query performance
- Cache hit/miss ratios
- Queue processing times
- Custom business metrics

## 🔍 What Each Service Monitors

### **OpenGrep Service**

- Code analysis job queue
- Repository scan performance
- Semgrep engine metrics
- API response times

### **TryComp Service**

- AI API call latency
- Code comparison processing
- OpenAI/Anthropic usage
- Request success rates

### **Camoufox Service**

- Browser session management
- Stealth detection success
- Resource usage per session
- Automation performance

### **Firecrawl Service**

- Web scraping job queue
- Page processing times
- Redis queue metrics
- Crawler success rates

### **NextFaster Service**

- E-commerce performance
- Database query times
- User session tracking
- Order processing metrics

### **Postiz Service**

- Social media post queue
- Platform API latencies
- Scheduled post execution
- User engagement metrics

### **Browserless Service**

- Browser pool management
- Session cleanup metrics
- Resource utilization
- Concurrent session limits

### **ActivePieces Service**

- Workflow execution times
- Integration success rates
- Queue processing metrics
- User workflow analytics

### **Dub Service**

- Link shortening performance
- Click tracking analytics
- Database query metrics
- Geographic click data

## 🔔 Alerting Rules

### **Critical Alerts**

- Service down (> 1 minute)
- High error rate (> 5% for 5 minutes)
- Disk space critical (> 90%)
- Memory usage critical (> 95%)
- SSL certificate expiring (< 7 days)

### **Warning Alerts**

- High response time (> 2 seconds for 5 minutes)
- Disk space warning (> 80%)
- Memory usage warning (> 85%)
- High CPU usage (> 80% for 10 minutes)
- SSL certificate expiring (< 30 days)

### **RUM Alerts**

- Page load time degradation
- Error rate spike in frontend
- User session drop-off
- Performance regression

## 🌐 Integration with Frontend

### **Add RUM to Your Services**

#### 1. Install Grafana Faro SDK

```bash
npm install @grafana/faro-web-sdk
```

#### 2. Initialize in Your App

```typescript
import { initializeFaro } from '@grafana/faro-web-sdk';

// Initialize Faro for RUM
initializeFaro({
  url: 'https://your-monitoring.railway.app:12347/collect',
  app: {
    name: 'your-service-name',
    version: '1.0.0',
    environment: 'production',
  },
  sessionTracking: {
    enabled: true,
    persistent: true,
  },
  instrumentations: [
    // Automatic instrumentation
    new TracingInstrumentation(),
    new FetchInstrumentation(),
    new PerformanceInstrumentation(),
    new WebVitalsInstrumentation(),
  ],
});
```

#### 3. Custom Event Tracking

```typescript
import { faro } from '@grafana/faro-web-sdk';

// Track custom events
faro.api.pushEvent('user_action', {
  action: 'button_click',
  component: 'header',
  value: 'signup',
});

// Track errors
faro.api.pushError(new Error('Custom error message'));

// Track performance
faro.api.pushMeasurement({
  type: 'custom_performance',
  values: {
    api_response_time: 150,
    database_query_time: 50,
  },
});
```

## 🔧 Configuration Examples

### **Service-Specific Blackbox Probes**

```yaml
# config/blackbox/blackbox.yml
modules:
  opengrep_health:
    prober: http
    timeout: 15s
    http:
      method: GET
      valid_status_codes: [200]
      headers:
        User-Agent: 'Synthetic-Monitor-OpenGrep'
```

### **Custom Prometheus Rules**

```yaml
# config/prometheus/alert_rules.yml
groups:
  - name: service_health
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: 'Service {{ $labels.instance }} is down'
```

### **Grafana Dashboard Variables**

```json
{
  "templating": {
    "list": [
      {
        "name": "service",
        "type": "query",
        "query": "label_values(up, job)",
        "refresh": 1
      }
    ]
  }
}
```

## 📈 Performance Optimization

### **Resource Requirements**

- **Minimum**: 4GB RAM, 2 vCPU
- **Recommended**: 8GB RAM, 4 vCPU
- **Storage**: 50GB for 30-day retention

### **Scaling Considerations**

- **High Traffic**: Increase Prometheus retention and storage
- **Many Services**: Use Prometheus federation
- **Global Monitoring**: Deploy multiple instances per region

### **Cost Optimization**

- Use Railway sleep mode for non-critical environments
- Adjust scrape intervals based on criticality
- Configure data retention policies
- Use recording rules for expensive queries

## 🔒 Security & Access

### **Access Control**

- Grafana admin credentials in environment variables
- Prometheus metrics authentication
- Network isolation between services
- CORS configuration for RUM endpoints

### **Data Privacy**

- RUM data anonymization options
- Configurable data retention
- GDPR-compliant user tracking
- Secure credential management

## 🚨 Troubleshooting

### **Common Issues**

#### RUM Not Collecting Data

```bash
# Check RUM collector logs
docker-compose logs rum-collector

# Verify endpoint accessibility
curl http://localhost:12347/health

# Check CORS configuration
curl -H "Origin: https://your-app.com" http://localhost:12347/collect
```

#### Node Exporter Permission Issues

```bash
# Ensure proper volume mounts
docker-compose logs node-exporter

# Check host filesystem access
docker exec -it node-exporter ls -la /host/proc
```

#### Blackbox Probes Failing

```bash
# Test probe manually
curl "http://localhost:9115/probe?module=http_2xx&target=https://example.com"

# Check blackbox configuration
docker-compose logs blackbox-exporter
```

## 📚 Additional Resources

- **Grafana Dashboards**: https://grafana.com/grafana/dashboards/
- **Prometheus Exporters**: https://prometheus.io/docs/instrumenting/exporters/
- **Grafana Faro SDK**: https://grafana.com/docs/grafana-cloud/faro-web-sdk/
- **Blackbox Exporter**: https://github.com/prometheus/blackbox_exporter
- **Node Exporter**: https://github.com/prometheus/node_exporter

## 🎯 Next Steps

1. **Deploy the enhanced monitoring stack**
2. **Configure service-specific health checks**
3. **Set up custom dashboards for your business metrics**
4. **Integrate RUM into your frontend applications**
5. **Configure alerting for critical services**
6. **Set up automated reporting and notifications**

---

**Ready to monitor everything?** Your services will be fully observable with system metrics,
synthetic monitoring, and real user analytics! 🚀
