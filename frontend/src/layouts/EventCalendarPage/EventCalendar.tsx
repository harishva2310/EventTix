import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import {format} from 'date-fns/format';
import {parse} from 'date-fns/parse';
import {startOfWeek} from 'date-fns/startOfWeek';
import {getDay} from 'date-fns/getDay';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Booking } from '@/models/BookingModel';
import { EventResponse } from '@/layouts/SearchEvents/components/EventSearchModel';
import { Link } from 'react-router-dom';
import { WidthIcon } from '@radix-ui/react-icons';

const locales = {
    'en-US': enUS
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    bookings: {
        bookingId: string;
        section: string;
        seat: string;
    }[];
    venue: string;
}

export function UserCalendar() {
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email || !isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchUserBookings = async () => {
            try {
                const token = await getAccessTokenSilently();
                const userResponse = await axios.get(`/api/user/email?email=${user?.email}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                const userId = userResponse.data.user_id;
                const bookingsResponse = await axios.get<Booking[]>(`/api/bookings/getBookingByUserId?userId=${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                
                // Group bookings by eventId
                const groupedBookings: { [key: number]: Booking[] } = {};
                bookingsResponse.data.forEach(booking => {
                    const eventId = booking.bookingDetails.ticketInfo.eventId;
                    if (eventId) {
                        if (!groupedBookings[eventId]) {
                            groupedBookings[eventId] = [];
                        }
                        groupedBookings[eventId].push(booking);
                    }
                });
        
                const calendarEvents: CalendarEvent[] = [];
        
                for (const [eventId, bookings] of Object.entries(groupedBookings)) {
                    const eventData = bookings[0].bookingDetails.eventData;
                    
                    calendarEvents.push({
                        id: Number(eventId),
                        title: eventData.event.event_name,
                        start: new Date(eventData.event.event_start_time),
                        end: new Date(eventData.event.event_end_time),
                        venue: eventData.venue.venue_name,
                        bookings: bookings.map(booking => ({
                            bookingId: booking.bookingId.toString(),
                            section: booking.bookingDetails.sectionInfo.sectionName,
                            seat: booking.bookingDetails.ticketInfo.ticketId.toString()
                        }))
                    });
                }
        
                setEvents(calendarEvents);
            } catch (error) {
                console.error('Error fetching calendar data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserBookings();
    }, [user?.email, isAuthenticated]);

    const EventComponent = ({ event: calendarEvent }: { event: any }) => (
        <div className="p-1">
            <Link to="/user-bookings" className="font-semibold text-foreground">
            <div className="font-semibold text-xs sm:text-sm">{calendarEvent.title}</div>
            <div className="text-xs text-foreground hidden sm:block">{calendarEvent.venue}</div>
            <div className="text-xs hidden text-foreground">
                Tickets: {calendarEvent.bookings.length}
            </div>
            </Link>
        </div>
    );

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-2 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-8 text-foreground">My Event Calendar</h1>
            <div className="h-[500px] sm:h-[700px] max-w-[80vw] md:w-full">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    components={{
                        event: EventComponent
                    }}
                    className="bg-background rounded-lg shadow-lg p-2 sm:p-4"
                    views={['month' ,'week','day','agenda']}
                    defaultView={window.innerWidth < 640 ? Views.AGENDA : Views.MONTH}
                    
                    toolbar={true}
                />
            </div>
        </div>
    );
}