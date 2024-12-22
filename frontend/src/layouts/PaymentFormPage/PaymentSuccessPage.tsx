import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { CheckCircle2, TicketCheck, ArrowRight, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      setIsLoading(true);
      const paymentIntentId = searchParams.get('payment_intent');

      if (!paymentIntentId) {
        navigate('/payment-failed');
        return;
      }

      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(`/api/payments/payment-intent/${paymentIntentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status === 'succeeded') {
          setBookingDetails(response.data);
          setIsLoading(false);
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        navigate('/payment-failed');
      }
    };


    verifyPayment();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading payment details...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-xl p-8 text-center space-y-6">
          <div className="space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-3xl font-bold text-green-500">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your tickets have been confirmed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>

            <Button
              className="flex items-center gap-2"
              onClick={() => navigate('/user-bookings')}
            >
              View My Tickets
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>
              A confirmation email has been sent to your registered email address.
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}