import React, { createContext, useContext, useState } from 'react'
import { STORE_INFO, STORES, DEFAULT_STORE_ID } from '../config/stores.js'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const currentStore = STORE_INFO

  return (
    <StoreContext.Provider
      value={{
        stores: STORES,
        currentStore,
        currentStoreId: DEFAULT_STORE_ID,
        switchStore: () => {},
        isBranchModalOpen: false,
        setIsBranchModalOpen: () => {},
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
