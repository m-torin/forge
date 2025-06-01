'use client'

import { composeStyles } from '@/shared/utils/style-helpers'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { Button, Card } from '@repo/design-system/gluestack'

interface MonitoringData {
  description: string
  stats: {
    systemHealth: number
    activeServices: number
    totalAlerts: number
    uptime: number
    responseTime: number
    lastCheck: string
  }
  timestamp: string
  title: string
}

interface Service {
  id: string
  lastCheck: string
  name: string
  responseTime: number
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  uptime: number
}

interface Alert {
  id: string
  message: string
  resolved: boolean
  service: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
}

interface MonitoringPageProps {
  initialData: MonitoringData
}

export function MonitoringPage({ initialData }: MonitoringPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'alerts' | 'metrics'>('overview')
  const [refreshing, setRefreshing] = useState(false)

  // Mock service data
  const mockServices: Service[] = [
    {
      id: '1',
      name: 'API Gateway',
      lastCheck: new Date().toISOString(),
      responseTime: 120,
      status: 'healthy',
      uptime: 99.9
    },
    {
      id: '2',
      name: 'Database',
      lastCheck: new Date().toISOString(),
      responseTime: 45,
      status: 'healthy',
      uptime: 99.8
    },
    {
      id: '3',
      name: 'Authentication Service',
      lastCheck: new Date().toISOString(),
      responseTime: 250,
      status: 'warning',
      uptime: 98.2
    },
    {
      id: '4',
      name: 'File Storage',
      lastCheck: new Date().toISOString(),
      responseTime: 89,
      status: 'healthy',
      uptime: 99.7
    },
    {
      id: '5',
      name: 'Email Service',
      lastCheck: new Date().toISOString(),
      responseTime: 1200,
      status: 'critical',
      uptime: 95.1
    }
  ]

  // Mock alert data
  const mockAlerts: Alert[] = [
    {
      id: '1',
      message: 'High response time detected (>1000ms)',
      resolved: false,
      service: 'Email Service',
      severity: 'high',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      message: 'Increased error rate (5.2%)',
      resolved: false,
      service: 'Authentication Service',
      severity: 'medium',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      message: 'Memory usage above 80%',
      resolved: true,
      service: 'API Gateway',
      severity: 'low',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#4caf50'
      case 'warning': return '#ff9800'
      case 'critical': return '#f44336'
      case 'offline': return '#9e9e9e'
      default: return '#666'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#2196f3'
      case 'medium': return '#ff9800'
      case 'high': return '#ff5722'
      case 'critical': return '#f44336'
      default: return '#666'
    }
  }

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`
  }

  const formatResponseTime = (time: number) => {
    return `${time}ms`
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
      {/* System Health Overview */}
      <View style={styles.healthSection}>
        <Card style={composeStyles(styles.healthCard, { backgroundColor: '#e8f5e8' })}>
          <Text style={styles.healthTitle}>System Health</Text>
          <Text style={composeStyles(styles.healthScore, { color: '#4caf50' })}>
            {formatUptime(initialData.stats.systemHealth)}
          </Text>
          <Text style={styles.healthSubtext}>All systems operational</Text>
        </Card>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricNumber}>{initialData.stats.activeServices}</Text>
          <Text style={styles.metricLabel}>Active Services</Text>
          <Text style={styles.metricStatus}>All monitored</Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text style={composeStyles(styles.metricNumber, { color: '#ff9800' })}>
            {initialData.stats.totalAlerts}
          </Text>
          <Text style={styles.metricLabel}>Active Alerts</Text>
          <Text style={styles.metricStatus}>Needs attention</Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text style={styles.metricNumber}>{formatUptime(initialData.stats.uptime)}</Text>
          <Text style={styles.metricLabel}>Overall Uptime</Text>
          <Text style={styles.metricStatus}>Last 30 days</Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text style={styles.metricNumber}>{formatResponseTime(initialData.stats.responseTime)}</Text>
          <Text style={styles.metricLabel}>Avg Response</Text>
          <Text style={styles.metricStatus}>Last hour</Text>
        </Card>
      </View>

      {/* Service Status Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Service Status Summary</Text>
        <View style={styles.statusSummary}>
          <View style={styles.statusItem}>
            <View style={composeStyles(styles.statusDot, { backgroundColor: '#4caf50' })} />
            <Text style={styles.statusText}>
              {mockServices.filter(s => s.status === 'healthy').length} Healthy
            </Text>
          </View>
          <View style={styles.statusItem}>
            <View style={composeStyles(styles.statusDot, { backgroundColor: '#ff9800' })} />
            <Text style={styles.statusText}>
              {mockServices.filter(s => s.status === 'warning').length} Warning
            </Text>
          </View>
          <View style={styles.statusItem}>
            <View style={composeStyles(styles.statusDot, { backgroundColor: '#f44336' })} />
            <Text style={styles.statusText}>
              {mockServices.filter(s => s.status === 'critical').length} Critical
            </Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <Button onPress={handleRefresh} style={styles.actionButton} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : '🔄 Refresh All'}
          </Button>
          <Button onPress={() => {}} style={styles.actionButton} variant="outline">
            📊 View Reports
          </Button>
          <Button onPress={() => {}} style={styles.actionButton} variant="secondary">
            ⚙️ Configure Alerts
          </Button>
        </View>
      </Card>
    </ScrollView>
  )

  const renderServices = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
      <View style={styles.servicesHeader}>
        <Text style={styles.sectionTitle}>Service Status</Text>
        <Button onPress={handleRefresh} disabled={refreshing} size="small">
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </View>

      <View style={styles.servicesList}>
        {mockServices.map((service) => (
          <Card key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceLastCheck}>
                  Last check: {formatTimestamp(service.lastCheck)}
                </Text>
              </View>
              <View style={composeStyles(styles.serviceStatus, { backgroundColor: getStatusColor(service.status) })}>
                <Text style={styles.serviceStatusText}>{service.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.serviceMetrics}>
              <View style={styles.serviceMetric}>
                <Text style={styles.serviceMetricLabel}>Uptime</Text>
                <Text style={styles.serviceMetricValue}>{formatUptime(service.uptime)}</Text>
              </View>
              <View style={styles.serviceMetric}>
                <Text style={styles.serviceMetricLabel}>Response Time</Text>
                <Text style={styles.serviceMetricValue}>{formatResponseTime(service.responseTime)}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  )

  const renderAlerts = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
      <View style={styles.alertsHeader}>
        <Text style={styles.sectionTitle}>System Alerts</Text>
        <Text style={styles.alertsCount}>
          {mockAlerts.filter(a => !a.resolved).length} active alerts
        </Text>
      </View>

      <View style={styles.alertsList}>
        {mockAlerts.map((alert) => (
          <Card key={alert.id} style={composeStyles(styles.alertCard, alert.resolved && styles.resolvedAlert)}>
            <View style={styles.alertHeader}>
              <View style={composeStyles(styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) })}>
                <Text style={styles.severityText}>{alert.severity.toUpperCase()}</Text>
              </View>
              <Text style={styles.alertTimestamp}>{formatTimestamp(alert.timestamp)}</Text>
            </View>

            <Text style={styles.alertService}>{alert.service}</Text>
            <Text style={composeStyles(styles.alertMessage, alert.resolved && styles.resolvedText)}>
              {alert.message}
            </Text>

            {!alert.resolved && (
              <View style={styles.alertActions}>
                <Button onPress={() => {}} style={styles.alertActionButton} size="small">
                  Acknowledge
                </Button>
                <Button onPress={() => {}} style={styles.alertActionButton} size="small" variant="outline">
                  View Details
                </Button>
              </View>
            )}
          </Card>
        ))}
      </View>
    </ScrollView>
  )

  const renderMetrics = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
      <Card style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Performance Metrics</Text>
        <Text style={styles.cardDescription}>
          Real-time system performance and resource utilization metrics.
        </Text>

        <View style={styles.metricCategories}>
          <View style={styles.metricCategory}>
            <Text style={styles.categoryTitle}>📈 Performance</Text>
            <Text style={styles.categoryMetric}>Response Time: 145ms avg</Text>
            <Text style={styles.categoryMetric}>Throughput: 1,250 req/min</Text>
            <Text style={styles.categoryMetric}>Error Rate: 0.2%</Text>
          </View>

          <View style={styles.metricCategory}>
            <Text style={styles.categoryTitle}>💾 Resources</Text>
            <Text style={styles.categoryMetric}>CPU Usage: 45%</Text>
            <Text style={styles.categoryMetric}>Memory: 68%</Text>
            <Text style={styles.categoryMetric}>Disk I/O: 23%</Text>
          </View>

          <View style={styles.metricCategory}>
            <Text style={styles.categoryTitle}>🌐 Network</Text>
            <Text style={styles.categoryMetric}>Bandwidth: 125 Mbps</Text>
            <Text style={styles.categoryMetric}>Latency: 12ms</Text>
            <Text style={styles.categoryMetric}>Packet Loss: 0.01%</Text>
          </View>
        </View>

        <Button onPress={() => {}} style={styles.viewChartsButton}>
          📊 View Detailed Charts
        </Button>
      </Card>
    </ScrollView>
  )

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <ScrollView contentContainerStyle={styles.tabScrollContainer} horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'services', label: 'Services' },
            { key: 'alerts', label: 'Alerts' },
            { key: 'metrics', label: 'Metrics' }
          ].map((tab) => (
            <Button
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              style={composeStyles(styles.tabButton, activeTab === tab.key && styles.activeTabButton)}
              size="small"
              variant={activeTab === tab.key ? 'primary' : 'outline'}
            >
              {tab.label}
            </Button>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'services' && renderServices()}
      {activeTab === 'alerts' && renderAlerts()}
      {activeTab === 'metrics' && renderMetrics()}
    </View>
  )
}

const styles = StyleSheet.create({
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionsCard: {
    padding: 20,
  },
  activeTabButton: {
    backgroundColor: '#2196f3',
  },
  alertActionButton: {
    flex: 1,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 10,
  },
  alertCard: {
    padding: 15,
  },
  alertHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  alertMessage: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  alertsCount: {
    color: '#666',
    fontSize: 14,
  },
  alertService: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  alertsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  alertsList: {
    gap: 15,
  },
  alertTimestamp: {
    color: '#999',
    fontSize: 12,
  },
  cardDescription: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  cardTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoryMetric: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  categoryTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  container: {
    flex: 1,
  },
  healthCard: {
    alignItems: 'center',
    padding: 25,
  },
  healthScore: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  healthSection: {
    marginBottom: 20,
  },
  healthSubtext: {
    color: '#666',
    fontSize: 14,
  },
  healthTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  metricCard: {
    minWidth: 150,
    alignItems: 'center',
    flex: 1,
    padding: 15,
  },
  metricCategories: {
    gap: 20,
    marginBottom: 20,
  },
  metricCategory: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
  },
  metricLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  metricNumber: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  metricsCard: {
    padding: 20,
  },
  metricStatus: {
    color: '#999',
    fontSize: 12,
  },
  resolvedAlert: {
    opacity: 0.6,
  },
  resolvedText: {
    textDecorationLine: 'line-through',
  },
  sectionTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
  },
  serviceCard: {
    padding: 15,
  },
  serviceHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceLastCheck: {
    color: '#999',
    fontSize: 12,
  },
  serviceMetric: {
    alignItems: 'center',
  },
  serviceMetricLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  serviceMetrics: {
    flexDirection: 'row',
    gap: 30,
  },
  serviceMetricValue: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  serviceName: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  servicesHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  servicesList: {
    gap: 15,
  },
  serviceStatus: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  serviceStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  severityBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  severityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 12,
    borderRadius: 6,
    height: 12,
  },
  statusItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statusSummary: {
    flexDirection: 'row',
    gap: 20,
  },
  statusText: {
    color: '#333',
    fontSize: 14,
  },
  summaryCard: {
    marginBottom: 20,
    padding: 20,
  },
  tabBar: {
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  tabButton: {
    minWidth: 100,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabScrollContainer: {
    gap: 10,
  },
  viewChartsButton: {
    alignSelf: 'flex-start',
  },
})
