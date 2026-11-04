import React, { useEffect } from 'react'
import { useStore } from '../context/StoreContext.jsx'
import TelegramIcon from './TelegramIcon.jsx'

export default function BranchSelectorModal() {
  const { stores, currentStoreId, switchStore, isBranchModalOpen, setIsBranchModalOpen } = useStore()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isBranchModalOpen) {
        setIsBranchModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isBranchModalOpen, setIsBranchModalOpen])

  if (!isBranchModalOpen) return null

  return (
    <div className="modal-backdrop" onClick={() => setIsBranchModalOpen(false)}>
      <div
        className="branch-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="branch-modal-title"
      >
        <div className="branch-modal-header">
          <div>
            <h3 id="branch-modal-title">🏪 ဆိုင်ခွဲ ရွေးချယ်ရန်</h3>
            <p className="branch-modal-subtitle">မိမိနှင့် နီးစပ်ရာ ဆိုင်ခွဲကို ရွေးချယ်ပါ</p>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setIsBranchModalOpen(false)}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="branch-list">
          {stores.map((s) => {
            const isSelected = s.id === currentStoreId
            const isAvailable = s.status === 'open'

            return (
              <div
                key={s.id}
                className={`branch-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                onClick={() => {
                  if (isAvailable) {
                    switchStore(s.id)
                    setIsBranchModalOpen(false)
                  }
                }}
              >
                <div className="branch-card-top">
                  <div className="branch-info">
                    <span className="branch-badge">{s.short_badge}</span>
                    <div>
                      <div className="branch-name">{s.name_my}</div>
                      <div className="branch-subname">{s.name}</div>
                    </div>
                  </div>
                  {isSelected && <span className="branch-current-tag">လက်ရှိဆိုင်</span>}
                  {!isAvailable && <span className="branch-status-tag">{s.status_label}</span>}
                </div>

                <div className="branch-card-details">
                  <div className="branch-detail-item">
                    <span>📍</span> {s.address}
                  </div>
                  <div className="branch-detail-item">
                    <span>📞</span> {s.phone}
                  </div>
                  <div className="branch-detail-item">
                    <TelegramIcon size={14} /> Telegram: @{s.telegram}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
