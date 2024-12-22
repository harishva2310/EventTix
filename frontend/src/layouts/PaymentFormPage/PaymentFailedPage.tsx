import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailedPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-xl p-8 text-center space-y-6">
          <div className="space-y-4">
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
            <h1 className="text-3xl font-bold text-destructive">Payment Failed</h1>
            <p className="text-muted-foreground">
              We were unable to process your payment. Please try again or use a different payment method.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4" />
              Return to Home
            </Button>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>
              If you continue to experience issues, please contact our support team
              or try using a different payment method.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/support'}
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
