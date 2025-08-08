#!/usr/bin/env node

/**
 * Production server for Comprehensive AI Agent Platform
 *
 * This server provides REST API endpoints for the comprehensive AI agent
 * platform with health checks, metrics, and monitoring endpoints.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Global error handling
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Platform instance (lazy initialization)
let platformInstance = null;

async function initializePlatform() {
  if (platformInstance) {
    return platformInstance;
  }

  try {
    // Dynamic import of the comprehensive integration example
    const { ComprehensiveIntegrationExample } = await import('./comprehensive-integration-example');

    platformInstance = new ComprehensiveIntegrationExample({
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      maxSupportAgents: parseInt(process.env.MAX_SUPPORT_AGENTS) || 10,
      maxSpecialistAgents: parseInt(process.env.MAX_SPECIALIST_AGENTS) || 5,
      autoScalingEnabled: process.env.AUTO_SCALING_ENABLED === 'true',
      monitoringEnabled: process.env.MONITORING_ENABLED === 'true',
      alertingEnabled: process.env.ALERTING_ENABLED === 'true',
    });

    await platformInstance.initialize();
    console.log('✅ Platform initialized successfully');

    return platformInstance;
  } catch (error) {
    console.error('❌ Failed to initialize platform:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// Readiness check endpoint
app.get('/ready', async (req, res) => {
  try {
    if (!platformInstance) {
      return res.status(503).json({
        status: 'not_ready',
        message: 'Platform not initialized',
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      platform: 'initialized',
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    const platform = await initializePlatform();
    const metrics = platform.getPlatformMetrics();

    // Convert metrics to Prometheus format
    const prometheusMetrics = [
      `# HELP platform_total_conversations Total number of conversations`,
      `# TYPE platform_total_conversations counter`,
      `platform_total_conversations ${metrics.platform.totalConversations}`,
      '',
      `# HELP platform_active_conversations Number of active conversations`,
      `# TYPE platform_active_conversations gauge`,
      `platform_active_conversations ${metrics.platform.activeConversations}`,
      '',
      `# HELP platform_agent_utilization Agent utilization percentage`,
      `# TYPE platform_agent_utilization gauge`,
      `platform_agent_utilization ${metrics.platform.agentUtilization}`,
      '',
      `# HELP platform_customer_satisfaction Customer satisfaction score`,
      `# TYPE platform_customer_satisfaction gauge`,
      `platform_customer_satisfaction ${metrics.platform.customerSatisfactionScore}`,
      '',
      `# HELP platform_system_health System health score`,
      `# TYPE platform_system_health gauge`,
      `platform_system_health ${metrics.platform.systemHealth}`,
      '',
      `# HELP platform_response_time_avg Average response time in milliseconds`,
      `# TYPE platform_response_time_avg gauge`,
      `platform_response_time_avg ${metrics.platform.averageResponseTime}`,
      '',
    ].join(
      '\
',
    );

    res.set('Content-Type', 'text/plain');
    res.send(prometheusMetrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate metrics',
      message: error.message,
    });
  }
});

// Platform status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const platform = await initializePlatform();
    const metrics = platform.getPlatformMetrics();

    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      metrics: {
        system: {
          totalAgents: metrics.system.health.totalAgents,
          healthyAgents: metrics.system.health.healthyAgents,
          systemLoad: metrics.system.health.systemLoad,
        },
        platform: {
          totalConversations: metrics.platform.totalConversations,
          activeConversations: metrics.platform.activeConversations,
          averageResponseTime: metrics.platform.averageResponseTime,
          customerSatisfactionScore: metrics.platform.customerSatisfactionScore,
          agentUtilization: metrics.platform.agentUtilization,
        },
        agents: {
          supportAgents: metrics.agents.support.length,
          specialistAgents: metrics.agents.specialist.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Customer interaction endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const platform = await initializePlatform();
    const interaction = req.body;

    // Validate request
    if (!interaction.customerId || !interaction.message) {
      return res.status(400).json({
        error: 'Missing required fields: customerId, message',
      });
    }

    // Set defaults
    const customerInteraction = {
      customerId: interaction.customerId,
      message: interaction.message,
      channel: interaction.channel || 'api',
      priority: interaction.priority || 'normal',
      metadata: interaction.metadata || {},
    };

    // Process interaction
    const result = await platform.handleCustomerInteraction(customerInteraction);

    res.json({
      sessionId: result.sessionId,
      response: result.response,
      agentType: result.agentType,
      responseTime: result.responseTime,
      escalated: result.escalated,
      qualityScore: result.qualityScore,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error handling customer interaction:', error);
    res.status(500).json({
      error: 'Failed to process interaction',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Auto-scaling endpoint
app.post('/api/scale', async (req, res) => {
  try {
    const platform = await initializePlatform();
    const result = await platform.autoScale();

    res.json({
      scaled: result.scaled,
      action: result.action,
      agentType: result.agentType,
      count: result.count,
      reason: result.reason,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Auto-scaling failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Platform export endpoint
app.get('/api/export', async (req, res) => {
  try {
    const platform = await initializePlatform();
    const snapshot = platform.exportPlatformState();

    res.json(snapshot);
  } catch (error) {
    res.status(500).json({
      error: 'Export failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Demo endpoint
app.post('/api/demo', async (req, res) => {
  try {
    // Dynamic import of demo function
    const { demonstrateComprehensiveIntegration } = await import(
      './comprehensive-integration-example'
    );

    const demoResult = await demonstrateComprehensiveIntegration();

    res.json({
      status: 'completed',
      results: demoResult.results,
      metrics: demoResult.metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Demo failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Static dashboard (simple HTML interface)
app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Agent Platform Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .metric { background: #f5f5f5; padding: 20px; margin: 10px 0; border-radius: 5px; }
            .status { font-weight: bold; }
            .healthy { color: green; }
            .degraded { color: orange; }
            .unhealthy { color: red; }
            button { background: #007bff; color: white; border: none; padding: 10px 20px; margin: 5px; cursor: pointer; border-radius: 3px; }
            button:hover { background: #0056b3; }
            #output { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; white-space: pre-wrap; }
        </style>
    </head>
    <body>
        <h1>🤖 AI Agent Platform Dashboard</h1>

        <div class="metric">
            <h3>System Status</h3>
            <div id="status">Loading...</div>
        </div>

        <div class="metric">
            <h3>Platform Controls</h3>
            <button onclick="getStatus()">Refresh Status</button>
            <button onclick="triggerAutoScale()">Trigger Auto-Scale</button>
            <button onclick="runDemo()">Run Demo</button>
            <button onclick="exportData()">Export Data</button>
        </div>

        <div class="metric">
            <h3>Chat Interface</h3>
            <input type="text" id="customerId" placeholder="Customer ID" style="width: 200px; margin: 5px;">
            <input type="text" id="message" placeholder="Enter message..." style="width: 400px; margin: 5px;">
            <button onclick="sendMessage()">Send Message</button>
        </div>

        <div id="output"></div>

        <script>
            function log(message) {
                document.getElementById('output').textContent += new Date().toISOString() + ': ' + message + '\
';
            }

            async function getStatus() {
                try {
                    const response = await fetch('/api/status');
                    const data = await response.json();

                    const statusHtml = \`
                        <div class="status \${data.status === 'operational' ? 'healthy' : 'unhealthy'}">
                            Status: \${data.status.toUpperCase()}
                        </div>
                        <p>Total Agents: \${data.metrics.system.totalAgents}</p>
                        <p>Healthy Agents: \${data.metrics.system.healthyAgents}</p>
                        <p>Active Conversations: \${data.metrics.platform.activeConversations}</p>
                        <p>Total Conversations: \${data.metrics.platform.totalConversations}</p>
                        <p>Agent Utilization: \${(data.metrics.platform.agentUtilization * 100).toFixed(1)}%</p>
                        <p>Customer Satisfaction: \${data.metrics.platform.customerSatisfactionScore.toFixed(1)}/5.0</p>
                    \`;

                    document.getElementById('status').innerHTML = statusHtml;
                    log('Status refreshed successfully');
                } catch (error) {
                    log('Error getting status: ' + error.message);
                }
            }

            async function triggerAutoScale() {
                try {
                    log('Triggering auto-scale...');
                    const response = await fetch('/api/scale', { method: 'POST' });
                    const data = await response.json();

                    log(\`Auto-scale result: \${data.scaled ? 'Scaled' : 'No scaling needed'}\`);
                    if (data.scaled) {
                        log(\`Action: \${data.action}, Type: \${data.agentType}, Count: \${data.count}\`);
                    }
                    log(\`Reason: \${data.reason}\`);
                } catch (error) {
                    log('Error triggering auto-scale: ' + error.message);
                }
            }

            async function runDemo() {
                try {
                    log('Running comprehensive demo...');
                    const response = await fetch('/api/demo', { method: 'POST' });
                    const data = await response.json();

                    log(\`Demo completed: \${data.results.length} interactions processed\`);
                    log(\`Platform metrics collected successfully\`);
                } catch (error) {
                    log('Error running demo: ' + error.message);
                }
            }

            async function sendMessage() {
                const customerId = document.getElementById('customerId').value;
                const message = document.getElementById('message').value;

                if (!customerId || !message) {
                    log('Please enter both customer ID and message');
                    return;
                }

                try {
                    log(\`Sending message from \${customerId}: "\${message}"\`);

                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            customerId: customerId,
                            message: message,
                            channel: 'dashboard',
                            priority: 'normal'
                        })
                    });

                    const data = await response.json();

                    log(\`Response from \${data.agentType}: "\${data.response}"\`);
                    log(\`Response time: \${data.responseTime}ms, Quality: \${data.qualityScore.toFixed(2)}, Escalated: \${data.escalated}\`);

                    // Clear message input
                    document.getElementById('message').value = '';
                } catch (error) {
                    log('Error sending message: ' + error.message);
                }
            }

            async function exportData() {
                try {
                    log('Exporting platform data...');
                    const response = await fetch('/api/export');
                    const data = await response.json();

                    // Create download link
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`platform-export-\${new Date().toISOString().split('T')[0]}.json\`;
                    a.click();

                    log('Platform data exported successfully');
                } catch (error) {
                    log('Error exporting data: ' + error.message);
                }
            }

            // Auto-refresh status every 30 seconds
            setInterval(getStatus, 30000);

            // Initial status load
            getStatus();
        </script>
    </body>
    </html>
  `);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((error, req, res, _next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message,
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');

  if (platformInstance) {
    try {
      await platformInstance.shutdown();
      console.log('Platform shutdown completed');
    } catch (error) {
      console.error('Error during platform shutdown:', error);
    }
  }

  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');

  if (platformInstance) {
    try {
      await platformInstance.shutdown();
      console.log('Platform shutdown completed');
    } catch (error) {
      console.error('Error during platform shutdown:', error);
    }
  }

  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Agent Platform server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📋 Status: http://localhost:${PORT}/api/status`);

  // Initialize platform in background
  (async () => {
    try {
      await initializePlatform();
    } catch (error) {
      console.error('Failed to initialize platform on startup:', error);
    }
  })();
});

module.exports = app;
