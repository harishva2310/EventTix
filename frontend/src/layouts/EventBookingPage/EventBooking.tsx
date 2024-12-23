import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, MapPin, Clock, Guitar, Mic, Ticket, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Toggle } from "@/components/ui/toggle"
import { EventHeroSection } from './components/EventHeroSection'
import { EventPerformersSection } from './components/EventDetails'
import { EventGallerySection } from './components/EventGallerySection'
import { useEventStore } from '@/stores/EventStore'
import { useUserStore } from '@/stores/UserStore'
import { useTicketStore } from '@/stores/TicketStores'
import { useCartStore } from '@/stores/CartStores'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function EventDetailsPage() {
    const { eventId } = useParams()
    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0()
    const navigate = useNavigate()
    // Add state for requested tickets
    const { eventData, isLoading, fetchEventDetails } = useEventStore()
    const { userDetails, fetchUserDetails } = useUserStore()
    const [requestedTickets, setRequestedTickets] = useState(0)
    const { sections, sectionTickets, fetchSections, fetchSectionTickets, handleRequestTickets, standingTickets } = useTicketStore()
    const { addItem, removeItem, items, } = useCartStore()

    useEffect(() => {
        if (eventId) {
            fetchEventDetails(eventId)
        }
    }, [eventId])

    useEffect(() => {
        if (user?.email && isAuthenticated) {
            const fetchToken = async () => {
                const token = await getAccessTokenSilently()
                if (user.email) {
                    fetchUserDetails(user.email, token)
                }
            }
            fetchToken()
        }
    }, [user?.email, isAuthenticated])

    useEffect(() => {
        if (isAuthenticated && eventData?.event) {
            const fetchToken = async () => {
                const token = await getAccessTokenSilently()
                fetchSections(eventData.event.event_id, token)
            }
            fetchToken()
        }
    }, [isAuthenticated, eventData])

    const handleSectionClick = async (sectionId: number, sectionSeating: string) => {
        if (!isAuthenticated) return

        if (sectionSeating === "YES") {
            const token = await getAccessTokenSilently()
            fetchSectionTickets(sectionId, eventData?.event.event_id || 0, token)
        } else {
            handleStandingTicketRequest(sectionId, requestedTickets)
        }
    }

    const handleStandingTicketRequest = async (sectionId: number, numberOfTickets: number) => {
        if (!eventData?.event.event_id) return
        const token = await getAccessTokenSilently()
        handleRequestTickets(sectionId, eventData.event.event_id, numberOfTickets, token)
    }

    if (!eventData) return <div>Event not found</div>

    const { event, venue } = eventData

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                <div className="p-4 sm:p-8">
                    <EventHeroSection event={event} venue={venue} />
                    <EventPerformersSection eventDetails={event.event_details} />

                    <div className="mt-8 w-full bg-card shadow-lg rounded-lg p-4 sm:p-6 overflow-hidden">
                        <h2 className="text-2xl font-bold mb-6">Select Your Seats</h2>

                        {event.event_details.event_seating_layout && (
                            <div className="mb-8">
                                <img
                                    src={`/img/${event.event_details.event_seating_layout}`}
                                    alt="Venue Seating Layout"
                                    className="w-full h-auto rounded-lg shadow-md"
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            {isAuthenticated ? (
                                <div className="space-y-4">
                                    {isLoading ? (
                                        <div className="text-center p-4">Loading available tickets...</div>
                                    ) : (
                                        <Accordion type="single" collapsible className="max-w-[60vw] sm:max-w-[80vw] md:max-w-[100vw] overflow-hidden" >
                                            {sections.map((section) => (
                                                <AccordionItem key={section.sectionId} value={section.sectionId.toString()}>
                                                    <AccordionTrigger
                                                        onClick={() => handleSectionClick(section.sectionId, section.sectionSeating)}
                                                        className="hover:no-underline"
                                                    >
                                                        <div className="flex items-center justify-between w-full pr-4">
                                                            <div className="flex items-center gap-3">
                                                                <Ticket className="h-5 w-5 text-muted-foreground" />
                                                                <span className="text-muted-foreground text-zinc-950 font-bold">Section: {section.sectionName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-muted-foreground">
                                                                    {section.sectionSeating === "YES" ? "Seated" : "Standing"}
                                                                </span>

                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="flex flex-col gap-4">
                                                            <div className="text-center p-2 bg-primary/10 rounded-md">
                                                                <span className="font-semibold">⭐ STAGE THIS SIDE ⭐</span>
                                                            </div>

                                                            {section.sectionSeating === "YES" ? (
                                                                // Seated Section
                                                                <div className="overflow-x-auto">
                                                                    <div
                                                                        style={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: `repeat(${section.sectionWidth}, minmax(3rem, 1fr))`,
                                                                            gap: '0.5rem',
                                                                            width: 'fit-content',
                                                                            padding: '0.5rem'
                                                                        }}
                                                                    >
                                                                        {sectionTickets[section.sectionId]?.sort((a, b) => a.ticketId - b.ticketId).map((ticket) => (
                                                                            <Toggle
                                                                                key={ticket.ticketId}
                                                                                variant="outline"
                                                                                aria-label={`Select seat ${ticket.seatNumber}`}
                                                                                disabled={ticket.ticketStatus !== 'AVAILABLE'}
                                                                                pressed={!!items[ticket.ticketId]}
                                                                                onPressedChange={(pressed) => {
                                                                                    if (pressed) {
                                                                                        addItem(ticket, eventData, section)
                                                                                    } else {
                                                                                        removeItem(ticket.ticketId)
                                                                                    }
                                                                                }}
                                                                                className={`w-12 h-12 p-0 flex flex-col items-center justify-center
                                                                                    ${ticket.ticketStatus === 'AVAILABLE'
                                                                                        ? 'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
                                                                                        : 'opacity-50 cursor-not-allowed'
                                                                                    }
                            `}
                                                                            >
                                                                                <span className="text-xs font-bold">{ticket.seatNumber}</span>
                                                                                <span className="text-xs font-semibold">${ticket.ticketPrice}</span>
                                                                            </Toggle>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                // Standing Section
                                                                <div className="flex flex-col gap-4">
                                                                    {standingTickets[section.sectionId] && (
                                                                        <div className="flex flex-col gap-4">
                                                                            <Card className="bg-card/50">
                                                                                <CardHeader>
                                                                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                                                                        <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                                                                        Standing Area Tickets
                                                                                    </CardTitle>
                                                                                </CardHeader>
                                                                                <CardContent>
                                                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                                                        <div className="space-y-1">
                                                                                            <p className="text-sm text-muted-foreground">Select the number of tickets</p>
                                                                                            <p className="text-xs text-muted-foreground">Max. 8 tickets per request</p>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2 sm:gap-4">
                                                                                            <Input
                                                                                                type="number"
                                                                                                min="1"
                                                                                                max={section.sectionCapacity}
                                                                                                className="w-20 sm:w-24"
                                                                                                placeholder="Qty"
                                                                                                onChange={(e) => {
                                                                                                    const value = parseInt(e.target.value)
                                                                                                    if (value > 0 && value <= section.sectionCapacity && value <= 8) {
                                                                                                        setRequestedTickets(value)
                                                                                                    }
                                                                                                }}
                                                                                            />
                                                                                            <Button
                                                                                                variant="default"
                                                                                                className="bg-primary hover:bg-primary/90 text-sm sm:text-base"
                                                                                                onClick={() => handleStandingTicketRequest(section.sectionId, requestedTickets)}
                                                                                                disabled={!requestedTickets || requestedTickets <= 0}
                                                                                            >
                                                                                                Find Tickets
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                </CardContent>
                                                                            </Card>

                                                                            {standingTickets[section.sectionId] && (
                                                                                <Card className="border-primary/20">
                                                                                    <CardHeader className="pb-2 sm:pb-3">
                                                                                        <CardTitle className="text-base sm:text-lg font-semibold">Available Tickets</CardTitle>
                                                                                    </CardHeader>
                                                                                    <CardContent>
                                                                                        <p className="text-xs sm:text-sm text-muted-foreground pb-2 sm:pb-3">Select tickets to add to cart</p>
                                                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                                                                            {standingTickets[section.sectionId].map((ticket) => (
                                                                                                <Toggle
                                                                                                    key={ticket.ticketId}
                                                                                                    variant="outline"
                                                                                                    pressed={!!items[ticket.ticketId]}
                                                                                                    onPressedChange={(pressed) => {
                                                                                                        if (pressed) {
                                                                                                            addItem(ticket, eventData, section)
                                                                                                        } else {
                                                                                                            removeItem(ticket.ticketId)
                                                                                                        }
                                                                                                    }}
                                                                                                    className="h-auto flex flex-col gap-1 sm:gap-2 p-2 sm:p-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-primary/10"
                                                                                                >
                                                                                                    <span className="text-xs sm:text-sm">Ticket #{ticket.ticketId}</span>
                                                                                                    <span className="text-base sm:text-lg font-bold">${ticket.ticketPrice}</span>
                                                                                                </Toggle>
                                                                                            ))}
                                                                                        </div>
                                                                                    </CardContent>
                                                                                </Card>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </AccordionContent>

                                                </AccordionItem>
                                            ))}
                                        </Accordion>

                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <p className="text-muted-foreground">Please log in to view available tickets</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {event.event_details.eventImages?.length > 0 && (
                        <EventGallerySection images={event.event_details.eventImages} />
                    )}
                </div>
            </div>

            <div className="mt-8">
                <Button
                    variant="outline"
                    className="hover:bg-accent transition-colors"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Search
                </Button>
            </div>
        </div>
    )
}

