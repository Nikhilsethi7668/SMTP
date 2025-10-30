import { create } from 'zustand'
import { persist } from 'zustand/middleware'


interface User {
    user_id: string,
  full_name: string
  company_name?: string
  username: string
  role: 'admin' | 'user'
  email?: string
  daily_quota: number
  monthly_quota: number
  used_today: number
  used_month: number
  rate_limit: number
  dedicated_ip_id?: string 
}

interface UserState {
  user: User | null
  setUser: (user: User) => void
  updateUser: (partialUser: Partial<User>) => void
  clearUser: () => void
}

// Zustand store with localStorage persistence
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),

      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage', 
    }
  )
)
