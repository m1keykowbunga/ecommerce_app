import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '../common/Button';

const StripeCheckoutForm = ({ onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/exito`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError?.(error);
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      onError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement className="mb-6" />
      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isProcessing}
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? 'Procesando...' : 'Pagar ahora'}
      </Button>
    </form>
  );
};

export default StripeCheckoutForm;
