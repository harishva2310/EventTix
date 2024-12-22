import { create } from 'zustand'
import { UserResponse } from '@/models/UserModel'
import axios from 'axios'

interface UserStore {
  userDetails: UserResponse | null
  fetchUserDetails: (email: string, token: string) => Promise<void>
}

export const useUserStore = create<UserStore>((set) => ({
  userDetails: null,
  fetchUserDetails: async (email, token) => {
    try {
      const response = await axios.get(`/api/user/email`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { email }
      })
      set({ userDetails: response.data })
      console.log('User details UserStore.ts:', response.data)
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }
}))
