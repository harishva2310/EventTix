import { create } from 'zustand'
import { EventResponse } from '@/layouts/SearchEvents/components/EventSearchModel'
import { SectionModel } from '@/models/SectionModel'
import axios from 'axios'
import { toast } from '@/hooks/use-toast'
import QRCode from 'qrcode';
import { useUserStore } from '@/stores/UserStore'
interface CartItem {
  ticketId: number
  sectionId: number
  price: number
  eventId: number
  eventDetails?: EventResponse
  sectionDetails?: SectionModel
  ticketCode: string
  ticketDateTime: string
}

interface CartStore {
  items: Record<number, CartItem>
  total: number
  isProcessingBooking: boolean
  showPaymentDialog: boolean
  setShowPaymentDialog: (show: boolean) => void
  addItem: (ticketId: number, sectionId: number, price: number, eventId: number, eventDetails: EventResponse, sectionDetails: SectionModel, ticketCode: string, ticketDateTime:string) => void
  removeItem: (ticketId: number) => void
  clearCart: () => void
  handlePurchase: (token: string, userEmail: string) => Promise<void>
  handlePaymentSuccess: (paymentIntentId: string, token: string, userDetails: any) => Promise<void>
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: {},
  total: 0,
  isProcessingBooking: false,
  showPaymentDialog: false,

  setShowPaymentDialog: (show) => set({ showPaymentDialog: show }),

  addItem: (ticketId, sectionId, price, eventId, eventDetails, sectionDetails, ticketCode, ticketDateTime) => {
    set((state) => {
      const newItems = {
        ...state.items,
        [ticketId]: { ticketId, sectionId, price, eventId, eventDetails, sectionDetails,ticketCode, ticketDateTime }
      }
      return {
        items: newItems,
        total: Object.values(newItems).reduce((sum, item) => sum + item.price, 0)
      }
    })
  },

  removeItem: (ticketId) => {
    set((state) => {
      const newItems = { ...state.items }
      delete newItems[ticketId]
      return {
        items: newItems,
        total: Object.values(newItems).reduce((sum, item) => sum + item.price, 0)
      }
    })
  },

  clearCart: () => set({ items: {}, total: 0 }),

  handlePurchase: async (token: string, userEmail: string) => {
    const state = get()
    const selectedTicketIds = Object.keys(state.items).map(id => parseInt(id))
    
    try {
      // Check ticket reservation
      const checkResponse = await axios.post('/api/tickets/check-reservation', selectedTicketIds, {
        headers: { Authorization: `Bearer ${token}` }
      }


      )
      
      if (checkResponse.data === "Selected Tickets may have been reserved") {
        toast({
          title: "Tickets Unavailable",
          description: "Some selected tickets are no longer available. Please try different tickets.",
          variant: "destructive",
        })
        return
      }

      // Reserve tickets
      const reservationResponse = await axios.post('/api/tickets/reserve', selectedTicketIds, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userEmail }
      })

      if (reservationResponse.status !== 200) {
        throw new Error('Failed to reserve tickets')
      }

      // Create payment intent
      const paymentResponse = await axios.post('/api/payments/create-payment-intent', {
        amount: Math.round(state.total * 100),
        currency: 'USD',
        description: `Tickets for ${Object.values(state.items)[0]?.eventDetails?.event.event_name}`,
        customerEmail: userEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (paymentResponse.data.clientSecret) {
        set({ showPaymentDialog: true })
      } else {
        throw new Error('Failed to initialize payment')
      }
    } catch (error) {
      console.error('Error in purchase process:', error)
      
      // Release reservation on error
      try {
        await axios.post('/api/tickets/release-reservation', selectedTicketIds, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userEmail }
        })
      } catch (releaseError) {
        console.error('Error releasing reservation:', releaseError)
      }

      toast({
        title: "Error",
        description: "Failed to process purchase. Please try again.",
        variant: "destructive",
      })
    }
  },

  handlePaymentSuccess: async (paymentIntentId: string, token: string, userDetails: any) => {
    const state = get()
    try {
        const dbUserDetails = useUserStore.getState().userDetails
        if (!dbUserDetails) {
            console.log('Database user details not found:', dbUserDetails)
            throw new Error('User details required')
        }

        const verificationResponse = await axios.get(`/api/payments/payment-intent/${paymentIntentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (verificationResponse.data.status === 'succeeded') {
            console.log('Payment verification successful')
            const currentDate = new Date()
            const cartTickets = Object.entries(state.items)
            
            const ticketsToUpdate = cartTickets.map(([ticketId]) => ({
                ticketId: parseInt(ticketId),
                newStatus: "SOLD"
            }))

            console.log('Processing tickets:', ticketsToUpdate)

            const bookingPromises = cartTickets.map(async ([ticketId, item]) => {
                const qrData = JSON.stringify({
                    ticketId,
                    eventId: item.eventId,
                    eventName: item.eventDetails?.event.event_name,
                    userEmail: dbUserDetails.email,
                    userId: dbUserDetails.user_id,
                    sectionName: item.sectionDetails?.sectionName,
                    sectionType: item.sectionDetails?.sectionSeating,
                    timestamp: Date.now(),
                    validationKey: Math.random().toString(36).substr(2, 9)
                })

                //const qrCodeImage = await QRCode.toDataURL(qrData)

                const bookingData = {
                    userId: dbUserDetails.user_id,
                    ticketId: parseInt(ticketId),
                    bookingDate: currentDate.toISOString().split('T')[0],
                    bookingTime: currentDate.toTimeString().split(' ')[0],
                    bookingStatus: "CONFIRMED",
                    bookingDetails: {
                      ticketInfo: {
                        price: item.price,
                        eventId: item.eventId,
                        ticketId: parseInt(ticketId),
                        sectionId: item.sectionId,
                        ticketStatus: "SOLD",
                        },
                        sectionInfo: item.sectionDetails,
                        userEmail: dbUserDetails.email,
                        eventData: item.eventDetails,
                        totalPrice: state.total,
                        userDetails: dbUserDetails,
                        paymentIntentId,
                        //qrCode: qrCodeImage
                    }
                }

                return axios.post('/api/bookings/createBooking', bookingData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            })

            const results = await Promise.all([
                ...bookingPromises,
                axios.put('/api/tickets/purchase-tickets', ticketsToUpdate, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ])

            console.log('Booking completed successfully')
            get().clearCart()
            set({ showPaymentDialog: false })
        }
    } catch (error) {
        console.error('Detailed booking error:', error)
        throw error
    }
}

}))