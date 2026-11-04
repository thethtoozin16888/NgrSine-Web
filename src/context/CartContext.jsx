import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('ngrsine_cart')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('ngrsine_cart', JSON.stringify(cartItems))
    } catch (e) {}
  }, [cartItems])

  const addToCart = (product, selectedCombo = null, quantity = 1) => {
    const addQty = Math.min(99, Math.max(1, parseInt(quantity, 10) || 1))
    setCartItems(prev => {
      const color = selectedCombo?.color || ''
      const option = selectedCombo?.option || ''
      const key = `${product.id}-${color}-${option}`
      const existing = prev.find(item => item.cartKey === key)
      const price = Number(selectedCombo?.price ?? product.selling_price ?? 0)
      const image = selectedCombo?.images?.[0] || product.thumb || product.images?.[0] || ''

      if (existing) {
        return prev.map(item =>
          item.cartKey === key
            ? { ...item, quantity: Math.min(99, (parseInt(item.quantity, 10) || 0) + addQty) }
            : item
        )
      }

      return [
        ...prev,
        {
          cartKey: key,
          productId: product.id,
          name: product.name,
          category: product.category,
          color,
          option,
          price,
          image,
          quantity: addQty,
          stock_status: selectedCombo ? selectedCombo.stock_status : product.stock_status,
        }
      ]
    })
  }

  const updateQuantity = (cartKey, qty) => {
    const parsed = parseInt(qty, 10) || 0
    const validQty = Math.min(99, Math.max(0, parsed))
    if (validQty <= 0) {
      removeFromCart(cartKey)
      return
    }
    setCartItems(prev =>
      prev.map(item => (item.cartKey === cartKey ? { ...item, quantity: validQty } : item))
    )
  }

  const removeFromCart = (cartKey) => {
    setCartItems(prev => prev.filter(item => item.cartKey !== cartKey))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const totalItems = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0)
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
    0
  )

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
