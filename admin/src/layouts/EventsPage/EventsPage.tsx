import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { useVenueStore } from '@/stores/VenueStore'
import { Event } from '@/models/EventModel'
import { format } from 'date-fns'
import { useEventStore } from '@/stores/EventStore'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function EventsPage() {
    const { events, setEvents } = useEventStore()
    const [selectedVenueId, setSelectedVenueId] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const { getAccessTokenSilently } = useAuth0()
    const venues = useVenueStore(state => state.venues)
    const navigate = useNavigate();


    const fetchEvents = async (venueId: string) => {
        try {
            setLoading(true)
            const token = await getAccessTokenSilently()
            const { data } = await axios.get<Event[]>(
                `/api/events/getEventbyVenueId/${venueId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            setEvents(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching events:', error)
            setEvents([])
        } finally {
            setLoading(false)
        }
    }



    const handleVenueChange = (value: string) => {
        setSelectedVenueId(value)
        fetchEvents(value)
    }

    return (
        <Card className="container w-full">
            <CardHeader className="bg-slate-50">
                <CardTitle className="text-2xl font-bold text-slate-800">
                    Events Management
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="mb-6">
                    <Select onValueChange={handleVenueChange} value={selectedVenueId}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select a venue" />
                        </SelectTrigger>
                        <SelectContent>
                            {venues.map((venue) => (
                                <SelectItem key={venue.venueId} value={venue.venueId.toString()}>
                                    {venue.venueName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="text-center py-4">Loading events...</div>
                ) : events.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-100">
                                <TableHead className="font-semibold text-slate-900 text-center">Event Name</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-center">Start Time</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-center">End Time</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-center">Type</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-center">Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow
                                    key={event.event_id}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    <TableCell className="font-medium">
                                        <Link
                                            to={`/event-details/${event.event_id}`}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            {event.event_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{format(new Date(event.event_start_time), 'PPp')}</TableCell>
                                    <TableCell>{format(new Date(event.event_end_time), 'PPp')}</TableCell>
                                    <TableCell>{event.event_type}</TableCell>
                                    <TableCell>{event.event_description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-4">
                        {selectedVenueId ? 'No events found for this venue' : 'Select a venue to view events'}
                    </div>
                )}
            </CardContent>
            <Button className="mt-4 mb-4" onClick={() => navigate('/addEvent')}>Add Event</Button>
        </Card>
        
    )
}
