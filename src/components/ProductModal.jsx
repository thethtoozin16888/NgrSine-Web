import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useStore } from '../context/StoreContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import TelegramIcon from './TelegramIcon.jsx'
import CartIcon from './CartIcon.jsx'
import {
  CloseIcon,
  PackageIcon,
  PlayIcon,
  CheckIcon,
  CheckCircleIcon,
  ClockIcon,
  PaletteIcon,
  SlidersIcon,
  VolumeIcon,
  FileTextIcon,
  TruckIcon,
  PhoneIcon,
  ArrowRightIcon,
  HeartIcon,
  ShareIcon,
  ZapIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  WifiIcon,
  LinkIcon
} from './Icons.jsx'

// Helper to reliably detect video formats (case-insensitive & handles query strings)
const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  const clean = url.split('?')[0].toLowerCase()
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.ogg')
  )
}

// Robust URL matcher that compares full URL, image filename basename, or stem without extension
const urlsMatch = (u1, u2) => {
  if (!u1 || !u2) return false
  if (u1 === u2) return true
  const b1 = u1.split('?')[0].split('/').pop().toLowerCase()
  const b2 = u2.split('?')[0].split('/').pop().toLowerCase()
  if (b1 && b2 && b1 === b2) return true
  const s1 = b1.replace(/\.[^/.]+$/, '')
  const s2 = b2.replace(/\.[^/.]+$/, '')
  return !!(s1 && s2 && s1 === s2)
}

export default function ProductModal({
  product: p,
  onClose,
  allProducts = [],
  onSelectProduct
}) {
  const { currentStore } = useStore()
  const { addToCart, setIsCartOpen } = useCart()
  const { isWishlisted, toggleWishlist, addRecentlyViewed } = useWishlist()

  const [addedToast, setAddedToast] = useState(false)
  const [shareToast, setShareToast] = useState(false)

  const wishlisted = isWishlisted(p.id)

  // 1. Detect same-name siblings in catalog (e.g. Spiderman Keycaps, Water Bottle, JMCY)
  const sameNameSiblings = useMemo(() => {
    if (!allProducts || !allProducts.length || !p?.name) return [p]
    const normName = p.name.trim().toLowerCase()
    const list = allProducts.filter(
      (item) => item.name && item.name.trim().toLowerCase() === normName
    )
    return list.length > 0 ? list : [p]
  }, [allProducts, p?.name, p?.id])

  const hasSiblings = sameNameSiblings.length > 1

  // 2. Variant group configuration
  const kv = p.var_group
  const hasVariants = !!kv
  const optLabel = kv?.option_label || 'အမျိုးအစား'

  // Detect if colors are numeric variations (e.g. Mouse Pad designs '1', '2', ... '21')
  const isNumericColors = useMemo(() => {
    return (
      Array.isArray(kv?.colors) &&
      kv.colors.length > 0 &&
      kv.colors.every((c) => /^\d+$/.test(String(c).trim()))
    )
  }, [kv?.colors])

  const colorGroupTitle = isNumericColors
    ? 'ပုံစံ / နံပါတ် ရွေးချယ်ရန်'
    : 'အရောင် ရွေးချယ်ရန်'

  const [selColor, setSelColor] = useState(kv?.colors?.[0] || '')
  const [selOption, setSelOption] = useState(kv?.options?.[0] || '')
  const [slide, setSlide] = useState(0)
  const [failedUrls, setFailedUrls] = useState({})
  const thumbStripRef = useRef(null)

  // Record into Recently Viewed history
  useEffect(() => {
    if (p && p.id) {
      addRecentlyViewed(p)
    }
  }, [p?.id])

  // Re-initialize variants, active slide and toasts whenever active product changes
  useEffect(() => {
    setSelColor(kv?.colors?.[0] || '')
    setSelOption(kv?.options?.[0] || '')
    setSlide(0)
    setFailedUrls({})
    setAddedToast(false)
    setShareToast(false)
  }, [p?.id])

  // Find matching combo for selected color × option
  let combo = null
  if (hasVariants && kv.combos) {
    combo =
      kv.combos.find((c) => c.color === selColor && c.option === selOption) ||
      kv.combos.find((c) => c.color === selColor) ||
      kv.combos.find((c) => c.option === selOption) ||
      kv.combos[0]
  }

  // Build a completely stable, deduplicated media list for this product.
  // Includes base photos, combo photos, and same-name sibling photos.
  // Fixed order ensures variant switching never shuffles thumbnail indexes!
  const allMedia = useMemo(() => {
    const list = []
    const seen = new Set()

    const add = (url, meta = {}) => {
      if (!url || typeof url !== 'string') return
      if (seen.has(url)) {
        const existing = list.find((item) => item.url === url)
        if (existing) {
          if (!existing.combo && meta.combo) existing.combo = meta.combo
          if (!existing.color && meta.color) existing.color = meta.color
          if (!existing.option && meta.option) existing.option = meta.option
          if (!existing.sibling && meta.sibling) existing.sibling = meta.sibling
        }
        return
      }
      seen.add(url)

      // Auto-tag matching combo, color and option if not already provided
      let comboRef = meta.combo || null
      let colorRef = meta.color || null
      let optionRef = meta.option || null

      if (!comboRef && kv?.combos) {
        const found = kv.combos.find((c) => Array.isArray(c.images) && c.images.includes(url))
        if (found) {
          comboRef = found
          colorRef = found.color || null
          optionRef = found.option || null
        }
      }

      list.push({
        url,
        ...meta,
        combo: comboRef,
        color: colorRef,
        option: optionRef
      })
    }

    // 1. Current product thumbnail
    if (p.thumb) {
      add(p.thumb, {
        productId: p.id,
        isThumb: true,
        combo: null,
        color: null,
        option: null
      })
    }

    // 2. Current product extra images
    if (Array.isArray(p.images)) {
      p.images.forEach((img) => {
        add(img, {
          productId: p.id,
          combo: null,
          color: null,
          option: null
        })
      })
    }

    // 3. Current product videos
    if (Array.isArray(p.videos)) {
      p.videos.forEach((vid) => {
        add(vid, {
          productId: p.id,
          isVideo: true,
          combo: null,
          color: null,
          option: null
        })
      })
    }

    // 4. Variant combos of current product (in fixed combo order)
    if (kv?.combos && Array.isArray(kv.combos)) {
      kv.combos.forEach((c) => {
        if (Array.isArray(c.images)) {
          c.images.forEach((img) => {
            add(img, {
              productId: p.id,
              combo: c,
              color: c.color || null,
              option: c.option || null
            })
          })
        }
        if (Array.isArray(c.videos)) {
          c.videos.forEach((vid) => {
            add(vid, {
              productId: p.id,
              isVideo: true,
              combo: c,
              color: c.color || null,
              option: c.option || null
            })
          })
        }
      })
    }

    // 5. Photos from same-name siblings (e.g. Spiderman Keycaps IDs 94, 274, 275)
    if (hasSiblings) {
      sameNameSiblings.forEach((sibling) => {
        if (String(sibling.id) === String(p.id)) return // Already included above
        if (sibling.thumb) {
          add(sibling.thumb, {
            productId: sibling.id,
            sibling,
            combo: null
          })
        }
        if (Array.isArray(sibling.images)) {
          sibling.images.forEach((img) => {
            add(img, {
              productId: sibling.id,
              sibling,
              combo: null
            })
          })
        }
        if (sibling.var_group?.combos && Array.isArray(sibling.var_group.combos)) {
          sibling.var_group.combos.forEach((sc) => {
            if (Array.isArray(sc.images)) {
              sc.images.forEach((img) => {
                add(img, {
                  productId: sibling.id,
                  sibling,
                  combo: sc,
                  color: sc.color || null,
                  option: sc.option || null
                })
              })
            }
          })
        }
      })
    }

    return list
  }, [p.id, p.thumb, p.images, p.videos, kv, hasSiblings, sameNameSiblings])

  // Auto-scroll active thumbnail into view when slide changes
  useEffect(() => {
    if (thumbStripRef.current) {
      const activeBtn = thumbStripRef.current.querySelector('.modal-thumb-btn.active')
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [slide])

  // Reactively synchronize slide to active combo image whenever combo changes
  useEffect(() => {
    if (combo?.images?.[0]) {
      const matchIdx = allMedia.findIndex((m) => urlsMatch(m.url, combo.images[0]))
      if (matchIdx !== -1) {
        setSlide(matchIdx)
      }
    }
  }, [combo?.id, combo?.color, combo?.option, allMedia])

  const price = hasVariants
    ? (combo ? combo.price : p.selling_price)
    : Number(p.selling_price || 0)

  const inStock = hasVariants
    ? (combo ? combo.stock_status === 'instock' : !!kv.in_stock)
    : p.stock_status === 'instock'

  // Resolve product / variant connection text
  const rawConnection = (combo?.connection || p?.connection || '').trim()
  const connectionText = useMemo(() => {
    let val = rawConnection
    if (!val && p?.category) {
      const catNorm = p.category.trim().toLowerCase()
      if (['keyboard', 'mouse', 'controller', 'numpad keyboard', 'barebone'].includes(catNorm)) {
        const desc = (p.content || '').toLowerCase()
        if (/tri[- ]?mode|3[- ]?mode|trimode|(2\.4g.*bluetooth|bluetooth.*2\.4g)/.test(desc)) {
          val = 'Tri mode connection'
        } else if (/2\.4g|wireless/.test(desc)) {
          val = 'Wireless 2.4G'
        } else if (/wired|type-c|usb-c/.test(desc)) {
          val = 'Wire Connection'
        }
      }
    }
    if (!val) return ''
    const lower = val.toLowerCase()
    if (lower === 'tri mode connection') return 'Tri-Mode Connection'
    if (lower === 'wire connection') return 'Wire Connection'
    if (lower === 'wireless 2.4g') return 'Wireless 2.4G Connection'
    return val
  }, [rawConnection, p?.category, p?.content])

  const isWiredConnection = useMemo(() => {
    if (!connectionText) return false
    const l = connectionText.toLowerCase()
    return l.includes('wire') && !l.includes('wireless') && !l.includes('tri')
  }, [connectionText])

  // Variant pick handlers: immediately updates selected variant AND switches main slide image
  const pickColor = (c) => {
    setSelColor(c)
    if (kv?.combos) {
      const match =
        kv.combos.find(
          (x) =>
            x.color === c &&
            (selOption ? x.option === selOption : true) &&
            (x.stock_status === 'instock' || Number(x.stock) > 0)
        ) ||
        kv.combos.find(
          (x) => x.color === c && (x.stock_status === 'instock' || Number(x.stock) > 0)
        ) ||
        kv.combos.find((x) => x.color === c && (selOption ? x.option === selOption : true)) ||
        kv.combos.find((x) => x.color === c)
      if (match && match.option) setSelOption(match.option)

      // Instantly switch gallery slide to matching combo image
      if (match?.images?.[0]) {
        const targetIdx = allMedia.findIndex((m) => urlsMatch(m.url, match.images[0]))
        if (targetIdx !== -1) {
          setSlide(targetIdx)
        }
      } else {
        const colorIdx = allMedia.findIndex((m) => m.color === c)
        if (colorIdx !== -1) {
          setSlide(colorIdx)
        }
      }
    }
  }

  const pickOption = (o) => {
    setSelOption(o)
    if (kv?.combos) {
      const match =
        kv.combos.find((x) => x.option === o && (selColor ? x.color === selColor : true)) ||
        kv.combos.find((x) => x.option === o)
      if (match && match.color) setSelColor(match.color)

      // Instantly switch gallery slide to matching combo image
      if (match?.images?.[0]) {
        const targetIdx = allMedia.findIndex((m) => urlsMatch(m.url, match.images[0]))
        if (targetIdx !== -1) {
          setSlide(targetIdx)
        }
      } else {
        const optIdx = allMedia.findIndex((m) => m.option === o)
        if (optIdx !== -1) {
          setSlide(optIdx)
        }
      }
    }
  }

  const colorAvailable = (c) => kv?.combos?.some((x) => x.color === c)
  const optionAvailable = (o) => kv?.combos?.some((x) => x.option === o)

  const colorIsInStock = (c) =>
    !!kv?.combos?.some(
      (x) => x.color === c && (x.stock_status === 'instock' || Number(x.stock) > 0)
    )

  const optionIsInStock = (o) => {
    const exact = kv?.combos?.find((x) => x.option === o && (selColor ? x.color === selColor : true))
    if (exact) {
      return exact.stock_status === 'instock' || Number(exact.stock) > 0
    }
    return !!kv?.combos?.some(
      (x) => x.option === o && (x.stock_status === 'instock' || Number(x.stock) > 0)
    )
  }

  // Sibling product selection handler
  const handleSelectSibling = (sib) => {
    if (!sib || String(sib.id) === String(p.id)) return
    if (onSelectProduct) {
      onSelectProduct(sib)
    }
  }

  // Slide selection handler (from thumbnails, arrows or swipe)
  const handleSelectSlide = (idx) => {
    setSlide(idx)
    const media = allMedia[idx]
    if (!media) return

    // If thumbnail belongs to another same-name sibling, switch active product
    if (media.sibling && String(media.sibling.id) !== String(p.id)) {
      if (onSelectProduct) {
        onSelectProduct(media.sibling)
      }
      return
    }

    // If thumbnail belongs to a variant combo, sync the chips
    if (media.combo) {
      if (media.combo.color) setSelColor(media.combo.color)
      if (media.combo.option) setSelOption(media.combo.option)
    } else {
      if (media.color) setSelColor(media.color)
      if (media.option) setSelOption(media.option)
    }
  }

  const nextSlide = () => {
    if (allMedia.length <= 1) return
    const nextIdx = (slide + 1) % allMedia.length
    handleSelectSlide(nextIdx)
  }

  const prevSlide = () => {
    if (allMedia.length <= 1) return
    const prevIdx = (slide - 1 + allMedia.length) % allMedia.length
    handleSelectSlide(prevIdx)
  }

  // Mobile Touch Swipe support
  const touchStartX = useRef(null)
  const touchEndX = useRef(null)

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 45 && allMedia.length > 1) {
      nextSlide()
    } else if (diff < -45 && allMedia.length > 1) {
      prevSlide()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  // ESC to close & Arrow keys to navigate gallery slides
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight' && allMedia.length > 1) {
        nextSlide()
      } else if (e.key === 'ArrowLeft' && allMedia.length > 1) {
        prevSlide()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, allMedia.length, slide])

  // Direct Product Link Sharing handler
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?p=${encodeURIComponent(p.id)}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${p.name} - Shop with NgrSine`,
          text: `${p.name} (${Number(price).toLocaleString()} Ks) - Shop with NgrSine`,
          url: shareUrl
        })
        return
      } catch (err) {
        // Fallback to clipboard if rejected or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareToast(true)
      setTimeout(() => setShareToast(false), 3000)
    } catch (err) {
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setShareToast(true)
      setTimeout(() => setShareToast(false), 3000)
    }
  }

  // Generate pre-filled Telegram order message
  const variantText = []
  if (combo?.color) variantText.push(`Color: ${combo.color}`)
  if (combo?.option) variantText.push(`${optLabel}: ${combo.option}`)
  const variantStr = variantText.length ? ` (${variantText.join(', ')})` : ''
  const tgUser = currentStore?.telegram || 'mark03168_bot'
  const orderMessage = encodeURIComponent(
    `မင်္ဂလာပါ ${currentStore.name_my} မှ မှာယူလိုပါသည် -\n` +
    `🆔 Product ID: #${p.id}\n` +
    `📦 ပစ္စည်း: ${p.name}${variantStr}\n` +
    `💰 စျေးနှုန်း: ${Number(price).toLocaleString()} Ks\n\n` +
    `အသေးစိတ် အတည်ပြုပေးပါရန်။`
  )
  const telegramOrderUrl = `https://t.me/${tgUser}?text=${orderMessage}`

  // Standard Add to Cart
  const handleAddToCart = () => {
    addToCart(p, combo, 1)
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 3000)
  }

  // Buy Now: Instant Single-item Direct Checkout
  const handleBuyNow = () => {
    addToCart(p, combo, 1)
    onClose()
    setIsCartOpen(true)
  }

  // Related Products: items in the same category first (excluding same-name siblings)
  const relatedProducts = useMemo(() => {
    if (!allProducts || !allProducts.length) return []
    const norm = p.name ? p.name.trim().toLowerCase() : ''
    const filtered = allProducts.filter(
      (item) => String(item.id) !== String(p.id) && item.name?.trim().toLowerCase() !== norm
    )
    const sameCat = filtered.filter((item) => item.category === p.category)
    if (sameCat.length >= 4) {
      return sameCat.slice(0, 4)
    }
    const diffCat = filtered.filter((item) => item.category !== p.category)
    return [...sameCat, ...diffCat].slice(0, 4)
  }, [allProducts, p.id, p.category, p.name])

  const currentMedia = allMedia[slide] || allMedia[0]
  const currentMediaUrl = currentMedia?.url || p.thumb || p.images?.[0] || ''

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="product-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        {/* Top-Right Header Actions (Wishlist, Share, Close) */}
        <div className="modal-header-actions">
          {/* Wishlist Toggle Button */}
          <button
            type="button"
            className={`modal-header-action-btn wishlist-btn ${wishlisted ? 'active' : ''}`}
            onClick={() => toggleWishlist(p)}
            title={wishlisted ? 'စိတ်ကြိုက်စာရင်းမှ ဖယ်ရှားမည်' : 'စိတ်ကြိုက်စာရင်းတွင် သိမ်းဆည်းမည်'}
            aria-label="Toggle wishlist"
          >
            <HeartIcon
              size={18}
              color={wishlisted ? '#E05353' : '#FFFFFF'}
              filled={wishlisted}
              fillColor="#E05353"
            />
          </button>

          {/* Direct Product Link Share Button */}
          <button
            type="button"
            className="modal-header-action-btn share-btn"
            onClick={handleShare}
            title="ပစ္စည်း Link ကို မျှဝေမည် / ကူးယူမည်"
            aria-label="Share product"
          >
            <ShareIcon size={18} color="#FFFFFF" />
          </button>

          {/* Close Button */}
          <button
            type="button"
            className="modal-header-action-btn close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon size={18} color="#FFFFFF" />
          </button>
        </div>

        {/* Media Gallery Section */}
        <div
          className="modal-media-section"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="modal-main-slide">
            {currentMediaUrl && !failedUrls[currentMediaUrl] ? (
              isVideoUrl(currentMediaUrl) ? (
                <video
                  src={currentMediaUrl}
                  controls
                  autoPlay
                  loop
                  className="modal-media-item"
                />
              ) : (
                <img
                  key={currentMediaUrl}
                  src={currentMediaUrl}
                  alt={`${p.name} - slide ${slide + 1}`}
                  className="modal-media-item"
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    const base = currentMediaUrl.split('?')[0].split('/').pop()
                    if (!e.target.dataset.triedImages && base) {
                      e.target.dataset.triedImages = 'true'
                      e.target.src = `/data/images/${base}`
                    } else if (!e.target.dataset.triedThumbs && base) {
                      e.target.dataset.triedThumbs = 'true'
                      e.target.src = `/data/thumbs/${base}`
                    } else {
                      setFailedUrls((prev) => ({ ...prev, [currentMediaUrl]: true }))
                    }
                  }}
                />
              )
            ) : (
              <div className="modal-no-img">
                <PackageIcon size={32} /> ပုံမရှိပါ
              </div>
            )}

            {/* Gallery Navigation Arrows & Slide Counter */}
            {allMedia.length > 1 && (
              <>
                <button
                  type="button"
                  className="modal-gallery-arrow prev"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevSlide()
                  }}
                  aria-label="Previous image"
                  title="ရှေ့ပုံသို့"
                >
                  <ChevronLeftIcon size={18} color="#FFFFFF" />
                </button>
                <button
                  type="button"
                  className="modal-gallery-arrow next"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextSlide()
                  }}
                  aria-label="Next image"
                  title="နောက်ပုံသို့"
                >
                  <ChevronRightIcon size={18} color="#FFFFFF" />
                </button>
                <div className="modal-gallery-counter">
                  {slide + 1} / {allMedia.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails row - shows every available photo & video */}
          {allMedia.length > 1 && (
            <div className="modal-thumbnails-strip" ref={thumbStripRef}>
              {allMedia.map((m, idx) => (
                <button
                  key={m.url + idx}
                  type="button"
                  className={`modal-thumb-btn ${slide === idx ? 'active' : ''}`}
                  onClick={() => handleSelectSlide(idx)}
                  title={`Photo ${idx + 1}`}
                >
                  {isVideoUrl(m.url) ? (
                    <span className="thumb-video-badge">
                      <PlayIcon size={10} /> Video
                    </span>
                  ) : (
                    <img
                      src={m.url}
                      alt={`${p.name} ${idx + 1}`}
                      loading="lazy"
                      onError={(e) => {
                        const base = m.url.split('?')[0].split('/').pop()
                        if (!e.target.dataset.triedImages && base) {
                          e.target.dataset.triedImages = 'true'
                          e.target.src = `/data/images/${base}`
                        } else if (!e.target.dataset.triedThumbs && base) {
                          e.target.dataset.triedThumbs = 'true'
                          e.target.src = `/data/thumbs/${base}`
                        } else {
                          e.target.style.display = 'none'
                          if (e.target.parentNode && !e.target.parentNode.querySelector('.modal-thumb-broken')) {
                            const ph = document.createElement('div')
                            ph.className = 'modal-thumb-broken'
                            ph.innerHTML = '<span style="font-size:12px;opacity:0.6">📦</span>'
                            e.target.parentNode.appendChild(ph)
                          }
                        }
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Info Body */}
        <div className="modal-info-section">
          {/* Top Row: Name on Far Left, (Category) in Brown on Far Right */}
          <div className="modal-top-row">
            <h2 id="product-modal-title" className="modal-product-title">
              {p.name}
            </h2>
            {p.category && (
              <span className="modal-title-category">({p.category})</span>
            )}
          </div>

          {/* Price on Left, In-Stock Badge on Right */}
          <div className="modal-meta-row">
            <div className="modal-price-tag">
              {Number(price).toLocaleString()} <span className="modal-price-ks">Ks</span>
            </div>
            {inStock ? (
              <span className="badge-pill badge-instock">
                <span className="badge-pulse-dot instock" aria-hidden="true" />
                <CheckIcon size={13} /> ပစ္စည်းရှိ
              </span>
            ) : (
              <span className="badge-pill badge-preorder">
                <span className="badge-pulse-dot preorder" aria-hidden="true" />
                <ClockIcon size={13} /> Pre-order
              </span>
            )}
          </div>

          {/* Connection Badge (Colored Rectangle below Model & Price) */}
          {connectionText && (
            <div className="modal-connection-row">
              <div className={`modal-connection-rect ${isWiredConnection ? 'is-wired' : 'is-wireless'}`}>
                {isWiredConnection ? <LinkIcon size={15} /> : <WifiIcon size={15} />}
                <span className="modal-connection-label">Connection :</span>
                <span className="modal-connection-value">{connectionText}</span>
              </div>
            </div>
          )}

          {/* Sibling Options Selector (for same-name products like Spiderman Keycaps, Water Bottle, JMCY) */}
          {hasSiblings && (
            <div className="modal-variants-block sibling-variant-group">
              <div className="variant-stock-legend" aria-label="Option stock color legend">
                <span className="legend-pill legend-instock">
                  <span className="chip-status-dot instock" aria-hidden="true" />
                  ပစ္စည်းရှိ (In-Stock)
                </span>
                <span className="legend-pill legend-preorder">
                  <span className="chip-status-dot preorder" aria-hidden="true" />
                  Pre-order
                </span>
              </div>
              <div className="variant-group">
                <div className="variant-group-label">
                  <SlidersIcon size={15} /> ပုံစံ / ဒီဇိုင်း ရွေးချယ်ရန် ({sameNameSiblings.length} မျိုး)
                </div>
                <div className="variant-chips-wrap sibling-chips-wrap">
                  {sameNameSiblings.map((sib, sIdx) => {
                    const isSelected = String(sib.id) === String(p.id)
                    const sibPrice = sib.var_group
                      ? sib.var_group.price_min
                      : Number(sib.selling_price || 0)
                    const hasDiffPrice = Number(sibPrice) !== Number(price)
                    const sibInStock = sib.var_group
                      ? !!sib.var_group.in_stock
                      : sib.stock_status === 'instock' || Number(sib.stock) > 0
                    return (
                      <button
                        key={sib.id}
                        type="button"
                        className={`variant-chip sibling-chip ${sibInStock ? 'chip-instock' : 'chip-preorder'} ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectSibling(sib)}
                        title={`${sib.name} - ဒီဇိုင်း ${sIdx + 1} (${sibInStock ? 'ပစ္စည်းရှိ' : 'Pre-order'})`}
                      >
                        <span className={`chip-status-dot ${sibInStock ? 'instock' : 'preorder'}`} aria-hidden="true" />
                        {sib.thumb && (
                          <img
                            src={sib.thumb}
                            alt={`ဒီဇိုင်း ${sIdx + 1}`}
                            className="sibling-chip-img"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        )}
                        <span className="sibling-chip-name">ဒီဇိုင်း {sIdx + 1}</span>
                        {hasDiffPrice && (
                          <span className="sibling-chip-price">
                            ({Number(sibPrice).toLocaleString()} Ks)
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Variants Selector (for products with internal var_group) */}
          {hasVariants && (
            <div className="modal-variants-block">
              {/* Stock Color Legend */}
              <div className="variant-stock-legend" aria-label="Option stock color legend">
                <span className="legend-pill legend-instock">
                  <span className="chip-status-dot instock" aria-hidden="true" />
                  ပစ္စည်းရှိ (In-Stock)
                </span>
                <span className="legend-pill legend-preorder">
                  <span className="chip-status-dot preorder" aria-hidden="true" />
                  Pre-order
                </span>
              </div>

              {/* Colors / Numeric Styles */}
              {kv.colors?.length > 1 && (
                <div className="variant-group">
                  <div className="variant-group-label">
                    {isNumericColors ? <SlidersIcon size={15} /> : <PaletteIcon size={15} />} {colorGroupTitle}
                    {selColor ? ` (${isNumericColors ? 'နံပါတ် ' + selColor : selColor})` : ''}
                  </div>
                  <div className="variant-chips-wrap">
                    {kv.colors.map((c) => {
                      const disabled = !colorAvailable(c)
                      const paired = kv.combos?.some(
                        (x) => x.color === c && (selOption ? x.option === selOption : true)
                      )
                      const cInStock = colorIsInStock(c)
                      return (
                        <button
                          key={c}
                          type="button"
                          className={`variant-chip ${cInStock ? 'chip-instock' : 'chip-preorder'} ${
                            selColor === c ? 'selected' : ''
                          } ${!paired && !disabled ? 'muted' : ''}`}
                          onClick={() => {
                            if (!disabled) pickColor(c)
                          }}
                          title={`${isNumericColors ? `နံပါတ် ${c}` : c} — ${cInStock ? 'ပစ္စည်းရှိ (In-Stock)' : 'Pre-order'}`}
                        >
                          <span className={`chip-status-dot ${cInStock ? 'instock' : 'preorder'}`} aria-hidden="true" />
                          <span>{isNumericColors ? `နံပါတ် ${c}` : c}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Options */}
              {kv.options?.length > 1 && (
                <div className="variant-group">
                  <div className="variant-group-label">
                    <SlidersIcon size={15} /> {optLabel} ရွေးချယ်ရန်
                    {selOption ? ` (${selOption})` : ''}
                  </div>
                  <div className="variant-chips-wrap">
                    {kv.options.map((o) => {
                      const disabled = !optionAvailable(o)
                      const paired = kv.combos?.some(
                        (x) => x.option === o && (selColor ? x.color === selColor : true)
                      )
                      const oInStock = optionIsInStock(o)
                      return (
                        <button
                          key={o}
                          type="button"
                          className={`variant-chip ${oInStock ? 'chip-instock' : 'chip-preorder'} ${
                            selOption === o ? 'selected' : ''
                          } ${!paired && !disabled ? 'muted' : ''}`}
                          onClick={() => {
                            if (!disabled) pickOption(o)
                          }}
                          title={`${o} — ${oInStock ? 'ပစ္စည်းရှိ (In-Stock)' : 'Pre-order'}`}
                        >
                          <span className={`chip-status-dot ${oInStock ? 'instock' : 'preorder'}`} aria-hidden="true" />
                          <span>{o}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Selected Combo Indicator */}
              {combo && (combo.color || combo.option) && (
                <div className="selected-combo-summary">
                  <PackageIcon size={14} /> ရွေးချယ်ထားသော ပုံစံ: <b>{combo.color ? (isNumericColors ? `နံပါတ် ${combo.color}` : combo.color) : '—'}</b>
                  {combo.option ? <> × <b>{combo.option}</b></> : null}
                </div>
              )}

              {/* Remark / Switch Sound */}
              {combo && combo.remark && (
                <div className="variant-remark-box">
                  <div className="remark-title">
                    {kv.is_keyboard ? (
                      <>
                        <VolumeIcon size={15} /> Switch Sound & Feel
                      </>
                    ) : (
                      <>
                        <FileTextIcon size={15} /> အချက်အလက်
                      </>
                    )}
                  </div>
                  <div className="remark-body">{combo.remark}</div>
                </div>
              )}
            </div>
          )}

          {/* Description Content */}
          {p.content && (
            <div className="modal-description-box">
              <div className="description-title">
                <FileTextIcon size={15} /> ပစ္စည်း အကြောင်းအရာ
              </div>
              <div className="description-text">{p.content}</div>
            </div>
          )}

          {/* Action Buttons: Buy Now (⚡), Add to Cart, Telegram */}
          <div className="modal-actions-row">
            <button
              type="button"
              className="modal-buynow-btn"
              onClick={handleBuyNow}
              title="ချက်ချင်းဝယ်ယူရန် Checkout သို့ သွားမည်"
            >
              <ZapIcon size={17} /> ချက်ချင်းဝယ်မည်
            </button>

            <button
              type="button"
              className="modal-cart-btn"
              onClick={handleAddToCart}
            >
              <CartIcon size={17} /> ခြင်းတောင်းထဲထည့်မည်
            </button>

            <a
              className="modal-telegram-btn"
              href={telegramOrderUrl}
              target="_blank"
              rel="noreferrer"
            >
              <TelegramIcon size={18} /> Telegram မှ မှာယူမည်
            </a>
          </div>

          {/* Added to Cart Toast */}
          {addedToast && (
            <div className="modal-toast" role="status" aria-live="polite">
              <span className="toast-text">
                <CheckCircleIcon size={16} /> ခြင်းတောင်းထဲသို့ ထည့်သွင်းပြီးပါပြီ!
              </span>
              <button
                type="button"
                className="toast-view-cart"
                onClick={() => {
                  onClose()
                  setIsCartOpen(true)
                }}
              >
                ခြင်းတောင်းကြည့်မည် <ArrowRightIcon size={13} />
              </button>
            </div>
          )}

          {/* Direct Link Copied Toast */}
          {shareToast && (
            <div className="modal-toast share-toast" role="status" aria-live="polite">
              <span className="toast-text">
                <CheckCircleIcon size={16} /> ပစ္စည်း Link ကို ကူးယူပြီးပါပြီ!
              </span>
            </div>
          )}

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="modal-related-section">
              <div className="related-section-header">
                <div className="related-header-left">
                  <TagIcon size={16} />
                  <span className="related-section-title">ဆက်စပ်ပစ္စည်းများ</span>
                </div>
                <span className="related-count">({relatedProducts.length} ခု)</span>
              </div>
              <div className="modal-related-grid">
                {relatedProducts.map((rel) => {
                  const relKv = rel.var_group
                  const relInStock = relKv ? !!relKv.in_stock : rel.stock_status === 'instock'
                  const relPrice = relKv ? relKv.price_min : Number(rel.selling_price || 0)
                  return (
                    <div
                      key={rel.id}
                      className="related-item-card"
                      onClick={() => {
                        if (onSelectProduct) {
                          onSelectProduct(rel)
                        }
                      }}
                      title={`${rel.name} ကို ကြည့်ရှုမည်`}
                    >
                      <div className="related-thumb-wrap">
                        {rel.thumb ? (
                          <img
                            src={rel.thumb}
                            alt={rel.name}
                            className="related-thumb-img"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              if (e.target.parentNode && !e.target.parentNode.querySelector('.placeholder-icon')) {
                                const icon = document.createElement('span')
                                icon.className = 'placeholder-icon'
                                icon.innerText = '📦'
                                e.target.parentNode.appendChild(icon)
                              }
                            }}
                          />
                        ) : (
                          <PackageIcon size={22} className="placeholder-icon" />
                        )}
                        <span className={`related-stock-pill ${relInStock ? 'instock' : 'pre'}`}>
                          {relInStock ? 'ပစ္စည်းရှိ' : 'Pre'}
                        </span>
                      </div>
                      <div className="related-info">
                        {rel.category && <span className="related-cat">{rel.category}</span>}
                        <h5 className="related-title">{rel.name}</h5>
                        <div className="related-price">
                          {Number(relPrice).toLocaleString()} <span className="related-ks">Ks</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Contact & Delivery footer in modal (Preserved strictly) */}
          <div className="modal-branch-footer">
            <div className="modal-footer-delivery">
              <TruckIcon size={16} /> <b>Royal Express</b> ရောက်သည့်မြို့တိုင်း အိမ်ရောက်ငွေချေရပါသည်
            </div>
            <div className="modal-footer-contact">
              <PhoneIcon size={14} /> {currentStore.phone} ·{' '}
              <span className="modal-footer-tg">
                <TelegramIcon size={14} />{' '}
                <a href={`https://t.me/${currentStore?.telegram || 'mark03168_bot'}`} target="_blank" rel="noreferrer">
                  Telegram @{currentStore?.telegram || 'mark03168_bot'}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
