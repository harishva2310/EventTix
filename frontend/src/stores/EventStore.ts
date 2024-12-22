import { create } from 'zustand'
import { EventResponse } from '@/layouts/SearchEvents/components/EventSearchModel'
import axios from 'axios'

interface EventStore {
  eventData: EventResponse | null
  isLoading: boolean
  fetchEventDetails: (eventId: string) => Promise<void>
}

export const useEventStore = create<EventStore>((set) => ({
  eventData: null,
  isLoading: false,
  fetchEventDetails: async (eventId) => {
    set({ isLoading: true })
    try {
      const response = await axios.get<EventResponse>(`/api/EventSearch/getEventById/${eventId}`)
      set({ eventData: response.data })
    } catch (error) {
      console.error('Error fetching event details:', error)
    } finally {
      set({ isLoading: false })
    }
  }
}))
