import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useEventStore } from '@/stores/EventStore'
import { useVenueStore } from '@/stores/VenueStore'
import { format } from 'date-fns'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-react'
import { toast } from '@/hooks/use-toast'
import { Plus, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export function EventDetailsPage() {
    const { eventId } = useParams()
    const events = useEventStore(state => state.events)
    const venues = useVenueStore(state => state.venues)
    const event = events.find(e => e.event_id === Number(eventId))
    const venue = venues.find(v => v.venueId === event?.venue_id)
    const [isEditing, setIsEditing] = useState(false)
    const { getAccessTokenSilently } = useAuth0()
    const navigate = useNavigate()
    const [editedEvent, setEditedEvent] = useState(event || {
        event_name: '',
        event_start_time: '',
        event_end_time: '',
        event_type: '',
        event_description: '',
        venue_id: 0,
        event_details: {},
        event_status: ''
    })

    useEffect(() => {
        if (event) {
            setEditedEvent(event)
        }
    }, [event])

    const handleInputChange = (key: string, value: any) => {
        console.log(`Updating ${key} to:`, value)
        setEditedEvent(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleDetailChange = (key: string, value: any) => {
        setEditedEvent(prev => {
            const details = { ...prev.event_details }
            if (key.includes('[')) {
                // Handle array updates
                const [arrayKey, indexStr] = key.split('[')
                const index = parseInt(indexStr)
                const currentArray = [...details[arrayKey]]
                currentArray[index] = value
                details[arrayKey] = currentArray
            } else {
                details[key] = value
            }
            return {
                ...prev,
                event_details: details
            }
        })
    }

    const handleVenueChange = (value: string) => {
        handleInputChange('venue_id', Number(value))
    }

    const renderEventDetailValue = (key: string, value: any) => {
        if (Array.isArray(value)) {
            return (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label className="capitalize">{key}</Label>
                        {isEditing && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newArray = [...value, '']
                                    handleDetailChange(key, newArray)
                                }}
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        )}
                    </div>
                    {value.map((item, index) => (
                        typeof item === 'object' ? (
                            <div key={index} className="pl-4 border-l-2 border-slate-200">
                                {Object.entries(item).map(([subKey, subValue]) => (
                                    <div key={subKey} className="flex items-center gap-2">
                                        <Label className="capitalize">{subKey}:</Label>
                                        <Input
                                            value={String(subValue)}
                                            onChange={(e) => handleDetailChange(`${key}[${index}].${subKey}`, e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">#{index + 1}</span>
                                <Input
                                    value={String(item)}
                                    onChange={(e) => {
                                        const newArray = [...value]
                                        newArray[index] = e.target.value
                                        handleDetailChange(key, newArray)
                                    }}
                                    disabled={!isEditing}
                                />
                                {isEditing && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const newArray = value.filter((_, i) => i !== index)
                                            handleDetailChange(key, newArray)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )
                    ))}
                </div>
            )
        }
        return (
            <Input
                value={String(value)}
                onChange={(e) => handleDetailChange(key, e.target.value)}
                disabled={!isEditing}
            />
        )
    }

    const handleSave = async () => {
        try {
            const token = await getAccessTokenSilently()

            const mappedEventData = {
                eventId: Number(eventId),
                eventName: editedEvent.event_name,
                venueId: Number(editedEvent.venue_id),
                eventStatus: editedEvent.event_status || 'UPCOMING',
                eventStartTime: editedEvent.event_start_time,
                eventEndTime: editedEvent.event_end_time,
                eventDescription: editedEvent.event_description,
                eventType: editedEvent.event_type,
                eventDetails: editedEvent.event_details
            }

            const response = await axios.post(
                '/api/events/create',
                mappedEventData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            // Map response data back to Event model format
            const updatedEvent = {
                event_id: response.data.eventId,
                event_name: response.data.eventName,
                venue_id: response.data.venueId,
                event_status: response.data.eventStatus,
                event_start_time: response.data.eventStartTime,
                event_end_time: response.data.eventEndTime,
                event_description: response.data.eventDescription,
                event_type: response.data.eventType,
                event_details: response.data.eventDetails
            }

            // Update store with correctly formatted data
            const updatedEvents = events.map(e =>
                e.event_id === Number(eventId) ? updatedEvent : e
            )
            useEventStore.getState().setEvents(updatedEvents)

            toast({
                title: "Success",
                description: "Event updated successfully",
            })

            setIsEditing(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update event",
                variant: "destructive"
            })
        }
    }



    if (!event) {
        return <div className="text-center py-4">Event not found</div>
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="bg-slate-50 flex flex-row justify-between items-center">
                <CardTitle className="text-2xl font-bold text-slate-800">
                    Event Details
                </CardTitle>
                <Button variant="default" onClick={() => navigate(`/manage-tickets/${eventId}`)}>
                    Manage Tickets
                </Button>
                <Button variant="default" onClick={() => navigate(`/create-tickets/${eventId}`)}>
                    Add Tickets
                </Button>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "destructive" : "default"}
                >
                    {isEditing ? 'Cancel Edit' : 'Edit Event Details'}
                </Button>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid gap-6">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Event Name</Label>
                            <Input
                                value={editedEvent.event_name}
                                onChange={(e) => handleInputChange('event_name', e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input
                                    type="datetime-local"
                                    value={format(new Date(editedEvent.event_start_time), "yyyy-MM-dd'T'HH:mm")}
                                    onChange={(e) => handleInputChange('event_start_time', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input
                                    type="datetime-local"
                                    value={format(new Date(editedEvent.event_end_time), "yyyy-MM-dd'T'HH:mm")}
                                    onChange={(e) => handleInputChange('event_end_time', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Event Type</Label>
                            <Input
                                value={editedEvent.event_type}
                                onChange={(e) => handleInputChange('event_type', e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Event Status</Label>
                            <Input
                                value={editedEvent.event_status}
                                onChange={(e) => handleInputChange('event_status', e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={editedEvent.event_description}
                                onChange={(e) => handleInputChange('event_description', e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Venue</Label>
                        <Select
                            value={String(editedEvent.venue_id)}
                            onValueChange={handleVenueChange}
                            disabled={!isEditing}
                        >
                            <SelectTrigger>
                                <SelectValue>
                                    {venues.find(v => v.venueId === editedEvent.venue_id)?.venueName || 'Select Venue'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {venues.map((venue) => (
                                    <SelectItem key={venue.venueId} value={String(venue.venueId)}>
                                        {venue.venueName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Additional Details</h3>
                        {Object.entries(editedEvent.event_details).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
                                {renderEventDetailValue(key, value)}
                            </div>
                        ))}
                    </div>

                    {isEditing && (
                        <Button className="mt-4" onClick={() => {
                            handleSave()
                            setIsEditing(false)
                        }}>
                            Save Changes
                        </Button>
                    )}
                </div>

            </CardContent>
        </Card>
    )
}
