import React, { useRef } from 'react'

const CATEGORY_ICONS = {
  'Keyboard': '⌨️',
  'Mouse': '🖱️',
  'Controller': '🎮',
  'Keycaps': '🎨',
  'Switch': '⚡',
  'Glasspad': '🧊',
  'Mousepad': '🎯',
  'Barebone': '🛠️',
  'Numpad Keyboard': '🔢',
  'Accessories': '🔌',
  'Lighting': '💡',
  'Fan': '💨'
}

export default function CategoryChips({ categories = [], selectedCategory = '', onSelectCategory }) {
  const scrollRef = useRef(null)

  return (
    <div className="cat-chips-wrapper">
      <div className="cat-chips-scroll" ref={scrollRef} role="tablist" aria-label="Product categories">
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === ''}
          className={`cat-chip-btn ${selectedCategory === '' ? 'active' : ''}`}
          onClick={() => onSelectCategory('')}
        >
          <span className="chip-icon">🔥</span>
          <span>အားလုံး (All)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === 'new_arrivals'}
          className={`cat-chip-btn ${selectedCategory === 'new_arrivals' ? 'active' : ''}`}
          onClick={() => onSelectCategory('new_arrivals')}
        >
          <span className="chip-icon">✨</span>
          <span>New Arrivals</span>
        </button>

        {categories.map((c) => {
          const icon = CATEGORY_ICONS[c] || '🏷️'
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={selectedCategory === c}
              className={`cat-chip-btn ${selectedCategory === c ? 'active' : ''}`}
              onClick={() => onSelectCategory(c)}
            >
              <span className="chip-icon">{icon}</span>
              <span>{c}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
