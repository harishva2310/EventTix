import { CalendarDays, MapPin, Clock, Guitar, Mic, Ticket, ArrowLeft, Car } from 'lucide-react';

interface PerformersSectionProps {
  eventDetails: any;
}

export const EventPerformersSection = ({ eventDetails }: PerformersSectionProps) => {
  return (
    <div className="p-4 sm:p-6 bg-secondary/5 rounded-lg space-y-3 sm:space-y-4">
      {eventDetails.headliner && (
        <div className="flex items-center gap-2 sm:gap-3">
          <Guitar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-base sm:text-lg font-semibold break-words">
            Headliner: {eventDetails.headliner}
          </span>
        </div>
      )}
      {eventDetails.supportingActs && eventDetails.supportingActs.length > 0 && (
        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
          <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-1 sm:mt-0" />
          <span className="text-sm sm:text-base md:text-lg break-words">
            Supporting Acts: {eventDetails.supportingActs.join(', ')}
          </span>
        </div>
      )}
      {eventDetails.amenities && eventDetails.amenities.length > 0 && (
        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
          <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-1 sm:mt-0" />
          <span className="text-sm sm:text-base md:text-lg break-words">
            Amenities: {eventDetails.amenities.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
};
