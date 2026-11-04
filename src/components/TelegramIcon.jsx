import React from 'react'

export default function TelegramIcon({
  size = 20,
  circle = true,
  circleColor = '#24A1DE',
  planeColor = '#FFFFFF',
  className = '',
  style = {}
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`telegram-icon ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
      aria-hidden="true"
    >
      {circle && <circle cx="12" cy="12" r="12" fill={circleColor} />}
      <path
        fill={planeColor}
        d="M17.56 8.16l-2.02 9.52c-.15.68-.56.84-1.13.52l-3.1-2.29-1.5 1.44c-.17.16-.31.3-.63.3l.22-3.17 5.76-5.2c.25-.22-.05-.35-.39-.12l-7.12 4.48-3.07-.96c-.67-.21-.68-.67.14-.99l12.01-4.63c.56-.2 1.05.13.87 1.1z"
      />
    </svg>
  )
}
