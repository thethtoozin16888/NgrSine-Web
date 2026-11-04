import React, { useState, useRef, useEffect } from 'react'

/**
 * CustomSelect – an accessible, high-performance dropdown component
 * Supports:
 * - High-contrast selection highlight in both Light Mode (Latte Brown) & Dark Mode (Golden Milk)
 * - Auto-scroll to active option on open
 * - ArrowUp / ArrowDown / Enter / Escape keyboard navigation
 * - Light dismiss (click outside / escape)
 */
export default function CustomSelect({
  options = [],
  value,
  onChange,
  'aria-label': ariaLabel,
  hasFilter = false
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const listRef = useRef(null)

  const selectedOption = options.find((o) => o.value === value)
  const selectedLabel = selectedOption?.label || options[0]?.label || ''

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Keyboard navigation: Escape, ArrowDown, ArrowUp, Enter
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setOpen(false)
      } else if (open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault()
        const currentIndex = options.findIndex((o) => o.value === value)
        let nextIndex = currentIndex
        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
        }
        if (options[nextIndex]) {
          onChange(options[nextIndex].value)
        }
      } else if (open && e.key === 'Enter') {
        e.preventDefault()
        setOpen(false)
      }
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, options, value, onChange])

  // Scroll active option into view when opened
  useEffect(() => {
    if (open && listRef.current) {
      const selectedEl = listRef.current.querySelector('.is-selected')
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [open])

  function handleSelect(optValue) {
    onChange(optValue)
    setOpen(false)
  }

  return (
    <div
      className={`custom-select-wrap ${open ? 'is-open' : ''}`}
      ref={wrapRef}
    >
      {/* Trigger button */}
      <button
        type="button"
        className={`custom-select-trigger ${hasFilter ? 'has-filter' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className="custom-select-label">{selectedLabel}</span>
        <span className={`custom-select-chevron ${open ? 'flipped' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Dropdown list */}
      {open && (
        <ul
          className="custom-select-list"
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((opt) => {
            const isActive = opt.value === value
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isActive}
                className={`custom-select-option ${isActive ? 'is-selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
                onMouseDown={(e) => e.preventDefault()} // prevent blur before click
              >
                {isActive && (
                  <span className="custom-select-check">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
                <span className="custom-select-option-text">{opt.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
