import React, { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('ngrsine_wishlist')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })

  // Recently Viewed state
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem('ngrsine_recently_viewed')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })

  // Drawer visibility state
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)

  // Save Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ngrsine_wishlist', JSON.stringify(wishlist))
    } catch (e) {}
  }, [wishlist])

  // Save Recently Viewed to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ngrsine_recently_viewed', JSON.stringify(recentlyViewed))
    } catch (e) {}
  }, [recentlyViewed])

  // Check if a product is wishlisted
  const isWishlisted = (productId) => {
    if (!productId) return false
    return wishlist.some((item) => String(item.id) === String(productId))
  }

  // Toggle wishlist state
  const toggleWishlist = (product) => {
    if (!product || !product.id) return
    setWishlist((prev) => {
      const exists = prev.some((item) => String(item.id) === String(product.id))
      if (exists) {
        return prev.filter((item) => String(item.id) !== String(product.id))
      }
      const itemToSave = {
        id: product.id,
        name: product.name,
        category: product.category,
        selling_price: product.selling_price,
        thumb: product.thumb || product.images?.[0] || '',
        var_group: product.var_group,
        stock_status: product.stock_status,
      }
      return [itemToSave, ...prev]
    })
  }

  // Remove single item from wishlist
  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => String(item.id) !== String(productId)))
  }

  // Clear all wishlist items
  const clearWishlist = () => {
    setWishlist([])
  }

  // Add a product to Recently Viewed (max 10 items, no duplicates, newest first)
  const addRecentlyViewed = (product) => {
    if (!product || !product.id) return
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => String(item.id) !== String(product.id))
      const itemToSave = {
        id: product.id,
        name: product.name,
        category: product.category,
        selling_price: product.selling_price,
        thumb: product.thumb || product.images?.[0] || '',
        var_group: product.var_group,
        stock_status: product.stock_status,
      }
      return [itemToSave, ...filtered].slice(0, 10)
    })
  }

  // Clear all recently viewed items
  const clearRecentlyViewed = () => {
    setRecentlyViewed([])
  }

  const wishlistCount = wishlist.length

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount,
        recentlyViewed,
        addRecentlyViewed,
        clearRecentlyViewed,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
