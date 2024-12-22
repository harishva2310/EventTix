export interface TicketType {
    type: string;
    price: number;
  }
  
  export interface EventDetails {
    amenities?: string[];
    headliner?: string;
    ticketTypes?: TicketType[];
    supportingActs?: string[];
    [key: string]: any; // For variable attributes
  }
  
  export interface Event {
    event_id: number;
    event_name: string;
    venue_id: number;
    event_start_time: string;
    event_end_time: string;
    event_description: string;
    event_type: string;
    event_details: EventDetails;
  }
  
  export interface Venue {
    venue_id: number;
    venue_name: string;
    venue_city: string;
    venue_state: string;
    venue_country: string;
    venue_address: string;
    venue_capacity: number;
    venue_type: string;
  }
  
  export interface EventResponse {
    event: Event;
    venue: Venue;
  }

  export interface PageResponse {
    content: EventResponse[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      offset: number;
    };
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    numberOfElements: number;
  }