import { EventResponse } from "@/layouts/SearchEvents/components/EventSearchModel"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Clock, Guitar, Mic } from "lucide-react"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"

interface EventCardProps {
  eventData: EventResponse;
}

export function EventCard({ eventData }: EventCardProps) {
  const { event, venue } = eventData;
  
  const navigate = useNavigate();
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold">{event.event_name}</h3>
            <p className="text-sm text-muted-foreground text-left">{event.event_type}</p>
          </div>
          
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>{format(new Date(event.event_start_time), 'PPP')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{format(new Date(event.event_start_time), 'p')}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{venue.venue_name}, {venue.venue_city}</span>
        </div>
        {event.event_details.headliner && (
          <div className="flex items-center gap-2">
            <Guitar className="h-4 w-4" />
            <span className="font-semibold">Headliner: {event.event_details.headliner}</span>
          </div>
        )}
        {event.event_details.supportingActs && event.event_details.supportingActs.length > 0 && (
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span>Supporting Acts: {event.event_details.supportingActs.join(', ')}</span>
          </div>
        )}
        <p className="text-sm text-muted-foreground">{event.event_description}</p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => navigate(`/event-details/${eventData.event.event_id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}