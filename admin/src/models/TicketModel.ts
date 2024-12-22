export interface TicketResponse {
    
    ticketId: number;
    eventId: number;
    venueId: number;
    sectionId: number;
    seatNumber: string;
    ticketSectionSeating: string;
    ticketDetails: Record<string, string>;
    ticketStatus: string;
    ticketPrice: number;
    ticketCode: string;
    ticketDateTime: string;
}