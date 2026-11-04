import React from 'react'
import { useStore } from '../context/StoreContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import TelegramIcon from './TelegramIcon.jsx'
import CartIcon from './CartIcon.jsx'
import { SunIcon, MoonIcon, HeartIcon } from './Icons.jsx'

export default function Header({ theme = 'light', toggleTheme }) {
  const { currentStore } = useStore()
  const { totalItems, setIsCartOpen } = useCart()
  const { wishlistCount, setIsWishlistOpen } = useWishlist()

  const logoSrc = theme === 'dark' ? '/logo-dark.png?v=2' : '/logo.png?v=2'

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="header-left">
          <div className="brand-group">
            <div className="brand-logo-wrap">
              <img
                src={logoSrc}
                alt="Shop with NgrSine"
                className="brand-logo-img"
                onError={(e) => {
                  if (e.target.src.indexOf('logo-dark.png') !== -1) {
                    e.target.src = '/logo.png'
                  }
                }}
              />
            </div>
            <div className="brand-texts">
              <span className="brand-title">Shop with NgrSine</span>
              <span className="brand-tagline">Online Store & Business</span>
            </div>
          </div>
        </div>

        {/* Actions: Theme Toggle, Telegram, Cart */}
        <div className="header-actions">
          {/* Dark / Light Mode Toggle Button with Animated Sliding Knob */}
          <button
            className={`theme-toggle-btn ${theme === 'dark' ? 'dark' : 'light'}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={theme === 'dark' ? 'Light mode သို့ ပြောင်းမည်' : 'Dark mode သို့ ပြောင်းမည်'}
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb">
                <span className="theme-toggle-icon sun">
                  <SunIcon size={14} />
                </span>
                <span className="theme-toggle-icon moon">
                  <MoonIcon size={14} />
                </span>
              </span>
            </span>
          </button>

          {/* Telegram Link */}
          <a
            className="action-btn action-telegram"
            href="https://t.me/mark03168_bot"
            target="_blank"
            rel="noreferrer"
            title="Telegram: @mark03168_bot"
          >
            <TelegramIcon size={19} />
            <span className="action-label">@mark03168_bot</span>
          </a>

          {/* Wishlist Button */}
          <button
            className="action-btn action-wishlist"
            onClick={() => setIsWishlistOpen(true)}
            title="စိတ်ကြိုက်စာရင်း ကြည့်ရန်"
            aria-label="View wishlist"
          >
            <HeartIcon
              size={18}
              color="currentColor"
              filled={wishlistCount > 0}
              fillColor="var(--primary)"
            />
            <span className="action-label">စိတ်ကြိုက်</span>
            {wishlistCount > 0 && <span className="cart-badge wishlist-badge">{wishlistCount}</span>}
          </button>

          {/* Cart Button */}
          <button
            className="action-btn action-cart"
            onClick={() => setIsCartOpen(true)}
            title="ခြင်းတောင်း ကြည့်ရန်"
          >
            <CartIcon size={19} color="currentColor" />
            <span className="action-label">ခြင်းတောင်း</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}
