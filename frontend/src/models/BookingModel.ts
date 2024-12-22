import { TicketResponse } from "./TicketModel";

export interface Booking {
    bookingId: number;
    userId: number;
    ticketId: number;
    bookingDate: string;
    bookingTime: string;
    bookingStatus: string;
    bookingDetails: {
      [x: string]: any;
      eventId: number;
      venueId: number;
      ticketInfo: any;
      userEmail: string;
      totalPrice: number;

    };
  }