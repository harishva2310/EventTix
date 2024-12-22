import { useState, useEffect } from "react"
import axios from "axios"
import { EventResponse, PageResponse } from "@/layouts/SearchEvents/components/EventSearchModel"
import { EventCard } from "./components/EventCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format, isSameDay } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import VenueModel from "@/models/VenueModel"
import { Spinner } from "@/components/ui/SpinnerLoading"


export default function SearchEvents() {
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [date, setDate] = useState<Date>()
  const [location, setLocation] = useState("all")
  const [eventType, setEventType] = useState("all")
  const [country, setCountry] = useState("all")
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(6) // Number of items per page
  const [availableEventTypes, setAvailableEventTypes] = useState<string[]>([])
  const [venues, setVenues] = useState<VenueModel[]>([])

  const fetchEventTypes = async () => {
    try {
      const response = await axios.get<string[]>('/api/events/getEventTypes')
      setAvailableEventTypes(response.data)
    } catch (error) {
      console.error('Error fetching event types:', error)
    }
  }

  const fetchVenues = async () => {
    try {
      const response = await axios.get<VenueModel[]>('/api/EventSearch/getAllVenues')
      setVenues(response.data)
    } catch (error) {
      console.error('Error fetching venues:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const eventTypeParam = eventType === 'all' ? '' : `&eventType=${eventType}`
      const response = await axios.get<PageResponse>('/api/EventSearch/v4/search', {
        params: {
          query: searchTerm,
          page: currentPage,
          size: pageSize,
          ...(eventType !== 'all' && { eventType }),
          ...(location !== 'all' && { city: location }),
          ...(country !== 'all' && { country })
        }
      })
      if(response.data.content.length !== 0) {
        setEvents(response.data.content)
      }
      
      console.log("Response: " + response.data.content)
      setTotalPages(response.data.totalPages)
      // Reset to first page if current page is beyond the new total pages
      if (currentPage >= response.data.totalPages) {
        setCurrentPage(0)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLocation("all")
  }, [country])
  useEffect(() => {
    fetchVenues()
    fetchEventTypes()
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [searchTerm, currentPage, pageSize, eventType, location, country])

  const filteredEvents = events.filter(({ event, venue }) => {
    const matchesLocation = location === "all" || venue.venue_city === location
    const matchesDate = !date || isSameDay(new Date(event.event_start_time), date)
    const matchesCountry = country === "all" || venue.venue_country === country
    return matchesLocation && matchesDate && matchesCountry
  })

  const getFilteredLocations = () => {
    if (country === "all") {
      return Array.from(new Set(venues.map(venue => venue.venue_city)))
    }
    return Array.from(new Set(
      venues
        .filter(venue => venue.venue_country === country)
        .map(venue => venue.venue_city)
    ))
  }
  const countries = Array.from(new Set(venues.map(venue => venue.venue_country)))


  const PaginationControls = () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            aria-disabled={currentPage === 0}
          />
        </PaginationItem>

        {[...Array(totalPages)].map((_, index) => (
          <PaginationItem key={index}>
            <PaginationLink
              href="#"
              onClick={() => setCurrentPage(index)}
              isActive={currentPage === index}
            >
              {index + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            aria-disabled={currentPage === totalPages - 1}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Search Events</h1>

        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-1/3"
          />

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="max-w-[100vw] md:w-[180px]">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {getFilteredLocations().map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="max-w-[100vw] md:w-[180px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className="max-w-[100vw] md:w-[180px]">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Event Types</SelectItem>
              {availableEventTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="default" className="max-w-[100vw] md:w-[180px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Filter by date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>

          <Button
            onClick={() => {
              setSearchTerm("")
              setLocation("all")
              setCountry("all")
              setEventType("all")
              setDate(undefined)
            }}
          >
            Clear Filters
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((eventData) => (
                <EventCard
                  key={eventData.event.event_id}
                  eventData={eventData}
                />
              ))}
            </div>

            {/* Add pagination controls */}
            <div className="mt-8 flex justify-center">
              <PaginationControls />
            </div>
          </>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center text-muted-foreground">
            No events found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}