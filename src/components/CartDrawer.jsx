import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import TelegramIcon from './TelegramIcon.jsx'
import CartIcon from './CartIcon.jsx'
import {
  CloseIcon,
  PackageIcon,
  PaletteIcon,
  SlidersIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  UserIcon,
  AlertCircleIcon,
  TruckIcon,
  CopyIcon,
  CheckIcon
} from './Icons.jsx'

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart()

  const { currentStore } = useStore()
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Customer Form state (auto-load from localStorage if available)
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('ngrsine_customer_info')
      return saved ? JSON.parse(saved) : { name: '', phone: '', address: '', notes: '' }
    } catch {
      return { name: '', phone: '', address: '', notes: '' }
    }
  })

  // Normalize Myanmar digits to standard Arabic digits
  const normalizeMyanmarDigits = (str) => {
    if (!str) return ''
    const myanmarDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉']
    return str.replace(/[၀-၉]/g, (d) => myanmarDigits.indexOf(d))
  }

  // ESC to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCartOpen, setIsCartOpen])

  if (!isCartOpen) return null

  // Validate Customer Form
  const validateForm = () => {
    const errs = {}
    if (!customer.name || !customer.name.trim()) errs.name = true

    const rawPhone = normalizeMyanmarDigits(customer.phone ? customer.phone.trim() : '')
    const digitsOnly = rawPhone.replace(/\D/g, '')
    if (!digitsOnly || digitsOnly.length < 7 || digitsOnly.length > 13) {
      errs.phone = true
    }

    if (!customer.address || !customer.address.trim()) errs.address = true

    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) {
      if (errs.name) setFormError('ကျေးဇူးပြု၍ ဝယ်ယူသူ အမည် (Name) ဖြည့်သွင်းပေးပါ')
      else if (errs.phone) setFormError('ကျေးဇူးပြု၍ မှန်ကန်သော ဖုန်းနံပါတ် (ဥပမာ - 09xxxxxxxxx) ဖြည့်သွင်းပေးပါ')
      else if (errs.address) setFormError('ကျေးဇူးပြု၍ ပို့ဆောင်မည့် လိပ်စာ (Address) ဖြည့်သွင်းပေးပါ')
      return false
    }
    setFormError('')
    return true
  }

  // Generate order summary text for Telegram (without order no and without delivery line)
  const generateOrderSummary = () => {
    let msg = `🛍️ NgrSine မှ မှာယူမှု စာရင်း\n`
    msg += `--------------------------------\n`
    msg += `👤 ဝယ်ယူသူ: ${customer.name || '—'}\n`
    msg += `📞 ဖုန်း: ${customer.phone || '—'}\n`
    msg += `📍 လိပ်စာ: ${customer.address || '—'}\n`
    if (customer.notes && customer.notes.trim()) {
      msg += `📝 မှတ်ချက်: ${customer.notes.trim()}\n`
    }
    msg += `--------------------------------\n`
    cartItems.forEach((item, index) => {
      const variantParts = []
      if (item.color) variantParts.push(`Color: ${item.color}`)
      if (item.option) variantParts.push(`Option: ${item.option}`)
      const variantStr = variantParts.length ? ` (${variantParts.join(', ')})` : ''
      const subtotal = item.price * item.quantity
      msg += `${index + 1}. ${item.name}${variantStr}\n`
      msg += `   ${item.quantity} ခု × ${Number(item.price).toLocaleString()} Ks = ${Number(subtotal).toLocaleString()} Ks\n`
    })
    msg += `--------------------------------\n`
    msg += `💰 စုစုပေါင်း: ${Number(totalPrice).toLocaleString()} Ks`
    return msg
  }

  // Send to Telegram (Also saves/links customer to POS)
  const handleSendTelegram = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Save customer and order to POS
      const payload = {
        name: customer.name.trim(),
        phone: normalizeMyanmarDigits(customer.phone.trim()),
        address: customer.address.trim(),
        notes: (customer.notes || '').trim(),
        items: cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          option: item.option,
          variant: [item.color, item.option].filter(Boolean).join(', '),
        })),
      }

      await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      // Remember customer for future visits
      try {
        localStorage.setItem(
          'ngrsine_customer_info',
          JSON.stringify({
            name: customer.name.trim(),
            phone: normalizeMyanmarDigits(customer.phone.trim()),
            address: customer.address.trim(),
            notes: '',
          })
        )
      } catch (e) {
        // ignore storage error
      }
    } catch (err) {
      console.warn('POS background save failed, proceeding with Telegram:', err)
    } finally {
      setIsSubmitting(false)
    }

    const text = encodeURIComponent(generateOrderSummary())
    const tgUser = currentStore?.telegram || 'mark03168_bot'
    const tgUrl = `https://t.me/${tgUser}?text=${text}`
    const win = window.open(tgUrl, '_blank')
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = tgUrl
    }
    clearCart()
    setIsCartOpen(false)
  }

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(generateOrderSummary())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = generateOrderSummary()
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="drawer-backdrop" onClick={() => setIsCartOpen(false)}>
      <div
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div>
            <h3 id="cart-drawer-title">
              <CartIcon size={20} /> ခြင်းတောင်း
            </h3>
            <span className="drawer-subtitle">
              {totalItems} ခု ရွေးချယ်ထားပါသည်
            </span>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="drawer-empty-state">
              <span className="empty-icon">
                <CartIcon size={52} strokeWidth={1.7} />
              </span>
              <p className="empty-title">ခြင်းတောင်းထဲတွင် ပစ္စည်းမရှိသေးပါ</p>
              <p className="empty-desc">ဝယ်ယူလိုသော ပစ္စည်းများကို ရှာဖွေထည့်သွင်းပါ</p>
              <button className="empty-action-btn" onClick={() => setIsCartOpen(false)}>
                ပစ္စည်းများ ကြည့်ရှုမည်
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="drawer-items-list">
                {cartItems.map((item) => (
                  <div key={item.cartKey} className="drawer-item-row">
                    <div className="item-thumb">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            const base = item.image.split('?')[0].split('/').pop()
                            if (!item.image.startsWith('/data/images/') && base) {
                              e.target.src = `/data/images/${base}`
                            } else {
                              e.target.style.display = 'none'
                            }
                          }}
                        />
                      ) : (
                        <PackageIcon size={22} />
                      )}
                    </div>

                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      {(item.color || item.option) && (
                        <div className="item-variant-label">
                          {item.color && (
                            <span className="variant-tag">
                              <PaletteIcon size={12} /> {item.color}
                            </span>
                          )}
                          {item.option && (
                            <span className="variant-tag">
                              <SlidersIcon size={12} /> {item.option}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="item-price-unit">
                        {Number(item.price).toLocaleString()} Ks
                      </div>

                      <div className="item-qty-row">
                        <div className="qty-stepper">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon size={12} />
                          </button>
                          <span className="qty-num">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <PlusIcon size={12} />
                          </button>
                        </div>

                        <button
                          className="item-remove-btn"
                          onClick={() => removeFromCart(item.cartKey)}
                          title="ခြင်းတောင်းမှ ဖျက်မည်"
                          aria-label="Remove item"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 👤 Customer Information Form (Links to POS Customer Table) */}
              <div className="drawer-customer-form">
                <div className="customer-form-title">
                  <span>
                    <UserIcon size={16} /> ဝယ်ယူသူ အချက်အလက်
                  </span>
                </div>

                {formError && (
                  <div className="customer-form-error">
                    <AlertCircleIcon size={15} /> {formError}
                  </div>
                )}

                <div className="form-group-compact">
                  <label htmlFor="cust-name">
                    အမည် (Name) <span className="req-star">*</span>
                  </label>
                  <input
                    id="cust-name"
                    type="text"
                    className={`form-input-compact ${fieldErrors.name ? 'has-error' : ''}`}
                    placeholder="ဥပမာ - မောင်မောင် / ကိုကျော်"
                    value={customer.name}
                    onChange={(e) => {
                      setCustomer({ ...customer, name: e.target.value })
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: false })
                    }}
                  />
                </div>

                <div className="form-group-compact">
                  <label htmlFor="cust-phone">
                    ဖုန်းနံပါတ် (Ph no) <span className="req-star">*</span>
                  </label>
                  <input
                    id="cust-phone"
                    type="tel"
                    className={`form-input-compact ${fieldErrors.phone ? 'has-error' : ''}`}
                    placeholder="ဥပမာ - 09xxxxxxxxx"
                    value={customer.phone}
                    onChange={(e) => {
                      setCustomer({ ...customer, phone: e.target.value })
                      if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: false })
                    }}
                  />
                </div>

                <div className="form-group-compact">
                  <label htmlFor="cust-address">
                    လိပ်စာ (Address) <span className="req-star">*</span>
                  </label>
                  <textarea
                    id="cust-address"
                    rows={2}
                    className={`form-input-compact form-textarea-compact ${fieldErrors.address ? 'has-error' : ''}`}
                    placeholder="မြို့နယ်၊ လမ်း၊ အိမ်အမှတ်..."
                    value={customer.address}
                    onChange={(e) => {
                      setCustomer({ ...customer, address: e.target.value })
                      if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: false })
                    }}
                  />
                </div>

                <div className="form-group-compact">
                  <label htmlFor="cust-notes">မှတ်ချက် (Note)</label>
                  <input
                    id="cust-notes"
                    type="text"
                    className="form-input-compact"
                    placeholder="ပို့ဆောင်ချိန် သို့မဟုတ် အခြားမှာကြားလိုသည်များ..."
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            {/* Delivery Notice */}
            <div className="drawer-delivery-notice">
              <TruckIcon size={15} /> <b>Royal Express</b> ရောက်သည့်မြို့တိုင်း အိမ်ရောက်ငွေချေ ရပါသည်
            </div>

            <div className="drawer-total-row">
              <span>စုစုပေါင်း ကျသင့်ငွေ</span>
              <span className="drawer-total-price">
                {Number(totalPrice).toLocaleString()} <span className="price-currency">Ks</span>
              </span>
            </div>

            {/* Telegram Order Button */}
            <button
              className="drawer-tg-order-btn"
              onClick={handleSendTelegram}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>သိမ်းဆည်းနေပါသည်...</>
              ) : (
                <>
                  <TelegramIcon size={19} /> Telegram (@{currentStore?.telegram || 'mark03168_bot'}) ဖြင့် မှာယူမည်
                </>
              )}
            </button>

            <div className="drawer-secondary-actions">
              <button className="drawer-copy-btn" onClick={handleCopySummary}>
                {copied ? (
                  <>
                    <CheckIcon size={15} /> ခြင်းတောင်း ကူးယူပြီးပါပြီ
                  </>
                ) : (
                  <>
                    <CopyIcon size={15} /> ခြင်းတောင်း ကူးယူမည်
                  </>
                )}
              </button>

              <button className="drawer-clear-btn" onClick={clearCart}>
                အကုန်ဖျက်မည်
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
