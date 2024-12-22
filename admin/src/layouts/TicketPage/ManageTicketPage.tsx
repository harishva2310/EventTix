import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEventStore } from '@/stores/EventStore'
import { useVenueStore } from '@/stores/VenueStore'
import { SectionModel } from '@/models/SectionModel'
import { TicketResponse } from '@/models/TicketModel'
import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'

export function TicketDetailsPage() {
    const { eventId } = useParams()
    const { getAccessTokenSilently } = useAuth0()
    const events = useEventStore(state => state.events)
    const venues = useVenueStore(state => state.venues)
    const event = events.find(e => e.event_id === Number(eventId))
    const venue = venues.find(v => v.venueId === event?.venue_id)
    const [selectedSection, setSelectedSection] = useState<SectionModel | null>(null)

    const [sections, setSections] = useState<SectionModel[]>([])
    const [tickets, setTickets] = useState<TicketResponse[]>([])
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null)

    const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null)

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false)
    const [bulkPrice, setBulkPrice] = useState('')
    const [bulkStatus, setBulkStatus] = useState('')

    // Add new states for standing section bulk update
    const [isStandingBulkUpdateDialogOpen, setIsStandingBulkUpdateDialogOpen] = useState(false)
    const [selectedStatusForBulk, setSelectedStatusForBulk] = useState('')
    const [standingBulkPrice, setStandingBulkPrice] = useState('')
    const [standingBulkNewStatus, setStandingBulkNewStatus] = useState('')


    // Fetch sections for the event
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const token = await getAccessTokenSilently()
                const response = await axios.get(`/api/sections/getByEventId`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { eventId: eventId },
                })
                setSections(response.data)
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch sections",
                    variant: "destructive"
                })
            }
        }

        if (eventId) {
            fetchSections()
        }
    }, [eventId, getAccessTokenSilently])

    // Fetch tickets when section is selected
    const handleSectionChange = async (sectionId: string) => {
        try {
            const token = await getAccessTokenSilently()
            const currentSection = sections.find(s => s.sectionId === Number(sectionId))
            setSelectedSection(currentSection || null)
            const response = await axios.post(
                '/api/tickets/findByEventSection',
                {
                    eventId: Number(eventId),
                    sectionId: Number(sectionId)
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            const sortedTickets = response.data.sort((a: TicketResponse, b: TicketResponse) => a.ticketId - b.ticketId)
            setTickets(sortedTickets)
            setSelectedSectionId(Number(sectionId))

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch tickets",
                variant: "destructive"
            })
        }
    }

    // Color Ticket cards based on status
    const getCardColorClass = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return 'bg-green-100'
            case 'RESERVED':
                return 'bg-yellow-100'
            case 'SOLD':
                return 'bg-blue-100'
            case 'UNAVAILABLE':
                return 'bg-gray-100'
            case 'CANCELLED':
                return 'bg-red-100'
            default:
                return ''
        }
    }

    // Move Dialog outside of the ticket mapping
    const TicketEditDialog = ({ isOpen, onClose, ticket, onUpdate }: {
        isOpen: boolean;
        onClose: () => void;
        ticket: TicketResponse | null;
        onUpdate: (price: string, status: string) => Promise<void>;
    }) => {
        const [editPrice, setEditPrice] = useState(ticket?.ticketPrice.toString() || '')
        const [editStatus, setEditStatus] = useState(ticket?.ticketStatus || '')

        useEffect(() => {
            if (ticket) {
                setEditPrice(ticket.ticketPrice.toString())
                setEditStatus(ticket.ticketStatus)
            }
        }, [ticket])

        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>

                    <DialogHeader>
                        <DialogTitle>Edit Ticket</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Price</Label>
                            <Input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={editStatus} onValueChange={setEditStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AVAILABLE">Available</SelectItem>
                                    <SelectItem value="RESERVED">Reserved</SelectItem>
                                    <SelectItem value="SOLD">Sold</SelectItem>
                                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={() => onUpdate(editPrice, editStatus)}>Update Ticket</Button>
                    </div>

                </DialogContent>
            </Dialog>
        )
    }



    //Handle ticket price and status updates
    const handleTicketUpdate = async (price: string, status: string) => {
        try {
            const token = await getAccessTokenSilently()

            const requestBody = [{
                ticketId: selectedTicket?.ticketId,
                ...(price !== String(selectedTicket?.ticketPrice) && { newPrice: Number(price) }),
                ...(status !== selectedTicket?.ticketStatus && { ticketStatus: status })
            }]

            await axios.put('/api/tickets/update-prices', requestBody, {
                headers: { Authorization: `Bearer ${token}` }
            })

            handleSectionChange(String(selectedSectionId))
            setIsDialogOpen(false)

            toast({
                title: "Success",
                description: "Ticket updated successfully"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update ticket",
                variant: "destructive"
            })
        }
    }

    const MemoizedTicketEditDialog = useMemo(() => (
        <TicketEditDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            ticket={selectedTicket}
            onUpdate={handleTicketUpdate}
        />
    ), [isDialogOpen, selectedTicket])

    // Add bulk update handler for seated section
    const handleBulkUpdate = async () => {
        try {
            const token = await getAccessTokenSilently()

            const requestBody = tickets.map(ticket => ({
                ticketId: ticket.ticketId,
                ...(bulkPrice && { newPrice: Number(bulkPrice) }),
                ...(bulkStatus && { ticketStatus: bulkStatus })
            }))

            await axios.put('/api/tickets/update-prices', requestBody, {
                headers: { Authorization: `Bearer ${token}` }
            })

            handleSectionChange(String(selectedSectionId))
            setIsBulkUpdateDialogOpen(false)
            setBulkPrice('')
            setBulkStatus('')

            toast({
                title: "Success",
                description: "All tickets updated successfully"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update tickets",
                variant: "destructive"
            })
        }
    }

    // Add handler for standing section bulk updates
    const handleStandingBulkUpdate = async () => {
        try {
            const token = await getAccessTokenSilently()

            const ticketsToUpdate = tickets
                .filter(ticket => ticket.ticketStatus === selectedStatusForBulk)
                .map(ticket => ({
                    ticketId: ticket.ticketId,
                    ...(standingBulkPrice && { newPrice: Number(standingBulkPrice) }),
                    ...(standingBulkNewStatus && { ticketStatus: standingBulkNewStatus })
                }))

            await axios.put('/api/tickets/update-prices', ticketsToUpdate, {
                headers: { Authorization: `Bearer ${token}` }
            })

            handleSectionChange(String(selectedSectionId))
            setIsStandingBulkUpdateDialogOpen(false)
            setStandingBulkPrice('')
            setStandingBulkNewStatus('')

            toast({
                title: "Success",
                description: "Selected tickets updated successfully"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update tickets",
                variant: "destructive"
            })
        }
    }


    return (
        <div className="space-y-6">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Event Sections</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={handleSectionChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                        <SelectContent>
                            {sections.map((section) => (
                                <SelectItem
                                    key={section.sectionId}
                                    value={section.sectionId.toString()}
                                >
                                    {section.sectionName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedSectionId && (
                <Card>
                    <CardHeader>
                    
                        {selectedSection?.sectionSeating === "YES" && (
                            <>
                            <h3 className="text-lg text-card-foreground">Seated Section</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Seated section tickets are displayed according to the number of seats in a row in the particular section. This is specified by the number of rows while creating the section. To view or edit section details, go back to the event details section and click on the Add Tickets button
                            </p>
                            </>

                        )}
                        {selectedSection?.sectionSeating === "NO" && (
                            <>
                            <h3 className="text-lg text-card-foreground">Standing Section</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Standing section tickets are displayed according to the number of tickets available or sold. To view or edit section details, go back to the event details section and click on the Add Tickets button
                            </p>
                            </>

                        )}

                    </CardHeader>
                    <CardContent>
                    {event?.event_details.event_seating_layout && (
                            <div className="mb-8">
                                <img
                                    src={`/img/${event?.event_details.event_seating_layout}`}
                                    alt="Venue Seating Layout"
                                    className="w-full h-auto rounded-lg shadow-md"
                                />
                            </div>
                        )}
                        {selectedSection?.sectionSeating === "YES" && (
                            <Button
                                onClick={() => setIsBulkUpdateDialogOpen(true)}
                                className="mt-4"
                            >
                                Update All Tickets Status/Price
                            </Button>
                        )}
                        {tickets.length > 0 && selectedSection?.sectionSeating === "YES" && (

                            <div className="overflow-x-auto overflow-y-auto max-h-[400px] mt-4">
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: selectedSection?.sectionSeating === "YES"
                                            ? `repeat(${selectedSection.sectionWidth}, 200px)`
                                            : 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: '1rem',
                                        minWidth: selectedSection?.sectionSeating === "YES" ? 'max-content' : 'auto'
                                    }}
                                >
                                    {tickets

                                        .map((ticket) => (
                                            <Card key={ticket.ticketId} className={`w-[200px] ${getCardColorClass(ticket.ticketStatus)}`} onClick={() => {
                                                setSelectedTicket(ticket)

                                                setIsDialogOpen(true)
                                            }}>
                                                <CardContent className="p-4">
                                                    <div className="space-y-2">
                                                        <p><strong>Seat:</strong> {ticket.seatNumber}</p>
                                                        <p><strong>Price:</strong> ${ticket.ticketPrice}</p>
                                                        <p><strong>Status:</strong> {ticket.ticketStatus}</p>
                                                        
                                                    </div>
                                                </CardContent>

                                            </Card>
                                        ))
                                    }
                                </div>
                            </div>

                        )}


                        {selectedSection?.sectionSeating === "NO" && (
                            <Button
                                onClick={() => setIsBulkUpdateDialogOpen(true)}
                                className="mt-4"
                            >
                                Update All Tickets Status/Price
                            </Button>
                        )}

                        {tickets.length > 0 && selectedSection?.sectionSeating === "NO" && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                {['AVAILABLE', 'RESERVED', 'SOLD', 'UNAVAILABLE'].map(status => {
                                    const statusTickets = tickets.filter(ticket => ticket.ticketStatus === status)
                                    const statusCount = statusTickets.length

                                    // Group tickets by price and get count for each price
                                    const priceGroups = statusTickets.reduce((acc, ticket) => {
                                        const price = ticket.ticketPrice
                                        acc[price] = (acc[price] || 0) + 1
                                        return acc
                                    }, {} as Record<number, number>)

                                    return (
                                        <Card key={status} className={`${getCardColorClass(status)}`}>
                                            <CardContent className="p-4 text-center">
                                                <h3 className="font-semibold text-lg">{status}</h3>
                                                <p className="text-2xl font-bold mt-2">{statusCount}</p>
                                                <div className="mt-2 text-sm">
                                                    <p className="font-medium">Prices:</p>
                                                    {Object.entries(priceGroups).map(([price, count]) => (
                                                        <span key={price} className="block">
                                                            ${price} ({count} tickets)
                                                        </span>
                                                    ))}
                                                </div>
                                                <Button
                                                    className="mt-4"
                                                    onClick={() => {
                                                        setSelectedStatusForBulk(status)
                                                        setIsStandingBulkUpdateDialogOpen(true)
                                                    }}
                                                >
                                                    Update {status} Tickets
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )
                                }
                                )}
                            </div>
                        )}
                    </CardContent>
                    {MemoizedTicketEditDialog}
                </Card>

            )}


            <Dialog open={isBulkUpdateDialogOpen} onOpenChange={setIsBulkUpdateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update All Tickets</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Price</Label>
                            <Input
                                type="number"
                                value={bulkPrice}
                                onChange={(e) => setBulkPrice(e.target.value)}
                                placeholder="Leave empty to keep current prices"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={bulkStatus} onValueChange={setBulkStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CURRENT">Keep current status</SelectItem>
                                    <SelectItem value="AVAILABLE">Available</SelectItem>
                                    <SelectItem value="RESERVED">Reserved</SelectItem>
                                    <SelectItem value="SOLD">Sold</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleBulkUpdate}>Update All Tickets</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isStandingBulkUpdateDialogOpen}
                onOpenChange={setIsStandingBulkUpdateDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update {selectedStatusForBulk} Tickets</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>New Price</Label>
                            <Input
                                type="number"
                                value={standingBulkPrice}
                                onChange={(e) => setStandingBulkPrice(e.target.value)}
                                placeholder="Leave empty to keep current prices"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>New Status</Label>
                            <Select value={standingBulkNewStatus} onValueChange={setStandingBulkNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select new status (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CURRENT">Keep current status</SelectItem>
                                    <SelectItem value="AVAILABLE">Available</SelectItem>
                                    <SelectItem value="RESERVED">Reserved</SelectItem>
                                    <SelectItem value="SOLD">Sold</SelectItem>
                                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleStandingBulkUpdate}>Update Tickets</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Toaster />
        </div>


    )
}
