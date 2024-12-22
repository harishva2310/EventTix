import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { VenueModel } from '@/models/VenueModel'

interface VenueStore {
  venues: VenueModel[]
  setVenues: (venues: VenueModel[]) => void
  clearVenues: () => void
}

export const useVenueStore = create<VenueStore>()(
  persist(
    (set) => ({
      venues: [],
      setVenues: (venues) => set({ venues }),
      clearVenues: () => set({ venues: [] })
    }),
    {
      name: 'venue-storage', // unique name for localStorage key
    }
  )
)