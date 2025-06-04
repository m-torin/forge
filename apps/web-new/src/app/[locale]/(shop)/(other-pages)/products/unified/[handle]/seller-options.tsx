'use client'

import { useState } from 'react'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { AddToCardButton, ButtonPrimary, NcInputNumber } from '@repo/design-system/mantine-ciseco'
import { analytics } from '@repo/analytics'
import { type Seller, type SellerOptionsProps } from './types'
import { useTrackAffiliateClick } from './use-track-affiliate'

interface SellerOptionsPropsWithData extends SellerOptionsProps {
  sellers: Seller[]
  productData: {
    id: string
    title: string
    price: number
    handle: string
    featuredImage?: { src: string }
    colorSelected?: string
    sizeSelected?: string
    status?: string
  }
  dict: any
  locale: string
}

export function SellerOptions({ 
  displayMode = 'buttons', 
  includeDirectSale = false,
  sellers,
  productData,
  dict,
  locale
}: SellerOptionsPropsWithData) {
  const [quantity, setQuantity] = useState(1)
  const trackAffiliateClick = useTrackAffiliateClick()
  
  const displayLowestPrice = Math.min(...sellers.map(s => s.price))
  const displayHighestPrice = Math.max(...sellers.map(s => s.price))

  const handleAddToCart = () => {
    // Track add to cart event using PostHog
    analytics.capture('Product Added', {
      productId: productData.id,
      productName: productData.title,
      price: productData.price,
      quantity,
      color: productData.colorSelected,
      size: productData.sizeSelected,
      locale,
      currency: 'USD',
      value: productData.price * quantity
    })
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity)
    // Quantity change tracking could be added here if needed
  }

  // If includeDirectSale is true, show the original Ciseco add to cart with quantity selector
  if (includeDirectSale) {
    return (
      <>
        {/* Original Ciseco Add to Cart Section */}
        <div className="flex gap-x-3.5">
          <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
            <NcInputNumber defaultValue={quantity} onChange={handleQuantityChange} />
          </div>
          <AddToCardButton
            as={'div'}
            imageUrl={productData.featuredImage?.src || ''}
            price={productData.price}
            quantity={quantity}
            title={productData.title}
            color={productData.colorSelected}
            size={productData.sizeSelected}
            className="flex flex-1 shrink-0"
            onClick={handleAddToCart}
          >
            <ButtonPrimary className="flex-1">
              <HugeiconsIcon
                icon={ShoppingBag03Icon}
                size={20}
                color="currentColor"
                className="hidden sm:inline-block"
                strokeWidth={1.5}
              />
              <span className="ms-4">{dict.product.addToCart}</span>
            </ButtonPrimary>
          </AddToCardButton>
        </div>

        {/* Affiliate Sellers Section */}
        {sellers.length > 0 && (
          <div className="mt-8">
            <SellerList 
              sellers={sellers} 
              displayMode={displayMode}
              productData={productData}
              trackAffiliateClick={trackAffiliateClick}
              displayLowestPrice={displayLowestPrice}
              displayHighestPrice={displayHighestPrice}
              dict={dict}
              locale={locale}
            />
          </div>
        )}
      </>
    )
  }

  // If no direct sale, only show affiliate sellers
  return (
    <SellerList 
      sellers={sellers} 
      displayMode={displayMode}
      productData={productData}
      trackAffiliateClick={trackAffiliateClick}
      displayLowestPrice={displayLowestPrice}
      displayHighestPrice={displayHighestPrice}
      dict={dict}
      locale={locale}
    />
  )
}

function SellerList({ 
  sellers, 
  displayMode, 
  productData, 
  trackAffiliateClick,
  displayLowestPrice,
  displayHighestPrice,
  dict,
  locale
}: {
  sellers: Seller[]
  displayMode: 'buttons' | 'table'
  productData: any
  trackAffiliateClick: any
  displayLowestPrice: number
  displayHighestPrice: number
  dict: any
  locale: string
}) {
  const handleSellerClick = (seller: Seller) => {
    // Enhanced tracking with locale
    trackAffiliateClick({
      productId: productData.id,
      productTitle: productData.title,
      productPrice: productData.price,
      seller: seller.name,
      sellerPrice: seller.price,
      isLowestPrice: seller.price === displayLowestPrice,
      displayMode,
      productHandle: productData.handle,
      locale,
      priceDifference: seller.price - productData.price,
      priceDifferencePercent: ((seller.price - productData.price) / productData.price * 100).toFixed(2)
    })
  }

  if (displayMode === 'table') {
    return (
      <div className="w-full">
        <h3 className="mb-4 text-lg font-semibold">{dict.product.comparePrices}</h3>
        <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">{dict.product.seller}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">{dict.product.price}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">{dict.product.availability}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">{dict.product.shipping}</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-neutral-700 dark:text-neutral-300">{dict.product.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {sellers.map((seller) => (
                <tr key={seller.name} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{seller.logo}</span>
                      <span className="font-medium">{seller.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-semibold ${seller.price === displayLowestPrice ? 'text-green-600 dark:text-green-400' : ''}`}>
                        ${seller.price.toFixed(2)}
                      </span>
                      {seller.price === displayLowestPrice && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-300">
                          {dict.product.lowest}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${seller.availability === dict.product.inStock ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {seller.availability}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {seller.shipping}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={seller.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleSellerClick(seller)}
                      className={`mx-auto block w-24 rounded-md px-4 py-2 text-center text-sm font-medium transition-colors ${seller.primaryColor} ${seller.hoverColor} ${seller.textColor}`}
                    >
                      {dict.product.shopNow}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
          <span>{dict.product.priceRange}: ${displayLowestPrice.toFixed(2)} - ${displayHighestPrice.toFixed(2)}</span>
          <span className="text-xs">{dict.product.pricesVary}</span>
        </div>
      </div>
    )
  }

  // Button list view
  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{dict.product.alsoAvailableAt}</h3>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {dict.product.from} ${displayLowestPrice.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {sellers.map((seller) => (
          <a
            key={seller.name}
            href={seller.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleSellerClick(seller)}
            className={`flex items-center justify-between rounded-lg p-4 transition-all ${seller.primaryColor} ${seller.hoverColor} ${seller.textColor} shadow-sm hover:shadow-md`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{seller.logo}</span>
              <div>
                <div className="font-semibold">{seller.name}</div>
                <div className="text-sm opacity-90">{seller.shipping}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">${seller.price.toFixed(2)}</div>
              <div className="text-sm opacity-90">{seller.availability}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}