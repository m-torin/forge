'use client'

import { composeStyles } from '@/shared/utils/style-helpers'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { Button, Card } from '@repo/design-system/uix'

interface DashboardData {
  description: string
  stats: {
    totalProducts: number
    activeContent: number
    systemHealth: number
    lastUpdate: string
  }
  timestamp: string
  title: string
}

interface DashboardPageProps {
  initialData: DashboardData
}

export function DashboardPage({ initialData }: DashboardPageProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  const navigateToSection = (section: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/${section}`
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Quick Stats Overview */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>System Overview</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{formatNumber(initialData.stats.totalProducts)}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
            <Text style={styles.statSubtext}>In PIM System</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{initialData.stats.activeContent}</Text>
            <Text style={styles.statLabel}>Active Content</Text>
            <Text style={styles.statSubtext}>Published Items</Text>
          </Card>

          <Card style={composeStyles(styles.statCard, styles.healthCard)}>
            <Text style={composeStyles(styles.statNumber, styles.healthNumber)}>
              {formatPercentage(initialData.stats.systemHealth)}
            </Text>
            <Text style={styles.statLabel}>System Health</Text>
            <Text style={styles.statSubtext}>All Services</Text>
          </Card>
        </View>
      </View>

      {/* Main Sections */}
      <View style={styles.sectionsContainer}>
        <Text style={styles.sectionTitle}>Platform Modules</Text>

        {/* PIM Section */}
        <Card style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIcon}>
              <Text style={styles.moduleIconText}>📦</Text>
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>Product Information Management</Text>
              <Text style={styles.moduleDescription}>
                Manage product catalogs, specifications, attributes, and digital assets
              </Text>
            </View>
          </View>

          <View style={styles.moduleStats}>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>1,247</Text>
              <Text style={styles.moduleStatLabel}>Products</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>89</Text>
              <Text style={styles.moduleStatLabel}>Categories</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>2,156</Text>
              <Text style={styles.moduleStatLabel}>Assets</Text>
            </View>
          </View>

          <View style={styles.moduleActions}>
            <Button
              onPress={() => navigateToSection('pim')}
              style={styles.moduleButton}
            >
              Open PIM
            </Button>
            <Button
              onPress={() => navigateToSection('pim/products')}
              style={styles.moduleButton}
              variant="outline"
            >
              View Products
            </Button>
          </View>
        </Card>

        {/* CMS Section */}
        <Card style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIcon}>
              <Text style={styles.moduleIconText}>📝</Text>
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>Content Management System</Text>
              <Text style={styles.moduleDescription}>
                Create, manage, and publish content across multiple channels
              </Text>
            </View>
          </View>

          <View style={styles.moduleStats}>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>156</Text>
              <Text style={styles.moduleStatLabel}>Articles</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>23</Text>
              <Text style={styles.moduleStatLabel}>Drafts</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>892</Text>
              <Text style={styles.moduleStatLabel}>Media Files</Text>
            </View>
          </View>

          <View style={styles.moduleActions}>
            <Button
              onPress={() => navigateToSection('cms')}
              style={styles.moduleButton}
            >
              Open CMS
            </Button>
            <Button
              onPress={() => navigateToSection('cms/content')}
              style={styles.moduleButton}
              variant="outline"
            >
              Manage Content
            </Button>
          </View>
        </Card>

        {/* Service Monitoring Section */}
        <Card style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIcon}>
              <Text style={styles.moduleIconText}>📊</Text>
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>Service Monitoring</Text>
              <Text style={styles.moduleDescription}>
                Monitor system health, performance metrics, and service alerts
              </Text>
            </View>
          </View>

          <View style={styles.moduleStats}>
            <View style={styles.moduleStat}>
              <Text style={composeStyles(styles.moduleStatNumber, styles.healthStat)}>98.5%</Text>
              <Text style={styles.moduleStatLabel}>Uptime</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>12</Text>
              <Text style={styles.moduleStatLabel}>Services</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={composeStyles(styles.moduleStatNumber, styles.alertStat)}>2</Text>
              <Text style={styles.moduleStatLabel}>Alerts</Text>
            </View>
          </View>

          <View style={styles.moduleActions}>
            <Button
              onPress={() => navigateToSection('monitoring')}
              style={styles.moduleButton}
            >
              Open Monitoring
            </Button>
            <Button
              onPress={() => navigateToSection('monitoring/health')}
              style={styles.moduleButton}
              variant="outline"
            >
              System Health
            </Button>
          </View>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <Button
            onPress={() => navigateToSection('pim/products/new')}
            style={styles.quickActionButton}
          >
            + Add Product
          </Button>
          <Button
            onPress={() => navigateToSection('cms/content/new')}
            style={styles.quickActionButton}
            variant="outline"
          >
            + Create Content
          </Button>
          <Button
            onPress={() => navigateToSection('scanner')}
            style={styles.quickActionButton}
            variant="secondary"
          >
            📱 Scan Barcode
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  alertStat: {
    color: '#ff9800',
  },
  container: {
    flex: 1,
  },
  healthCard: {
    backgroundColor: '#e8f5e8',
  },
  healthNumber: {
    color: '#4caf50',
  },
  healthStat: {
    color: '#4caf50',
  },
  moduleActions: {
    flexDirection: 'row',
    gap: 10,
  },
  moduleButton: {
    flex: 1,
  },
  moduleCard: {
    marginBottom: 20,
    padding: 20,
  },
  moduleDescription: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  moduleHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  moduleIcon: {
    width: 50,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    marginRight: 15,
  },
  moduleIconText: {
    fontSize: 24,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleStat: {
    alignItems: 'center',
  },
  moduleStatLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  moduleStatNumber: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  moduleStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
  },
  moduleTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  quickActionButton: {
    flex: 1,
  },
  quickActions: {
    padding: 20,
    paddingTop: 0,
  },
  sectionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    padding: 15,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  statNumber: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsSection: {
    padding: 20,
  },
  statSubtext: {
    color: '#999',
    fontSize: 12,
  },
})
