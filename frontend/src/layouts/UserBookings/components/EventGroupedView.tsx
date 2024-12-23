import { GroupedBookings } from '@/layouts/UserBookings/components/types';
import { Booking } from '@/models/BookingModel';

interface EventGroupedViewProps {
    groupedBookings: GroupedBookings;
}

export function EventGroupedView({ groupedBookings }: EventGroupedViewProps) {
    return (
        <div className="space-y-8 overflow-x-hidden">
            {Object.entries(groupedBookings).map(([eventId, { eventData, bookings }]) => (
                <div key={eventId} className="mb-8 bg-background/100 rounded-lg shadow-lg p-6 overflow-x-hidden">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-foreground">{eventData?.event.event_name}</h2>
                        <p className="text-muted-foreground">{eventData?.event.event_description}</p>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Event Start</p>
                                <p className="text-foreground">{new Date(eventData?.event.event_start_time || '').toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Event End</p>
                                <p className="text-foreground">{new Date(eventData?.event.event_end_time || '').toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-muted-foreground">Venue</p>
                            <p className="text-foreground">{eventData?.venue.venue_name}</p>
                            <p className="text-sm text-muted-foreground">
                                {eventData?.venue.venue_address}, {eventData?.venue.venue_city}, {eventData?.venue.venue_state}
                            </p>
                        </div>
                        {eventData?.event.event_details.headliner && (
                            <div className="mt-2">
                                <p className="text-sm text-muted-foreground">Headliner</p>
                                <p className="text-foreground">{eventData.event.event_details.headliner}</p>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
                        {bookings.map((booking: Booking) => (
                            <div key={booking.bookingId} className="border rounded-lg p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-foreground">Booking ID: {booking.bookingId}</span>
                                    <span className={`px-3 py-1 rounded-full text-sm ${booking.bookingStatus === 'CONFIRMED'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                        }`}>
                                        {booking.bookingStatus}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Booking Date</p>
                                        <p className="text-foreground">{new Date(booking.bookingDate).toDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Booking Time</p>
                                        <p className="text-foreground">{booking.bookingTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ticket Price</p>
                                        <p className="text-foreground">${booking.bookingDetails.ticketInfo.ticketPrice}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Section & Seat</p>
                                        <p className="text-foreground">
                                            {booking.bookingDetails.sectionInfo.sectionName} -
                                            {booking.bookingDetails.sectionInfo.sectionSeating === "YES"
                                                ? booking.bookingDetails.ticketInfo.seatNumber
                                                : "Standing"}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-center">
                                    {booking.bookingDetails.qrCode && (
                                        <img
                                            src={`data:image/png;base64,${booking.bookingDetails.qrCode}`}
                                            alt="Ticket QR Code"
                                            className="w-32 h-32 sm:w-48 sm:h-48"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
