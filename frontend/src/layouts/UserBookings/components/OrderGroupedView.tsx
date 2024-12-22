import { Button } from '@/components/ui/button';
import { PaymentGroupedBookings } from '@/layouts/UserBookings/components/types';
import { Booking } from '@/models/BookingModel';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
interface OrderGroupedViewProps {
    paymentGroupedBookings: PaymentGroupedBookings;
}



export function OrderGroupedView({ paymentGroupedBookings }: OrderGroupedViewProps) {

    const { getAccessTokenSilently } = useAuth0();

    async function handleCancelBooking(paymentIntentId: string, bookings: Booking[]) {
        try {
            const token = await getAccessTokenSilently();
            const refundResponse = await fetch(`/api/payments/refund/${paymentIntentId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!refundResponse.ok) throw new Error('Refund failed');

            const ticketsToUpdate = bookings.map(booking => ({
                ticketId: booking.bookingDetails.ticketInfo.ticketId,
                newStatus: "AVAILABLE"
            }));

            const ticketUpdateResponse = await fetch('/api/tickets/refund-tickets', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketsToUpdate),
            });
            if (!ticketUpdateResponse.ok) throw new Error('Ticket status update failed');

            const bookingsToCancel = bookings.map(booking => ({
                bookingId: booking.bookingId
            }));

            const bookingUpdateResponse = await fetch('/api/bookings/cancelBooking', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bookingsToCancel),
            });
            if (!bookingUpdateResponse.ok) throw new Error('Booking cancellation failed');

            window.location.reload();
        } catch (error) {
            console.error('Booking cancellation failed:', error);
        }
    }
    const [selectedPaymentIntent, setSelectedPaymentIntent] = useState<{ id: string; bookings: Booking[] } | null>(null);
    const sortedOrders = Object.entries(paymentGroupedBookings).sort((a, b) => {
        const dateA = new Date(`${a[1].bookings[0].bookingDate} ${a[1].bookings[0].bookingTime}`);
        const dateB = new Date(`${b[1].bookings[0].bookingDate} ${b[1].bookings[0].bookingTime}`);
        return dateB.getTime() - dateA.getTime(); // Descending order
    });

    return (
        <div className="space-y-4 sm:space-y-8">
            <Dialog>
                {sortedOrders.map(([paymentIntentId, { eventData, bookings }]) => (
                    <div key={paymentIntentId} className="mb-4 sm:mb-8 bg-background/100 rounded-lg shadow-lg p-4 sm:p-6">
                        <div className="border-b pb-3 sm:pb-4 mb-3 sm:mb-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Order Details</h2>
                                <span className="text-xs sm:text-sm text-muted-foreground">Order ID: {paymentIntentId}</span>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full sm:w-auto"
                                        onClick={() => setSelectedPaymentIntent({ id: paymentIntentId, bookings })}
                                        disabled={bookings.every(booking => booking.bookingStatus === 'CANCELLED')}
                                    >
                                        Cancel Booking
                                    </Button>
                                </DialogTrigger>
                            </div>

                            <div className="mt-2">
                                <p className="text-xs sm:text-sm text-muted-foreground">Total Amount</p>
                                <p className="text-sm sm:text-base text-foreground">${bookings[0].bookingDetails.totalPrice.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="space-y-4 sm:space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {bookings.map((booking) => (
                                <div key={booking.bookingId} className="border rounded-lg p-3 sm:p-4">
                                    <div className="mb-3 sm:mb-4">
                                        <h3 className="text-base sm:text-lg font-semibold text-foreground">
                                            {booking.bookingDetails.eventData.event.event_name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            {new Date(booking.bookingDetails.eventData.event.event_start_time).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-foreground pb-2">Purchase Date: {booking.bookingDate}</p>
                                    </div>

                                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                        <div>
                                            <p className="text-xs sm:text-sm text-muted-foreground">Venue</p>
                                            <p className="text-sm sm:text-base text-foreground">
                                                {booking.bookingDetails.eventData.venue.venue_name}
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground">
                                                {booking.bookingDetails.eventData.venue.venue_address},
                                                {booking.bookingDetails.eventData.venue.venue_city},
                                                {booking.bookingDetails.eventData.venue.venue_state}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm text-muted-foreground">Ticket Details</p>
                                            <p className="text-sm sm:text-base text-foreground">
                                                Section: {booking.bookingDetails.sectionInfo.sectionName}
                                            </p>
                                            <p className="text-sm sm:text-base text-foreground">
                                                {booking.bookingDetails.sectionInfo.sectionSeating === "YES"
                                                    ? `Seat: ${booking.bookingDetails.ticketInfo.seatNumber}`
                                                    : "Standing Ticket"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t gap-2 sm:gap-0">
                                        <div>
                                            <p className="text-xs sm:text-sm text-muted-foreground">Ticket Price</p>
                                            <p className="text-sm sm:text-base text-foreground">
                                                ${booking.bookingDetails.ticketInfo.ticketPrice}
                                            </p>
                                        </div>
                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${booking.bookingStatus === 'CONFIRMED'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                            }`}>
                                            {booking.bookingStatus}
                                        </span>
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Cancel Booking Confirmation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this booking? Refund amounts are subjected to our Terms and Conditions
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => setSelectedPaymentIntent(null)}
                        >
                            No, Keep Booking
                        </Button>
                        <Button
                            variant="destructive"
                            className="w-full sm:w-auto"
                            onClick={() => {
                                if (selectedPaymentIntent) {
                                    handleCancelBooking(selectedPaymentIntent.id, selectedPaymentIntent.bookings);
                                }
                            }}
                        >
                            Yes, Cancel Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
