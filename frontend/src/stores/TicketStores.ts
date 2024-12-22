import { create } from 'zustand'
import { SectionModel } from '@/models/SectionModel'
import { TicketResponse } from '@/models/TicketModel'
import axios from 'axios'
import { toast } from '@/hooks/use-toast'

interface TicketStore {
    sections: SectionModel[]
    sectionTickets: Record<number, TicketResponse[]>
    standingTickets: Record<number, TicketResponse[]>
    selectedTickets: Record<number, boolean>
    cartTotal: number
    setSections: (sections: SectionModel[]) => void
    setSectionTickets: (sectionId: number, tickets: TicketResponse[]) => void
    setStandingTickets: (sectionId: number, tickets: TicketResponse[]) => void
    selectTicket: (ticketId: number) => void
    deselectTicket: (ticketId: number) => void
    fetchSections: (eventId: number, token: string) => Promise<void>
    fetchSectionTickets: (sectionId: number, eventId: number, token: string) => Promise<void>
    handleRequestTickets: (sectionId: number, eventId: number, numberOfTickets: number, token: string) => Promise<void>
  }
  
  export const useTicketStore = create<TicketStore>((set) => ({
    sections: [],
    sectionTickets: {},
    standingTickets: {},
    selectedTickets: {},
    cartTotal: 0,
  
    setSections: (sections) => set({ sections }),
    
    setSectionTickets: (sectionId, tickets) => set((state) => ({
      sectionTickets: { ...state.sectionTickets, [sectionId]: tickets }
    })),
  
    setStandingTickets: (sectionId, tickets) => set((state) => ({
      standingTickets: { ...state.standingTickets, [sectionId]: tickets }
    })),
  
    selectTicket: (ticketId) => set((state) => ({
      selectedTickets: { ...state.selectedTickets, [ticketId]: true }
    })),
  
    deselectTicket: (ticketId) => set((state) => {
      const newSelectedTickets = { ...state.selectedTickets }
      delete newSelectedTickets[ticketId]
      return { selectedTickets: newSelectedTickets }
    }),
  
    fetchSections: async (eventId, token) => {
      try {
        const response = await axios.get<SectionModel[]>(`/api/sections/getByEventId`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { eventId }
        })
        set({ sections: response.data })
      } catch (error) {
        console.error('Error fetching sections:', error)
      }
    },
  
    fetchSectionTickets: async (sectionId, eventId, token) => {
      try {
        const response = await axios.post<TicketResponse[]>('/api/tickets/findByEventSection', {
          eventId,
          sectionId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        set((state) => ({
          sectionTickets: { ...state.sectionTickets, [sectionId]: response.data }
        }))
      } catch (error) {
        console.error('Error fetching section tickets:', error)
      }
    },
  
    handleRequestTickets: async (sectionId, eventId, numberOfTickets, token) => {
      try {
        const response = await axios.post('/api/tickets/findFirstAvailable', {
          eventId,
          sectionId,
          numberOfTickets
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
  
        if (typeof response.data === 'string') {
          toast({
            title: "Tickets Unavailable",
            description: response.data,
            variant: "destructive",
          })
          return
        }
  
        set((state) => ({
          standingTickets: { ...state.standingTickets, [sectionId]: response.data }
        }))
      } catch (error) {
        console.error('Error requesting tickets:', error)
      }
    }
  }))
  
