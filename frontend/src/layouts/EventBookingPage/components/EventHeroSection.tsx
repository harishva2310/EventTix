import { format } from "date-fns";
import { CalendarDays, Clock, MapPin } from "lucide-react";

interface EventHeroProps {
  event: any;
  venue: any;
}

export const EventHeroSection = ({ event, venue }: EventHeroProps) => {
  return (
    <>
      {/* Hero Section */}
      {event.event_details.cover_picture_path && event.event_details.cover_picture_path.length > 0 ? (
        <div className="relative mb-4 sm:mb-8 rounded-lg overflow-hidden">
          <img
            src={`/img/${event.event_details.cover_picture_path[0]}`}
            alt="Event Cover"
            className="w-full h-[200px] sm:h-[400px] md:h-[600px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 text-white">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-1 sm:mb-2">
              {event.event_name}
            </h1>
            <p className="text-sm sm:text-lg md:text-xl opacity-90 line-clamp-2 sm:line-clamp-none">
              {event.event_description}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4 sm:mb-8 p-4 sm:p-0">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-1 sm:mb-2">
            {event.event_name}
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground">
            {event.event_description}
          </p>
        </div>
      )}

      {/* Event Details Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="p-4 sm:p-6 bg-primary/5 rounded-lg space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
            <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span>{format(new Date(event.event_start_time), 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span>{format(new Date(event.event_start_time), 'p')}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg">
            <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="break-words">{venue.venue_name}, {venue.venue_city}</span>
          </div>
        </div>
      </div>
    </>

  );
};
