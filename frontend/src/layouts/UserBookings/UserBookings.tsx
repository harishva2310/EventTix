import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserResponse } from '@/models/UserModel';
import { TicketResponse } from '@/models/TicketModel';
import { EventResponse } from '@/layouts/SearchEvents/components/EventSearchModel';
import { Booking } from '@/models/BookingModel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventGroupedView } from './components/EventGroupedView';
import { OrderGroupedView } from './components/OrderGroupedView';

interface BookingGroup {
    eventData?: EventResponse;
    bookings: Booking[];
}

interface GroupedBookings {
    [eventId: number]: BookingGroup;
}

interface PaymentGroupedBookings {
    [paymentIntentId: string]: {
        eventData?: EventResponse;
        bookings: Booking[];
        paymentIntentId: string;
    }
}

export function UserBookings() {
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [groupedByEvent, setGroupedByEvent] = useState<GroupedBookings>({});
    const [groupedByPayment, setGroupedByPayment] = useState<PaymentGroupedBookings>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email || !isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchUserBookings = async () => {
            try {
                const token = await getAccessTokenSilently();
                const userResponse = await axios.get(`/api/user/email`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        email: user?.email
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
                
                const eventGrouped: GroupedBookings = {};
                const paymentGrouped: PaymentGroupedBookings = {};

                for (const booking of bookingsResponse.data) {
                    const eventId = booking.bookingDetails.eventData.event.event_id;
                    const paymentIntentId = booking.bookingDetails.paymentIntentId;

                    // Group by events
                    if (!eventGrouped[eventId]) {
                        eventGrouped[eventId] = {
                            eventData: booking.bookingDetails.eventData,
                            bookings: []
                        };
                    }
                    eventGrouped[eventId].bookings.push(booking);

                    // Group by payment
                    if (paymentIntentId) {
                        if (!paymentGrouped[paymentIntentId]) {
                            paymentGrouped[paymentIntentId] = {
                                eventData: booking.bookingDetails.eventData,
                                bookings: [],
                                paymentIntentId: paymentIntentId
                            };
                        }
                        paymentGrouped[paymentIntentId].bookings.push(booking);
                    }
                }

                setGroupedByEvent(eventGrouped);
                setGroupedByPayment(paymentGrouped);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserBookings();
    }, [user?.email, isAuthenticated, getAccessTokenSilently]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-8 text-foreground">My Bookings</h1>
            
            <Tabs defaultValue="events" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="events">View by Events</TabsTrigger>
                    <TabsTrigger value="orders">View by Transactions</TabsTrigger>
                </TabsList>

                <TabsContent value="events">
                    <EventGroupedView groupedBookings={groupedByEvent as Record<number, { eventData: EventResponse; bookings: Booking[] }>} />
                </TabsContent>

                <TabsContent value="orders">
                    <OrderGroupedView paymentGroupedBookings={Object.fromEntries(
                        Object.entries(groupedByPayment).map(([key, value]) => [
                            key,
                            { ...value, eventData: value.eventData! }
                        ])
                    )} />
                </TabsContent>
            </Tabs>

            {Object.keys(groupedByEvent).length === 0 && (
                <div className="text-center mt-8">
                    <p className="text-muted-foreground">No bookings found</p>
                </div>
            )}
        </div>
    );
}