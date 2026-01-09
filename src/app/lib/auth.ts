import { useEffect } from 'react'
import { create } from 'zustand'
import { useAppKitAccount } from '@reown/appkit/react'

type Auth = {
  authenticated: boolean
  role: 'user' | 'evaluator' | null
  setAuth: (authenticated: boolean, role: 'user' | 'evaluator' | null) => void
}

export const useAuthStore = create<Auth>((set) => ({
  authenticated: false,
  role: null,
  setAuth: (authenticated, role) => set({ authenticated, role }),
}))

// reactive hook
export function useSiweAuth() {
  const { isConnected } = useAppKitAccount()
  const { authenticated, role } = useAuthStore()

  useEffect(() => {
    const token = globalThis.localStorage?.getItem('siwe-jwt')
    if (!isConnected || !token) {
      useAuthStore.setState({ authenticated: false, role: null })
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const stillValid = Date.now() < payload.exp * 1000
      const role = (payload.role === 'evaluator') ? 'evaluator' : 'user'
      useAuthStore.setState({ authenticated: stillValid, role })
    } catch {
      localStorage.removeItem('siwe-jwt')
      useAuthStore.setState({ authenticated: false, role: null })
    }
  }, [isConnected])

  return { authenticated, role }
}