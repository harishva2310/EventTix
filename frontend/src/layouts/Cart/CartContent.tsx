import { ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/CartStores'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { PaymentForm } from '@/layouts/PaymentFormPage/PaymentForm'
import { toast } from '@/hooks/use-toast'

interface CartContentProps {
    variant?: 'icon' | 'floating'
}

export function CartContent({ variant = 'icon' }: CartContentProps) {
    const navigate = useNavigate()
    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0()
    const {
        items,
        total,
        removeItem,
        handlePurchase,
        handlePaymentSuccess,
        showPaymentDialog,
        setShowPaymentDialog
    } = useCartStore()

    const itemCount = Object.keys(items).length

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            toast({
                title: "Authentication Required",
                description: "Please log in to proceed with checkout",
                variant: "destructive",
            })
            return
        }

        try {
            const token = await getAccessTokenSilently()
            await handlePurchase(token, user?.email || '')
        } catch (error) {
            toast({
                title: "Checkout Error",
                description: "Failed to initiate checkout process",
                variant: "destructive",
            })
        }
    }

    const onPaymentSuccess = async (paymentIntentId: string) => {
        try {
            const token = await getAccessTokenSilently()
            const result = await handlePaymentSuccess(paymentIntentId, token, user)

            if (result !== undefined) {
                navigate(`/payment-success?payment_intent=${paymentIntentId}`)
            } else {
                navigate('/payment-failed')
            }
        } catch (error) {
            navigate('/payment-failed')
        }
    }

    const triggerButton = variant === 'floating' ? (
        <Button
            className="bg-green-500 hover:bg-green-600 text-white w-[60vw] sm:w-[50vw] shadow-lg transition-all duration-200 py-6"
            size="lg"
        >
            <div className="flex items-center justify-center gap-3 text-lg">
                <ShoppingCart className="h-6 w-6" />
                <span className="font-semibold">View Cart</span>
                {itemCount > 0 && (
                    <Badge
                        variant="secondary"
                        className="bg-white text-green-600 ml-2"
                    >
                        {itemCount} items
                    </Badge>
                )}
            </div>
        </Button>
    ) : (
        <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
            {itemCount > 0 && (
                <Badge
                    variant="destructive"
                    className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs"
                >
                    {itemCount}
                </Badge>
            )}
        </Button>
    )

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    {triggerButton}
                </DialogTrigger>
                <DialogContent className="max-w-full w-[80vh] h-[90vh] mt-[10vh] p-0 border-t-2 border-green-500">
                    <div className="container mx-auto h-[80vh] p-6 flex flex-col relative">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-xl sm:text-2xl">
                                Cart Items ({itemCount})
                            </h3>
                            <DialogClose asChild>
                                
                            </DialogClose>
                        </div>

                        {itemCount > 0 ? (
                            <>
                                <div className="flex-1 overflow-auto space-y-3 pb-[200px]">
                                    {Object.values(items).map((item) => (
                                        <div
                                            key={item.ticket?.ticketId}
                                            className="flex justify-between items-center p-4 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
                                        >
                                            <div className="space-y-2">
                                                <p className="font-semibold text-lg">{item.eventDetails?.event.event_name}</p>
                                                <div className="space-y-1">
                                                    <p className="text-sm text-muted-foreground">
                                                        Section: {item.sectionDetails?.sectionName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.eventDetails?.venue.venue_name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Seat: {item.ticket?.seatNumber}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <span className="font-bold text-lg">${item.ticket?.ticketPrice}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeItem(item.ticket.ticketId)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-4 bg-background absolute bottom-0 left-0 right-0 px-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold">Total Amount</p>
                                            <p className="text-sm text-muted-foreground">Including all fees</p>
                                        </div>
                                        <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                                    </div>
                                    <Button
                                        className="w-full py-6 text-lg font-semibold"
                                        onClick={handleCheckout}
                                    >
                                        Proceed to Checkout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                                <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                                <p className="text-xl text-muted-foreground">Your cart is empty</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Payment</DialogTitle>
                    </DialogHeader>
                    <PaymentForm
                        amount={total}
                        onSuccess={onPaymentSuccess}
                        onError={(error) => {
                            toast({
                                title: "Payment Failed",
                                description: error,
                                variant: "destructive",
                            })
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}
