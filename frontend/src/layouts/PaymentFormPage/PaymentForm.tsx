import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useAuth0 } from '@auth0/auth0-react';
import { stripePromise } from '@/config/stripeConfig';
import { useCartStore } from '@/stores/CartStores';
import axios from 'axios';
interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
}

const CheckoutForm = ({ amount, onSuccess, onError }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'An error occurred during payment');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Wait for booking completion before redirecting
        await onSuccess(paymentIntent.id);
        window.location.href = `/payment-success?payment_intent=${paymentIntent.id}`;
      }
    } catch (error) {
      onError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : `Pay ${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

const CountdownTimer = ({ onTimeout }: { onTimeout: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-center p-4 bg-muted/20 rounded-lg mb-4">
      <p className="text-sm font-medium">
        You have {minutes}:{seconds.toString().padStart(2, '0')} minutes to complete the transaction
      </p>
    </div>
  );
};

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
}

export const PaymentForm = ({ amount, onSuccess, onError }: PaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState('');
  const { getAccessTokenSilently } = useAuth0();
  const setShowPaymentDialog = useCartStore(state => state.setShowPaymentDialog);
  const handleTimeout = () => {
    setClientSecret('');
    setShowPaymentDialog(false);
    onError('Payment session expired. Please try again.');
  };

  useEffect(() => {
    let mounted = true;

    const initializePayment = async () => {
      if (!amount || amount <= 0) return;

      try {
        const token = await getAccessTokenSilently();
        const amountInCents = Math.round(amount * 100);

        if (!mounted) return;

        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: amountInCents,
            currency: 'usd',
          }),
        });

        if (!mounted) return;

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        if (mounted) {
          onError('Failed to initialize payment');
        }
      }
    };

    initializePayment();

    return () => {
      mounted = false;
    };
  }, [amount]);

  if (!clientSecret) {
    return <div>Loading payment form...</div>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      <div>
      <CountdownTimer onTimeout={handleTimeout} />
      <CheckoutForm
        clientSecret={clientSecret}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
      </div>
    </Elements>

  );
};