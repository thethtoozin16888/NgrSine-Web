import React from 'react'

export default function CartIcon({
  size = 20,
  strokeWidth = 2,
  color = 'currentColor',
  className = '',
  style = {}
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`cart-icon-svg ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
      aria-hidden="true"
    >
      <circle cx="8" cy="21" r="1.5" />
      <circle cx="19" cy="21" r="1.5" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}
