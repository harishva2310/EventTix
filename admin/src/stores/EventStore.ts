import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Event } from '@/models/EventModel'

interface EventStore {
  events: Event[]
  setEvents: (events: Event[]) => void
  clearEvents: () => void
}

export const useEventStore = create<EventStore>()(
  persist(
    (set) => ({
      events: [],
      setEvents: (events) => set({ events }),
      clearEvents: () => set({ events: [] })
    }),
    {
      name: 'event-storage', // unique name for localStorage key
    }
  )
)

