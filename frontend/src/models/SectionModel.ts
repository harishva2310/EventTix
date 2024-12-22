export interface SectionModel {
    sectionId: number;
    sectionName: string;
    eventId: number;
    venueId: number;
    sectionCapacity: number;
    sectionSeating: string;
    sectionWidth: number;
    sectionDetails: Record<string, string>;
}