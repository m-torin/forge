import { getScanHistoryAction, saveScanHistoryAction } from '@/features/history/actions/scan-history-actions'
import { type ScanResult } from '@/features/scanner/types/scanner'
import { searchProductsWithAIAction } from '@/features/search/actions/ai-actions'
import { AnalyticsService, PerformanceTimer } from '@/shared/services/analyticsService'

import { lookupProductAction, searchProductsAction } from '../actions/product-actions'

type BarcodeType = 'UPC_A' | 'UPC_E' | 'EAN_13' | 'EAN_8' | 'CODE_128' | 'CODE_39' | 'CODE_93' | 'CODABAR' | 'ITF' | 'RSS_14' | 'RSS_EXPANDED' | 'QR' | 'PDF_417' | 'AZTEC' | 'DATA_MATRIX' | 'MAXI_CODE' | 'OTHER'
type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

export interface Product {
  aiConfidence?: number | null
  aiGenerated?: boolean
  aiSources?: string[]
  attributes?: any
  category?: string | null
  createdAt: Date
  createdBy?: string | null
  description?: string | null
  id: string
  name: string
  organizationId?: string | null
  sku: string
  status: ProductStatus
  updatedAt: Date
}

export interface ProductBarcode {
  barcode: string
  id: string
  isPrimary: boolean
  product?: Product
  productId: string
  type: BarcodeType
}

export interface ProductWithBarcodes extends Product {
  barcodes: ProductBarcode[]
}

export interface AISearchResult {
  brand?: string
  category?: string
  confidence: number
  description?: string
  imageUrl?: string
  productName?: string
  sources: string[]
  specifications?: Record<string, any>
}

export class ProductLookupService {
  /**
   * Find a product in the PIM system by barcode
   */
  static async findProductByBarcode(barcode: string): Promise<ProductWithBarcodes | null> {
    const timer = new PerformanceTimer('product_lookup')

    try {
      console.log(`Looking up product for barcode: ${barcode}`)

      // Track the lookup attempt
      AnalyticsService.trackEvent({
        type: 'barcode_scanned',
        barcode
      })

      // Use server action to lookup product
      const formData = new FormData()
      formData.append('barcode', barcode)
      
      const response = await lookupProductAction(formData)

      if (!response.success) {
        console.error('Product lookup failed:', response.error)
        return null
      }

      const productBarcode = response.data

      if (productBarcode) {
        console.log(`Product found for barcode ${barcode}:`, productBarcode.name)

        // Track successful product lookup
        AnalyticsService.trackEvent({
          type: 'product_found',
          barcode,
          productId: productBarcode.id
        })

        timer.end(true, { barcode, productId: productBarcode.id })
        return productBarcode
      }

      console.log(`No product found for barcode: ${barcode}`)

      // Track product not found
      AnalyticsService.trackEvent({
        type: 'product_not_found',
        barcode
      })

      timer.end(true, { barcode, found: false })
      return null
    } catch (error) {
      console.error('Error looking up product:', error)
      AnalyticsService.trackError(error as Error, { barcode, operation: 'product_lookup' })
      timer.end(false, { barcode, error: (error as Error).message })
      throw new Error('Failed to lookup product in PIM system')
    }
  }

  /**
   * Search for product information using AI (Perplexity)
   */
  static async searchProductWithAI(barcode: string): Promise<AISearchResult> {
    const timer = new PerformanceTimer('ai_search')

    try {
      // Track AI search start
      AnalyticsService.trackEvent({
        type: 'ai_search_started',
        barcode
      })

      // Use server action for AI search
      const formData = new FormData()
      formData.append('query', `Find detailed product information for barcode: ${barcode}. Include product name, brand, category, description, specifications, and any other relevant details.`)
      formData.append('context', `Barcode: ${barcode}`)
      
      const response = await searchProductsWithAIAction(formData)

      if (!response.success) {
        throw new Error('AI search request failed')
      }

      const data = response.data!

      const result = {
        confidence: 0.7, // Default confidence for AI results
        brand: data.brand,
        category: data.category,
        description: data.description,
        imageUrl: undefined, // AI search doesn't return images currently
        productName: data.productName,
        sources: data.searchSuggestions || [],
        specifications: {}
      }

      // Track successful AI search
      const duration = timer.end(true, { confidence: result.confidence, barcode })
      AnalyticsService.trackEvent({
        confidence: result.confidence,
        type: 'ai_search_completed',
        barcode,
        duration
      })

      return result
    } catch (error) {
      console.error('Error in AI product search:', error)

      // Track AI search error
      const duration = timer.end(false, { barcode, error: (error as Error).message })
      AnalyticsService.trackError(error as Error, { barcode, operation: 'ai_search' })

      // Return mock data for development
      const mockResult = this.getMockAIResult(barcode)

      // Track mock result usage
      AnalyticsService.trackEvent({
        confidence: mockResult.confidence,
        type: 'ai_search_completed',
        barcode,
        duration,
        metadata: { fallbackToMock: true }
      })

      return mockResult
    }
  }

  /**
   * Mock AI search result for development/testing
   */
  private static getMockAIResult(barcode: string): AISearchResult {
    const mockResults: Record<string, AISearchResult> = {
      '111111111111': {
        confidence: 0.95,
        brand: 'Apple',
        category: 'Electronics > Smartphones',
        description: 'Latest iPhone with titanium design, A17 Pro chip, and advanced camera system',
        imageUrl: 'https://example.com/iphone15pro.jpg',
        productName: 'Apple iPhone 15 Pro',
        sources: ['Apple Official', 'GSMArena', 'TechCrunch'],
        specifications: {
          battery: 'Up to 23 hours video playback',
          camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
          connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3',
          display: '6.1-inch Super Retina XDR',
          storage: '128GB'
        }
      },
      '222222222222': {
        confidence: 0.88,
        brand: 'Nike',
        category: 'Footwear > Athletic Shoes',
        description: 'Lifestyle shoe with large Max Air unit for all-day comfort',
        productName: 'Nike Air Max 270',
        sources: ['Nike.com', 'Foot Locker', 'Sneaker News'],
        specifications: {
          colors: 'Multiple colorways available',
          material: 'Mesh and synthetic upper',
          sole: 'Rubber outsole with Max Air cushioning',
          weight: '310g (size 9)'
        }
      }
    }

    return mockResults[barcode] || {
      confidence: 0.1,
      brand: 'Unknown',
      category: 'Uncategorized',
      description: `Product information not found for barcode: ${barcode}`,
      productName: 'Unknown Product',
      sources: [],
      specifications: {}
    }
  }

  /**
   * Add a new product to PIM from AI search results
   */
  static async addProductToPIM(aiResult: AISearchResult, barcode: string, userId?: string): Promise<ProductWithBarcodes> {
    const timer = new PerformanceTimer('product_import')

    try {
      // Determine barcode type based on length and format
      const barcodeType = this.determineBarcodeType(barcode)

      // Generate SKU from barcode
      const sku = `AI-${barcode.slice(-8)}`

      // Create product via API
      const response = await fetch('/api/products', {
        body: JSON.stringify({
          barcode: {
            type: barcodeType,
            barcode: barcode,
            isPrimary: true
          },
          product: {
            aiConfidence: aiResult.confidence,
            name: aiResult.productName || 'Unknown Product',
            aiGenerated: true,
            aiSources: aiResult.sources,
            attributes: {
              brand: aiResult.brand,
              ...aiResult.specifications,
              confidence: aiResult.confidence,
              aiGenerated: true,
              sources: aiResult.sources
            },
            category: aiResult.category || 'Uncategorized',
            createdBy: userId,
            description: aiResult.description,
            sku: sku,
            status: 'DRAFT'
          }
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      const result = await response.json()

      if (!result) {
        throw new Error('Failed to create product')
      }

      console.log('Product added to PIM:', result)

      // Track successful product import
      const duration = timer.end(true, {
        confidence: aiResult.confidence,
        barcode,
        productId: result.id
      })

      AnalyticsService.trackEvent({
        confidence: aiResult.confidence,
        type: 'product_imported',
        barcode,
        duration,
        productId: result.id
      })

      return result
    } catch (error) {
      console.error('Error adding product to PIM:', error)

      // Track import failure
      const duration = timer.end(false, {
        confidence: aiResult.confidence,
        barcode,
        error: (error as Error).message
      })

      AnalyticsService.trackError(error as Error, {
        confidence: aiResult.confidence,
        barcode,
        operation: 'product_import'
      })

      throw new Error('Failed to add product to PIM system')
    }
  }

  /**
   * Save scan history to database
   */
  static async saveScanHistory(scanResult: ScanResult, userId?: string, productId?: string): Promise<void> {
    try {
      const formData = new FormData()
      formData.append('barcode', scanResult.data)
      if (userId) formData.append('userId', userId)
      formData.append('sessionId', 'web-session') // TODO: Generate proper session ID
      
      const result = {
        type: scanResult.type,
        barcode: scanResult.data,
        note: scanResult.note,
        platform: typeof window !== 'undefined' ? 'web' : 'mobile',
        productId: productId,
        rawData: scanResult.data,
      }
      formData.append('result', JSON.stringify(result))
      
      await saveScanHistoryAction(formData)
    } catch (error) {
      console.error('Error saving scan history:', error)
      // Don't throw - scan history is not critical
    }
  }

  /**
   * Get all products (for PIM listing)
   */
  static async getAllProducts(organizationId?: string): Promise<ProductWithBarcodes[]> {
    try {
      const url = organizationId ? `/api/products?orgId=${organizationId}` : '/api/products'
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      
      return response.json()
    } catch (error) {
      console.error('Error getting products:', error)
      throw new Error('Failed to fetch products')
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<ProductWithBarcodes | null> {
    try {
      const response = await fetch(`/api/products/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch product')
      }
      
      return response.json()
    } catch (error) {
      console.error('Error getting product by ID:', error)
      throw new Error('Failed to fetch product')
    }
  }

  /**
   * Update product in PIM
   */
  static async updateProduct(id: string, updates: Partial<Product>): Promise<ProductWithBarcodes | null> {
    try {
      const response = await fetch(`/api/products/${id}`, {
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH'
      })
      
      if (!response.ok) {
        throw new Error('Failed to update product')
      }
      
      return response.json()
    } catch (error) {
      console.error('Error updating product:', error)
      throw new Error('Failed to update product')
    }
  }

  /**
   * Generate barcode suggestions for common formats
   */
  static generateBarcodeVariations(scannedCode: string): string[] {
    const variations = [scannedCode]

    // Add leading zeros for UPC-A format
    if (scannedCode.length === 11) {
      variations.push('0' + scannedCode)
    }

    // Remove check digit and try
    if (scannedCode.length > 8) {
      variations.push(scannedCode.slice(0, -1))
    }

    // Add common prefixes
    const prefixes = ['0', '00', '000']
    prefixes.forEach(prefix => {
      if (scannedCode.length + prefix.length <= 13) {
        variations.push(prefix + scannedCode)
      }
    })

    return [...new Set(variations)] // Remove duplicates
  }

  /**
   * Determine barcode type based on format
   */
  private static determineBarcodeType(barcode: string): BarcodeType {
    const length = barcode.length

    if (length === 12) return 'UPC_A'
    if (length === 8) return 'UPC_E'
    if (length === 13) return 'EAN_13'
    if (length === 8) return 'EAN_8'
    if (length >= 6 && length <= 128) return 'CODE_128'

    return 'OTHER'
  }

  /**
   * Get scan history for a user
   */
  static async getScanHistory(userId?: string, limit = 50): Promise<any[]> {
    try {
      const formData = new FormData()
      formData.append('limit', limit.toString())
      if (userId) formData.append('userId', userId)
      formData.append('sessionId', 'web-session') // TODO: Generate proper session ID
      
      const response = await getScanHistoryAction(formData)
      
      if (!response.success) {
        console.error('Failed to fetch scan history:', response.error)
        return []
      }
      
      return response.data?.scans || []
    } catch (error) {
      console.error('Error getting scan history:', error)
      return []
    }
  }

  /**
   * Search products by name, SKU, or barcode
   */
  static async searchProducts(query: string, organizationId?: string): Promise<ProductWithBarcodes[]> {
    try {
      const formData = new FormData()
      formData.append('query', query)
      formData.append('limit', '50')
      
      const response = await searchProductsAction(formData)
      
      if (!response.success) {
        throw new Error('Failed to search products')
      }
      
      return response.data?.products || []
    } catch (error) {
      console.error('Error searching products:', error)
      throw new Error('Failed to search products')
    }
  }
}
