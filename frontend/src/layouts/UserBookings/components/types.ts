import { EventResponse } from "@/layouts/SearchEvents/components/EventSearchModel";
import { Booking } from "@/models/BookingModel";

export interface BookingGroup {
    eventData: EventResponse;
    bookings: Booking[];
}

export interface GroupedBookings {
    [eventId: number]: BookingGroup;
}

export interface PaymentGroupedBookings {
    [paymentIntentId: string]: {
        eventData: EventResponse;
        bookings: Booking[];
    }
}