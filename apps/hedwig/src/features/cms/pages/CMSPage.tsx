'use client'

import { composeStyles } from '@/shared/utils/style-helpers'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { Button, Card } from '@repo/design-system/gluestack'

interface CMSData {
  description: string
  stats: {
    totalArticles: number
    drafts: number
    published: number
    mediaFiles: number
    lastPublished: string
  }
  timestamp: string
  title: string
}

interface CMSPageProps {
  initialData: CMSData
}

export function CMSPage({ initialData }: CMSPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'media' | 'workflows'>('overview')

  const navigateToSection = (section: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/${section}`
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{formatNumber(initialData.stats.totalArticles)}</Text>
          <Text style={styles.statLabel}>Total Articles</Text>
          <Text style={styles.statChange}>+5 this week</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{initialData.stats.published}</Text>
          <Text style={styles.statLabel}>Published</Text>
          <Text style={styles.statChange}>+3 this week</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{initialData.stats.drafts}</Text>
          <Text style={styles.statLabel}>Drafts</Text>
          <Text style={styles.statChange}>+2 pending</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{formatNumber(initialData.stats.mediaFiles)}</Text>
          <Text style={styles.statLabel}>Media Files</Text>
          <Text style={styles.statChange}>+12 this week</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <Button onPress={() => navigateToSection('cms/content/new')} style={styles.quickActionButton}>
            + Create Article
          </Button>
          <Button onPress={() => navigateToSection('cms/media')} style={styles.quickActionButton} variant="outline">
            Upload Media
          </Button>
          <Button onPress={() => navigateToSection('cms/templates')} style={styles.quickActionButton} variant="outline">
            Manage Templates
          </Button>
          <Button onPress={() => navigateToSection('cms/publish')} style={styles.quickActionButton} variant="secondary">
            Publish Queue
          </Button>
        </View>
      </Card>

      {/* Recent Content */}
      <Card style={styles.recentCard}>
        <Text style={styles.cardTitle}>Recent Content</Text>
        <View style={styles.contentList}>
          <View style={styles.contentItem}>
            <View style={styles.contentInfo}>
              <Text style={styles.contentTitle}>Getting Started with React Native</Text>
              <Text style={styles.contentMeta}>Article • Draft • 2 hours ago</Text>
            </View>
            <View style={composeStyles(styles.statusBadge, { backgroundColor: '#ff9800' })}>
              <Text style={styles.statusText}>DRAFT</Text>
            </View>
          </View>

          <View style={styles.contentItem}>
            <View style={styles.contentInfo}>
              <Text style={styles.contentTitle}>Product Launch Announcement</Text>
              <Text style={styles.contentMeta}>Article • Published • 1 day ago</Text>
            </View>
            <View style={composeStyles(styles.statusBadge, { backgroundColor: '#4caf50' })}>
              <Text style={styles.statusText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.contentItem}>
            <View style={styles.contentInfo}>
              <Text style={styles.contentTitle}>Company Newsletter Template</Text>
              <Text style={styles.contentMeta}>Template • Updated • 3 days ago</Text>
            </View>
            <View style={composeStyles(styles.statusBadge, { backgroundColor: '#2196f3' })}>
              <Text style={styles.statusText}>TEMPLATE</Text>
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  )

  const renderContent = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
      <Card style={styles.contentManagementCard}>
        <Text style={styles.cardTitle}>Content Management</Text>
        <Text style={styles.cardDescription}>
          Create, edit, and organize your content with our intuitive editor.
        </Text>

        <View style={styles.contentTypes}>
          <View style={styles.contentType}>
            <Text style={styles.contentTypeIcon}>📄</Text>
            <Text style={styles.contentTypeName}>Articles</Text>
            <Text style={styles.contentTypeCount}>156 items</Text>
          </View>

          <View style={styles.contentType}>
            <Text style={styles.contentTypeIcon}>📰</Text>
            <Text style={styles.contentTypeName}>News</Text>
            <Text style={styles.contentTypeCount}>45 items</Text>
          </View>

          <View style={styles.contentType}>
            <Text style={styles.contentTypeIcon}>📋</Text>
            <Text style={styles.contentTypeName}>Pages</Text>
            <Text style={styles.contentTypeCount}>23 items</Text>
          </View>

          <View style={styles.contentType}>
            <Text style={styles.contentTypeIcon}>📧</Text>
            <Text style={styles.contentTypeName}>Newsletters</Text>
            <Text style={styles.contentTypeCount}>12 items</Text>
          </View>
        </View>

        <Button onPress={() => navigateToSection('cms/content/new')} style={styles.createButton}>
          + Create New Content
        </Button>
      </Card>
    </ScrollView>
  )

  const renderMedia = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
      <Card style={styles.mediaCard}>
        <Text style={styles.cardTitle}>Media Library</Text>
        <Text style={styles.cardDescription}>
          Manage images, videos, and documents for your content.
        </Text>

        <View style={styles.mediaStats}>
          <View style={styles.mediaStat}>
            <Text style={styles.mediaStatNumber}>456</Text>
            <Text style={styles.mediaStatLabel}>Images</Text>
          </View>
          <View style={styles.mediaStat}>
            <Text style={styles.mediaStatNumber}>89</Text>
            <Text style={styles.mediaStatLabel}>Videos</Text>
          </View>
          <View style={styles.mediaStat}>
            <Text style={styles.mediaStatNumber}>234</Text>
            <Text style={styles.mediaStatLabel}>Documents</Text>
          </View>
          <View style={styles.mediaStat}>
            <Text style={styles.mediaStatNumber}>113</Text>
            <Text style={styles.mediaStatLabel}>Audio</Text>
          </View>
        </View>

        <Button onPress={() => navigateToSection('cms/media/upload')} style={styles.uploadButton}>
          + Upload Media
        </Button>
      </Card>
    </ScrollView>
  )

  const renderWorkflows = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
      <Card style={styles.workflowCard}>
        <Text style={styles.cardTitle}>Publishing Workflows</Text>
        <Text style={styles.cardDescription}>
          Manage content approval and publishing processes.
        </Text>

        <View style={styles.workflowSteps}>
          <View style={styles.workflowStep}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepTitle}>Draft Creation</Text>
            <Text style={styles.stepDescription}>Content creators write and format articles</Text>
          </View>

          <View style={styles.workflowStep}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepTitle}>Review Process</Text>
            <Text style={styles.stepDescription}>Editors review and provide feedback</Text>
          </View>

          <View style={styles.workflowStep}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepTitle}>Approval</Text>
            <Text style={styles.stepDescription}>Final approval from content managers</Text>
          </View>

          <View style={styles.workflowStep}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepTitle}>Publishing</Text>
            <Text style={styles.stepDescription}>Content goes live across channels</Text>
          </View>
        </View>

        <Button onPress={() => navigateToSection('cms/workflows/manage')} style={styles.manageButton}>
          Manage Workflows
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
            { key: 'content', label: 'Content' },
            { key: 'media', label: 'Media' },
            { key: 'workflows', label: 'Workflows' }
          ].map((tab) => (
            <Button
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              style={activeTab === tab.key ? styles.activeTabButton : styles.tabButton}
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
      {activeTab === 'content' && renderContent()}
      {activeTab === 'media' && renderMedia()}
      {activeTab === 'workflows' && renderWorkflows()}
    </View>
  )
}

const styles = StyleSheet.create({
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  activeTabButton: {
    backgroundColor: '#2196f3',
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
  container: {
    flex: 1,
  },
  contentInfo: {
    flex: 1,
  },
  contentItem: {
    borderBottomWidth: 1,
    alignItems: 'center',
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  contentList: {
    gap: 15,
  },
  contentManagementCard: {
    padding: 20,
  },
  contentMeta: {
    color: '#999',
    fontSize: 12,
  },
  contentTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentType: {
    minWidth: 100,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    flex: 1,
    padding: 15,
  },
  contentTypeCount: {
    color: '#666',
    fontSize: 12,
  },
  contentTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  contentTypeName: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  createButton: {
    alignSelf: 'flex-start',
  },
  manageButton: {
    alignSelf: 'flex-start',
  },
  mediaCard: {
    padding: 20,
  },
  mediaStat: {
    alignItems: 'center',
    flex: 1,
  },
  mediaStatLabel: {
    color: '#666',
    fontSize: 12,
  },
  mediaStatNumber: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mediaStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    minWidth: 120,
    flex: 1,
  },
  quickActionsCard: {
    marginBottom: 20,
    padding: 20,
  },
  recentCard: {
    padding: 20,
  },
  statCard: {
    minWidth: 150,
    alignItems: 'center',
    flex: 1,
    padding: 15,
  },
  statChange: {
    color: '#4caf50',
    fontSize: 12,
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
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  stepDescription: {
    color: '#666',
    flex: 1,
    fontSize: 14,
  },
  stepNumber: {
    width: 30,
    backgroundColor: '#2196f3',
    borderRadius: 15,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    height: 30,
    lineHeight: 30,
    textAlign: 'center',
  },
  stepTitle: {
    color: '#333',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
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
  uploadButton: {
    alignSelf: 'flex-start',
  },
  workflowCard: {
    padding: 20,
  },
  workflowStep: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 15,
  },
  workflowSteps: {
    gap: 15,
    marginBottom: 20,
  },
})
