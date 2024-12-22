export interface Event {
    event_id: number;
    event_name: string;
    venue_id: number;
    event_start_time: string;
    event_end_time: string;
    event_description: string;
    event_type: string;
    event_details: Record<string, any>;
    event_status: string;
  }