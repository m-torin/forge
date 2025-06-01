'use client'

import { useState } from 'react'
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native'

import { Button, Card } from '@repo/design-system/gluestack'

interface PIMData {
  description: string
  stats: {
    totalProducts: number
    categories: number
    attributes: number
    digitalAssets: number
    lastSync: string
  }
  timestamp: string
  title: string
}

interface Product {
  attributes: Record<string, any>
  category: string
  id: string
  lastModified: string
  name: string
  sku: string
  status: 'active' | 'draft' | 'archived'
}

interface PIMClientProps {
  initialData: PIMData
}

export function PIMPage({ initialData }: PIMClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'attributes' | 'assets'>('overview')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock product data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      attributes: {
        batteryLife: '20 hours',
        brand: 'TechSound',
        color: 'Black',
        price: 99.99,
        weight: '250g'
      },
      category: 'Electronics > Audio',
      lastModified: '2025-05-31T10:30:00Z',
      sku: 'WBH-001',
      status: 'active'
    },
    {
      id: '2',
      name: 'Organic Cotton T-Shirt',
      attributes: {
        brand: 'EcoWear',
        colors: ['White', 'Black', 'Navy'],
        material: '100% Organic Cotton',
        price: 29.99,
        sizes: ['S', 'M', 'L', 'XL']
      },
      category: 'Clothing > Shirts',
      lastModified: '2025-05-30T14:15:00Z',
      sku: 'OCT-002',
      status: 'active'
    },
    {
      id: '3',
      name: 'Smart Home Security Camera',
      attributes: {
        brand: 'SecureHome',
        connectivity: 'WiFi',
        nightVision: true,
        price: 149.99,
        resolution: '1080p'
      },
      category: 'Electronics > Security',
      lastModified: '2025-05-31T09:45:00Z',
      sku: 'SHSC-003',
      status: 'draft'
    }
  ]

  const navigateToSection = (section: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/${section}`
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4caf50'
      case 'draft': return '#ff9800'
      case 'archived': return '#9e9e9e'
      default: return '#666'
    }
  }

  const renderProductItem = ({ item }: { item: Product }) => (
    <Card className="p-4 mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900 mb-1">{item.name}</Text>
          <Text className="text-xs text-gray-600 mb-0.5">SKU: {item.sku}</Text>
          <Text className="text-xs text-gray-500">{item.category}</Text>
        </View>
        <View 
          className="px-2 py-1 rounded"
          style={{ backgroundColor: getStatusColor(item.status) }}
        >
          <Text className="text-xs font-bold text-white">{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-600 mb-2">Key Attributes:</Text>
        <View>
          {Object.entries(item.attributes).slice(0, 3).map(([key, value]) => (
            <Text key={key} className="text-xs text-gray-700 mb-0.5">
              {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
            </Text>
          ))}
        </View>
      </View>

      <View className="flex-row gap-2">
        <Button onPress={() => {}} className="flex-1" size="sm">
          Edit
        </Button>
        <Button onPress={() => {}} className="flex-1" size="sm" variant="outline">
          View Details
        </Button>
        <Button onPress={() => {}} className="flex-1" size="sm" variant="secondary">
          Duplicate
        </Button>
      </View>
    </Card>
  )

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5">
      {/* Stats Cards */}
      <View className="flex-row flex-wrap gap-4 mb-5">
        <Card className="min-w-[150px] flex-1 p-4 items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-1">{formatNumber(initialData.stats.totalProducts)}</Text>
          <Text className="text-sm font-semibold text-gray-600 mb-0.5">Total Products</Text>
          <Text className="text-xs text-green-500">+12 this week</Text>
        </Card>

        <Card className="min-w-[150px] flex-1 p-4 items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-1">{initialData.stats.categories}</Text>
          <Text className="text-sm font-semibold text-gray-600 mb-0.5">Categories</Text>
          <Text className="text-xs text-green-500">+3 this month</Text>
        </Card>

        <Card className="min-w-[150px] flex-1 p-4 items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-1">{initialData.stats.attributes}</Text>
          <Text className="text-sm font-semibold text-gray-600 mb-0.5">Attributes</Text>
          <Text className="text-xs text-green-500">+8 this month</Text>
        </Card>

        <Card className="min-w-[150px] flex-1 p-4 items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-1">{formatNumber(initialData.stats.digitalAssets)}</Text>
          <Text className="text-sm font-semibold text-gray-600 mb-0.5">Digital Assets</Text>
          <Text className="text-xs text-green-500">+45 this week</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card className="p-5 mb-5">
        <Text className="text-lg font-bold text-gray-900 mb-4">Quick Actions</Text>
        <View className="flex-row flex-wrap gap-2">
          <Button onPress={() => navigateToSection('pim/products/new')} className="min-w-[120px] flex-1">
            + Add Product
          </Button>
          <Button onPress={() => navigateToSection('pim/categories')} className="min-w-[120px] flex-1" variant="outline">
            Manage Categories
          </Button>
          <Button onPress={() => navigateToSection('pim/attributes')} className="min-w-[120px] flex-1" variant="outline">
            Define Attributes
          </Button>
          <Button onPress={() => navigateToSection('pim/import')} className="min-w-[120px] flex-1" variant="secondary">
            Import Data
          </Button>
        </View>
      </Card>

      {/* Recent Activity */}
      <Card className="p-5">
        <Text className="text-lg font-bold text-gray-900 mb-4">Recent Activity</Text>
        <View className="gap-3">
          <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
            <Text className="text-sm text-gray-700 flex-1">Product "Wireless Headphones" updated</Text>
            <Text className="text-xs text-gray-500">2 hours ago</Text>
          </View>
          <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
            <Text className="text-sm text-gray-700 flex-1">New category "Smart Home" created</Text>
            <Text className="text-xs text-gray-500">1 day ago</Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-gray-700 flex-1">Bulk import completed: 25 products</Text>
            <Text className="text-xs text-gray-500">2 days ago</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  )

  const renderProducts = () => (
    <View className="flex-1 p-5">
      <View className="flex-row items-center gap-4 mb-5">
        <View className="flex-1">
          <Pressable onPress={() => {
            const query = prompt('Search products:', searchQuery)
            if (query !== null) setSearchQuery(query)
          }}>
            <View className="border border-gray-300 rounded-md px-3 py-3 bg-gray-50">
              <Text className="text-sm text-gray-600">
                {searchQuery || 'Search products...'}
              </Text>
            </View>
          </Pressable>
        </View>
        <Button onPress={() => navigateToSection('pim/products/new')} size="sm">
          + Add Product
        </Button>
      </View>

      <FlatList
        contentContainerStyle={{ gap: 15 }}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        data={mockProducts}
        renderItem={renderProductItem}
      />
    </View>
  )

  const renderCategories = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5">
      <Card className="p-5">
        <Text className="text-lg font-bold text-gray-900 mb-4">Product Categories</Text>
        <View className="mb-5">
          <View className="mb-4">
            <Text className="text-base font-bold text-gray-900 mb-2">📱 Electronics (456 products)</Text>
            <View className="ml-5 gap-1">
              <Text className="text-sm text-gray-600">• Audio (123 products)</Text>
              <Text className="text-sm text-gray-600">• Security (89 products)</Text>
              <Text className="text-sm text-gray-600">• Smart Home (244 products)</Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-base font-bold text-gray-900 mb-2">👕 Clothing (789 products)</Text>
            <View className="ml-5 gap-1">
              <Text className="text-sm text-gray-600">• Shirts (345 products)</Text>
              <Text className="text-sm text-gray-600">• Pants (234 products)</Text>
              <Text className="text-sm text-gray-600">• Accessories (210 products)</Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-base font-bold text-gray-900 mb-2">🏠 Home & Garden (234 products)</Text>
            <View className="ml-5 gap-1">
              <Text className="text-sm text-gray-600">• Furniture (156 products)</Text>
              <Text className="text-sm text-gray-600">• Decor (78 products)</Text>
            </View>
          </View>
        </View>

        <Button onPress={() => navigateToSection('pim/categories/new')} className="self-start">
          + Add Category
        </Button>
      </Card>
    </ScrollView>
  )

  const renderAttributes = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5">
      <Card className="p-5">
        <Text className="text-lg font-bold text-gray-900 mb-4">Product Attributes</Text>
        <View className="mb-5">
          <View className="mb-5">
            <Text className="text-base font-bold text-gray-900 mb-2">Basic Information</Text>
            <Text className="text-sm text-gray-600 mb-1">• Name (Text)</Text>
            <Text className="text-sm text-gray-600 mb-1">• SKU (Text)</Text>
            <Text className="text-sm text-gray-600 mb-1">• Description (Rich Text)</Text>
            <Text className="text-sm text-gray-600 mb-1">• Brand (Select)</Text>
          </View>

          <View className="mb-5">
            <Text className="text-base font-bold text-gray-900 mb-2">Physical Properties</Text>
            <Text className="text-sm text-gray-600 mb-1">• Weight (Number)</Text>
            <Text className="text-sm text-gray-600 mb-1">• Dimensions (Text)</Text>
            <Text className="text-sm text-gray-600 mb-1">• Color (Multi-select)</Text>
            <Text className="text-sm text-gray-600 mb-1">• Material (Text)</Text>
          </View>

          <View className="mb-5">
            <Text className="text-base font-bold text-gray-900 mb-2">Pricing & Availability</Text>
            <Text className="text-sm text-gray-600 mb-1">• Price (Currency)</Text>
            <Text className="text-sm text-gray-600 mb-1">• MSRP (Currency)</Text>
            <Text className="text-sm text-gray-600 mb-1">• Status (Select)</Text>
          </View>
        </View>

        <Button onPress={() => navigateToSection('pim/attributes/new')} className="self-start">
          + Define Attribute
        </Button>
      </Card>
    </ScrollView>
  )

  const renderAssets = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5">
      <Card className="p-5">
        <Text className="text-lg font-bold text-gray-900 mb-4">Digital Assets</Text>
        <View className="flex-row flex-wrap gap-4 mb-5">
          <View className="w-[120px] items-center">
            <View className="w-20 h-20 bg-gray-100 rounded-lg items-center justify-center mb-2">
              <Text className="text-2xl">🖼️</Text>
            </View>
            <Text className="text-xs font-semibold text-gray-900 text-center mb-0.5">product-image-1.jpg</Text>
            <Text className="text-xs text-gray-500 text-center">1920x1080 • 245 KB</Text>
          </View>

          <View className="w-[120px] items-center">
            <View className="w-20 h-20 bg-gray-100 rounded-lg items-center justify-center mb-2">
              <Text className="text-2xl">📄</Text>
            </View>
            <Text className="text-xs font-semibold text-gray-900 text-center mb-0.5">spec-sheet.pdf</Text>
            <Text className="text-xs text-gray-500 text-center">PDF • 1.2 MB</Text>
          </View>

          <View className="w-[120px] items-center">
            <View className="w-20 h-20 bg-gray-100 rounded-lg items-center justify-center mb-2">
              <Text className="text-2xl">🎥</Text>
            </View>
            <Text className="text-xs font-semibold text-gray-900 text-center mb-0.5">product-demo.mp4</Text>
            <Text className="text-xs text-gray-500 text-center">1080p • 15.3 MB</Text>
          </View>
        </View>

        <Button onPress={() => navigateToSection('pim/assets/upload')} className="self-start">
          + Upload Assets
        </Button>
      </Card>
    </ScrollView>
  )

  return (
    <View className="flex-1">
      {/* Tab Navigation */}
      <View className="bg-white border-b border-gray-200 px-4 py-2">
        <ScrollView 
          contentContainerStyle={{ gap: 10 }} 
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'products', label: 'Products' },
            { key: 'categories', label: 'Categories' },
            { key: 'attributes', label: 'Attributes' },
            { key: 'assets', label: 'Assets' }
          ].map((tab) => (
            <Button
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              className="min-w-[100px]"
              size="sm"
              variant={activeTab === tab.key ? 'primary' : 'outline'}
            >
              {tab.label}
            </Button>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'products' && renderProducts()}
      {activeTab === 'categories' && renderCategories()}
      {activeTab === 'attributes' && renderAttributes()}
      {activeTab === 'assets' && renderAssets()}
    </View>
  )
}

