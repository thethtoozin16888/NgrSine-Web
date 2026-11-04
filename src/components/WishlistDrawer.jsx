import React, { useState, useEffect } from 'react'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import CartIcon from './CartIcon.jsx'
import {
  CloseIcon,
  HeartIcon,
  TrashIcon,
  CheckCircleIcon,
  PackageIcon,
  ArrowRightIcon
} from './Icons.jsx'

export default function WishlistDrawer({ onSelectProduct }) {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    removeFromWishlist,
    clearWishlist,
    wishlistCount,
  } = useWishlist()

  const { addToCart, setIsCartOpen } = useCart()
  const [addedItemKey, setAddedItemKey] = useState(null)

  // ESC to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isWishlistOpen) {
        setIsWishlistOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isWishlistOpen, setIsWishlistOpen])

  if (!isWishlistOpen) return null

  const handleAddToCart = (product, e) => {
    e.stopPropagation()
    addToCart(product, null, 1)
    setAddedItemKey(product.id)
    setTimeout(() => setAddedItemKey(null), 2500)
  }

  const handleItemClick = (product) => {
    setIsWishlistOpen(false)
    if (onSelectProduct) {
      onSelectProduct(product)
    }
  }

  return (
    <div className="drawer-backdrop" onClick={() => setIsWishlistOpen(false)}>
      <div
        className="drawer-panel wishlist-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-drawer-title"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <HeartIcon size={22} filled={true} fillColor="#D9534F" />
            <div>
              <h2 id="wishlist-drawer-title" className="drawer-title">
                စိတ်ကြိုက် စာရင်း
              </h2>
              <span className="drawer-count">({wishlistCount} မျိုး သိမ်းထားသည်)</span>
            </div>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close wishlist"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        {wishlist.length === 0 ? (
          <div className="drawer-empty-view">
            <div className="empty-icon-wrap wishlist-empty-icon">
              <HeartIcon size={56} color="var(--primary-bronze)" />
            </div>
            <h3 className="empty-title">စိတ်ကြိုက်စာရင်းတွင် ပစ္စည်းမရှိသေးပါ</h3>
            <p className="empty-desc">
              မိမိနှစ်သက်သော ပစ္စည်းများကို အသည်းပုံ (Heart) နှိပ်၍ အလွယ်တကူ သိမ်းဆည်းထားနိုင်ပါသည်။
            </p>
            <button
              className="empty-action-btn"
              onClick={() => setIsWishlistOpen(false)}
            >
              ပစ္စည်းများ ဆက်လက်ကြည့်ရှုမည်
            </button>
          </div>
        ) : (
          <>
            <div className="drawer-items-list wishlist-items-list">
              {wishlist.map((item) => {
                const isAdded = addedItemKey === item.id
                return (
                  <div
                    key={item.id}
                    className="cart-item-card wishlist-item-card"
                    onClick={() => handleItemClick(item)}
                    title="အသေးစိတ် ကြည့်ရှုရန် နှိပ်ပါ"
                  >
                    <div className="item-img-wrap">
                      {item.thumb ? (
                        <img
                          src={item.thumb}
                          alt={item.name}
                          className="item-thumb-img"
                          onError={(e) => {
                            const base = item.thumb.split('?')[0].split('/').pop()
                            if (!item.thumb.startsWith('/data/images/') && base) {
                              e.target.src = `/data/images/${base}`
                            } else {
                              e.target.style.display = 'none'
                            }
                          }}
                        />
                      ) : (
                        <PackageIcon size={24} className="placeholder-icon" />
                      )}
                    </div>

                    <div className="item-details">
                      {item.category && (
                        <span className="item-category-tag">{item.category}</span>
                      )}
                      <h4 className="item-title">{item.name}</h4>
                      <div className="item-price-row">
                        <span className="item-price">
                          {Number(item.selling_price || 0).toLocaleString()} Ks
                        </span>
                      </div>

                      {/* Wishlist item action buttons */}
                      <div className="wishlist-actions-row" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={`wishlist-add-cart-btn ${isAdded ? 'added' : ''}`}
                          onClick={(e) => handleAddToCart(item, e)}
                        >
                          {isAdded ? (
                            <>
                              <CheckCircleIcon size={15} /> ထည့်ပြီးပါပြီ
                            </>
                          ) : (
                            <>
                              <CartIcon size={15} /> ခြင်းတောင်းထဲထည့်မည်
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="wishlist-remove-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromWishlist(item.id)
                          }}
                          title="စာရင်းမှ ဖယ်ရှားမည်"
                          aria-label="Remove from wishlist"
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Wishlist Drawer Footer */}
            <div className="drawer-footer wishlist-drawer-footer">
              <button
                type="button"
                className="wishlist-view-cart-btn"
                onClick={() => {
                  setIsWishlistOpen(false)
                  setIsCartOpen(true)
                }}
              >
                <CartIcon size={18} /> ခြင်းတောင်းသို့ သွားမည် <ArrowRightIcon size={14} />
              </button>

              <button
                type="button"
                className="clear-cart-link"
                onClick={clearWishlist}
              >
                <TrashIcon size={13} /> စိတ်ကြိုက်စာရင်း အကုန်ရှင်းထုတ်မည်
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
