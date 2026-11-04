import React, { useState, useEffect, useMemo, useRef } from 'react'
import { flushSync } from 'react-dom'
import { StoreProvider, useStore } from './context/StoreContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { WishlistProvider, useWishlist } from './context/WishlistContext.jsx'
import Header from './components/Header.jsx'
import FilterBar from './components/FilterBar.jsx'
import ProductCard from './components/ProductCard.jsx'
import ProductModal from './components/ProductModal.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import WishlistDrawer from './components/WishlistDrawer.jsx'
import ScrollNavButtons from './components/ScrollNavButtons.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import TelegramIcon from './components/TelegramIcon.jsx'
import {
  SparklesIcon,
  TruckIcon,
  PackageIcon,
  StoreIcon,
  MapPinIcon,
  PhoneIcon,
  CreditCardIcon,
  ClockIcon,
  TrashIcon
} from './components/Icons.jsx'

function ShopContent({ theme, toggleTheme }) {
  const { currentStore } = useStore()
  const { recentlyViewed, clearRecentlyViewed } = useWishlist()

  const [products, setProducts] = useState([])
  const [allProductsCatalog, setAllProductsCatalog] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(
    () => localStorage.getItem('ngrsine_selected_category') || ''
  )
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [stockFilter, setStockFilter] = useState(
    () => localStorage.getItem('ngrsine_stock_filter') || 'all'
  )
  const [sortBy, setSortBy] = useState(
    () => localStorage.getItem('ngrsine_sort_by') || 'default'
  )
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Persist filter selections to localStorage so they survive page reloads / revisits
  useEffect(() => {
    localStorage.setItem('ngrsine_selected_category', selectedCategory)
  }, [selectedCategory])

  useEffect(() => {
    localStorage.setItem('ngrsine_stock_filter', stockFilter)
  }, [stockFilter])

  useEffect(() => {
    localStorage.setItem('ngrsine_sort_by', sortBy)
  }, [sortBy])

  // Always fetch full catalog once on mount (first try static /data/products.json, then fallback to /api/shop/products)
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        let res = await fetch('/data/products.json')
        if (!res.ok) {
          res = await fetch('/api/shop/products')
        }
        const data = await res.json()
        if (data.products && data.products.length > 0) {
          setAllProductsCatalog(data.products)
          setProducts(data.products)
        }
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories)
        }
        setLoading(false)
      } catch (err) {
        console.warn('Primary catalog fetch failed, trying API fallback:', err)
        fetch('/api/shop/products')
          .then((r) => r.json())
          .then((data) => {
            if (data.products) {
              setAllProductsCatalog(data.products)
              setProducts(data.products)
            }
            if (data.categories) setCategories(data.categories)
            setLoading(false)
          })
          .catch((e) => {
            console.error('All catalog fetches failed:', e)
            setLoading(false)
          })
      }
    }
    loadCatalog()
  }, [])

  // Filter products when category or search changes (instant client-side filter with API fallback)
  useEffect(() => {
    if (allProductsCatalog && allProductsCatalog.length > 0) {
      let filtered = [...allProductsCatalog]
      if (selectedCategory && selectedCategory !== 'new_arrivals') {
        const catLower = selectedCategory.toLowerCase()
        filtered = filtered.filter(
          (p) => (p.category || '').toLowerCase() === catLower
        )
      }
      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase().trim()
        filtered = filtered.filter((p) => {
          const name = (p.name || '').toLowerCase()
          const content = (p.content || '').toLowerCase()
          const cat = (p.category || '').toLowerCase()
          return name.includes(term) || content.includes(term) || cat.includes(term)
        })
      }
      setProducts(filtered)
      setLoading(false)
      return
    }

    // Fallback: fetch from API if allProductsCatalog is not yet populated
    setLoading(true)
    let url = '/api/shop/products?'
    if (selectedCategory && selectedCategory !== 'new_arrivals') {
      url += `category=${encodeURIComponent(selectedCategory)}&`
    }
    if (debouncedSearch) url += `search=${encodeURIComponent(debouncedSearch)}`

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const prods = data.products || []
        setProducts(prods)
        if (data.categories) setCategories(data.categories)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Fetch products error:', err)
        setLoading(false)
      })
  }, [selectedCategory, debouncedSearch, allProductsCatalog])

  const hasHandledInitialDeepLink = useRef(false)

  // Open product modal & sync URL (?p=<id>) synchronously
  const handleOpenProduct = (product) => {
    if (!product) return
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('p', product.id)
      window.history.replaceState({ pId: product.id }, '', url.toString())
    } catch (e) {}
    setSelectedProduct(product)
  }

  // Close product modal & cleanly remove (?p=) from URL immediately
  const handleCloseProduct = () => {
    try {
      const url = new URL(window.location.href)
      if (url.searchParams.has('p') || url.searchParams.has('product')) {
        url.searchParams.delete('p')
        url.searchParams.delete('product')
        const newSearch = url.searchParams.toString()
        const newUrl = url.pathname + (newSearch ? `?${newSearch}` : '')
        window.history.replaceState({}, '', newUrl)
      }
    } catch (e) {}
    setSelectedProduct(null)
  }

  // Handle direct product URL linking (?p=<id> or ?product=<id>) on initial mount ONLY
  useEffect(() => {
    if (hasHandledInitialDeepLink.current) return
    const params = new URLSearchParams(window.location.search)
    const pid = params.get('p') || params.get('product')
    if (pid) {
      const catalog = allProductsCatalog.length > 0 ? allProductsCatalog : products
      if (catalog.length > 0) {
        const match = catalog.find((item) => String(item.id) === String(pid))
        if (match) {
          hasHandledInitialDeepLink.current = true
          setSelectedProduct(match)
        }
      }
    } else {
      hasHandledInitialDeepLink.current = true
    }
  }, [products, allProductsCatalog])

  // Handle browser back and forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const pid = params.get('p') || params.get('product')
      const catalog = allProductsCatalog.length > 0 ? allProductsCatalog : products
      if (pid && catalog.length > 0) {
        const match = catalog.find((item) => String(item.id) === String(pid))
        setSelectedProduct(match || null)
      } else {
        setSelectedProduct(null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [products, allProductsCatalog])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Special handling for New Arrivals: stock positive (in-stock) items sorted in order
    if (selectedCategory === 'new_arrivals') {
      result = result.filter((p) => {
        if (p.var_group) {
          return (
            !!p.var_group.in_stock ||
            (p.var_group.combos &&
              p.var_group.combos.some(
                (c) => Number(c.stock) > 0 || c.stock_status === 'instock'
              ))
          )
        }
        return p.stock_status === 'instock' || Number(p.stock) > 0
      })

      // Default chronological sort: newest arrival (highest ID) first
      if (sortBy === 'default' || !sortBy) {
        result.sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
      }
    } else {
      // Normal Stock status filter
      if (stockFilter === 'instock') {
        result = result.filter((p) =>
          p.var_group ? !!p.var_group.in_stock : p.stock_status === 'instock'
        )
      } else if (stockFilter === 'preorder') {
        result = result.filter((p) =>
          p.var_group ? !p.var_group.in_stock : p.stock_status !== 'instock'
        )
      }
    }

    // Sort
    if (sortBy === 'price_asc') {
      result.sort((a, b) => {
        const priceA = a.var_group ? a.var_group.price_min : Number(a.selling_price || 0)
        const priceB = b.var_group ? b.var_group.price_min : Number(b.selling_price || 0)
        return priceA - priceB
      })
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => {
        const priceA = a.var_group ? a.var_group.price_max : Number(a.selling_price || 0)
        const priceB = b.var_group ? b.var_group.price_max : Number(b.selling_price || 0)
        return priceB - priceA
      })
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [products, selectedCategory, stockFilter, sortBy])

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('')
    setSearch('')
    setDebouncedSearch('')
    setStockFilter('all')
    setSortBy('default')
    try {
      localStorage.removeItem('ngrsine_selected_category')
      localStorage.removeItem('ngrsine_stock_filter')
      localStorage.removeItem('ngrsine_sort_by')
    } catch (e) {}
  }

  return (
    <div className="shop-app-wrapper" data-theme={theme}>
      {/* Liquid Glass Ambient Light Elements */}
      <div className="liquid-glass-ambient" aria-hidden="true">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="main-content-container">
        {/* Store Hero Banner - International Modern Tech Redesign */}
        <section className="store-hero-banner">
          <div className="hero-banner-inner">
            <div className="hero-brand-showcase">
              <div className="hero-brand-logo">
                <img
                  src="/logo.png"
                  alt="Shop with NgrSine"
                  className="hero-brand-logo-img"
                />
              </div>
              <div className="hero-brand-texts">
                <div className="hero-pill-badge">
                  <SparklesIcon size={14} className="hero-sparkle-icon" />
                  <span>Official Tech Store • {allProductsCatalog.length || 207}+ Items</span>
                </div>
                <h1 className="hero-brand-title">Shop with NgrSine</h1>
                <p className="hero-brand-tagline">
                  Gaming Gear, Custom Keyboards & Curated Tech Accessories
                </p>
                <p className="hero-subtext">
                  အရည်အသွေးမြင့် ကုန်ပစ္စည်းများကို အာမခံချက်အပြည့်ဖြင့် Royal Express ဖြင့် အိမ်တိုင်ရာရောက် ပို့ဆောင်ပေးပါသည်
                </p>
              </div>
            </div>

            {/* Right: Modern Trust Badges */}
            <div className="hero-trust-badges">
              <div className="hero-badge-pill" title="မြန်မာတစ်နိုင်ငံလုံး အိမ်ရောက်ငွေချေ ရရှိပါသည်">
                <div className="pill-icon-wrap"><TruckIcon size={16} /></div>
                <div className="pill-text-wrap">
                  <span className="pill-title">Royal Express COD</span>
                  <span className="pill-desc">မြို့ပေါင်း ၁၀၀+ အိမ်ရောက်ငွေချေ</span>
                </div>
              </div>

              <div className="hero-badge-pill" title="စစ်မှန်သော အရည်အသွေး အာမခံ">
                <div className="pill-icon-wrap"><PackageIcon size={16} /></div>
                <div className="pill-text-wrap">
                  <span className="pill-title">100% Authentic Quality</span>
                  <span className="pill-desc">စစ်မှန်သော ပစ္စည်းများသာ</span>
                </div>
              </div>

              <a
                href="https://t.me/mark03168_bot"
                target="_blank"
                rel="noreferrer"
                className="hero-badge-pill telegram-pill"
                title="စုံစမ်းမေးမြန်းမှုများအတွက် ၂၄ နာရီ မေးမြန်းနိုင်ပါသည်"
              >
                <div className="pill-icon-wrap"><TelegramIcon size={16} /></div>
                <div className="pill-text-wrap">
                  <span className="pill-title">24/7 AI Helper Bot</span>
                  <span className="pill-desc">@mark03168_bot နှင့် စကားပြောရန်</span>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar with Category and Stock Dropdowns */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          stockFilter={stockFilter}
          onStockFilterChange={setStockFilter}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Product Grid / Skeleton Loading */}
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card skeleton-card">
                <div className="skeleton-media-wrap"></div>
                <div className="skeleton-body">
                  <div className="skeleton-line skeleton-cat"></div>
                  <div className="skeleton-line skeleton-title"></div>
                  <div className="skeleton-line skeleton-price"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="products-grid" key={selectedCategory || 'all'}>
            {filteredProducts.map((p, index) => (
              <ProductCard
                key={p.id}
                product={p}
                style={{ animationDelay: `${Math.min(index * 0.035, 0.35)}s` }}
                onClick={() => handleOpenProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="no-products-view">
            <PackageIcon size={52} className="no-products-icon" />
            <h3 className="no-products-title">ကိုက်ညီသော ပစ္စည်း မတွေ့ရှိပါ</h3>
            <p className="no-products-desc">ရှာဖွေမှု စာသား သို့မဟုတ် Filter များကို ပြောင်းလဲစမ်းသပ်ပါ</p>
            <button className="reset-filters-btn" onClick={handleResetFilters}>
              အစမှ ပြန်လည်ရှာဖွေမည်
            </button>
          </div>
        )}

        {/* Recently Viewed Products Section */}
        {recentlyViewed.length > 0 && (
          <section className="recently-viewed-section">
            <div className="section-header-row">
              <div className="section-title-group">
                <ClockIcon size={20} className="section-icon" />
                <h3 className="section-title">မကြာသေးမီက ကြည့်ရှုခဲ့သည်များ</h3>
                <span className="section-badge-count">{recentlyViewed.length} ခု</span>
              </div>
              <button
                type="button"
                className="clear-history-btn"
                onClick={clearRecentlyViewed}
                title="ကြည့်ရှုမှတ်တမ်း အားလုံး ရှင်းထုတ်မည်"
              >
                <TrashIcon size={14} /> ရှင်းထုတ်မည်
              </button>
            </div>

            <div className="recently-viewed-scroll-track">
              {recentlyViewed.map((item) => {
                const itemKv = item.var_group
                const itemInStock = itemKv ? !!itemKv.in_stock : item.stock_status === 'instock'
                const itemPrice = itemKv ? itemKv.price_min : Number(item.selling_price || 0)
                return (
                  <div
                    key={item.id}
                    className="recent-product-card"
                    onClick={() => {
                      const fullItem =
                        (allProductsCatalog.length > 0 ? allProductsCatalog : products).find(
                          (x) => String(x.id) === String(item.id)
                        ) || item
                      handleOpenProduct(fullItem)
                    }}
                    title={`${item.name} ကို ကြည့်ရှုရန်`}
                  >
                    <div className="recent-media-wrap">
                      {item.thumb ? (
                        <img
                          src={item.thumb}
                          alt={item.name}
                          className="recent-thumb-img"
                          loading="lazy"
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
                      <span className={`recent-stock-tag ${itemInStock ? 'instock' : 'pre'}`}>
                        {itemInStock ? 'ပစ္စည်းရှိ' : 'Pre'}
                      </span>
                    </div>
                    <div className="recent-card-body">
                      {item.category && <span className="recent-cat-label">{item.category}</span>}
                      <h4 className="recent-title">{item.name}</h4>
                      <div className="recent-price-row">
                        <span className="recent-price">
                          {Number(itemPrice).toLocaleString()} Ks
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="shop-footer">
          <div className="footer-inner">
            <div className="footer-col">
              <div className="footer-brand">
                <StoreIcon size={20} /> {currentStore.name_my}
              </div>
              <p className="footer-desc">{currentStore.description}</p>
              <div className="footer-info-row">
                <MapPinIcon size={16} /> {currentStore.address}
              </div>
            </div>

            <div className="footer-col">
              <div className="footer-heading">ဆက်သွယ်ရန်</div>
              <div className="footer-info-row">
                <PhoneIcon size={16} /> ဖုန်း: <b>{currentStore.phone}</b>
              </div>
              <div className="footer-info-row footer-tg-row">
                <TelegramIcon size={18} /> Telegram:{' '}
                <a
                  href={`https://t.me/${currentStore?.telegram || 'mark03168_bot'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-link"
                >
                  @{currentStore?.telegram || 'mark03168_bot'}
                </a>
              </div>
            </div>

            <div className="footer-col">
              <div className="footer-heading">ပို့ဆောင်ရေးနှင့် ငွေပေးချေမှု</div>
              <div className="footer-info-row">
                <TruckIcon size={16} />{' '}
                <span>
                  <b>Royal Express</b> ရောက်သည့်မြို့တိုင်း အိမ်ရောက်ငွေချေ (COD) ရရှိပါသည်။
                </span>
              </div>
              <div className="footer-info-row">
                <CreditCardIcon size={16} />{' '}
                <span>KPay, WavePay, Mobile Banking များဖြင့်လည်း ငွေပေးချေနိုင်ပါသည်။</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            © {new Date().getFullYear()} NgrSine Business System. All rights reserved.
          </div>
        </footer>
      </main>

      {/* Modals, Drawers & Chat Widget */}
      {selectedProduct && (
        <ProductModal
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={handleCloseProduct}
          allProducts={allProductsCatalog.length > 0 ? allProductsCatalog : products}
          onSelectProduct={handleOpenProduct}
        />
      )}

      <WishlistDrawer
        onSelectProduct={(p) => {
          const fullItem =
            (allProductsCatalog.length > 0 ? allProductsCatalog : products).find(
              (x) => String(x.id) === String(p.id)
            ) || p
          handleOpenProduct(fullItem)
        }}
      />

      <CartDrawer />

      <ScrollNavButtons />

      <ChatWidget
        products={allProductsCatalog.length > 0 ? allProductsCatalog : products}
        categories={categories}
        onSelectProduct={handleOpenProduct}
      />
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('ngrsine_theme') || 'light'
    } catch (e) {
      return 'light'
    }
  })

  const toggleTheme = (e) => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    const direction = nextTheme === 'dark' ? 'to-dark' : 'to-light'

    // Calculate ripple origin from click coordinates or button center
    let x = window.innerWidth - 60
    let y = 30
    if (e && typeof e.clientX === 'number' && e.clientX > 0) {
      x = e.clientX
      y = e.clientY
    } else if (e?.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    }

    // Maximum radius to reach the furthest corner of viewport
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    document.documentElement.style.setProperty('--theme-x', `${Math.round(x)}px`)
    document.documentElement.style.setProperty('--theme-y', `${Math.round(y)}px`)
    document.documentElement.style.setProperty('--theme-radius', `${Math.ceil(endRadius)}px`)

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      document.documentElement.setAttribute('data-theme-transition', direction)
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setTheme(nextTheme)
          document.documentElement.setAttribute('data-theme', nextTheme)
        })
      })
      transition.finished.finally(() => {
        document.documentElement.removeAttribute('data-theme-transition')
      })
    } else {
      document.documentElement.classList.add('no-vt-fallback')
      document.documentElement.setAttribute('data-theme-transition', direction)
      setTheme(nextTheme)
      document.documentElement.setAttribute('data-theme', nextTheme)
      setTimeout(() => {
        document.documentElement.removeAttribute('data-theme-transition')
        document.documentElement.classList.remove('no-vt-fallback')
      }, 600)
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem('ngrsine_theme', theme)
    } catch (e) {}
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <StoreProvider>
      <CartProvider>
        <WishlistProvider>
          <ShopContent theme={theme} toggleTheme={toggleTheme} />
        </WishlistProvider>
      </CartProvider>
    </StoreProvider>
  )
}
