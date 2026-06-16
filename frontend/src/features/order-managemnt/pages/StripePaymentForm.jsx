
import React, { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

const StripePaymentForm = ({ onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage("");

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      setErrorMessage(result.error.message || "Payment failed");
      setLoading(false);
      return;
    }

    setLoading(false);
    onPaymentSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="font-sans space-y-4">
      <PaymentElement />

      {errorMessage && (
        <p className="text-sm text-red-500 font-semibold">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full rounded-xl py-3 text-sm font-extrabold text-white border-none cursor-pointer
          ${loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"}`}
      >
        {loading ? "Processing Payment..." : "Pay Now 💳"}
      </button>
    </form>
  );
};

export default StripePaymentForm;