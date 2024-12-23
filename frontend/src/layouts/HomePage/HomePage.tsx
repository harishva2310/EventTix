import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import concertImage from "../../assets/concert2.jpg"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { EventResponse, PageResponse } from "../SearchEvents/components/EventSearchModel"
import { useEffect, useState } from "react"
import VenueModel from "@/models/VenueModel"
import { MapPin } from "lucide-react"
export default function LandingPage() {

  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(3) // Number of items per page
  const [availableEventTypes, setAvailableEventTypes] = useState<string[]>([])
  const [venues, setVenues] = useState<VenueModel[]>([]);

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get<PageResponse>('/api/EventSearch/v4/search', {
        params: {
          page: currentPage,
          size: pageSize,

        }
      })
      setEvents(response.data.content)
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

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section with Background Image */}
      <section className="relative w-full">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${concertImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 pt-20 sm:pt-32 pb-16 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-[90vw] sm:max-w-none mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white">
              Book Your Next Adventure
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-xl text-gray-200 max-w-2xl mx-auto">
              Discover and book tickets for the most exciting events happening around you.
              From concerts to conferences, we've got you covered.
            </p>
            <p className="mt-4 sm:mt-6 text-base sm:text-xl text-gray-200 max-w-2xl mx-auto">
              Disclaimer: This is a tech demo project and all the images and data used in this project are for demonstration purposes only.
            </p>
            <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
              >
                <Link to="/events">Browse Events</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            <div className="text-center col-span-3">Loading events...</div>
          ) : (
            events.map((eventData) => (
              <div key={eventData.event.event_id} className="rounded-lg border bg-card p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                <div className="aspect-video bg-muted rounded-md mb-4">
                  {eventData.event.event_details.cover_picture_path && eventData.event.event_details.cover_picture_path.length > 0 ? (
                    <img
                      src={`/img/${eventData.event.event_details.cover_picture_path[0]}`}
                      alt={eventData.event.event_name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded-md" />
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{eventData.event.event_name}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">{eventData.event.event_description}</p>
                <div className="flex items-center gap-2 mb-4 text-sm sm:text-base">
                  <MapPin className="h-4 w-4" />
                  <span>{eventData.venue.venue_name}, {eventData.venue.venue_city}</span>
                </div>
                <div className="mt-auto">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/event-details/${eventData.event.event_id}`)}
                    className="w-full"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center">
            <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">🎫</span>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Easy Booking</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Search for your events by clicking Events and book tickets easily</p>
          </div>
          <div className="text-center">
            <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">🔒</span>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Pay for your orders using Stripe with options such as Credit/Debit Card, Amazon Pay etc</p>
          </div>
          <div className="text-center">
            <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">🏦</span>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Verified Tickets and Booking</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Each ticket and booking for an event in our system is verified by our security algorithms designed to prevent counterfeiting and theft of tickets</p>
          </div>
        </div>
      </section>
    </div>
  )
}