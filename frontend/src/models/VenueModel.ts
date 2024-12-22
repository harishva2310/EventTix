class VenueModel {
    venue_id: number;
    venue_name: string;
    venue_address: string;
    venue_city: string;
    venue_state: string;
    venue_country: string;
    venue_capacity: number;
    venue_type: string;
    venue_details: Record<string, any>;

    public constructor(venue_id: number, venue_name: string, venue_address: string, venue_city: string, venue_state: string, venue_country: string, venue_capacity: number, venue_type: string,venue_details: Record<string, any>) {
        this.venue_id = venue_id;
        this.venue_name = venue_name;
        this.venue_address = venue_address;
        this.venue_city = venue_city;
        this.venue_state = venue_state;
        this.venue_country = venue_country;
        this.venue_capacity = venue_capacity;
        this.venue_type = venue_type;
        this.venue_details = venue_details;
    }
}

export default VenueModel;