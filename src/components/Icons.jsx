import React from 'react'

/**
 * Universal SVG Icon Set for NgrSine Shop
 * Replaces system emojis with crisp, elegant, accessible vector icons.
 * Features:
 * - Configurable size and color
 * - strokeWidth="1.8" with round caps and joins
 * - aria-hidden="true" for accessibility
 * - vector-effect="non-scaling-stroke" for crisp rendering
 */

function createIcon(d, defaultSize = 18, isFill = false) {
  return function SvgIcon({
    size = defaultSize,
    color = 'currentColor',
    className = '',
    style = {},
    ...props
  }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={isFill ? color : 'none'}
        stroke={isFill ? 'none' : color}
        strokeWidth={isFill ? 0 : '1.8'}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`ui-icon ${className}`}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          ...style
        }}
        aria-hidden="true"
        {...props}
      >
        {d}
      </svg>
    )
  }
}

// ☀️ Sun Icon (Theme switcher)
export const SunIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </>,
  16
)

// 🌙 Moon Icon (Theme switcher)
export const MoonIcon = createIcon(
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  16
)

// 🔍 Search Icon
export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>,
  18
)

// ✕ Close Icon
export const CloseIcon = createIcon(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>,
  18
)

// 📦 Package / Parcel Icon
export const PackageIcon = createIcon(
  <>
    <path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-1.8 0L2.7 6.06A1.8 1.8 0 0 0 1.8 7.6v8.8a1.8 1.8 0 0 0 .9 1.55l8.55 4.94a1.78 1.78 0 0 0 1.8 0l8.55-4.94a1.8 1.8 0 0 0 .9-1.55V7.6a1.8 1.8 0 0 0-.9-1.54L16.5 9.4Z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </>,
  18
)

// ✅ Check Icon
export const CheckIcon = createIcon(
  <polyline points="20 6 9 17 4 12" />,
  16
)

// Check Circle (Toast & Success)
export const CheckCircleIcon = createIcon(
  <>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </>,
  18
)

// ⏰ / 📅 Clock Icon (Pre-order)
export const ClockIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>,
  16
)

// ▶ Play / Video Icon
export const PlayIcon = createIcon(
  <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />,
  14,
  true
)

// 🎨 Palette Icon (Color Variants)
export const PaletteIcon = createIcon(
  <>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" />
  </>,
  16
)

// 🔧 / ⚙️ Sliders / Option Icon
export const SlidersIcon = createIcon(
  <>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </>,
  16
)

// 🔊 Volume Icon (Switch Sound & Feel)
export const VolumeIcon = createIcon(
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </>,
  16
)

// 📋 / 📝 File Text Icon (Description / Specs)
export const FileTextIcon = createIcon(
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </>,
  16
)

// 🚚 Truck Icon (Royal Express Delivery)
export const TruckIcon = createIcon(
  <>
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </>,
  18
)

// 📞 Phone Icon
export const PhoneIcon = createIcon(
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
  16
)

// ✨ Sparkles Icon (Welcome & Brand highlight)
export const SparklesIcon = createIcon(
  <>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </>,
  16
)

// 🏪 Store Icon (Brand identity)
export const StoreIcon = createIcon(
  <>
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7a2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1-2 2 2 2 0 0 1-2-2" />
  </>,
  18
)

// 📍 Map Pin Icon (Location)
export const MapPinIcon = createIcon(
  <>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </>,
  16
)

// 💳 Credit Card / Payment Icon (COD & Banking)
export const CreditCardIcon = createIcon(
  <>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </>,
  18
)

// 👤 User Icon (Customer Form)
export const UserIcon = createIcon(
  <>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>,
  16
)

// ⚠️ Alert Circle Icon (Validation Error)
export const AlertCircleIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </>,
  16
)

// 🗑️ Trash Icon (Cart Remove)
export const TrashIcon = createIcon(
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </>,
  16
)

// 📋 Copy Icon
export const CopyIcon = createIcon(
  <>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>,
  16
)

// → Arrow Right Icon
export const ArrowRightIcon = createIcon(
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>,
  16
)

// + Plus Icon (Stepper)
export const PlusIcon = createIcon(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>,
  14
)

// − Minus Icon (Stepper)
export const MinusIcon = createIcon(
  <line x1="5" y1="12" x2="19" y2="12" />,
  14
)

// 🏷️ Tag / Categories Icon
export const TagIcon = createIcon(
  <>
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </>,
  16
)

// 🌪️ Filter Icon
export const FilterIcon = createIcon(
  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
  16
)

// 💬 Message / Chat Icon
export const MessageCircleIcon = createIcon(
  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  18
)

// ➤ Send Icon
export const SendIcon = createIcon(
  <>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </>,
  16
)

// 🤖 Bot / Assistant Icon
export const BotIcon = createIcon(
  <>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8.01" y2="16" />
    <line x1="16" y1="16" x2="16.01" y2="16" />
  </>,
  18
)

// ⌄ Chevron Down Icon
export const ChevronDownIcon = createIcon(
  <polyline points="6 9 12 15 18 9" />,
  16
)

// ⌃ Chevron Up Icon
export const ChevronUpIcon = createIcon(
  <polyline points="18 15 12 9 6 15" />,
  16
)

// ↑ Arrow Up Icon
export const ArrowUpIcon = createIcon(
  <>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </>,
  16
)

// ↓ Arrow Down Icon
export const ArrowDownIcon = createIcon(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </>,
  16
)

// ❤️ Heart Icon (Wishlist)
export function HeartIcon({
  size = 18,
  color = 'currentColor',
  filled = false,
  fillColor = '#D9534F',
  className = '',
  style = {},
  ...props
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? fillColor : 'none'}
      stroke={filled ? fillColor : color}
      strokeWidth={filled ? '1.2' : '1.8'}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ui-icon heart-icon ${filled ? 'filled' : ''} ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
      aria-hidden="true"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}

// 📤 Share Icon
export const ShareIcon = createIcon(
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </>,
  18
)

// 🔗 Link Icon (Direct Link Copy)
export const LinkIcon = createIcon(
  <>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </>,
  16
)

// ⚡ Zap / Lightning Bolt Icon (Buy Now Instant Checkout)
export const ZapIcon = createIcon(
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />,
  16,
  true
)

// 👁️ Eye Icon (Recently Viewed)
export const EyeIcon = createIcon(
  <>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </>,
  16
)

// 🕒 History Icon
export const HistoryIcon = createIcon(
  <>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </>,
  16
)

// ‹ Chevron Left Icon (Gallery prev)
export const ChevronLeftIcon = createIcon(
  <polyline points="15 18 9 12 15 6" />,
  18
)

// › Chevron Right Icon (Gallery next)
export const ChevronRightIcon = createIcon(
  <polyline points="9 18 15 12 9 6" />,
  18
)

// 🛜 Wifi / Connectivity Icon
export const WifiIcon = createIcon(
  <>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </>,
  16
)


