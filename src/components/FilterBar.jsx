import React from 'react'
import { SearchIcon, CloseIcon } from './Icons.jsx'
import CustomSelect from './CustomSelect.jsx'

export default function FilterBar({
  search = '',
  onSearchChange,
  stockFilter = 'all',
  onStockFilterChange,
  categories = [],
  selectedCategory = '',
  onSelectCategory,
}) {
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'new_arrivals', label: 'New Arrivals' },
    ...categories
      .filter((cat) => cat.toLowerCase() !== 'new arrivals' && cat.toLowerCase() !== 'new_arrivals')
      .map((cat) => ({ value: cat, label: cat })),
  ]

  const stockOptions = [
    { value: 'all',      label: 'All Items' },
    { value: 'instock',  label: 'In-stock' },
    { value: 'preorder', label: 'Pre-order' },
  ]

  return (
    <div className="filter-bar-container">
      {/* 1. Search Input */}
      <div className="search-input-wrapper">
        <span className="search-icon">
          <SearchIcon size={18} />
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="ပစ္စည်းအမည်၊ အမျိုးအစား ရိုက်ရှာရန်..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            title="စာသားဖျက်ရန်"
            aria-label="Clear search"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      {/* 2. Dropdown Tabs Row (Category on Left, Stock Filter on Right) */}
      <div className="filter-dropdown-tabs-row">
        {/* Left: Category */}
        <div className="filter-dropdown-wrap">
          <CustomSelect
            options={categoryOptions}
            value={selectedCategory}
            onChange={onSelectCategory}
            aria-label="All Category dropdown"
            hasFilter={!!selectedCategory}
          />
        </div>

        {/* Right: Stock Filter */}
        <div className="filter-dropdown-wrap">
          <CustomSelect
            options={stockOptions}
            value={stockFilter}
            onChange={onStockFilterChange}
            aria-label="All Products stock dropdown"
            hasFilter={stockFilter !== 'all'}
          />
        </div>
      </div>
    </div>
  )
}
