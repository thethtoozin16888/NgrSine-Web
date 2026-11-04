import React, { useState } from 'react'
import { useWishlist } from '../context/WishlistContext.jsx'
import {
  PackageIcon,
  PlayIcon,
  CheckIcon,
  ClockIcon,
  ArrowRightIcon,
  HeartIcon
} from './Icons.jsx'

export default function ProductCard({ product: p, onClick }) {
  const [imgError, setImgError] = useState(false)
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(p.id)

  const kv = p.var_group
  const showRange = kv && kv.price_min !== kv.price_max
  const inStock = kv ? !!kv.in_stock : p.stock_status === 'instock'
  const hasVariants = !!kv && (kv.colors?.length > 1 || kv.options?.length > 1 || kv.count > 1)
  const thumbSrc = p.thumb || (Array.isArray(p.images) && p.images[0]) || ''
  const hasImage = !!thumbSrc && !imgError

  return (
    <div className="product-card" onClick={onClick}>
      {/* Media Image Container */}
      <div className="product-media-wrap">
        {hasImage ? (
          <img
            className="product-thumb-img"
            src={thumbSrc}
            loading="lazy"
            alt={p.name}
            onError={(e) => {
              const base = thumbSrc.split('?')[0].split('/').pop()
              if (!thumbSrc.startsWith('/data/images/') && base) {
                e.target.src = `/data/images/${base}`
              } else {
                setImgError(true)
              }
            }}
          />
        ) : (
          <div className="product-thumb-placeholder">
            <PackageIcon size={32} className="placeholder-icon" />
          </div>
        )}

        {/* Wishlist Quick Toggle Button (Top-Right Floating Circle Token) */}
        <button
          type="button"
          className={`card-wishlist-btn ${wishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            toggleWishlist(p)
          }}
          title={wishlisted ? 'စိတ်ကြိုက်စာရင်းမှ ဖယ်ရှားမည်' : 'စိတ်ကြိုက်စာရင်းတွင် သိမ်းဆည်းမည်'}
          aria-label="Toggle wishlist"
        >
          <HeartIcon
            size={16}
            color={wishlisted ? '#E05353' : 'currentColor'}
            filled={wishlisted}
            fillColor="#E05353"
          />
        </button>

        {/* Top-Left: Dedicated Info Badges Container (Separated to eliminate overlap) */}
        <div className="media-badges-top-left">
          {p.videos?.length > 0 && (
            <span className="badge-pill badge-video">
              <PlayIcon size={11} /> Video
            </span>
          )}
          {hasVariants && (
            <span className="badge-pill badge-variants">
              {kv.count} မျိုး
            </span>
          )}
        </div>

        {/* Bottom-Left: Stock Status Badge with Animated Pulse Indicator */}
        <div className="media-badges-bottom-left">
          {inStock ? (
            <span className="badge-pill badge-instock" title="ပစ္စည်း အသင့်ရှိပါသည်">
              <span className="badge-pulse-dot instock" aria-hidden="true" />
              <CheckIcon size={12} />
              <span>ပစ္စည်းရှိ</span>
            </span>
          ) : (
            <span className="badge-pill badge-preorder" title="ကြိုတင်မှာယူနိုင်ပါသည်">
              <span className="badge-pulse-dot preorder" aria-hidden="true" />
              <ClockIcon size={12} />
              <span>Pre-order</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="product-card-body">
        {p.category && <span className="product-category-tag">{p.category}</span>}
        <h4 className="product-title" title={p.name}>
          {p.name}
        </h4>

        {/* Color / Variant Swatches Preview */}
        {kv?.colors?.length > 0 && (
          <div className="color-swatches-preview">
            {kv.colors.slice(0, 4).map((c, idx) => (
              <span key={idx} className="color-dot" title={c} />
            ))}
            {kv.colors.length > 4 && (
              <span className="more-dots-text">+{kv.colors.length - 4}</span>
            )}
            {kv.colors.length > 1 && (
              <span className="swatch-label">{kv.colors.length} အရောင်</span>
            )}
          </div>
        )}

        {/* Price & Action Row */}
        <div className="product-card-foot">
          <div className="price-display">
            {showRange ? (
              <span className="price-range">
                {Number(kv.price_min).toLocaleString()} – {Number(kv.price_max).toLocaleString()}{' '}
                <span className="price-currency">Ks</span>
              </span>
            ) : (
              <span className="price-single">
                {Number(p.selling_price || 0).toLocaleString()}{' '}
                <span className="price-currency">Ks</span>
              </span>
            )}
          </div>

          <button
            className="card-action-btn"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            title="အသေးစိတ် ကြည့်ရှုရန်"
          >
            <span>ကြည့်မည်</span>
            <ArrowRightIcon size={13} className="btn-arrow-icon" />
          </button>
        </div>
      </div>
    </div>
  )
}
