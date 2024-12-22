import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useEventStore } from '@/stores/EventStore'
import { useVenueStore } from '@/stores/VenueStore'
import { useAuth0 } from '@auth0/auth0-react'
import { toast } from '@/hooks/use-toast'
import axios from 'axios'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { SectionModel } from '@/models/SectionModel'
import { Toaster } from '@/components/ui/toaster'

interface TicketCreationForm {
    eventId: number;
    venueId: number;
    sectionId: number;
    ticketPrice: number;
    ticketStatus: string;
    ticketSectionSeating: string;
    seatStart?: number;
    seatEnd?: number;
    ticketDetails: Record<string, string>;
    secretKey: string;
    numberOfStandingTickets?: number;
}

export function AddTickets() {
    const { eventId } = useParams()
    const { getAccessTokenSilently } = useAuth0()
    const events = useEventStore(state => state.events)
    const venues = useVenueStore(state => state.venues)
    const event = events.find(e => e.event_id === Number(eventId))
    // Add this state inside your component
    const [sections, setSections] = useState<SectionModel[]>([])
    const [ticketForm, setTicketForm] = useState<TicketCreationForm>({
        eventId: Number(eventId),
        venueId: event?.venue_id || 0,
        sectionId: 0,
        ticketPrice: 0,
        ticketStatus: 'AVAILABLE',
        ticketSectionSeating: 'NO',
        ticketDetails: {},
        secretKey: ''
    })

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const token = await getAccessTokenSilently()
                const response = await axios.get(`/api/sections/getByEventId?eventId=${eventId}`, {
                    headers: { Authorization: `Bearer ${token}` }
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
        fetchSections()
    }, [eventId])

    const [newSection, setNewSection] = useState({
        sectionName: '',
        eventId: Number(eventId),
        venueId: event?.venue_id || 0,
        sectionCapacity: 0,
        sectionSeating: '',
        sectionWidth: 0,
        sectionDetails: {}
    })

    const handleSectionInputChange = (key: string, value: any) => {
        setNewSection(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleCreateSection = async () => {
        try {
            const token = await getAccessTokenSilently()
            console.log('Creating section with data:', newSection)
            await axios.post(
                '/api/sections/createSection',
                newSection,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            toast({
                title: "Success",
                description: "Section created successfully",
            })

            // Reset form
            setNewSection({
                sectionName: '',
                eventId: Number(eventId),
                venueId: event?.venue_id || 0,
                sectionCapacity: 0,
                sectionSeating: '',
                sectionWidth: 0,
                sectionDetails: {}
            })

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create section",
                variant: "destructive"
            })
        }
    }

    const handleCreateTickets = async () => {
        try {
            const token = await getAccessTokenSilently()
            const selectedSection = sections.find(s => s.sectionId === ticketForm.sectionId)
            const tickets = []

            if (selectedSection?.sectionSeating === 'YES' && ticketForm.seatStart && ticketForm.seatEnd) {
                for (let i = ticketForm.seatStart; i <= ticketForm.seatEnd; i++) {
                    tickets.push({
                        eventId: ticketForm.eventId,
                        venueId: ticketForm.venueId,
                        sectionId: ticketForm.sectionId,
                        seatNumber: `A${i}`,
                        ticketSectionSeating: ticketForm.ticketSectionSeating,
                        ticketStatus: ticketForm.ticketStatus,
                        ticketPrice: ticketForm.ticketPrice,
                        ticketDetails: ticketForm.ticketDetails
                    })
                }
            } else {
                for (let i = 0; i < ticketForm.numberOfStandingTickets!; i++) {
                    tickets.push({
                        eventId: ticketForm.eventId,
                        venueId: ticketForm.venueId,
                        sectionId: ticketForm.sectionId,
                        seatNumber: 'NA',
                        ticketSectionSeating: ticketForm.ticketSectionSeating,
                        ticketStatus: ticketForm.ticketStatus,
                        ticketPrice: ticketForm.ticketPrice,
                        ticketDetails: ticketForm.ticketDetails
                    })
                }
            }

            await axios.post(
                `/api/tickets/v2/create-bulk?secretKey=${ticketForm.secretKey}`,
                tickets,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            toast({
                title: "Success",
                description: "Tickets created successfully",
            })

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create tickets",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Section Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Create New Section</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Section Name</Label>
                            <Input
                                value={newSection.sectionName}
                                onChange={(e) => handleSectionInputChange('sectionName', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Section Capacity</Label>
                            <Input
                                type="number"
                                value={newSection.sectionCapacity}
                                onChange={(e) => handleSectionInputChange('sectionCapacity', parseInt(e.target.value))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Section Seating Type</Label>
                            <Select
                                value={newSection.sectionSeating}
                                onValueChange={(value) => handleSectionInputChange('sectionSeating', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select seating type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="YES">Seated Section</SelectItem>
                                    <SelectItem value="NO">Standing Section</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Section Width</Label>
                            <Input
                                type="number"
                                value={newSection.sectionWidth}
                                onChange={(e) => handleSectionInputChange('sectionWidth', parseInt(e.target.value))}
                            />
                        </div>

                        <Button onClick={handleCreateSection}>
                            Create Section
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Ticket Management - Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Create Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Section</Label>
                            <Select
                                value={String(ticketForm.sectionId)}
                                onValueChange={(value) => setTicketForm(prev => ({
                                    ...prev,
                                    sectionId: Number(value),
                                    ticketSectionSeating: sections.find(s => s.sectionId === Number(value))?.sectionSeating || 'NO'
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((section) => (
                                        <SelectItem key={section.sectionId} value={String(section.sectionId)}>
                                            Section Name: {section.sectionName} - Seating: {section.sectionSeating} - Number of Rows: {section.sectionWidth}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {ticketForm.ticketSectionSeating === 'YES' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Seat Start Number</Label>
                                    <Input
                                        type="number"
                                        value={ticketForm.seatStart}
                                        onChange={(e) => setTicketForm(prev => ({
                                            ...prev,
                                            seatStart: Number(e.target.value)
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Seat End Number</Label>
                                    <Input
                                        type="number"
                                        value={ticketForm.seatEnd}
                                        onChange={(e) => setTicketForm(prev => ({
                                            ...prev,
                                            seatEnd: Number(e.target.value)
                                        }))}
                                    />
                                </div>
                            </div>
                        )}

                        {ticketForm.ticketSectionSeating === 'NO' && (
                            <div className="space-y-2">
                                <Label>Number of Standing Tickets</Label>
                                <Input
                                    type="number"
                                    value={ticketForm.numberOfStandingTickets}
                                    onChange={(e) => setTicketForm(prev => ({
                                        ...prev,
                                        numberOfStandingTickets: Number(e.target.value)
                                    }))}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Ticket Status</Label>
                            <Select
                                value={ticketForm.ticketStatus}
                                onValueChange={(value) => setTicketForm(prev => ({
                                    ...prev,
                                    ticketStatus: value
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select ticket status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                                    <SelectItem value="UNAVAILABLE">UNAVAILABLE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Ticket Price</Label>
                            <Input
                                type="number"
                                value={ticketForm.ticketPrice}
                                onChange={(e) => setTicketForm(prev => ({
                                    ...prev,
                                    ticketPrice: Number(e.target.value)
                                }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Event Secret Key</Label>
                            <Input
                                value={ticketForm.secretKey}
                                onChange={(e) => setTicketForm(prev => ({
                                    ...prev,
                                    secretKey: e.target.value
                                }))}
                            />
                        </div>

                        <Button onClick={handleCreateTickets}>
                            Create Tickets
                        </Button>
                    </div>
                </CardContent>
                <Toaster />
            </Card>
        </div>
    )
}
