import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { subscriptionApi } from "../../api/subscriptionApi";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
);

const AddCardForm = ({ clientSecret, onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  const [cardName, setCardName] = useState("");
  const [country, setCountry] = useState("US");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const billingDetails = {
      name: cardName || undefined,
      address: {
        country: country || undefined,
        line1: line1 || undefined,
        line2: line2 || undefined,
        city: city || undefined,
        state: state || undefined,
        postal_code: postalCode || undefined,
      }
    };

    const { error: stripeError } = await stripe.confirmCardSetup(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: billingDetails,
        },
      }
    );

    if (stripeError) {
      setError(stripeError.message);
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full font-sans">
      <div className="flex-1 overflow-y-auto p-6 text-slate-800 custom-scrollbar">
        <h2 className="text-[17px] font-bold mb-2">Add a card</h2>
        <p className="text-[13px] text-slate-600 mb-6 leading-relaxed">
          Only add a card if you have received affirmative consent from your customer to save their payment method for future purchases.
        </p>

        <div className="bg-[#f6f8fa] p-4 rounded-lg">
          <div className="bg-white border border-slate-300 rounded-md p-3 shadow-sm mb-3">
            <CardElement 
              options={{ 
                hidePostalCode: true,
                style: {
                  base: {
                    fontSize: '15px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }} 
            />
          </div>

          <button 
            type="button" 
            onClick={() => setShowMoreOptions(!showMoreOptions)} 
            className="text-[13px] text-[#5433FF] hover:text-[#4329cc] font-medium flex items-center gap-1 focus:outline-none transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ease-in-out ${showMoreOptions ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            More options
          </button>

          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showMoreOptions ? "max-h-[600px] opacity-100 mt-5" : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Cardholder name</label>
                <input 
                  type="text" 
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:border-[#5433FF] focus:ring-1 focus:ring-[#5433FF] shadow-sm transition-shadow" 
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Address</label>
                <div className="flex flex-col border border-slate-300 rounded-md bg-white shadow-sm transition-shadow focus-within:border-[#5433FF] focus-within:ring-1 focus-within:ring-[#5433FF]">
                  <select 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="p-2.5 text-[13px] border-b border-slate-300 focus:outline-none bg-transparent text-slate-700 w-full hover:bg-slate-50 cursor-pointer"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Address line 1" 
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    className="p-2 text-[13px] border-b border-slate-300 focus:outline-none placeholder-slate-400 w-full" 
                  />
                  <input 
                    type="text" 
                    placeholder="Address line 2" 
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    className="p-2 text-[13px] border-b border-slate-300 focus:outline-none placeholder-slate-400 w-full" 
                  />
                  <input 
                    type="text" 
                    placeholder="City" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="p-2 text-[13px] border-b border-slate-300 focus:outline-none placeholder-slate-400 w-full" 
                  />
                  <div className="flex">
                    <input 
                      type="text" 
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="p-2 text-[13px] border-r border-slate-300 w-1/2 focus:outline-none placeholder-slate-400" 
                    />
                    <input 
                      type="text" 
                      placeholder="ZIP" 
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="p-2 text-[13px] w-1/2 focus:outline-none placeholder-slate-400" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 text-[13px] text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 rounded-b-xl relative z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          disabled={isProcessing}
          className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[13px] font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="px-4 py-1.5 bg-[#5433FF] hover:bg-[#4329cc] text-white text-[13px] font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#5433FF]/50 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Add card"}
        </button>
      </div>
    </form>
  );
};

const AddCardModal = ({ isOpen, onClose, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchSetupIntent = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await subscriptionApi.createSetupIntent();
          if (res.success && res.data) {
            setClientSecret(res.data);
          } else {
            setError(res.message || "Failed to initialize verification session.");
          }
        } catch (err) {
          setError("An error occurred while establishing secure connection.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchSetupIntent();
    } else {
      setClientSecret("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 md:p-6 transition-opacity"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-[500px] max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-20 p-1 rounded-full hover:bg-slate-100"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-slate-600 gap-4 py-32 text-sm font-medium">
            <div className="w-8 h-8 border-2 border-[#5433FF] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading secure payment form...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-24 px-6 space-y-6">
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
              {error}
            </div>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-100 text-slate-800 rounded-md font-semibold text-[13px] transition-colors hover:bg-slate-200 border border-slate-300"
            >
              Close
            </button>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <AddCardForm 
              clientSecret={clientSecret} 
              onClose={onClose} 
              onSuccess={() => {
                onSuccess();
                onClose();
              }} 
            />
          </Elements>
        ) : null}
      </div>
    </div>
  );
};

export default AddCardModal;