import React from 'react'
import { TagIcon } from './Icons.jsx'

export default function CategoryChips({ categories = [], selectedCategory = '', onSelectCategory }) {
  return (
    <div className="cat-chips-wrapper">
      <div className="cat-chips-scroll" role="tablist" aria-label="Product categories">
        <button
          role="tab"
          aria-selected={selectedCategory === ''}
          className={`cat-chip-btn ${selectedCategory === '' ? 'active' : ''}`}
          onClick={() => onSelectCategory('')}
        >
          <TagIcon size={14} className="chip-icon" />
          <span>All Categories</span>
        </button>

        <button
          role="tab"
          aria-selected={selectedCategory === 'new_arrivals'}
          className={`cat-chip-btn ${selectedCategory === 'new_arrivals' ? 'active' : ''}`}
          onClick={() => onSelectCategory('new_arrivals')}
        >
          <span>✨ New Arrivals</span>
        </button>

        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={selectedCategory === c}
            className={`cat-chip-btn ${selectedCategory === c ? 'active' : ''}`}
            onClick={() => onSelectCategory(c)}
          >
            <span>{c}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
