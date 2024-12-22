import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/CartStores'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PaymentForm } from '@/layouts/PaymentFormPage/PaymentForm'
import { toast } from '@/hooks/use-toast'

export function CartIcon() {
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

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
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
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-[calc(100vw-2rem)] sm:w-96 max-w-96"
                >
                    <div className="p-3 sm:p-4">
                        <h3 className="font-bold text-sm sm:text-base mb-2">
                            Cart Items ({itemCount})
                        </h3>
                        {itemCount > 0 ? (
                            <>
                                <div className="space-y-2 max-h-[400px] overflow-auto">
                                    {Object.values(items).map((item) => (
                                        <div key={item.ticket?.ticketId} className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                                            <div className="space-y-1">
                                                <p className="font-medium">{item.eventDetails?.event.event_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Section: {item.sectionDetails?.sectionName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.eventDetails?.venue.venue_name}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="font-bold">${item.ticket?.ticketPrice}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => removeItem(item.ticket.ticketId)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                                <div className="border-t mt-4 pt-4">
                                    <div className="flex justify-between font-bold mb-4">
                                        <span>Total:</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <Button className="w-full" onClick={handleCheckout}>
                                        Proceed to Checkout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-muted-foreground">Your cart is empty</p>
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

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
