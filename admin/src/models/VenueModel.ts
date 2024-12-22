export interface VenueModel {
    venueId: number;
    venueName: string;
    venueAddress: string;
    venueCity: string;
    venueState: string;
    venueCountry: string;
    venueCapacity: number;
    venueType: string;
    venueDetails: Record<string, any>;
}